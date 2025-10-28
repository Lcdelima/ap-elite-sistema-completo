#!/usr/bin/env python3
"""
Script para criar usuários padrão no sistema AP Elite
"""

import requests
import json

BACKEND_URL = "http://localhost:8001"

usuarios_padrao = [
    {
        "name": "Administrador Elite",
        "email": "admin@apelite.com",
        "password": "admin123",
        "role": "administrator",
        "phone": "(11) 98765-0001",
        "cpf": "123.456.789-00"
    },
    {
        "name": "Laura Perita",
        "email": "laura@apelite.com",
        "password": "senha123",
        "role": "administrator",
        "phone": "(11) 98765-4321",
        "cpf": "987.654.321-00"
    },
    {
        "name": "João Silva",
        "email": "joao@email.com",
        "password": "cliente123",
        "role": "client",
        "phone": "(11) 99999-1111",
        "cpf": "111.222.333-44"
    },
    {
        "name": "Maria Santos",
        "email": "maria@email.com",
        "password": "cliente123",
        "role": "client",
        "phone": "(11) 99999-2222",
        "cpf": "222.333.444-55"
    },
    {
        "name": "Pedro Oliveira",
        "email": "pedro@email.com",
        "password": "cliente123",
        "role": "client",
        "phone": "(11) 99999-3333",
        "cpf": "333.444.555-66"
    }
]

def criar_usuarios():
    print("🚀 Criando usuários padrão no sistema AP Elite...\n")
    
    for usuario in usuarios_padrao:
        try:
            # Tenta criar o usuário
            response = requests.post(
                f"{BACKEND_URL}/api/users",
                json=usuario,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Usuário criado: {usuario['name']} ({usuario['email']})")
                print(f"   Role: {usuario['role']} | Senha: {usuario['password']}")
            elif response.status_code == 400 and "already exists" in response.text:
                print(f"⚠️  Usuário já existe: {usuario['email']}")
            else:
                print(f"❌ Erro ao criar {usuario['email']}: {response.text}")
        except Exception as e:
            print(f"❌ Erro ao criar {usuario['email']}: {str(e)}")
    
    print("\n" + "="*60)
    print("✅ Processo concluído!")
    print("="*60)
    print("\n📝 CREDENCIAIS DE ACESSO:\n")
    print("ADMINISTRADORES:")
    print("  • admin@apelite.com / admin123")
    print("  • laura@apelite.com / senha123")
    print("\nCLIENTES:")
    print("  • joao@email.com / cliente123")
    print("  • maria@email.com / cliente123")
    print("  • pedro@email.com / cliente123")
    print("\n" + "="*60)

if __name__ == "__main__":
    criar_usuarios()
