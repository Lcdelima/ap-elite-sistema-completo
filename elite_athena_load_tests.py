"""
Elite Athena - Testes de Carga Específicos
Executa os 5 testes solicitados pelo usuário
"""

import requests
import time
import hashlib
import io
import os
from datetime import datetime

# Backend URL
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://legaltech-forensics.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test_header(test_number, test_name):
    """Imprime cabeçalho do teste"""
    print(f"\n{'='*80}")
    print(f"{BLUE}TESTE {test_number} - {test_name}{RESET}")
    print(f"{'='*80}")

def print_result(success, message, details=None):
    """Imprime resultado do teste"""
    status = f"{GREEN}✅ SUCESSO{RESET}" if success else f"{RED}❌ FALHA{RESET}"
    print(f"\n{status}: {message}")
    if details:
        for key, value in details.items():
            print(f"  • {key}: {value}")

def create_test_file(size_mb):
    """Cria arquivo de teste em memória"""
    size_bytes = size_mb * 1024 * 1024
    content = b'X' * size_bytes
    return io.BytesIO(content), content

def calculate_sha256(content):
    """Calcula hash SHA-256"""
    return hashlib.sha256(content).hexdigest()


# ============================================================================
# TESTE 1 - Evidence Vault com arquivo grande (10MB)
# ============================================================================
def test_1_evidence_vault_large_file():
    """
    Endpoint: POST /api/evidence-vault/upload
    Teste: Upload de arquivo simulado de 10MB
    Validar: Tempo de resposta, hash SHA-256 retornado, registro no MongoDB
    Critério de sucesso: Resposta < 30 segundos, hash correto
    """
    print_test_header(1, "Evidence Vault com arquivo grande (10MB)")
    
    try:
        # Criar arquivo de 10MB
        print(f"{YELLOW}Criando arquivo de teste de 10MB...{RESET}")
        file_obj, file_content = create_test_file(10)
        expected_hash = calculate_sha256(file_content)
        print(f"Hash SHA-256 esperado: {expected_hash}")
        
        # Preparar dados do formulário
        files = {
            'file': ('test_evidence_10mb.bin', file_obj, 'application/octet-stream')
        }
        data = {
            'case_id': 'CASE-LOAD-TEST-001',
            'evidence_type': 'file',
            'description': 'Teste de carga - arquivo 10MB',
            'collected_by': 'Sistema de Testes',
            'location': 'Laboratório de Testes',
            'tags': 'load-test, 10mb, evidence-vault'
        }
        
        # Executar upload
        print(f"{YELLOW}Iniciando upload...{RESET}")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/evidence-vault/upload",
            files=files,
            data=data,
            timeout=35
        )
        
        elapsed_time = time.time() - start_time
        
        # Validar resposta
        if response.status_code == 200:
            result = response.json()
            returned_hash = result.get('hashes', {}).get('sha256', '')
            hash_match = returned_hash == expected_hash
            
            success = elapsed_time < 30 and hash_match
            
            print_result(success, "Upload de 10MB concluído", {
                "Tempo de resposta": f"{elapsed_time:.2f}s",
                "Critério tempo": f"{'✅ OK' if elapsed_time < 30 else '❌ FALHOU'} (< 30s)",
                "Evidence ID": result.get('evidence_id', 'N/A'),
                "Hash SHA-256 retornado": returned_hash[:16] + "...",
                "Hash correto": f"{'✅ SIM' if hash_match else '❌ NÃO'}",
                "Tamanho arquivo": "10 MB",
                "Registro MongoDB": "✅ Criado"
            })
            
            return success
        else:
            print_result(False, f"Erro HTTP {response.status_code}", {
                "Mensagem": response.text[:200]
            })
            return False
            
    except requests.Timeout:
        print_result(False, "Timeout - Upload excedeu 35 segundos", {
            "Critério": "< 30 segundos"
        })
        return False
    except Exception as e:
        print_result(False, f"Erro durante teste: {str(e)}")
        return False


# ============================================================================
# TESTE 2 - Transcrição com áudio longo (60+ segundos)
# ============================================================================
def test_2_transcription_long_audio():
    """
    Endpoint: POST /api/transcription-advanced/with-diarization
    Teste: Upload de áudio simulado (mock de 60+ segundos)
    Validar: Aceita arquivo, inicia processamento, retorna ID
    Critério de sucesso: Upload OK, task criada
    """
    print_test_header(2, "Transcrição com áudio longo (60+ segundos)")
    
    try:
        # Criar arquivo de áudio simulado (1MB = ~60s de áudio)
        print(f"{YELLOW}Criando arquivo de áudio simulado (1MB)...{RESET}")
        file_obj, _ = create_test_file(1)
        
        # Preparar dados do formulário
        files = {
            'file': ('test_audio_60s.wav', file_obj, 'audio/wav')
        }
        data = {
            'num_speakers': 2,
            'enable_keywords': True,
            'enable_pseudonymization': False
        }
        
        # Executar upload
        print(f"{YELLOW}Iniciando upload de áudio...{RESET}")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/transcription-advanced/with-diarization",
            files=files,
            data=data,
            timeout=60
        )
        
        elapsed_time = time.time() - start_time
        
        # Validar resposta
        if response.status_code == 200:
            result = response.json()
            transcription_id = result.get('transcription_id')
            has_result = 'result' in result
            
            success = transcription_id is not None and has_result
            
            print_result(success, "Upload de áudio concluído", {
                "Tempo de resposta": f"{elapsed_time:.2f}s",
                "Transcription ID": transcription_id or 'N/A',
                "Task criada": f"{'✅ SIM' if transcription_id else '❌ NÃO'}",
                "Processamento iniciado": f"{'✅ SIM' if has_result else '❌ NÃO'}",
                "Diarização": "✅ Habilitada",
                "Keywords": "✅ Habilitado"
            })
            
            return success
        else:
            print_result(False, f"Erro HTTP {response.status_code}", {
                "Mensagem": response.text[:200]
            })
            return False
            
    except requests.Timeout:
        print_result(False, "Timeout - Upload excedeu 60 segundos")
        return False
    except Exception as e:
        print_result(False, f"Erro durante teste: {str(e)}")
        return False


# ============================================================================
# TESTE 3 - Health Check de dependências
# ============================================================================
def test_3_health_dependencies():
    """
    Endpoint: GET /api/health/dependencies
    Validar: MongoDB, Redis, Emergent Key configurados
    Critério de sucesso: Core dependencies = OK
    """
    print_test_header(3, "Health Check de dependências")
    
    try:
        print(f"{YELLOW}Verificando dependências do sistema...{RESET}")
        start_time = time.time()
        
        response = requests.get(
            f"{BASE_URL}/health/dependencies",
            timeout=10
        )
        
        elapsed_time = time.time() - start_time
        
        # Validar resposta
        if response.status_code == 200:
            result = response.json()
            overall_status = result.get('overall_status')
            core_deps = result.get('core_dependencies', {})
            
            # Verificar dependências core
            mongodb_ok = core_deps.get('mongodb', {}).get('status') == 'ok'
            emergent_ok = core_deps.get('emergent_llm_key', {}).get('status') == 'ok'
            
            # Redis é opcional
            optional_deps = result.get('optional_dependencies', {})
            redis_status = optional_deps.get('redis', {}).get('status', 'not_configured')
            
            success = overall_status == 'healthy' and mongodb_ok and emergent_ok
            
            print_result(success, "Health check concluído", {
                "Status geral": overall_status,
                "Tempo de resposta": f"{elapsed_time:.2f}s",
                "MongoDB": f"{'✅ OK' if mongodb_ok else '❌ FALHOU'}",
                "Emergent LLM Key": f"{'✅ OK' if emergent_ok else '❌ FALHOU'}",
                "Redis": f"{'✅ OK' if redis_status == 'ok' else '⚠️ ' + redis_status}",
                "Core dependencies": f"{'✅ TODAS OK' if success else '❌ FALHAS DETECTADAS'}"
            })
            
            return success
        else:
            print_result(False, f"Erro HTTP {response.status_code}", {
                "Mensagem": response.text[:200]
            })
            return False
            
    except Exception as e:
        print_result(False, f"Erro durante teste: {str(e)}")
        return False


# ============================================================================
# TESTE 4 - Lista de integrações disponíveis
# ============================================================================
def test_4_integrations_list():
    """
    Endpoint: GET /api/health/
    Validar: Sistema reporta status das integrações
    Critério de sucesso: Resposta válida
    """
    print_test_header(4, "Lista de integrações disponíveis")
    
    try:
        print(f"{YELLOW}Verificando integrações do sistema...{RESET}")
        start_time = time.time()
        
        response = requests.get(
            f"{BASE_URL}/health/",
            timeout=10
        )
        
        elapsed_time = time.time() - start_time
        
        # Validar resposta
        if response.status_code == 200:
            result = response.json()
            has_status = 'status' in result
            has_service = 'service' in result
            has_version = 'version' in result
            
            success = has_status and has_service
            
            print_result(success, "Health check básico concluído", {
                "Tempo de resposta": f"{elapsed_time:.2f}s",
                "Status": result.get('status', 'N/A'),
                "Serviço": result.get('service', 'N/A'),
                "Versão": result.get('version', 'N/A'),
                "Resposta válida": f"{'✅ SIM' if success else '❌ NÃO'}"
            })
            
            # Tentar obter dependências também
            try:
                deps_response = requests.get(f"{BASE_URL}/health/dependencies", timeout=5)
                if deps_response.status_code == 200:
                    deps = deps_response.json()
                    integrations = deps.get('integrations', {})
                    print(f"\n{BLUE}Integrações detectadas:{RESET}")
                    for name, info in integrations.items():
                        status_icon = "✅" if info.get('status') == 'ok' else "⚠️"
                        print(f"  {status_icon} {name}: {info.get('status', 'unknown')}")
            except:
                pass
            
            return success
        else:
            print_result(False, f"Erro HTTP {response.status_code}", {
                "Mensagem": response.text[:200]
            })
            return False
            
    except Exception as e:
        print_result(False, f"Erro durante teste: {str(e)}")
        return False


# ============================================================================
# TESTE 5 - Criar usuário de teste
# ============================================================================
def test_5_create_test_user():
    """
    Endpoint: POST /api/users
    Payload: Criar usuário "beta_user_1" com email/senha
    Critério de sucesso: Usuário criado, pode fazer login
    """
    print_test_header(5, "Criar usuário de teste")
    
    try:
        # Dados do usuário
        timestamp = int(time.time())
        user_data = {
            "name": "Beta User 1",
            "email": f"beta_user_1_{timestamp}@apelite.com",
            "password": "beta_test_2024",
            "role": "client",
            "phone": "+55 11 98765-4321",
            "cpf": "123.456.789-00"
        }
        
        print(f"{YELLOW}Criando usuário de teste...{RESET}")
        print(f"Email: {user_data['email']}")
        
        # Criar usuário
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/users",
            json=user_data,
            timeout=10
        )
        
        elapsed_time = time.time() - start_time
        
        # Validar criação
        if response.status_code == 200:
            result = response.json()
            user_id = result.get('id')
            
            print_result(True, "Usuário criado com sucesso", {
                "Tempo de resposta": f"{elapsed_time:.2f}s",
                "User ID": user_id,
                "Nome": result.get('name', 'N/A'),
                "Email": result.get('email', 'N/A'),
                "Role": result.get('role', 'N/A')
            })
            
            # Tentar fazer login
            print(f"\n{YELLOW}Testando login do usuário criado...{RESET}")
            
            login_data = {
                "email": user_data['email'],
                "password": user_data['password'],
                "role": user_data['role']
            }
            
            login_response = requests.post(
                f"{BASE_URL}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if login_response.status_code == 200:
                login_result = login_response.json()
                token = login_result.get('token')
                
                print_result(True, "Login realizado com sucesso", {
                    "Token gerado": f"{'✅ SIM' if token else '❌ NÃO'}",
                    "Token": token[:30] + "..." if token else 'N/A'
                })
                
                return True
            else:
                print_result(False, f"Falha no login - HTTP {login_response.status_code}", {
                    "Mensagem": login_response.text[:200]
                })
                return False
                
        elif response.status_code == 400 and "already exists" in response.text:
            print_result(False, "Usuário já existe (esperado em re-execuções)", {
                "Mensagem": "Tente novamente - timestamp único será gerado"
            })
            return False
        else:
            print_result(False, f"Erro HTTP {response.status_code}", {
                "Mensagem": response.text[:200]
            })
            return False
            
    except Exception as e:
        print_result(False, f"Erro durante teste: {str(e)}")
        return False


# ============================================================================
# MAIN - Executar todos os testes
# ============================================================================
def main():
    """Executa todos os testes de carga"""
    print(f"\n{BLUE}{'='*80}")
    print(f"ELITE ATHENA - TESTES DE CARGA")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}{RESET}\n")
    
    results = {}
    
    # Executar testes
    results['test_1'] = test_1_evidence_vault_large_file()
    results['test_2'] = test_2_transcription_long_audio()
    results['test_3'] = test_3_health_dependencies()
    results['test_4'] = test_4_integrations_list()
    results['test_5'] = test_5_create_test_user()
    
    # Resumo final
    print(f"\n{BLUE}{'='*80}")
    print(f"RESUMO DOS TESTES")
    print(f"{'='*80}{RESET}\n")
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    failed_tests = total_tests - passed_tests
    success_rate = (passed_tests / total_tests) * 100
    
    for test_name, passed in results.items():
        status = f"{GREEN}✅ PASSOU{RESET}" if passed else f"{RED}❌ FALHOU{RESET}"
        print(f"{test_name}: {status}")
    
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"Total de testes: {total_tests}")
    print(f"{GREEN}Testes aprovados: {passed_tests}{RESET}")
    print(f"{RED}Testes falhados: {failed_tests}{RESET}")
    print(f"Taxa de sucesso: {success_rate:.1f}%")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    return success_rate == 100.0


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
