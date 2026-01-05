#!/usr/bin/env python3
"""
Core Engine - Data Extraction Module Testing
Testing the Data Extraction module integrated with Core Engine

Test Scenarios:
1. Test Creation of Extraction via Core Engine (POST /api/core-engine/execute)
2. Test with Image (filename: "foto.jpg")
3. Test with SQLite (filename: "whatsapp.db")
4. Test List Jobs (GET /api/core-engine/jobs)
5. Test Health Check (GET /api/core-engine/health)

Success Criteria:
- All tests return 200/success
- States are registered correctly
- Hashes are generated (SHA-256, SHA-512)
- Custody ID is created
- Artifacts are saved in /app/backend/evidence/
- Logs forenses are generated

Authentication: laura@apelite.com / laura2024
"""

import requests
import json
import sys
from datetime import datetime
import os

# Configuration
BASE_URL = "https://legalgravitas.preview.emergentagent.com/api"
AUTH_EMAIL = "laura@apelite.com"
AUTH_PASSWORD = "Secure2024!"
AUTH_ROLE = "admin"

class CoreEngineExtractionTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        self.job_ids = []
        
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
            print("=" * 80)
            
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
                self.log_test("Authentication", "PASS", f"Authenticated as {AUTH_EMAIL}")
                return True
            else:
                self.log_test("Authentication", "FAIL", f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authentication", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_health_check(self):
        """Test 5: Health Check"""
        try:
            print("\n🏥 TEST 5: HEALTH CHECK")
            print("=" * 80)
            
            response = self.session.get(f"{BASE_URL}/core-engine/health")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                
                # Verify required fields
                checks = []
                checks.append(("status", data.get("status") == "healthy"))
                checks.append(("orchestrator", data.get("orchestrator") == "running"))
                checks.append(("modules_registered", data.get("modules_registered", 0) >= 46))
                
                all_passed = all(check[1] for check in checks)
                
                details = f"Status: {data.get('status')}, Orchestrator: {data.get('orchestrator')}, Modules: {data.get('modules_registered')}"
                
                if all_passed:
                    self.log_test("Health Check", "PASS", details)
                else:
                    failed_checks = [check[0] for check in checks if not check[1]]
                    self.log_test("Health Check", "FAIL", f"Failed checks: {failed_checks}. {details}")
            else:
                self.log_test("Health Check", "FAIL", f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Health Check", "FAIL", f"Exception: {str(e)}")
    
    def test_extraction_pdf(self):
        """Test 1: Create Extraction with PDF"""
        try:
            print("\n📄 TEST 1: EXTRACTION WITH PDF")
            print("=" * 80)
            
            payload = {
                "module_path": "pericia/extracao_dados",
                "input_data": {
                    "caso_id": "TESTE-MOTOR-001",
                    "tipo_dispositivo": "Android",
                    "dispositivo_marca": "Samsung",
                    "dispositivo_modelo": "Galaxy S23 Ultra",
                    "filename": "evidencia.pdf"
                }
            }
            
            print(f"Request Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(f"{BASE_URL}/core-engine/execute", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
                
                # Verify required fields
                checks = []
                checks.append(("status", data.get("status") == "success"))
                checks.append(("job_id", data.get("job_id") is not None))
                checks.append(("state", data.get("state") is not None))
                
                # Check result details (data is in result.output)
                result = data.get("result", {})
                output = result.get("output", {})
                checks.append(("extracted_data", "extracted_data" in output))
                checks.append(("hashes", "hashes" in output))
                checks.append(("custody_id", "custody_id" in output))
                
                # Verify hashes
                hashes = output.get("hashes", {})
                checks.append(("sha256", "sha256" in hashes))
                checks.append(("sha512", "sha512" in hashes))
                
                all_passed = all(check[1] for check in checks)
                
                if all_passed:
                    job_id = data.get("job_id")
                    self.job_ids.append(job_id)
                    details = f"Job ID: {job_id}, State: {data.get('state')}, Custody ID: {output.get('custody_id')}"
                    self.log_test("Extraction PDF", "PASS", details)
                else:
                    failed_checks = [check[0] for check in checks if not check[1]]
                    self.log_test("Extraction PDF", "FAIL", f"Missing fields: {failed_checks}")
            else:
                self.log_test("Extraction PDF", "FAIL", f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Extraction PDF", "FAIL", f"Exception: {str(e)}")
    
    def test_extraction_image(self):
        """Test 2: Create Extraction with Image"""
        try:
            print("\n🖼️ TEST 2: EXTRACTION WITH IMAGE")
            print("=" * 80)
            
            payload = {
                "module_path": "pericia/extracao_dados",
                "input_data": {
                    "caso_id": "TESTE-MOTOR-002",
                    "tipo_dispositivo": "iPhone",
                    "dispositivo_marca": "Apple",
                    "dispositivo_modelo": "iPhone 14 Pro",
                    "filename": "foto.jpg"
                }
            }
            
            print(f"Request Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(f"{BASE_URL}/core-engine/execute", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
                
                # Verify required fields
                checks = []
                checks.append(("status", data.get("status") == "success"))
                checks.append(("job_id", data.get("job_id") is not None))
                
                # Check result details (data is in result.output)
                result = data.get("result", {})
                output = result.get("output", {})
                extracted_data = output.get("extracted_data", {})
                
                # Verify EXIF extraction
                checks.append(("exif_data", "exif" in extracted_data))
                checks.append(("hashes", "hashes" in output))
                checks.append(("custody_id", "custody_id" in output))
                
                all_passed = all(check[1] for check in checks)
                
                if all_passed:
                    job_id = data.get("job_id")
                    self.job_ids.append(job_id)
                    exif = extracted_data.get("exif", {})
                    details = f"Job ID: {job_id}, EXIF tags: {len(exif)}, Custody ID: {result.get('custody_id')}"
                    self.log_test("Extraction Image", "PASS", details)
                else:
                    failed_checks = [check[0] for check in checks if not check[1]]
                    self.log_test("Extraction Image", "FAIL", f"Missing fields: {failed_checks}")
            else:
                self.log_test("Extraction Image", "FAIL", f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Extraction Image", "FAIL", f"Exception: {str(e)}")
    
    def test_extraction_sqlite(self):
        """Test 3: Create Extraction with SQLite"""
        try:
            print("\n🗄️ TEST 3: EXTRACTION WITH SQLITE")
            print("=" * 80)
            
            payload = {
                "module_path": "pericia/extracao_dados",
                "input_data": {
                    "caso_id": "TESTE-MOTOR-003",
                    "tipo_dispositivo": "Android",
                    "dispositivo_marca": "Samsung",
                    "dispositivo_modelo": "Galaxy S21",
                    "filename": "whatsapp.db"
                }
            }
            
            print(f"Request Payload: {json.dumps(payload, indent=2)}")
            
            response = self.session.post(f"{BASE_URL}/core-engine/execute", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
                
                # Verify required fields
                checks = []
                checks.append(("status", data.get("status") == "success"))
                checks.append(("job_id", data.get("job_id") is not None))
                
                # Check result details
                result = data.get("result", {})
                extracted_data = result.get("extracted_data", {})
                
                # Verify SQLite extraction
                checks.append(("tables", "tables" in extracted_data))
                checks.append(("hashes", "hashes" in result))
                checks.append(("custody_id", "custody_id" in result))
                
                all_passed = all(check[1] for check in checks)
                
                if all_passed:
                    job_id = data.get("job_id")
                    self.job_ids.append(job_id)
                    tables = extracted_data.get("tables", {})
                    details = f"Job ID: {job_id}, Tables extracted: {len(tables)}, Custody ID: {result.get('custody_id')}"
                    self.log_test("Extraction SQLite", "PASS", details)
                else:
                    failed_checks = [check[0] for check in checks if not check[1]]
                    self.log_test("Extraction SQLite", "FAIL", f"Missing fields: {failed_checks}")
            else:
                self.log_test("Extraction SQLite", "FAIL", f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Extraction SQLite", "FAIL", f"Exception: {str(e)}")
    
    def test_list_jobs(self):
        """Test 4: List Jobs"""
        try:
            print("\n📋 TEST 4: LIST JOBS")
            print("=" * 80)
            
            response = self.session.get(f"{BASE_URL}/core-engine/jobs")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
                
                # Verify required fields
                checks = []
                checks.append(("status", data.get("status") == "success"))
                checks.append(("jobs", "jobs" in data))
                checks.append(("count", data.get("count", 0) >= len(self.job_ids)))
                
                all_passed = all(check[1] for check in checks)
                
                if all_passed:
                    jobs = data.get("jobs", [])
                    details = f"Total jobs: {data.get('count')}, Jobs returned: {len(jobs)}"
                    self.log_test("List Jobs", "PASS", details)
                else:
                    failed_checks = [check[0] for check in checks if not check[1]]
                    self.log_test("List Jobs", "FAIL", f"Failed checks: {failed_checks}")
            else:
                self.log_test("List Jobs", "FAIL", f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("List Jobs", "FAIL", f"Exception: {str(e)}")
    
    def verify_artifacts(self):
        """Verify artifacts are saved"""
        try:
            print("\n📁 VERIFICATION: ARTIFACTS")
            print("=" * 80)
            
            evidence_dir = "/app/backend/evidence"
            
            if os.path.exists(evidence_dir):
                files = os.listdir(evidence_dir)
                print(f"Files in {evidence_dir}: {files}")
                
                if len(files) > 0:
                    self.log_test("Artifacts Saved", "PASS", f"Found {len(files)} artifacts in evidence directory")
                else:
                    self.log_test("Artifacts Saved", "FAIL", "No artifacts found in evidence directory")
            else:
                self.log_test("Artifacts Saved", "FAIL", f"Evidence directory does not exist: {evidence_dir}")
                
        except Exception as e:
            self.log_test("Artifacts Saved", "FAIL", f"Exception: {str(e)}")
    
    def verify_logs(self):
        """Verify forensic logs are generated"""
        try:
            print("\n📝 VERIFICATION: FORENSIC LOGS")
            print("=" * 80)
            
            logs_dir = "/app/backend/logs/forense"
            
            if os.path.exists(logs_dir):
                files = [f for f in os.listdir(logs_dir) if f.startswith("pericia_extracao_dados")]
                print(f"Forensic logs in {logs_dir}: {files}")
                
                if len(files) > 0:
                    # Check latest log file
                    latest_log = sorted(files)[-1]
                    log_path = os.path.join(logs_dir, latest_log)
                    
                    with open(log_path, 'r') as f:
                        log_content = f.read()
                        print(f"\nLatest log file ({latest_log}):")
                        print(log_content[:500])  # Print first 500 chars
                    
                    self.log_test("Forensic Logs", "PASS", f"Found {len(files)} forensic log files")
                else:
                    self.log_test("Forensic Logs", "FAIL", "No forensic logs found")
            else:
                self.log_test("Forensic Logs", "FAIL", f"Logs directory does not exist: {logs_dir}")
                
        except Exception as e:
            self.log_test("Forensic Logs", "FAIL", f"Exception: {str(e)}")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r["status"] == "PASS")
        failed_tests = total_tests - passed_tests
        
        print(f"\nTotal Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n" + "=" * 80)
        
        return failed_tests == 0
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("\n" + "=" * 80)
        print("🚀 CORE ENGINE - DATA EXTRACTION MODULE TESTING")
        print("=" * 80)
        
        # Authenticate
        if not self.authenticate():
            print("\n❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run tests in order
        self.test_health_check()
        self.test_extraction_pdf()
        self.test_extraction_image()
        self.test_extraction_sqlite()
        self.test_list_jobs()
        
        # Verify artifacts and logs
        self.verify_artifacts()
        self.verify_logs()
        
        # Print summary
        return self.print_summary()


def main():
    """Main test execution"""
    test_suite = CoreEngineExtractionTestSuite()
    success = test_suite.run_all_tests()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
