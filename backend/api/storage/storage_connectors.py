"""Storage Connectors - AWS S3, Google Drive, OneDrive - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import boto3
from botocore.exceptions import ClientError
import os
from motor.motor_asyncio import AsyncIOMotorClient
import json

router = APIRouter(prefix="/api/storage", tags=["storage"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class StorageConfig(BaseModel):
    user_id: str
    provider: str  # s3, google_drive, onedrive
    credentials: Dict[str, Any]
    bucket_name: Optional[str] = None
    folder_path: Optional[str] = None
    is_active: bool = True


class S3StorageService:
    """Serviço de storage AWS S3 (cliente configura suas credenciais)"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.s3_client = None
    
    def connect(self):
        """Conecta ao S3 do cliente usando suas credenciais"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.config['aws_access_key_id'],
                aws_secret_access_key=self.config['aws_secret_access_key'],
                region_name=self.config.get('region', 'us-east-1')
            )
            return True
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro ao conectar S3: {str(e)}")
    
    def test_connection(self):
        """Testa conexão com bucket"""
        try:
            self.s3_client.head_bucket(Bucket=self.config['bucket_name'])
            return True
        except ClientError:
            return False
    
    def upload_file(self, file_path: str, object_key: str) -> str:
        """Upload de arquivo para S3"""
        try:
            self.s3_client.upload_file(
                file_path,
                self.config['bucket_name'],
                object_key
            )
            return f"s3://{self.config['bucket_name']}/{object_key}"
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Erro no upload: {str(e)}")
    
    def download_file(self, object_key: str, destination: str):
        """Download de arquivo do S3"""
        try:
            self.s3_client.download_file(
                self.config['bucket_name'],
                object_key,
                destination
            )
            return destination
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Erro no download: {str(e)}")
    
    def list_files(self, prefix: str = ""):
        """Lista arquivos no bucket"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.config['bucket_name'],
                Prefix=prefix
            )
            return response.get('Contents', [])
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Erro ao listar: {str(e)}")


@router.post("/config")
async def configure_storage(config_data: StorageConfig):
    """Configura storage do cliente"""
    
    # Verificar se já existe configuração
    existing = await db.storage_configs.find_one({
        "user_id": config_data.user_id,
        "provider": config_data.provider
    })
    
    if existing:
        # Atualizar
        await db.storage_configs.update_one(
            {"user_id": config_data.user_id, "provider": config_data.provider},
            {"$set": config_data.model_dump()}
        )
        message = "Configuração atualizada"
    else:
        # Criar nova
        await db.storage_configs.insert_one(config_data.model_dump())
        message = "Configuração criada"
    
    # Testar conexão
    if config_data.provider == "s3":
        storage = S3StorageService(config_data.credentials)
        storage.connect()
        
        if not storage.test_connection():
            raise HTTPException(status_code=400, detail="Não foi possível conectar ao bucket S3")
    
    return {
        "message": message,
        "provider": config_data.provider,
        "connection_status": "success"
    }


@router.get("/config/{user_id}")
async def get_storage_configs(user_id: str):
    """Lista configurações de storage do usuário"""
    configs = await db.storage_configs.find(
        {"user_id": user_id, "is_active": True}
    ).to_list(length=None)
    
    # Remover credenciais sensíveis da resposta
    for config in configs:
        if 'credentials' in config:
            config['credentials'] = {k: '***' for k in config['credentials'].keys()}
    
    return {"configs": configs}


@router.post("/upload")
async def upload_to_storage(
    user_id: str,
    provider: str,
    file_path: str,
    object_key: str
):
    """Upload arquivo para storage do cliente"""
    
    # Buscar configuração
    config = await db.storage_configs.find_one({
        "user_id": user_id,
        "provider": provider,
        "is_active": True
    })
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuração de storage não encontrada")
    
    if provider == "s3":
        storage = S3StorageService(config['credentials'])
        storage.connect()
        s3_path = storage.upload_file(file_path, object_key)
        
        return {
            "message": "Upload realizado com sucesso",
            "storage_path": s3_path,
            "provider": provider
        }
    else:
        raise HTTPException(status_code=400, detail=f"Provider {provider} não implementado ainda")


@router.get("/list/{user_id}/{provider}")
async def list_storage_files(user_id: str, provider: str, prefix: str = ""):
    """Lista arquivos no storage do cliente"""
    
    config = await db.storage_configs.find_one({
        "user_id": user_id,
        "provider": provider,
        "is_active": True
    })
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuração não encontrada")
    
    if provider == "s3":
        storage = S3StorageService(config['credentials'])
        storage.connect()
        files = storage.list_files(prefix)
        
        return {
            "provider": provider,
            "files": files,
            "count": len(files)
        }
    else:
        raise HTTPException(status_code=400, detail=f"Provider {provider} não implementado")
