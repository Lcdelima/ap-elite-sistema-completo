"""
OXYGEN-STYLE ADVANCED CONFIGURATION SYSTEM
Sistema de configuração avançado inspirado no Oxygen Forensic Detective
Gerenciamento de licenças, GPU, telemetria, e configurações por usuário
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import jwt
import json
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/oxygen-config", tags=["oxygen_config"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['ap_elite']

# Authentication
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    try:
        token = authorization.replace("Bearer ", "")
        SECRET_KEY = os.environ.get("SECRET_KEY", "ap_elite_secret_key_2024")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return payload
        except:
            user = await db.users.find_one({"token": token})
            return user if user else {"id": "anonymous", "email": "anonymous@apelite.com"}
    except:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}

# Models
class SystemConfig(BaseModel):
    """Configuração do sistema (estilo Oxygen)"""
    # Telemetria (CEIP - Customer Experience Improvement Program)
    telemetry_enabled: bool = True
    telemetry_session_number: int = 0
    telemetry_global_number: int = 0
    
    # GPU Settings
    gpu_enabled: bool = True
    use_gpu_on_user_activity: bool = True
    disable_gpu_on_overheat: bool = True
    temperature_overheat_threshold: int = 85  # Celsius
    gpu_load_limit: int = 90  # Percentage
    
    # DSA Server (Data Synchronization & Access)
    dsa_server_enabled: bool = False
    dsa_server_port: int = 9091
    dsa_log_enabled: bool = True
    dsa_files_uploading_enabled: bool = False
    
    # File Management
    calculate_file_md5: bool = True
    calculate_file_sha256: bool = True
    save_unprotected_with_originals: bool = True
    save_temp_files_in_system_default_folder: bool = True
    unprotected_result_custom_destination: Optional[str] = None
    temp_files_custom_destination: Optional[str] = None
    
    # Advanced Features
    enable_ai_analysis: bool = True
    enable_malware_scan: bool = True
    enable_timeline_reconstruction: bool = True
    enable_deleted_recovery: bool = True
    enable_encrypted_analysis: bool = True

class GPUDevice(BaseModel):
    """Informações de dispositivo GPU (estilo Oxygen)"""
    device_id: str
    device_name: str
    driver_version: Optional[str] = None
    memory_size_mb: Optional[int] = None
    cores: Optional[int] = None
    calibration_status: str = "Not Calibrated"  # Not Calibrated, Calibrating, Success, Failed
    optimization_parameters: Optional[Dict[str, Any]] = None
    last_calibrated_timestamp: Optional[str] = None
    benchmark_score: Optional[int] = None

class LicenseKey(BaseModel):
    """Chave de licença (estilo Oxygen)"""
    key_id: str
    encrypted_key: str
    is_main: bool = False
    license_type: str  # trial, basic, professional, enterprise
    expires_at: Optional[str] = None
    features_enabled: List[str] = []

class UserPreferences(BaseModel):
    """Preferências por usuário"""
    user_id: str
    theme: str = "dark"  # light, dark, auto
    language: str = "pt-BR"
    keyboard_shortcuts_enabled: bool = True
    notifications_enabled: bool = True
    auto_save: bool = True
    custom_paths: Dict[str, str] = {}

# Routes
@router.get("/system-config")
async def get_system_config(authorization: str = Header(None)):
    """Obter configuração completa do sistema"""
    user = await get_current_user(authorization)
    
    try:
        config = await db.system_config.find_one({"config_type": "main"})
        
        if not config:
            # Criar configuração padrão
            default_config = {
                "config_type": "main",
                "config_id": str(uuid.uuid4()),
                "ceip": {
                    "telemetry_enabled": True,
                    "telemetry_session_number": 0,
                    "telemetry_global_number": 0
                },
                "settings": {
                    "gpu_enabled": True,
                    "use_gpu_on_user_activity": True,
                    "disable_gpu_on_overheat": True,
                    "temperature_overheat_threshold": 85,
                    "gpu_load_limit": 90,
                    "dsa_server_enabled": False,
                    "dsa_server_port": 9091,
                    "dsa_log_enabled": True,
                    "dsa_files_uploading_enabled": False,
                    "calculate_file_md5": True,
                    "calculate_file_sha256": True,
                    "save_unprotected_with_originals": True,
                    "save_temp_files_in_system_default_folder": True,
                    "enable_ai_analysis": True,
                    "enable_malware_scan": True,
                    "enable_timeline_reconstruction": True,
                    "enable_deleted_recovery": True,
                    "enable_encrypted_analysis": True
                },
                "installation_id": {
                    "full": str(uuid.uuid4()),
                    "full_v2": str(uuid.uuid4()),
                    "full_v3": str(uuid.uuid4())
                },
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.system_config.insert_one(default_config)
            config = default_config
        
        config.pop("_id", None)
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/system-config")
async def update_system_config(config_update: Dict[str, Any], authorization: str = Header(None)):
    """Atualizar configuração do sistema"""
    user = await get_current_user(authorization)
    
    try:
        # Atualiza configuração
        result = await db.system_config.update_one(
            {"config_type": "main"},
            {
                "$set": {
                    **config_update,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Configuração atualizada com sucesso",
            "modified_count": result.modified_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gpu-devices")
async def get_gpu_devices(authorization: str = Header(None)):
    """Obter lista de dispositivos GPU"""
    user = await get_current_user(authorization)
    
    try:
        devices = await db.gpu_devices.find({}).to_list(10)
        for device in devices:
            device.pop("_id", None)
        
        return {
            "gpu_devices": devices,
            "count": len(devices),
            "has_calibrated_gpus": any(d.get("calibration_status") == "Success" for d in devices)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gpu-devices/detect")
async def detect_gpu_devices(authorization: str = Header(None)):
    """Detectar dispositivos GPU disponíveis"""
    user = await get_current_user(authorization)
    
    try:
        # Simula detecção de GPU (em produção, usar bibliotecas como pynvml para NVIDIA)
        detected_gpus = [
            {
                "device_id": f"GPU_{str(uuid.uuid4())[:8]}",
                "device_name": "NVIDIA GeForce RTX 4090",
                "driver_version": "537.34",
                "memory_size_mb": 24576,
                "cores": 16384,
                "calibration_status": "Not Calibrated",
                "detected_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "device_id": f"GPU_{str(uuid.uuid4())[:8]}",
                "device_name": "AMD Radeon RX 7900 XTX",
                "driver_version": "23.11.1",
                "memory_size_mb": 24576,
                "cores": 6144,
                "calibration_status": "Not Calibrated",
                "detected_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        # Salva no banco
        for gpu in detected_gpus:
            await db.gpu_devices.update_one(
                {"device_id": gpu["device_id"]},
                {"$set": gpu},
                upsert=True
            )
        
        return {
            "success": True,
            "message": f"{len(detected_gpus)} dispositivos GPU detectados",
            "devices": detected_gpus
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gpu-devices/{device_id}/calibrate")
async def calibrate_gpu_device(device_id: str, authorization: str = Header(None)):
    """Calibrar dispositivo GPU"""
    user = await get_current_user(authorization)
    
    try:
        # Simula calibração de GPU
        import random
        
        # Atualiza status para "Calibrating"
        await db.gpu_devices.update_one(
            {"device_id": device_id},
            {"$set": {"calibration_status": "Calibrating"}}
        )
        
        # Simula processo de calibração (benchmark)
        benchmark_score = random.randint(8000, 20000)
        
        optimization_params = {
            "kernel_threads": random.choice([64, 128, 256, 512]),
            "batch_size": random.choice([256, 512, 1024, 2048]),
            "memory_allocation_mb": random.randint(8192, 16384),
            "optimal_temperature": random.randint(65, 75),
            "power_limit_watts": random.randint(300, 450)
        }
        
        # Atualiza com resultados da calibração
        update_data = {
            "calibration_status": "Success",
            "benchmark_score": benchmark_score,
            "optimization_parameters": optimization_params,
            "last_calibrated_timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await db.gpu_devices.update_one(
            {"device_id": device_id},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "GPU calibrada com sucesso",
            "benchmark_score": benchmark_score,
            "optimization_parameters": optimization_params
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gpu-devices/{device_id}/temperature")
async def get_gpu_temperature(device_id: str, authorization: str = Header(None)):
    """Obter temperatura atual da GPU"""
    user = await get_current_user(authorization)
    
    try:
        import random
        
        # Simula leitura de temperatura (em produção, usar pynvml)
        temperature = random.randint(45, 85)
        fan_speed = random.randint(30, 90)
        power_usage = random.randint(150, 400)
        
        return {
            "device_id": device_id,
            "temperature_celsius": temperature,
            "fan_speed_percent": fan_speed,
            "power_usage_watts": power_usage,
            "status": "normal" if temperature < 80 else "warning" if temperature < 85 else "critical",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/licenses")
async def get_licenses(authorization: str = Header(None)):
    """Obter licenças ativas"""
    user = await get_current_user(authorization)
    
    try:
        licenses = await db.licenses.find({}).to_list(10)
        for license in licenses:
            license.pop("_id", None)
        
        return {
            "licenses": licenses,
            "count": len(licenses),
            "main_license": next((l for l in licenses if l.get("is_main")), None)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/licenses")
async def add_license(license_data: Dict[str, Any], authorization: str = Header(None)):
    """Adicionar nova licença"""
    user = await get_current_user(authorization)
    
    try:
        # Gera ID da licença
        license_id = str(uuid.uuid4())
        
        # Encripta chave (simples hash para demo)
        encrypted_key = hashlib.sha256(license_data.get("key", "").encode()).hexdigest()
        
        license_doc = {
            "license_id": license_id,
            "encrypted_key": encrypted_key,
            "is_main": license_data.get("is_main", False),
            "license_type": license_data.get("license_type", "professional"),
            "expires_at": license_data.get("expires_at"),
            "features_enabled": license_data.get("features_enabled", [
                "data_extraction",
                "password_recovery",
                "forensic_analysis",
                "ai_analysis",
                "gpu_acceleration",
                "malware_scan",
                "timeline_reconstruction"
            ]),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": user.get("email")
        }
        
        # Se é main, remove main de outras licenças
        if license_doc["is_main"]:
            await db.licenses.update_many({}, {"$set": {"is_main": False}})
        
        await db.licenses.insert_one(license_doc)
        license_doc.pop("_id", None)
        
        return {
            "success": True,
            "message": "Licença adicionada com sucesso",
            "license": license_doc
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-preferences")
async def get_user_preferences(authorization: str = Header(None)):
    """Obter preferências do usuário"""
    user = await get_current_user(authorization)
    
    try:
        prefs = await db.user_preferences.find_one({"user_id": user.get("id")})
        
        if not prefs:
            # Criar preferências padrão
            prefs = {
                "user_id": user.get("id"),
                "theme": "dark",
                "language": "pt-BR",
                "keyboard_shortcuts_enabled": True,
                "notifications_enabled": True,
                "auto_save": True,
                "custom_paths": {},
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.user_preferences.insert_one(prefs)
        
        prefs.pop("_id", None)
        return prefs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/user-preferences")
async def update_user_preferences(preferences: Dict[str, Any], authorization: str = Header(None)):
    """Atualizar preferências do usuário"""
    user = await get_current_user(authorization)
    
    try:
        await db.user_preferences.update_one(
            {"user_id": user.get("id")},
            {
                "$set": {
                    **preferences,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Preferências atualizadas com sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/installation-info")
async def get_installation_info(authorization: str = Header(None)):
    """Obter informações da instalação"""
    user = await get_current_user(authorization)
    
    try:
        config = await db.system_config.find_one({"config_type": "main"})
        
        if not config:
            raise HTTPException(status_code=404, detail="Configuração não encontrada")
        
        installation_id = config.get("installation_id", {})
        
        return {
            "installation_id": installation_id.get("full"),
            "installation_id_v2": installation_id.get("full_v2"),
            "installation_id_v3": installation_id.get("full_v3"),
            "installed_at": config.get("created_at"),
            "version": "2.0.0",
            "build": "20240128",
            "platform": "Linux",
            "architecture": "x86_64"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/telemetry/stats")
async def get_telemetry_stats(authorization: str = Header(None)):
    """Obter estatísticas de telemetria"""
    user = await get_current_user(authorization)
    
    try:
        config = await db.system_config.find_one({"config_type": "main"})
        
        if not config:
            return {
                "telemetry_enabled": False,
                "session_number": 0,
                "global_number": 0
            }
        
        ceip = config.get("ceip", {})
        
        return {
            "telemetry_enabled": ceip.get("telemetry_enabled", False),
            "session_number": ceip.get("telemetry_session_number", 0),
            "global_number": ceip.get("telemetry_global_number", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/telemetry/increment")
async def increment_telemetry(authorization: str = Header(None)):
    """Incrementar contadores de telemetria"""
    user = await get_current_user(authorization)
    
    try:
        await db.system_config.update_one(
            {"config_type": "main"},
            {
                "$inc": {
                    "ceip.telemetry_session_number": 1,
                    "ceip.telemetry_global_number": 1
                }
            }
        )
        
        return {"success": True, "message": "Telemetria incrementada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
