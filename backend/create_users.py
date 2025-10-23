import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def create_default_users():
    """Create default users for AP Elite system"""
    
    # Admin user - Dra. Laura Cunha de Lima
    admin_user = {
        "id": str(uuid.uuid4()),
        "name": "Dra. Laura Cunha de Lima",
        "email": "laura@apelite.com",
        "password": "laura2024",  # In production, this should be hashed
        "role": "administrator",
        "phone": "(11) 9 1646-8611",
        "cpf": "000.000.000-00",
        "address": "R Paraguai, 454 - Jardim America, Tres Coracoes - MG",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
        "active": True
    }
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_user["email"]})
    if not existing_admin:
        await db.users.insert_one(admin_user)
        print(f"✅ Usuário admin criado: {admin_user['email']}")
    else:
        print(f"ℹ️ Usuário admin já existe: {admin_user['email']}")
    
    # Sample client user
    client_user = {
        "id": str(uuid.uuid4()),
        "name": "Cliente Teste",
        "email": "cliente@apelite.com",
        "password": "cliente2024",  # In production, this should be hashed
        "role": "client",
        "phone": "(11) 99999-9999",
        "cpf": "111.111.111-11",
        "address": "Endereço do Cliente",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
        "active": True
    }
    
    # Check if client already exists
    existing_client = await db.users.find_one({"email": client_user["email"]})
    if not existing_client:
        await db.users.insert_one(client_user)
        print(f"✅ Usuário cliente criado: {client_user['email']}")
    else:
        print(f"ℹ️ Usuário cliente já existe: {client_user['email']}")
    
    print("\n🔐 CREDENCIAIS DE ACESSO:")
    print("👨‍💼 ADMINISTRADOR (Dra. Laura):")
    print(f"   Email: {admin_user['email']}")
    print(f"   Senha: {admin_user['password']}")
    print("")
    print("👤 CLIENTE DE TESTE:")
    print(f"   Email: {client_user['email']}")
    print(f"   Senha: {client_user['password']}")
    print("")
    print("🌐 Acesse: https://apelite-erp.preview.emergentagent.com/login")
    
async def main():
    await create_default_users()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())