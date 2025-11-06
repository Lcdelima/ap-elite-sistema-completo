"""
Backend Test Suite for Elite Athena Calculator System
Tests the 5 specific calculator endpoints as requested
"""
import requests
import json
import sys

# Backend URL from environment
BACKEND_URL = "https://legaltech-forensics.preview.emergentagent.com/api"

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*80}")
    print(f"TESTE: {test_name}")
    print(f"{'='*80}")

def print_result(success, message, details=None):
    """Print formatted test result"""
    status = "✅ PASSOU" if success else "❌ FALHOU"
    print(f"\n{status}: {message}")
    if details:
        print(f"Detalhes: {json.dumps(details, indent=2, ensure_ascii=False)}")

def test_1_pena_trifasico():
    """TESTE 1 - Calculadora de Pena Trifásico"""
    print_test_header("TESTE 1 - Calculadora de Pena Trifásico")
    
    endpoint = f"{BACKEND_URL}/calculadoras/criminal/pena-trifasico"
    payload = {
        "pena_base_meses": 60,
        "atenuantes": 1,
        "agravantes": 0,
        "majorantes_percentual": 0,
        "minorantes_percentual": 0
    }
    
    print(f"Endpoint: POST {endpoint}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(endpoint, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Validar campos esperados
            if "pena_final_meses" in data:
                print_result(True, "Calculadora de Pena Trifásico funcionando corretamente", {
                    "pena_base_meses": data.get("pena_base_meses"),
                    "pena_final_meses": data.get("pena_final_meses"),
                    "pena_final_anos": data.get("pena_final_anos")
                })
                return True
            else:
                print_result(False, "Campo 'pena_final_meses' não encontrado na resposta", data)
                return False
        else:
            print_result(False, f"Status code inesperado: {response.status_code}", {
                "response": response.text
            })
            return False
            
    except Exception as e:
        print_result(False, f"Erro na requisição: {str(e)}")
        return False

def test_2_irpf():
    """TESTE 2 - Calculadora IRPF"""
    print_test_header("TESTE 2 - Calculadora IRPF")
    
    endpoint = f"{BACKEND_URL}/calc-universal/tributario/irpf"
    payload = {
        "renda_anual": 50000,
        "dependentes": 2,
        "deducoes": 5000
    }
    
    print(f"Endpoint: POST {endpoint}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(endpoint, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Validar campos esperados
            if "imposto_devido" in data:
                print_result(True, "Calculadora IRPF funcionando corretamente", {
                    "renda_anual": data.get("renda_anual"),
                    "dependentes": data.get("dependentes"),
                    "imposto_devido": data.get("imposto_devido"),
                    "aliquota_efetiva": data.get("aliquota_efetiva")
                })
                return True
            else:
                print_result(False, "Campo 'imposto_devido' não encontrado na resposta", data)
                return False
        else:
            print_result(False, f"Status code inesperado: {response.status_code}", {
                "response": response.text
            })
            return False
            
    except Exception as e:
        print_result(False, f"Erro na requisição: {str(e)}")
        return False

def test_3_ferias():
    """TESTE 3 - Calculadora Férias"""
    print_test_header("TESTE 3 - Calculadora Férias")
    
    endpoint = f"{BACKEND_URL}/calculadoras/trabalhista/ferias"
    payload = {
        "salario": 3000,
        "dias_ferias": 30
    }
    
    print(f"Endpoint: POST {endpoint}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(endpoint, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Validar campos esperados
            if "valor_ferias" in data and "terco_constitucional" in data:
                print_result(True, "Calculadora Férias funcionando corretamente", {
                    "salario": data.get("salario"),
                    "dias_ferias": data.get("dias_ferias"),
                    "valor_ferias": data.get("valor_ferias"),
                    "terco_constitucional": data.get("terco_constitucional"),
                    "total": data.get("total")
                })
                return True
            else:
                print_result(False, "Campos 'valor_ferias' ou 'terco_constitucional' não encontrados", data)
                return False
        else:
            print_result(False, f"Status code inesperado: {response.status_code}", {
                "response": response.text
            })
            return False
            
    except Exception as e:
        print_result(False, f"Erro na requisição: {str(e)}")
        return False

def test_4_health_check():
    """TESTE 4 - Health Check"""
    print_test_header("TESTE 4 - Health Check")
    
    endpoint = f"{BACKEND_URL}/health/"
    
    print(f"Endpoint: GET {endpoint}")
    
    try:
        response = requests.get(endpoint, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Validar campos esperados
            if data.get("status") == "healthy":
                print_result(True, "Health Check funcionando corretamente", {
                    "status": data.get("status"),
                    "service": data.get("service"),
                    "version": data.get("version")
                })
                return True
            else:
                print_result(False, "Status não é 'healthy'", data)
                return False
        else:
            print_result(False, f"Status code inesperado: {response.status_code}", {
                "response": response.text
            })
            return False
            
    except Exception as e:
        print_result(False, f"Erro na requisição: {str(e)}")
        return False

def test_5_lista_completa():
    """TESTE 5 - Lista de Calculadoras"""
    print_test_header("TESTE 5 - Lista de Calculadoras")
    
    endpoint = f"{BACKEND_URL}/calc-final/lista-completa"
    
    print(f"Endpoint: GET {endpoint}")
    
    try:
        response = requests.get(endpoint, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Validar campos esperados
            if data.get("total") == 54 and data.get("implementadas") == 54:
                print_result(True, "Lista de Calculadoras funcionando corretamente", {
                    "total": data.get("total"),
                    "implementadas": data.get("implementadas"),
                    "progresso": data.get("progresso")
                })
                return True
            else:
                print_result(False, f"Total ou implementadas diferente de 54", data)
                return False
        else:
            print_result(False, f"Status code inesperado: {response.status_code}", {
                "response": response.text
            })
            return False
            
    except Exception as e:
        print_result(False, f"Erro na requisição: {str(e)}")
        return False

def main():
    """Execute all tests"""
    print("\n" + "="*80)
    print("ELITE ATHENA - TESTE DE CALCULADORAS")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    
    results = {
        "TESTE 1 - Pena Trifásico": test_1_pena_trifasico(),
        "TESTE 2 - IRPF": test_2_irpf(),
        "TESTE 3 - Férias": test_3_ferias(),
        "TESTE 4 - Health Check": test_4_health_check(),
        "TESTE 5 - Lista Completa": test_5_lista_completa()
    }
    
    # Summary
    print("\n" + "="*80)
    print("RESUMO DOS TESTES")
    print("="*80)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*80}")
    print(f"RESULTADO FINAL: {passed}/{total} testes passaram ({passed/total*100:.1f}%)")
    print(f"{'='*80}\n")
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()
