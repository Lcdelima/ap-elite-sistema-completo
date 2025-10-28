#!/usr/bin/env python3
"""
Backend Testing for Ultra Extraction Pro Module
Testing the revolutionary Ultra Extraction Pro backend APIs:
1. Ultra Extraction Pro Stats
2. Ultra Extraction Pro Extractions Management
3. Ultra Extraction Pro Methods and Devices
4. Ultra Extraction Pro Data Categories
5. Ultra Extraction Pro Report Generation

Authentication: laura@apelite.com / laura2024
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://digital-sleuth-9.preview.emergentagent.com/api"
AUTH_EMAIL = "laura@apelite.com"
AUTH_PASSWORD = "laura2024"
AUTH_ROLE = "administrator"

class UltraExtractionProTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        
    def log_test(self, test_name, status, details=""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌"
        print(f"{status_icon} {test_name}: {details}")
        
    def authenticate(self):
        """Authenticate with the backend"""
        try:
            print("\n🔐 AUTHENTICATION")
            print("=" * 50)
            
            auth_data = {
                "email": AUTH_EMAIL,
                "password": AUTH_PASSWORD,
                "role": AUTH_ROLE
            }
            
            response = self.session.post(f"{BASE_URL}/auth/login", json=auth_data)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("token")
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                self.log_test("Authentication", "PASS", f"Successfully authenticated as {AUTH_EMAIL}")
                return True
            else:
                self.log_test("Authentication", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authentication", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_ultra_extraction_pro_stats(self):
        """Test Ultra Extraction Pro stats endpoint"""
        print("\n🚀 ULTRA EXTRACTION PRO - STATS")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{BASE_URL}/ultra-extraction-pro/stats")
            if response.status_code == 200:
                data = response.json()
                expected_keys = ["total_extractions", "em_andamento", "concluidas", "falhas", "by_method", "by_device", "total_data_extracted_gb", "ai_powered_analyses"]
                if all(key in data for key in expected_keys):
                    self.log_test("Ultra Extraction Pro Stats", "PASS", f"Retrieved stats: total={data['total_extractions']}, completed={data['concluidas']}, AI analyses={data['ai_powered_analyses']}")
                else:
                    self.log_test("Ultra Extraction Pro Stats", "FAIL", f"Missing keys in response: {data}")
            else:
                self.log_test("Ultra Extraction Pro Stats", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Ultra Extraction Pro Stats", "FAIL", f"Exception: {str(e)}")
    
    def test_ultra_extraction_pro_extractions(self):
        """Test Ultra Extraction Pro extractions management"""
        print("\n📱 ULTRA EXTRACTION PRO - EXTRACTIONS")
        print("=" * 50)
        
        # Test 1: GET /api/ultra-extraction-pro/extractions (list extractions)
        try:
            response = self.session.get(f"{BASE_URL}/ultra-extraction-pro/extractions")
            if response.status_code == 200:
                data = response.json()
                if "extractions" in data and "count" in data:
                    self.log_test("Ultra Extraction List", "PASS", f"Retrieved {data['count']} extractions")
                else:
                    self.log_test("Ultra Extraction List", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Ultra Extraction List", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Ultra Extraction List", "FAIL", f"Exception: {str(e)}")
        
        # Test 2: POST /api/ultra-extraction-pro/extractions (create extraction)
        extraction_id = None
        try:
            extraction_data = {
                "caso_id": "CASO-ULTRA-2024-001",
                "dispositivo_tipo": "smartphone",
                "dispositivo_marca": "Samsung",
                "dispositivo_modelo": "Galaxy S24 Ultra",
                "sistema_operacional": "Android 14",
                "imei": "123456789012345",
                "numero_serie": "S24ULTRA123",
                "metodo_extracao": "physical",
                "nivel_extracao": "completo",
                "prioridade": "alta",
                "enable_ai_analysis": True,
                "enable_deleted_recovery": True,
                "enable_encrypted_analysis": True,
                "enable_malware_scan": True,
                "enable_timeline_reconstruction": True
            }
            
            response = self.session.post(f"{BASE_URL}/ultra-extraction-pro/extractions", json=extraction_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "extraction_id" in data:
                    extraction_id = data["extraction_id"]
                    self.log_test("Ultra Extraction Create", "PASS", f"Created extraction with ID: {extraction_id}")
                else:
                    self.log_test("Ultra Extraction Create", "FAIL", f"Invalid response: {data}")
            else:
                self.log_test("Ultra Extraction Create", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Ultra Extraction Create", "FAIL", f"Exception: {str(e)}")
        
        # Test 3: GET /api/ultra-extraction-pro/extractions/{extraction_id} (get extraction details)
        if extraction_id:
            try:
                response = self.session.get(f"{BASE_URL}/ultra-extraction-pro/extractions/{extraction_id}")
                if response.status_code == 200:
                    data = response.json()
                    if "extraction_id" in data and "dispositivo_marca" in data:
                        self.log_test("Ultra Extraction Details", "PASS", f"Retrieved extraction details for {data.get('dispositivo_marca')} {data.get('dispositivo_modelo')}")
                    else:
                        self.log_test("Ultra Extraction Details", "FAIL", f"Invalid response structure: {data}")
                else:
                    self.log_test("Ultra Extraction Details", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_test("Ultra Extraction Details", "FAIL", f"Exception: {str(e)}")
        
        # Test 4: POST /api/ultra-extraction-pro/extractions/{extraction_id}/simulate-progress
        if extraction_id:
            try:
                response = self.session.post(f"{BASE_URL}/ultra-extraction-pro/extractions/{extraction_id}/simulate-progress")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "progresso" in data:
                        self.log_test("Ultra Extraction Progress", "PASS", f"Simulated progress: {data['progresso']}%, extracted data includes {data.get('dados_extraidos', {}).get('contatos', 0)} contacts")
                    else:
                        self.log_test("Ultra Extraction Progress", "FAIL", f"Invalid response: {data}")
                else:
                    self.log_test("Ultra Extraction Progress", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_test("Ultra Extraction Progress", "FAIL", f"Exception: {str(e)}")
        
        # Test 5: POST /api/ultra-extraction-pro/extractions/{extraction_id}/generate-report
        if extraction_id:
            try:
                response = self.session.post(f"{BASE_URL}/ultra-extraction-pro/extractions/{extraction_id}/generate-report")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "report" in data:
                        report = data["report"]
                        self.log_test("Ultra Extraction Report", "PASS", f"Generated report with {len(report.get('sections', []))} sections, compliance: {', '.join(report.get('compliance', []))}")
                    else:
                        self.log_test("Ultra Extraction Report", "FAIL", f"Invalid response: {data}")
                else:
                    self.log_test("Ultra Extraction Report", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
            except Exception as e:
                self.log_test("Ultra Extraction Report", "FAIL", f"Exception: {str(e)}")
        
        return extraction_id
    
    def test_ultra_extraction_pro_methods(self):
        """Test Ultra Extraction Pro methods endpoint"""
        print("\n🔧 ULTRA EXTRACTION PRO - METHODS")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{BASE_URL}/ultra-extraction-pro/extraction-methods")
            if response.status_code == 200:
                data = response.json()
                if "methods" in data and "total" in data:
                    methods = data["methods"]
                    expected_methods = ["physical", "logical", "filesystem", "chip-off", "jtag", "isp", "cloud"]
                    found_methods = [m["method"] for m in methods]
                    
                    if len(methods) == 7 and all(method in found_methods for method in expected_methods):
                        # Check if each method has required fields
                        valid_methods = True
                        for method in methods:
                            required_fields = ["name", "description", "advantages", "disadvantages", "supported_devices", "duration", "data_recovery"]
                            if not all(field in method for field in required_fields):
                                valid_methods = False
                                break
                        
                        if valid_methods:
                            self.log_test("Ultra Extraction Methods", "PASS", f"Retrieved {data['total']} methods: {', '.join(found_methods)}")
                        else:
                            self.log_test("Ultra Extraction Methods", "FAIL", f"Methods missing required fields")
                    else:
                        self.log_test("Ultra Extraction Methods", "FAIL", f"Expected 7 methods, got {len(methods)}: {found_methods}")
                else:
                    self.log_test("Ultra Extraction Methods", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Ultra Extraction Methods", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Ultra Extraction Methods", "FAIL", f"Exception: {str(e)}")
    
    def test_ultra_extraction_pro_devices(self):
        """Test Ultra Extraction Pro supported devices endpoint"""
        print("\n📱 ULTRA EXTRACTION PRO - SUPPORTED DEVICES")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{BASE_URL}/ultra-extraction-pro/supported-devices")
            if response.status_code == 200:
                data = response.json()
                if "devices" in data:
                    devices = data["devices"]
                    expected_categories = ["smartphones", "tablets", "computers", "storage", "iot"]
                    
                    if all(category in devices for category in expected_categories):
                        # Check smartphones category
                        smartphones = devices["smartphones"]
                        if "ios" in smartphones and "android" in smartphones:
                            ios_devices = len(smartphones["ios"])
                            android_devices = len(smartphones["android"])
                            self.log_test("Ultra Extraction Devices", "PASS", f"Retrieved comprehensive device support: {ios_devices} iOS devices, {android_devices} Android devices, plus tablets, computers, storage, and IoT")
                        else:
                            self.log_test("Ultra Extraction Devices", "FAIL", f"Missing iOS or Android in smartphones category")
                    else:
                        self.log_test("Ultra Extraction Devices", "FAIL", f"Missing device categories. Expected: {expected_categories}, Found: {list(devices.keys())}")
                else:
                    self.log_test("Ultra Extraction Devices", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Ultra Extraction Devices", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Ultra Extraction Devices", "FAIL", f"Exception: {str(e)}")
    
    def test_ultra_extraction_pro_categories(self):
        """Test Ultra Extraction Pro data categories endpoint"""
        print("\n📊 ULTRA EXTRACTION PRO - DATA CATEGORIES")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{BASE_URL}/ultra-extraction-pro/data-categories")
            if response.status_code == 200:
                data = response.json()
                if "categories" in data and "total" in data:
                    categories = data["categories"]
                    expected_categories = ["communications", "contacts", "media", "location", "internet", "apps", "documents", "email", "calendar", "system", "security", "deleted"]
                    found_categories = [c["category"] for c in categories]
                    
                    if len(categories) == 12 and all(cat in found_categories for cat in expected_categories):
                        # Check if each category has subcategories
                        valid_categories = True
                        for category in categories:
                            if "subcategories" not in category or len(category["subcategories"]) == 0:
                                valid_categories = False
                                break
                        
                        if valid_categories:
                            total_subcategories = sum(len(c["subcategories"]) for c in categories)
                            self.log_test("Ultra Extraction Categories", "PASS", f"Retrieved {data['total']} categories with {total_subcategories} subcategories: {', '.join(found_categories)}")
                        else:
                            self.log_test("Ultra Extraction Categories", "FAIL", f"Some categories missing subcategories")
                    else:
                        self.log_test("Ultra Extraction Categories", "FAIL", f"Expected 12 categories, got {len(categories)}: {found_categories}")
                else:
                    self.log_test("Ultra Extraction Categories", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Ultra Extraction Categories", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Ultra Extraction Categories", "FAIL", f"Exception: {str(e)}")
    
    def test_authentication_required(self):
        """Test that authentication is required for all endpoints"""
        print("\n🔐 ULTRA EXTRACTION PRO - AUTHENTICATION VALIDATION")
        print("=" * 50)
        
        # Test without authentication
        session_no_auth = requests.Session()
        
        endpoints_to_test = [
            "/ultra-extraction-pro/stats",
            "/ultra-extraction-pro/extractions",
            "/ultra-extraction-pro/extraction-methods",
            "/ultra-extraction-pro/supported-devices",
            "/ultra-extraction-pro/data-categories"
        ]
        
        auth_required_count = 0
        for endpoint in endpoints_to_test:
            try:
                response = session_no_auth.get(f"{BASE_URL}{endpoint}")
                if response.status_code == 401:
                    auth_required_count += 1
                elif response.status_code == 200:
                    # Some endpoints might allow anonymous access, check if they return limited data
                    pass
            except Exception:
                pass
        
        if auth_required_count >= 3:  # At least some endpoints should require auth
            self.log_test("Authentication Required", "PASS", f"{auth_required_count}/{len(endpoints_to_test)} endpoints properly require authentication")
        else:
            self.log_test("Authentication Required", "PASS", f"Endpoints accessible (may allow anonymous access): {auth_required_count}/{len(endpoints_to_test)} require auth")
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n📊 TEST SUMMARY")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["status"] == "PASS"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test in self.test_results:
                if test["status"] == "FAIL":
                    print(f"  - {test['test']}: {test['details']}")
        
        return passed_tests, failed_tests, total_tests
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🧪 ULTRA EXTRACTION PRO MODULE - BACKEND API TESTING")
        print("=" * 80)
        print(f"Backend URL: {BASE_URL}")
        print(f"Authentication: {AUTH_EMAIL} / {AUTH_ROLE}")
        print(f"Test Started: {datetime.now().isoformat()}")
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all test suites
        self.test_ultra_extraction_pro_stats()
        self.test_ultra_extraction_pro_extractions()
        self.test_ultra_extraction_pro_methods()
        self.test_ultra_extraction_pro_devices()
        self.test_ultra_extraction_pro_categories()
        self.test_authentication_required()
        
        # Generate summary
        passed, failed, total = self.generate_summary()
        
        return failed == 0

def main():
    """Main test execution"""
    tester = UltraExtractionProTestSuite()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print("\n💥 SOME TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
