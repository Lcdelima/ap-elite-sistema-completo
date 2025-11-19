"""
AP ELITE GRAVITAS™ - Core Database Module
Centralização da conexão MongoDB para eliminar importações circulares

Este módulo fornece a instância do banco de dados MongoDB
que pode ser importada por TODOS os outros módulos sem dependência circular.
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do MongoDB
MONGO_CONNECTION_STRING = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test_database")

# Criar cliente MongoDB
client = AsyncIOMotorClient(MONGO_CONNECTION_STRING)

# Instância do banco de dados
db = client[DB_NAME]

# Função helper para obter o banco
def get_database():
    """
    Retorna a instância do banco de dados
    Útil para dependency injection em FastAPI
    """
    return db

# Função para fechar conexão (usar no shutdown do app)
async def close_database_connection():
    """
    Fecha a conexão com MongoDB
    Deve ser chamada no evento shutdown do FastAPI
    """
    client.close()
