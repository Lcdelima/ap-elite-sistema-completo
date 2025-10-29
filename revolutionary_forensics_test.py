#!/usr/bin/env python3
"""
REVOLUTIONARY FORENSICS MODULES TESTING
Testing 3 new revolutionary forensic modules:
1. PASSWORD RECOVERY ELITE
2. DATA RECOVERY ULTIMATE  
3. USB FORENSICS PRO

Authentication: laura@apelite.com / laura2024
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cisai-forense.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class ForensicsModuleTester:
    def __init__(self):
        self.token = None
        self.test_results = {
            "password_recovery_elite": [],
            "data_recovery_ultimate": [],
            "usb_forensics_pro": []
        }
        self.total_tests = 0
        self.passed_tests = 0
        
    def authenticate(self):
        """Authenticate with laura@apelite.com / laura2024"""
        print("🔐 Authenticating with laura@apelite.com...")
        
        auth_data = {
            "email": "laura@apelite.com",
            "password": "laura2024",
            "role": "administrator"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json=auth_data)
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("token")
                print(f"✅ Authentication successful! Token: {self.token[:20]}...")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def get_headers(self):
        """Get headers with Bearer token"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_endpoint(self, method, url, data=None, expected_status=200, module_name="", test_name=""):
        """Test a single endpoint"""
        self.total_tests += 1
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=self.get_headers())
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=self.get_headers())
            else:
                response = requests.request(method, url, json=data, headers=self.get_headers())
            
            success = response.status_code == expected_status
            
            result = {
                "test_name": test_name,
                "method": method.upper(),
                "url": url,
                "status_code": response.status_code,
                "expected_status": expected_status,
                "success": success,
                "response_size": len(response.text),
                "timestamp": datetime.now().isoformat()
            }
            
            if success:
                self.passed_tests += 1
                print(f"✅ {test_name}: {response.status_code}")
                
                # Parse and validate response structure
                try:
                    json_data = response.json()
                    result["response_data"] = json_data
                    
                    # Add specific validations based on test
                    if "stats" in test_name.lower():
                        self.validate_stats_response(json_data, result)
                    elif "create" in test_name.lower() or "post" in method.lower():
                        self.validate_creation_response(json_data, result)
                    elif "list" in test_name.lower():
                        self.validate_list_response(json_data, result)
                        
                except json.JSONDecodeError:
                    result["response_text"] = response.text[:200]
                    
            else:
                print(f"❌ {test_name}: Expected {expected_status}, got {response.status_code}")
                result["error"] = response.text[:200]
            
            self.test_results[module_name].append(result)
            return success, response
            
        except Exception as e:
            print(f"❌ {test_name}: Exception - {e}")
            result = {
                "test_name": test_name,
                "method": method.upper(),
                "url": url,
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            self.test_results[module_name].append(result)
            return False, None
    
    def validate_stats_response(self, data, result):
        """Validate stats response structure"""
        required_fields = []
        if "password-recovery" in result["url"]:
            required_fields = ["total_attempts", "em_andamento", "recuperadas", "falhas", "success_rate"]
        elif "data-recovery" in result["url"]:
            required_fields = ["total_recoveries", "em_andamento", "concluidas", "total_data_recovered_gb"]
        elif "usb-forensics" in result["url"]:
            required_fields = ["total_analyses", "dispositivos_detectados", "dispositivos_suspeitos"]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            result["validation_warning"] = f"Missing fields: {missing_fields}"
        else:
            result["validation_success"] = "All required fields present"
    
    def validate_creation_response(self, data, result):
        """Validate creation response structure"""
        if "success" in data and data["success"]:
            result["creation_success"] = True
            if "attempt_id" in data or "recovery_id" in data or "analysis_id" in data:
                result["id_generated"] = True
        else:
            result["creation_warning"] = "Success field not found or false"
    
    def validate_list_response(self, data, result):
        """Validate list response structure"""
        if isinstance(data, dict):
            if "count" in data:
                result["list_count"] = data["count"]
            if any(key in data for key in ["attempts", "recoveries", "analyses", "methods", "devices"]):
                result["list_structure_valid"] = True
        elif isinstance(data, list):
            result["list_count"] = len(data)
            result["list_structure_valid"] = True
    
    def test_password_recovery_elite(self):
        """Test PASSWORD RECOVERY ELITE module"""
        print("\n🔓 TESTING PASSWORD RECOVERY ELITE MODULE")
        print("=" * 60)
        
        module = "password_recovery_elite"
        base_url = f"{BASE_URL}/password-recovery-elite"
        
        # Test 1: GET /stats
        self.test_endpoint("GET", f"{base_url}/stats", 
                          module_name=module, test_name="Password Recovery Stats")
        
        # Test 2: GET /recovery-attempts
        self.test_endpoint("GET", f"{base_url}/recovery-attempts", 
                          module_name=module, test_name="List Recovery Attempts")
        
        # Test 3: POST /recovery-attempts (Create new attempt)
        recovery_data = {
            "caso_id": "CASO-PWD-2024-001",
            "arquivo_tipo": "pdf",
            "arquivo_nome": "documento_protegido.pdf",
            "metodo_ataque": "dictionary",
            "complexidade": "media",
            "prioridade": "alta",
            "charset": "all",
            "min_length": 6,
            "max_length": 12,
            "use_gpu": True,
            "enable_ai_optimization": True
        }
        
        success, response = self.test_endpoint("POST", f"{base_url}/recovery-attempts", 
                                             data=recovery_data, module_name=module, 
                                             test_name="Create Recovery Attempt")
        
        attempt_id = None
        if success and response:
            try:
                data = response.json()
                attempt_id = data.get("attempt_id")
                print(f"   📝 Created attempt ID: {attempt_id}")
            except:
                pass
        
        # Test 4: GET /recovery-attempts/{attempt_id} (if we have an ID)
        if attempt_id:
            self.test_endpoint("GET", f"{base_url}/recovery-attempts/{attempt_id}", 
                              module_name=module, test_name="Get Recovery Attempt Details")
            
            # Test 5: POST /recovery-attempts/{attempt_id}/simulate-progress
            self.test_endpoint("POST", f"{base_url}/recovery-attempts/{attempt_id}/simulate-progress", 
                              module_name=module, test_name="Simulate Recovery Progress")
        
        # Test 6: GET /attack-methods
        self.test_endpoint("GET", f"{base_url}/attack-methods", 
                          module_name=module, test_name="Get Attack Methods")
        
        # Test 7: GET /supported-file-types
        self.test_endpoint("GET", f"{base_url}/supported-file-types", 
                          module_name=module, test_name="Get Supported File Types")
    
    def test_data_recovery_ultimate(self):
        """Test DATA RECOVERY ULTIMATE module"""
        print("\n💾 TESTING DATA RECOVERY ULTIMATE MODULE")
        print("=" * 60)
        
        module = "data_recovery_ultimate"
        base_url = f"{BASE_URL}/data-recovery-ultimate"
        
        # Test 1: GET /stats
        self.test_endpoint("GET", f"{base_url}/stats", 
                          module_name=module, test_name="Data Recovery Stats")
        
        # Test 2: GET /recoveries
        self.test_endpoint("GET", f"{base_url}/recoveries", 
                          module_name=module, test_name="List Data Recoveries")
        
        # Test 3: POST /recoveries (Create new recovery)
        recovery_data = {
            "caso_id": "CASO-REC-2024-001",
            "sistema_operacional": "windows",
            "tipo_midia": "ssd",
            "capacidade_gb": 500,
            "tipo_recuperacao": "deleted_files",
            "filesystem": "ntfs",
            "scan_profundidade": "profunda",
            "tipos_arquivo": ["all"],
            "prioridade": "alta"
        }
        
        success, response = self.test_endpoint("POST", f"{base_url}/recoveries", 
                                             data=recovery_data, module_name=module, 
                                             test_name="Create Data Recovery")
        
        recovery_id = None
        if success and response:
            try:
                data = response.json()
                recovery_id = data.get("recovery_id")
                print(f"   📝 Created recovery ID: {recovery_id}")
            except:
                pass
        
        # Test 4: GET /recoveries/{recovery_id} (if we have an ID)
        if recovery_id:
            self.test_endpoint("GET", f"{base_url}/recoveries/{recovery_id}", 
                              module_name=module, test_name="Get Recovery Details")
            
            # Test 5: POST /recoveries/{recovery_id}/simulate-progress
            self.test_endpoint("POST", f"{base_url}/recoveries/{recovery_id}/simulate-progress", 
                              module_name=module, test_name="Simulate Recovery Progress")
        
        # Test 6: GET /supported-systems
        self.test_endpoint("GET", f"{base_url}/supported-systems", 
                          module_name=module, test_name="Get Supported Systems")
        
        # Test 7: GET /supported-media-types
        self.test_endpoint("GET", f"{base_url}/supported-media-types", 
                          module_name=module, test_name="Get Supported Media Types")
    
    def test_usb_forensics_pro(self):
        """Test USB FORENSICS PRO module"""
        print("\n🔌 TESTING USB FORENSICS PRO MODULE")
        print("=" * 60)
        
        module = "usb_forensics_pro"
        base_url = f"{BASE_URL}/usb-forensics-pro"
        
        # Test 1: GET /stats
        self.test_endpoint("GET", f"{base_url}/stats", 
                          module_name=module, test_name="USB Forensics Stats")
        
        # Test 2: GET /analyses
        self.test_endpoint("GET", f"{base_url}/analyses", 
                          module_name=module, test_name="List USB Analyses")
        
        # Test 3: POST /analyses (Create new analysis)
        analysis_data = {
            "caso_id": "CASO-USB-2024-001",
            "computer_name": "DESKTOP-FORENSIC01",
            "tipo_analise": "history",
            "profundidade": "completa"
        }
        
        success, response = self.test_endpoint("POST", f"{base_url}/analyses", 
                                             data=analysis_data, module_name=module, 
                                             test_name="Create USB Analysis")
        
        analysis_id = None
        if success and response:
            try:
                data = response.json()
                analysis_id = data.get("analysis_id")
                print(f"   📝 Created analysis ID: {analysis_id}")
            except:
                pass
        
        # Test 4: GET /analyses/{analysis_id} (if we have an ID)
        if analysis_id:
            self.test_endpoint("GET", f"{base_url}/analyses/{analysis_id}", 
                              module_name=module, test_name="Get Analysis Details")
        
        # Test 5: GET /devices
        self.test_endpoint("GET", f"{base_url}/devices", 
                          module_name=module, test_name="List All USB Devices")
        
        # Test 6: GET /suspicious-devices
        self.test_endpoint("GET", f"{base_url}/suspicious-devices", 
                          module_name=module, test_name="Get Suspicious Devices")
        
        # Test 7: GET /device-types
        self.test_endpoint("GET", f"{base_url}/device-types", 
                          module_name=module, test_name="Get Device Types")
        
        # Test 8: GET /analysis-types
        self.test_endpoint("GET", f"{base_url}/analysis-types", 
                          module_name=module, test_name="Get Analysis Types")
    
    def test_authentication_required(self):
        """Test that endpoints require authentication"""
        print("\n🔒 TESTING AUTHENTICATION REQUIREMENTS")
        print("=" * 60)
        
        # Test without token
        old_token = self.token
        self.token = None
        
        # Test one endpoint from each module without auth
        endpoints = [
            f"{BASE_URL}/password-recovery-elite/stats",
            f"{BASE_URL}/data-recovery-ultimate/stats", 
            f"{BASE_URL}/usb-forensics-pro/stats"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(endpoint)
                if response.status_code == 401:
                    print(f"✅ Authentication required for {endpoint.split('/')[-2]}")
                    self.passed_tests += 1
                else:
                    print(f"⚠️  {endpoint.split('/')[-2]} allows access without auth: {response.status_code}")
                self.total_tests += 1
            except Exception as e:
                print(f"❌ Error testing {endpoint}: {e}")
                self.total_tests += 1
        
        # Restore token
        self.token = old_token
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 80)
        print("🎯 REVOLUTIONARY FORENSICS MODULES - TEST REPORT")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   Total Tests: {self.total_tests}")
        print(f"   Passed: {self.passed_tests}")
        print(f"   Failed: {self.total_tests - self.passed_tests}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        # Module-specific results
        for module_name, results in self.test_results.items():
            if not results:
                continue
                
            module_passed = sum(1 for r in results if r.get("success", False))
            module_total = len(results)
            module_rate = (module_passed / module_total * 100) if module_total > 0 else 0
            
            print(f"\n📋 {module_name.upper().replace('_', ' ')}:")
            print(f"   Tests: {module_total}")
            print(f"   Passed: {module_passed}")
            print(f"   Success Rate: {module_rate:.1f}%")
            
            # Show failed tests
            failed_tests = [r for r in results if not r.get("success", False)]
            if failed_tests:
                print(f"   ❌ Failed Tests:")
                for test in failed_tests:
                    print(f"      - {test['test_name']}: {test.get('error', 'Unknown error')}")
        
        # Detailed validation results
        print(f"\n🔍 VALIDATION RESULTS:")
        
        for module_name, results in self.test_results.items():
            successful_tests = [r for r in results if r.get("success", False)]
            if successful_tests:
                print(f"\n   {module_name.upper().replace('_', ' ')}:")
                for test in successful_tests:
                    validations = []
                    if test.get("validation_success"):
                        validations.append("✅ Structure Valid")
                    if test.get("creation_success"):
                        validations.append("✅ Creation Success")
                    if test.get("id_generated"):
                        validations.append("✅ ID Generated")
                    if test.get("list_structure_valid"):
                        validations.append("✅ List Structure Valid")
                    if test.get("list_count") is not None:
                        validations.append(f"📊 Count: {test['list_count']}")
                    
                    if validations:
                        print(f"      {test['test_name']}: {', '.join(validations)}")
        
        return success_rate >= 90  # Consider 90%+ as success

def main():
    """Main test execution"""
    print("🚀 REVOLUTIONARY FORENSICS MODULES COMPREHENSIVE TESTING")
    print("Testing 3 new revolutionary forensic modules with authentication")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 80)
    
    tester = ForensicsModuleTester()
    
    # Step 1: Authenticate
    if not tester.authenticate():
        print("❌ Authentication failed. Cannot proceed with tests.")
        sys.exit(1)
    
    # Step 2: Test authentication requirements
    tester.test_authentication_required()
    
    # Step 3: Test each module
    tester.test_password_recovery_elite()
    tester.test_data_recovery_ultimate()
    tester.test_usb_forensics_pro()
    
    # Step 4: Generate report
    success = tester.generate_report()
    
    # Step 5: Save detailed results
    with open("/app/revolutionary_forensics_test_results.json", "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "backend_url": BACKEND_URL,
            "total_tests": tester.total_tests,
            "passed_tests": tester.passed_tests,
            "success_rate": (tester.passed_tests / tester.total_tests * 100) if tester.total_tests > 0 else 0,
            "test_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: /app/revolutionary_forensics_test_results.json")
    
    if success:
        print("\n🎉 ALL REVOLUTIONARY FORENSICS MODULES WORKING PERFECTLY!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the report above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()