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
BASE_URL = "https://apelite-digital.preview.emergentagent.com/api"
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
    
    def test_forensics_enhanced(self):
        """Test Forensics Enhanced module endpoints"""
        print("\n🔬 FORENSICS ENHANCED MODULE")
        print("=" * 50)
        
        # Test 1: GET /api/forensics/enhanced/stats/overview
        try:
            response = self.session.get(f"{BASE_URL}/forensics/enhanced/stats/overview")
            if response.status_code == 200:
                data = response.json()
                expected_keys = ["total", "active", "completed", "critical"]
                if all(key in data for key in expected_keys):
                    self.log_test("Forensics Stats Overview", "PASS", f"Retrieved stats: {data}")
                else:
                    self.log_test("Forensics Stats Overview", "FAIL", f"Missing keys in response: {data}")
            else:
                self.log_test("Forensics Stats Overview", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Forensics Stats Overview", "FAIL", f"Exception: {str(e)}")
        
        # Test 2: GET /api/forensics/enhanced (list examinations)
        try:
            response = self.session.get(f"{BASE_URL}/forensics/enhanced")
            if response.status_code == 200:
                data = response.json()
                if "examinations" in data and "total" in data:
                    self.log_test("Forensics List Examinations", "PASS", f"Retrieved {data['total']} examinations")
                else:
                    self.log_test("Forensics List Examinations", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Forensics List Examinations", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Forensics List Examinations", "FAIL", f"Exception: {str(e)}")
        
        # Test 3: POST /api/forensics/enhanced (create examination)
        try:
            exam_data = {
                "examId": f"EXAM-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                "examTitle": "Test Forensic Examination",
                "examType": "disk_imaging",
                "evidenceType": "computer",
                "deviceBrand": "Dell",
                "deviceModel": "Latitude 7420",
                "serialNumber": "TEST123456",
                "operatingSystem": "Windows 11",
                "storageSize": "512GB SSD",
                "caseName": "Test Case Investigation",
                "caseNumber": "CASE-001",
                "requestor": "Detective Silva",
                "laboratory": "AP Elite Lab",
                "examDate": datetime.now().isoformat(),
                "priority": "high",
                "objectives": "Complete forensic analysis of suspect computer",
                "methodology": "write_blocker",
                "hashAlgorithm": "SHA-256",
                "imagingTool": "FTK_Imager",
                "aiEnabled": "true",
                "mlAnalysis": "true",
                "autoReport": "true",
                "notes": "Test examination for API validation"
            }
            
            response = self.session.post(f"{BASE_URL}/forensics/enhanced", data=exam_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "exam_id" in data:
                    self.log_test("Forensics Create Examination", "PASS", f"Created examination with ID: {data['exam_id']}")
                else:
                    self.log_test("Forensics Create Examination", "FAIL", f"Invalid response: {data}")
            else:
                self.log_test("Forensics Create Examination", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Forensics Create Examination", "FAIL", f"Exception: {str(e)}")
        
        # Test 4: GET /api/forensics/enhanced/tools
        try:
            response = self.session.get(f"{BASE_URL}/forensics/enhanced/tools")
            if response.status_code == 200:
                data = response.json()
                if "tools" in data and "categories" in data:
                    self.log_test("Forensics Tools", "PASS", f"Retrieved {data.get('total_tools', 0)} tools in {len(data.get('categories', []))} categories")
                else:
                    self.log_test("Forensics Tools", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Forensics Tools", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Forensics Tools", "FAIL", f"Exception: {str(e)}")
        
        # Test 5: GET /api/forensics/enhanced/device-types
        try:
            response = self.session.get(f"{BASE_URL}/forensics/enhanced/device-types")
            if response.status_code == 200:
                data = response.json()
                if "device_types" in data and "total" in data:
                    self.log_test("Forensics Device Types", "PASS", f"Retrieved {data['total']} device types")
                else:
                    self.log_test("Forensics Device Types", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Forensics Device Types", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Forensics Device Types", "FAIL", f"Exception: {str(e)}")
        
        # Test 6: GET /api/forensics/enhanced/analysis-types
        try:
            response = self.session.get(f"{BASE_URL}/forensics/enhanced/analysis-types")
            if response.status_code == 200:
                data = response.json()
                if "analysis_types" in data and "total" in data:
                    self.log_test("Forensics Analysis Types", "PASS", f"Retrieved {data['total']} analysis types")
                else:
                    self.log_test("Forensics Analysis Types", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Forensics Analysis Types", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Forensics Analysis Types", "FAIL", f"Exception: {str(e)}")
    
    def test_data_extraction_enhanced(self):
        """Test Data Extraction Enhanced module endpoints"""
        print("\n📱 DATA EXTRACTION ENHANCED MODULE")
        print("=" * 50)
        
        # Test 1: GET /api/data-extraction/stats
        try:
            response = self.session.get(f"{BASE_URL}/data-extraction/stats")
            if response.status_code == 200:
                data = response.json()
                expected_keys = ["total", "in_progress", "completed", "failed"]
                if all(key in data for key in expected_keys):
                    self.log_test("Data Extraction Stats", "PASS", f"Retrieved stats: {data}")
                else:
                    self.log_test("Data Extraction Stats", "FAIL", f"Missing keys in response: {data}")
            else:
                self.log_test("Data Extraction Stats", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Data Extraction Stats", "FAIL", f"Exception: {str(e)}")
        
        # Test 2: GET /api/data-extraction/extractions
        try:
            response = self.session.get(f"{BASE_URL}/data-extraction/extractions")
            if response.status_code == 200:
                data = response.json()
                if "extractions" in data and "count" in data:
                    self.log_test("Data Extraction List", "PASS", f"Retrieved {data['count']} extractions")
                else:
                    self.log_test("Data Extraction List", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Data Extraction List", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Data Extraction List", "FAIL", f"Exception: {str(e)}")
        
        # Test 3: POST /api/data-extraction/extractions (create extraction)
        try:
            extraction_data = {
                "device_type": "smartphone",
                "device_model": "Galaxy S21",
                "device_brand": "Samsung",
                "case_id": "CASE-001",
                "extraction_tool": "Cellebrite UFED",
                "extraction_method": "logical",
                "priority": "high"
            }
            
            response = self.session.post(f"{BASE_URL}/data-extraction/extractions", json=extraction_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "extraction_id" in data:
                    self.log_test("Data Extraction Create", "PASS", f"Created extraction with ID: {data['extraction_id']}")
                else:
                    self.log_test("Data Extraction Create", "FAIL", f"Invalid response: {data}")
            else:
                self.log_test("Data Extraction Create", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Data Extraction Create", "FAIL", f"Exception: {str(e)}")
        
        # Test 4: GET /api/data-extraction/tools
        try:
            response = self.session.get(f"{BASE_URL}/data-extraction/tools")
            if response.status_code == 200:
                data = response.json()
                if "tools" in data and "total" in data:
                    self.log_test("Data Extraction Tools", "PASS", f"Retrieved {data['total']} extraction tools")
                else:
                    self.log_test("Data Extraction Tools", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Data Extraction Tools", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Data Extraction Tools", "FAIL", f"Exception: {str(e)}")
        
        # Test 5: GET /api/data-extraction/device-types
        try:
            response = self.session.get(f"{BASE_URL}/data-extraction/device-types")
            if response.status_code == 200:
                data = response.json()
                if "device_types" in data and "total" in data:
                    self.log_test("Data Extraction Device Types", "PASS", f"Retrieved {data['total']} device types")
                else:
                    self.log_test("Data Extraction Device Types", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Data Extraction Device Types", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Data Extraction Device Types", "FAIL", f"Exception: {str(e)}")
        
        # Test 6: GET /api/data-extraction/extraction-methods
        try:
            response = self.session.get(f"{BASE_URL}/data-extraction/extraction-methods")
            if response.status_code == 200:
                data = response.json()
                if "methods" in data and "total" in data:
                    self.log_test("Data Extraction Methods", "PASS", f"Retrieved {data['total']} extraction methods")
                else:
                    self.log_test("Data Extraction Methods", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Data Extraction Methods", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Data Extraction Methods", "FAIL", f"Exception: {str(e)}")
    
    def test_evidence_processing_enhanced(self):
        """Test Evidence Processing Enhanced module endpoints"""
        print("\n🗂️ EVIDENCE PROCESSING ENHANCED MODULE")
        print("=" * 50)
        
        # Test 1: GET /api/evidence/stats
        try:
            response = self.session.get(f"{BASE_URL}/evidence/stats")
            if response.status_code == 200:
                data = response.json()
                expected_keys = ["total", "pending", "processing", "completed", "failed"]
                if all(key in data for key in expected_keys):
                    self.log_test("Evidence Processing Stats", "PASS", f"Retrieved stats: {data}")
                else:
                    self.log_test("Evidence Processing Stats", "FAIL", f"Missing keys in response: {data}")
            else:
                self.log_test("Evidence Processing Stats", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Evidence Processing Stats", "FAIL", f"Exception: {str(e)}")
        
        # Test 2: GET /api/evidence/evidence
        try:
            response = self.session.get(f"{BASE_URL}/evidence/evidence")
            if response.status_code == 200:
                data = response.json()
                if "evidence" in data and "count" in data:
                    self.log_test("Evidence Processing List", "PASS", f"Retrieved {data['count']} evidence items")
                else:
                    self.log_test("Evidence Processing List", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Evidence Processing List", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Evidence Processing List", "FAIL", f"Exception: {str(e)}")
        
        # Test 3: POST /api/evidence/evidence (create evidence)
        try:
            evidence_data = {
                "evidence_name": "Test Evidence",
                "evidence_type": "digital_image",
                "case_id": "CASE-001",
                "source": "Police seizure",
                "description": "Test evidence for API validation",
                "priority": "high",
                "hash_algorithm": "SHA-256"
            }
            
            response = self.session.post(f"{BASE_URL}/evidence/evidence", json=evidence_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "evidence_id" in data:
                    self.log_test("Evidence Processing Create", "PASS", f"Created evidence with ID: {data['evidence_id']}")
                else:
                    self.log_test("Evidence Processing Create", "FAIL", f"Invalid response: {data}")
            else:
                self.log_test("Evidence Processing Create", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Evidence Processing Create", "FAIL", f"Exception: {str(e)}")
        
        # Test 4: GET /api/evidence/evidence-types
        try:
            response = self.session.get(f"{BASE_URL}/evidence/evidence-types")
            if response.status_code == 200:
                data = response.json()
                if "evidence_types" in data and "total" in data:
                    self.log_test("Evidence Types", "PASS", f"Retrieved {data['total']} evidence types")
                else:
                    self.log_test("Evidence Types", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Evidence Types", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Evidence Types", "FAIL", f"Exception: {str(e)}")
        
        # Test 5: GET /api/evidence/processing-workflows
        try:
            response = self.session.get(f"{BASE_URL}/evidence/processing-workflows")
            if response.status_code == 200:
                data = response.json()
                if "workflows" in data and "total" in data:
                    self.log_test("Evidence Processing Workflows", "PASS", f"Retrieved {data['total']} workflows")
                else:
                    self.log_test("Evidence Processing Workflows", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Evidence Processing Workflows", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Evidence Processing Workflows", "FAIL", f"Exception: {str(e)}")
        
        # Test 6: GET /api/evidence/hash-algorithms
        try:
            response = self.session.get(f"{BASE_URL}/evidence/hash-algorithms")
            if response.status_code == 200:
                data = response.json()
                if "algorithms" in data and "total" in data:
                    self.log_test("Evidence Hash Algorithms", "PASS", f"Retrieved {data['total']} hash algorithms")
                else:
                    self.log_test("Evidence Hash Algorithms", "FAIL", f"Invalid response structure: {data}")
            else:
                self.log_test("Evidence Hash Algorithms", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Evidence Hash Algorithms", "FAIL", f"Exception: {str(e)}")
    
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
        print("🧪 FORENSICS & INVESTIGATION ENHANCED MODULES - BACKEND API TESTING")
        print("=" * 80)
        print(f"Backend URL: {BASE_URL}")
        print(f"Authentication: {AUTH_EMAIL} / {AUTH_ROLE}")
        print(f"Test Started: {datetime.now().isoformat()}")
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all test suites
        self.test_forensics_enhanced()
        self.test_data_extraction_enhanced()
        self.test_evidence_processing_enhanced()
        
        # Generate summary
        passed, failed, total = self.generate_summary()
        
        return failed == 0

def main():
    """Main test execution"""
    tester = ForensicsTestSuite()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print("\n💥 SOME TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
