import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import uuid
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables  
ROOT_DIR = Path("backend")
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def create_sample_data():
    """Create sample data for testing the system"""
    
    # Get client user
    client_user = await db.users.find_one({"email": "cliente@apelite.com"})
    if not client_user:
        print("❌ Cliente não encontrado. Execute create_users.py primeiro.")
        return
    
    # Sample case
    sample_case = {
        "id": str(uuid.uuid4()),
        "client_id": client_user["id"],
        "title": "Perícia Digital - Recuperação de Dados",
        "service_type": "Perícia Digital",
        "description": "Análise forense de dispositivo móvel para recuperação de mensagens deletadas.",
        "status": "active",
        "priority": "normal",
        "start_date": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
        "completion_date": None,
        "estimated_completion": (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
        "assigned_to": "Dra. Laura Cunha de Lima",
        "fee": 2500.00,
        "notes": "Cliente solicitou análise urgente devido a processo judicial.",
        "created_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    }
    
    existing_case = await db.cases.find_one({"title": sample_case["title"]})
    if not existing_case:
        await db.cases.insert_one(sample_case)
        print(f"✅ Caso exemplo criado: {sample_case['title']}")
    
    # Sample appointment
    sample_appointment = {
        "id": str(uuid.uuid4()),
        "name": client_user["name"],
        "email": client_user["email"],
        "phone": client_user["phone"],
        "service": "Consulta de Acompanhamento",
        "datetime": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
        "description": "Reunião para discutir andamento da perícia digital.",
        "urgency": "normal",
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_appointment = await db.appointments.find_one({"email": client_user["email"]})
    if not existing_appointment:
        await db.appointments.insert_one(sample_appointment)
        print(f"✅ Agendamento exemplo criado para: {client_user['name']}")
    
    # Sample document
    sample_document = {
        "id": str(uuid.uuid4()),
        "case_id": sample_case["id"],
        "client_id": client_user["id"],
        "filename": "Relatório_Inicial_Perícia.pdf",
        "file_type": "application/pdf",
        "file_size": 1024000,  # 1MB
        "description": "Relatório inicial da análise pericial",
        "category": "relatorio",
        "upload_date": datetime.now(timezone.utc).isoformat(),
        "confidential": True
    }
    
    existing_doc = await db.documents.find_one({"filename": sample_document["filename"]})
    if not existing_doc:
        await db.documents.insert_one(sample_document)
        print(f"✅ Documento exemplo criado: {sample_document['filename']}")
    
    print("\n✅ Dados de exemplo criados com sucesso!")
    print("\n📊 RESUMO DOS DADOS:")
    print(f"- 1 caso ativo para {client_user['name']}")
    print(f"- 1 agendamento confirmado")
    print(f"- 1 documento disponível")

async def main():
    await create_sample_data()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())