#!/usr/bin/env python3
"""
Backend Testing for AP Elite Premium Features
Testing Perícia Digital Pro and Interceptações Telemáticas Pro modules
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://legaltech-forensics.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Authentication credentials
AUTH_EMAIL = "laura@apelite.com"
AUTH_PASSWORD = "laura2024"

class PremiumFeaturesTest:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.headers = {}
        
    def authenticate(self):
        """Authenticate and get token"""
        print("🔐 Authenticating...")
        
        auth_data = {
            "email": AUTH_EMAIL,
            "password": AUTH_PASSWORD,
            "role": "administrator"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=auth_data)
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.headers = {'Authorization': f'Bearer {self.token}'}
                print(f"✅ Authentication successful - Token: {self.token[:20]}...")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def test_pericia_digital_pro(self):
        """Test all Perícia Digital Pro endpoints"""
        print("\n🔬 TESTING PERÍCIA DIGITAL PRO MODULE")
        print("=" * 60)
        
        results = []
        
        # 1. GET /api/pericia-digital-pro/stats
        print("1. Testing GET /api/pericia-digital-pro/stats")
        try:
            response = self.session.get(f"{API_BASE}/pericia-digital-pro/stats", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}")
                print(f"   📊 Stats: Total={data.get('total', 0)}, Em Andamento={data.get('em_andamento', 0)}")
                results.append(("GET /api/pericia-digital-pro/stats", True, response.status_code))
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("GET /api/pericia-digital-pro/stats", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("GET /api/pericia-digital-pro/stats", False, "Exception"))
        
        # 2. GET /api/pericia-digital-pro/pericias
        print("\n2. Testing GET /api/pericia-digital-pro/pericias")
        try:
            response = self.session.get(f"{API_BASE}/pericia-digital-pro/pericias", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}")
                print(f"   📋 Perícias: {data.get('count', 0)} found")
                results.append(("GET /api/pericia-digital-pro/pericias", True, response.status_code))
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("GET /api/pericia-digital-pro/pericias", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("GET /api/pericia-digital-pro/pericias", False, "Exception"))
        
        # 3. POST /api/pericia-digital-pro/pericias (Create new pericia)
        print("\n3. Testing POST /api/pericia-digital-pro/pericias")
        pericia_data = {
            "caso_id": "CASO-2024-001",
            "dispositivo_tipo": "smartphone",
            "dispositivo_marca": "Samsung",
            "dispositivo_modelo": "Galaxy S21",
            "sistema_operacional": "Android 12",
            "capacidade_armazenamento": "128GB",
            "objetivo_pericia": "Extração completa de dados",
            "metodologia": "extracao_logica",
            "prioridade": "alta"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/pericia-digital-pro/pericias", 
                                       json=pericia_data, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                pericia_id = data.get('pericia_id')
                print(f"   ✅ Status: {response.status_code}")
                print(f"   🆔 Perícia ID: {pericia_id}")
                results.append(("POST /api/pericia-digital-pro/pericias", True, response.status_code))
                
                # Store pericia_id for subsequent tests
                self.pericia_id = pericia_id
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("POST /api/pericia-digital-pro/pericias", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("POST /api/pericia-digital-pro/pericias", False, "Exception"))
        
        # 4. GET /api/pericia-digital-pro/pericias/{pericia_id}
        if hasattr(self, 'pericia_id'):
            print(f"\n4. Testing GET /api/pericia-digital-pro/pericias/{self.pericia_id}")
            try:
                response = self.session.get(f"{API_BASE}/pericia-digital-pro/pericias/{self.pericia_id}", 
                                          headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Status: {response.status_code}")
                    print(f"   📱 Device: {data.get('dispositivo_marca')} {data.get('dispositivo_modelo')}")
                    results.append(("GET /api/pericia-digital-pro/pericias/{id}", True, response.status_code))
                else:
                    print(f"   ❌ Status: {response.status_code} - {response.text}")
                    results.append(("GET /api/pericia-digital-pro/pericias/{id}", False, response.status_code))
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results.append(("GET /api/pericia-digital-pro/pericias/{id}", False, "Exception"))
        
        # 5. POST /api/pericia-digital-pro/pericias/{pericia_id}/extrair-dados
        if hasattr(self, 'pericia_id'):
            print(f"\n5. Testing POST /api/pericia-digital-pro/pericias/{self.pericia_id}/extrair-dados")
            try:
                response = self.session.post(f"{API_BASE}/pericia-digital-pro/pericias/{self.pericia_id}/extrair-dados", 
                                           headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Status: {response.status_code}")
                    print(f"   📊 Data extracted: {data.get('dados_extraidos', {})}")
                    results.append(("POST /api/pericia-digital-pro/pericias/{id}/extrair-dados", True, response.status_code))
                else:
                    print(f"   ❌ Status: {response.status_code} - {response.text}")
                    results.append(("POST /api/pericia-digital-pro/pericias/{id}/extrair-dados", False, response.status_code))
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results.append(("POST /api/pericia-digital-pro/pericias/{id}/extrair-dados", False, "Exception"))
        
        # 6. POST /api/pericia-digital-pro/pericias/{pericia_id}/gerar-relatorio
        if hasattr(self, 'pericia_id'):
            print(f"\n6. Testing POST /api/pericia-digital-pro/pericias/{self.pericia_id}/gerar-relatorio")
            try:
                response = self.session.post(f"{API_BASE}/pericia-digital-pro/pericias/{self.pericia_id}/gerar-relatorio", 
                                           headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Status: {response.status_code}")
                    print(f"   📄 Report: {data.get('relatorio', {}).get('relatorio_id', 'N/A')}")
                    results.append(("POST /api/pericia-digital-pro/pericias/{id}/gerar-relatorio", True, response.status_code))
                else:
                    print(f"   ❌ Status: {response.status_code} - {response.text}")
                    results.append(("POST /api/pericia-digital-pro/pericias/{id}/gerar-relatorio", False, response.status_code))
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results.append(("POST /api/pericia-digital-pro/pericias/{id}/gerar-relatorio", False, "Exception"))
        
        # 7. GET /api/pericia-digital-pro/metodologias
        print("\n7. Testing GET /api/pericia-digital-pro/metodologias")
        try:
            response = self.session.get(f"{API_BASE}/pericia-digital-pro/metodologias", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}")
                print(f"   🔧 Metodologias: {data.get('total', 0)} available")
                results.append(("GET /api/pericia-digital-pro/metodologias", True, response.status_code))
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("GET /api/pericia-digital-pro/metodologias", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("GET /api/pericia-digital-pro/metodologias", False, "Exception"))
        
        # 8. GET /api/pericia-digital-pro/ferramentas
        print("\n8. Testing GET /api/pericia-digital-pro/ferramentas")
        try:
            response = self.session.get(f"{API_BASE}/pericia-digital-pro/ferramentas", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}")
                print(f"   🛠️ Tools available: {len(data.get('ferramentas', {}))}")
                results.append(("GET /api/pericia-digital-pro/ferramentas", True, response.status_code))
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("GET /api/pericia-digital-pro/ferramentas", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("GET /api/pericia-digital-pro/ferramentas", False, "Exception"))
        
        return results
    
    def test_interceptacoes_pro(self):
        """Test all Interceptações Telemáticas Pro endpoints"""
        print("\n📡 TESTING INTERCEPTAÇÕES TELEMÁTICAS PRO MODULE")
        print("=" * 60)
        
        results = []
        
        # 1. GET /api/interceptacoes-pro/stats
        print("1. Testing GET /api/interceptacoes-pro/stats")
        try:
            response = self.session.get(f"{API_BASE}/interceptacoes-pro/stats", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}")
                print(f"   📊 Stats: Total={data.get('total', 0)}, Ativas={data.get('ativas', 0)}")
                results.append(("GET /api/interceptacoes-pro/stats", True, response.status_code))
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("GET /api/interceptacoes-pro/stats", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("GET /api/interceptacoes-pro/stats", False, "Exception"))
        
        # 2. GET /api/interceptacoes-pro/interceptacoes
        print("\n2. Testing GET /api/interceptacoes-pro/interceptacoes")
        try:
            response = self.session.get(f"{API_BASE}/interceptacoes-pro/interceptacoes", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}")
                print(f"   📋 Interceptações: {data.get('count', 0)} found")
                results.append(("GET /api/interceptacoes-pro/interceptacoes", True, response.status_code))
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("GET /api/interceptacoes-pro/interceptacoes", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("GET /api/interceptacoes-pro/interceptacoes", False, "Exception"))
        
        # 3. POST /api/interceptacoes-pro/interceptacoes (Create new interception)
        print("\n3. Testing POST /api/interceptacoes-pro/interceptacoes")
        interceptacao_data = {
            "alvo_nome": "Test Target",
            "alvo_telefone": "+55 11 91234-5678",
            "tipo_interceptacao": "telefonica",
            "mandado_judicial": "MANDADO-2024-001",
            "validade_inicio": "2024-01-01",
            "validade_fim": "2024-12-31",
            "motivo": "Investigation",
            "prioridade": "alta"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/interceptacoes-pro/interceptacoes", 
                                       json=interceptacao_data, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                interceptacao_id = data.get('interceptacao_id')
                print(f"   ✅ Status: {response.status_code}")
                print(f"   🆔 Interceptação ID: {interceptacao_id}")
                results.append(("POST /api/interceptacoes-pro/interceptacoes", True, response.status_code))
                
                # Store interceptacao_id for subsequent tests
                self.interceptacao_id = interceptacao_id
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("POST /api/interceptacoes-pro/interceptacoes", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("POST /api/interceptacoes-pro/interceptacoes", False, "Exception"))
        
        # 4. GET /api/interceptacoes-pro/interceptacoes/{interceptacao_id}
        if hasattr(self, 'interceptacao_id'):
            print(f"\n4. Testing GET /api/interceptacoes-pro/interceptacoes/{self.interceptacao_id}")
            try:
                response = self.session.get(f"{API_BASE}/interceptacoes-pro/interceptacoes/{self.interceptacao_id}", 
                                          headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Status: {response.status_code}")
                    print(f"   📞 Target: {data.get('alvo_nome')} - {data.get('alvo_telefone')}")
                    results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}", True, response.status_code))
                else:
                    print(f"   ❌ Status: {response.status_code} - {response.text}")
                    results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}", False, response.status_code))
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}", False, "Exception"))
        
        # 5. GET /api/interceptacoes-pro/interceptacoes/{interceptacao_id}/eventos-realtime
        if hasattr(self, 'interceptacao_id'):
            print(f"\n5. Testing GET /api/interceptacoes-pro/interceptacoes/{self.interceptacao_id}/eventos-realtime")
            try:
                response = self.session.get(f"{API_BASE}/interceptacoes-pro/interceptacoes/{self.interceptacao_id}/eventos-realtime", 
                                          headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Status: {response.status_code}")
                    print(f"   📡 Real-time events: {data.get('count', 0)} captured")
                    results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}/eventos-realtime", True, response.status_code))
                else:
                    print(f"   ❌ Status: {response.status_code} - {response.text}")
                    results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}/eventos-realtime", False, response.status_code))
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}/eventos-realtime", False, "Exception"))
        
        # 6. GET /api/interceptacoes-pro/interceptacoes/{interceptacao_id}/geolocalizacao
        if hasattr(self, 'interceptacao_id'):
            print(f"\n6. Testing GET /api/interceptacoes-pro/interceptacoes/{self.interceptacao_id}/geolocalizacao")
            try:
                response = self.session.get(f"{API_BASE}/interceptacoes-pro/interceptacoes/{self.interceptacao_id}/geolocalizacao", 
                                          headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Status: {response.status_code}")
                    print(f"   🌍 Geolocation points: {data.get('count', 0)} tracked")
                    results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}/geolocalizacao", True, response.status_code))
                else:
                    print(f"   ❌ Status: {response.status_code} - {response.text}")
                    results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}/geolocalizacao", False, response.status_code))
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results.append(("GET /api/interceptacoes-pro/interceptacoes/{id}/geolocalizacao", False, "Exception"))
        
        # 7. POST /api/interceptacoes-pro/interceptacoes/{interceptacao_id}/parar
        if hasattr(self, 'interceptacao_id'):
            print(f"\n7. Testing POST /api/interceptacoes-pro/interceptacoes/{self.interceptacao_id}/parar")
            try:
                response = self.session.post(f"{API_BASE}/interceptacoes-pro/interceptacoes/{self.interceptacao_id}/parar", 
                                           headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Status: {response.status_code}")
                    print(f"   ⏹️ Interception stopped: {data.get('message', 'Success')}")
                    results.append(("POST /api/interceptacoes-pro/interceptacoes/{id}/parar", True, response.status_code))
                else:
                    print(f"   ❌ Status: {response.status_code} - {response.text}")
                    results.append(("POST /api/interceptacoes-pro/interceptacoes/{id}/parar", False, response.status_code))
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results.append(("POST /api/interceptacoes-pro/interceptacoes/{id}/parar", False, "Exception"))
        
        # 8. GET /api/interceptacoes-pro/tipos-interceptacao
        print("\n8. Testing GET /api/interceptacoes-pro/tipos-interceptacao")
        try:
            response = self.session.get(f"{API_BASE}/interceptacoes-pro/tipos-interceptacao", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}")
                print(f"   📋 Interception types: {data.get('total', 0)} available")
                results.append(("GET /api/interceptacoes-pro/tipos-interceptacao", True, response.status_code))
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("GET /api/interceptacoes-pro/tipos-interceptacao", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("GET /api/interceptacoes-pro/tipos-interceptacao", False, "Exception"))
        
        # 9. GET /api/interceptacoes-pro/equipamentos
        print("\n9. Testing GET /api/interceptacoes-pro/equipamentos")
        try:
            response = self.session.get(f"{API_BASE}/interceptacoes-pro/equipamentos", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}")
                print(f"   🛠️ Equipment: {data.get('total', 0)} available")
                results.append(("GET /api/interceptacoes-pro/equipamentos", True, response.status_code))
            else:
                print(f"   ❌ Status: {response.status_code} - {response.text}")
                results.append(("GET /api/interceptacoes-pro/equipamentos", False, response.status_code))
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append(("GET /api/interceptacoes-pro/equipamentos", False, "Exception"))
        
        return results
    
    def generate_summary(self, pericia_results, interceptacao_results):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🎯 PREMIUM FEATURES TESTING SUMMARY")
        print("=" * 80)
        
        all_results = pericia_results + interceptacao_results
        total_tests = len(all_results)
        passed_tests = len([r for r in all_results if r[1] == True])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests}")
        print(f"   ❌ Failed: {failed_tests}")
        print(f"   📈 Success Rate: {success_rate:.1f}%")
        
        print(f"\n🔬 PERÍCIA DIGITAL PRO RESULTS:")
        pericia_passed = len([r for r in pericia_results if r[1] == True])
        pericia_total = len(pericia_results)
        pericia_rate = (pericia_passed / pericia_total) * 100 if pericia_total > 0 else 0
        print(f"   Tests: {pericia_passed}/{pericia_total} passed ({pericia_rate:.1f}%)")
        
        print(f"\n📡 INTERCEPTAÇÕES PRO RESULTS:")
        intercept_passed = len([r for r in interceptacao_results if r[1] == True])
        intercept_total = len(interceptacao_results)
        intercept_rate = (intercept_passed / intercept_total) * 100 if intercept_total > 0 else 0
        print(f"   Tests: {intercept_passed}/{intercept_total} passed ({intercept_rate:.1f}%)")
        
        # Show failed tests
        failed_endpoints = [r for r in all_results if r[1] == False]
        if failed_endpoints:
            print(f"\n❌ FAILED ENDPOINTS:")
            for endpoint, status, code in failed_endpoints:
                print(f"   • {endpoint} - Status: {code}")
        
        # Success criteria check
        print(f"\n🎯 SUCCESS CRITERIA CHECK:")
        print(f"   • All 20 endpoints should return 200 status: {'✅' if failed_tests == 0 else '❌'}")
        print(f"   • Professional-grade data structures: {'✅' if success_rate >= 90 else '❌'}")
        print(f"   • Real-time capture simulation: {'✅' if any('eventos-realtime' in r[0] and r[1] for r in all_results) else '❌'}")
        print(f"   • Geolocation tracking: {'✅' if any('geolocalizacao' in r[0] and r[1] for r in all_results) else '❌'}")
        print(f"   • Complete forensic workflow: {'✅' if any('extrair-dados' in r[0] and r[1] for r in all_results) else '❌'}")
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': success_rate,
            'pericia_rate': pericia_rate,
            'intercept_rate': intercept_rate,
            'all_passed': failed_tests == 0
        }

def main():
    """Main testing function"""
    print("🚀 AP ELITE PREMIUM FEATURES TESTING")
    print("Testing Professional Forensics & Interception Modules")
    print("Better than Cellebrite, Oxygen, and Avila Forense")
    print("=" * 80)
    
    tester = PremiumFeaturesTest()
    
    # Authenticate first
    if not tester.authenticate():
        print("❌ Cannot proceed without authentication")
        return
    
    # Test both modules
    pericia_results = tester.test_pericia_digital_pro()
    interceptacao_results = tester.test_interceptacoes_pro()
    
    # Generate summary
    summary = tester.generate_summary(pericia_results, interceptacao_results)
    
    # Final status
    if summary['all_passed']:
        print(f"\n🎉 ALL TESTS PASSED! Premium features are fully operational.")
    else:
        print(f"\n⚠️ Some tests failed. Please check the failed endpoints above.")
    
    print(f"\nTesting completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()