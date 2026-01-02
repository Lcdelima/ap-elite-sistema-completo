#!/usr/bin/env python3
"""
Script de Teste de Integração - Aegis/Thanatos
Testa todos os endpoints principais da API
"""

import requests
import time
import hashlib
import json
from pathlib import Path

# Configurações
API_URL = "http://localhost:8002"
ACTOR_ID = "test@example.com"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def log_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def log_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")

def log_warning(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")

def test_health():
    """Teste 1: Verificar se API está online"""
    log_info("Teste 1: Verificando saúde da API...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        log_success("API está online e saudável")
        return True
    except Exception as e:
        log_error(f"Falha no teste de saúde: {e}")
        return False

def test_create_case():
    """Teste 2: Criar caso"""
    log_info("Teste 2: Criando caso...")
    try:
        response = requests.post(
            f"{API_URL}/cases",
            json={"name": "Teste Automatizado"},
            headers={"X-Actor-Id": ACTOR_ID}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == "Teste Automatizado"
        log_success(f"Caso criado com ID: {data['id']}")
        return data["id"]
    except Exception as e:
        log_error(f"Falha ao criar caso: {e}")
        return None

def test_create_target(case_id):
    """Teste 3: Criar alvo"""
    log_info("Teste 3: Criando alvo...")
    try:
        response = requests.post(
            f"{API_URL}/cases/{case_id}/targets",
            json={
                "type": "PHONE",
                "value": "+5511999999999",
                "label": "Alvo Teste"
            },
            headers={"X-Actor-Id": ACTOR_ID}
        )
        assert response.status_code == 200
        data = response.json()
        log_success(f"Alvo criado com ID: {data['id']}")
        return data["id"]
    except Exception as e:
        log_error(f"Falha ao criar alvo: {e}")
        return None

def test_upload_judicial_order(case_id):
    """Teste 4: Upload de ordem judicial"""
    log_info("Teste 4: Fazendo upload de ordem judicial...")
    try:
        # Criar arquivo PDF mock
        mock_pdf = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n"
        
        response = requests.post(
            f"{API_URL}/cases/{case_id}/judicial-orders",
            files={"file": ("ordem_teste.pdf", mock_pdf, "application/pdf")},
            data={
                "process_number": "1234567-89.2024.8.26.0100",
                "court": "Tribunal Teste",
                "judge": "Juiz Teste",
                "valid_from": "2024-01-01T00:00:00Z",
                "valid_until": "2024-12-31T23:59:59Z"
            },
            headers={"X-Actor-Id": ACTOR_ID}
        )
        assert response.status_code == 200
        data = response.json()
        log_success(f"Ordem judicial criada com ID: {data['id']}")
        return data["id"]
    except Exception as e:
        log_error(f"Falha ao criar ordem judicial: {e}")
        return None

def test_upload_audio(case_id, target_id):
    """Teste 5: Upload de áudio"""
    log_info("Teste 5: Fazendo upload de áudio...")
    try:
        # Criar arquivo de áudio mock
        mock_audio = b"ID3" + b"\x00" * 1000  # Mock MP3
        
        response = requests.post(
            f"{API_URL}/cases/{case_id}/evidences/audio",
            files={"file": ("audio_teste.mp3", mock_audio, "audio/mpeg")},
            data={"target_id": target_id},
            headers={"X-Actor-Id": ACTOR_ID}
        )
        assert response.status_code == 200
        data = response.json()
        log_success(f"Evidência de áudio criada com ID: {data['id']}")
        log_info(f"Status: {data['status']}")
        log_info(f"SHA256: {data['sha256'][:16]}...")
        return data["id"]
    except Exception as e:
        log_error(f"Falha ao fazer upload de áudio: {e}")
        return None

def test_list_evidences(case_id):
    """Teste 6: Listar evidências"""
    log_info("Teste 6: Listando evidências...")
    try:
        response = requests.get(
            f"{API_URL}/cases/{case_id}/evidences",
            headers={"X-Actor-Id": ACTOR_ID}
        )
        assert response.status_code == 200
        data = response.json()
        log_success(f"Listadas {len(data)} evidência(s)")
        return True
    except Exception as e:
        log_error(f"Falha ao listar evidências: {e}")
        return False

def test_get_evidence(evidence_id):
    """Teste 7: Obter detalhes de evidência"""
    log_info("Teste 7: Obtendo detalhes de evidência...")
    try:
        response = requests.get(
            f"{API_URL}/evidences/{evidence_id}",
            headers={"X-Actor-Id": ACTOR_ID}
        )
        assert response.status_code == 200
        data = response.json()
        log_success("Detalhes de evidência obtidos")
        
        if data.get("transcription"):
            log_success("Transcrição disponível!")
        else:
            log_warning("Transcrição ainda não disponível")
        
        return True
    except Exception as e:
        log_error(f"Falha ao obter evidência: {e}")
        return False

def run_all_tests():
    """Executar todos os testes"""
    print("\n" + "="*60)
    print("  Aegis/Thanatos - Teste de Integração Completo")
    print("="*60 + "\n")
    
    results = []
    
    # Teste 1: Health
    results.append(("Health Check", test_health()))
    
    if not results[-1][1]:
        log_error("API não está disponível. Abortando testes.")
        return
    
    # Teste 2: Criar caso
    case_id = test_create_case()
    results.append(("Criar Caso", case_id is not None))
    
    if not case_id:
        log_error("Não foi possível criar caso. Abortando testes.")
        return
    
    # Teste 3: Criar alvo
    target_id = test_create_target(case_id)
    results.append(("Criar Alvo", target_id is not None))
    
    # Teste 4: Upload ordem judicial
    order_id = test_upload_judicial_order(case_id)
    results.append(("Upload Ordem Judicial", order_id is not None))
    
    # Teste 5: Upload áudio
    evidence_id = test_upload_audio(case_id, target_id)
    results.append(("Upload Áudio", evidence_id is not None))
    
    # Teste 6: Listar evidências
    results.append(("Listar Evidências", test_list_evidences(case_id)))
    
    # Teste 7: Obter evidência
    if evidence_id:
        results.append(("Obter Evidência", test_get_evidence(evidence_id)))
    
    # Resumo
    print("\n" + "="*60)
    print("  RESUMO DOS TESTES")
    print("="*60 + "\n")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = f"{Colors.GREEN}✅ PASSOU{Colors.END}" if success else f"{Colors.RED}❌ FALHOU{Colors.END}"
        print(f"{test_name:<30} {status}")
    
    print("\n" + "-"*60)
    percentage = (passed / total * 100) if total > 0 else 0
    color = Colors.GREEN if percentage == 100 else Colors.YELLOW if percentage >= 70 else Colors.RED
    print(f"Total: {color}{passed}/{total} testes passaram ({percentage:.1f}%){Colors.END}")
    print("="*60 + "\n")
    
    if percentage == 100:
        log_success("✨ Todos os testes passaram! Sistema pronto para produção.")
    elif percentage >= 70:
        log_warning("🚧 Alguns testes falharam. Revisar antes de deploy.")
    else:
        log_error("🚫 Muitos testes falharam. Sistema não está pronto.")

if __name__ == "__main__":
    run_all_tests()
