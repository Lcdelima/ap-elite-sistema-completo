"""
Script de migração de senhas para hash bcrypt
EXECUTAR UMA VEZ para migrar senhas de texto plano para hash
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

# Adicionar path do backend
sys.path.append('/app/backend')

from security import hash_password

async def migrate_passwords():
    """Migra todas as senhas de texto plano para hash bcrypt"""
    
    # Conectar ao MongoDB
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🔐 Iniciando migração de senhas para hash bcrypt...")
    print(f"📁 Banco de dados: {DB_NAME}")
    
    # Buscar todos os usuários
    users = await db.users.find({}).to_list(1000)
    
    print(f"\n👥 Total de usuários encontrados: {len(users)}")
    
    migrated = 0
    skipped = 0
    
    for user in users:
        password = user.get("password")
        
        # Se a senha já está em hash (começa com $2b$), pular
        if password and password.startswith("$2b$"):
            print(f"⏭️  {user.get('email')} - Senha já está em hash, pulando")
            skipped += 1
            continue
        
        # Se a senha está em texto plano, fazer hash
        if password:
            hashed = hash_password(password)
            
            await db.users.update_one(
                {"id": user.get("id")},
                {"$set": {"password": hashed}}
            )
            
            print(f"✅ {user.get('email')} - Senha migrada para hash bcrypt")
            migrated += 1
        else:
            print(f"⚠️  {user.get('email')} - Sem senha definida")
    
    print(f"\n📊 Migração concluída:")
    print(f"   ✅ Migradas: {migrated}")
    print(f"   ⏭️  Puladas (já em hash): {skipped}")
    print(f"   📁 Total: {len(users)}")
    
    client.close()
    print("\n🎉 Migração concluída com sucesso!")

if __name__ == "__main__":
    asyncio.run(migrate_passwords())
