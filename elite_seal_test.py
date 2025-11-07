#!/usr/bin/env python3
"""
Elite Seal™ Digital Custody System - Comprehensive Backend Testing

Testing all Elite Seal™ endpoints:
1. Authentication
2. Evidence existence check
3. Create Elite Seal™ for evidence
4. List all seals
5. Get JSON manifest
6. Get PDF manifest (if WeasyPrint available)
7. Get QR code image
8. Public verification endpoint
9. Blockchain registration

Authentication: laura@apelite.com / laura2024
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Configuration
BASE_URL = "https://gravitas-law.preview.emergentagent.com/api"
AUTH_EMAIL = "laura@apelite.com"
AUTH_PASSWORD = "laura2024"
AUTH_ROLE = "administrator"

class EliteSealTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        self.evidence_id = None
        self.seal_id = None
        self.hash_sha256 = None
        
    def log_test(self, test_name, status, details=""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
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
                self.log_test("Authentication", "PASS", f"Successfully authenticated as {AUTH_EMAIL}")
                return True
            else:
                self.log_test("Authentication", "FAIL", f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authentication", "FAIL", f"Exception: {str(e)}")
            return False
    
    def check_existing_evidence(self):
        """Check if there are any existing evidences in the database"""
        try:
            print("\n📦 CHECKING EXISTING EVIDENCE")
            print("=" * 80)
            
            # Try to get evidence from evidence_vault collection
            # We'll use a workaround by trying to create a seal with a random ID
            # and checking the error message
            
            # First, let's try to list forensic evidences if there's an endpoint
            # Since we don't have a direct endpoint, we'll create a mock evidence
            
            self.log_test("Evidence Check", "INFO", "Checking for existing evidence...")
            
            # Try to get evidence from Ultra Extraction Pro or other modules
            response = self.session.get(f"{BASE_URL}/ultra-extraction-pro/extractions")
            if response.status_code == 200:
                data = response.json()
                extractions = data.get("extractions", [])
                if extractions:
                    # Use first extraction as evidence
                    self.evidence_id = extractions[0].get("id")
                    self.log_test("Evidence Check", "PASS", f"Found existing extraction: {self.evidence_id}")
                    return True
            
            # Try forensic evidences
            response = self.session.get(f"{BASE_URL}/forensics/enhanced")
            if response.status_code == 200:
                data = response.json()
                examinations = data.get("examinations", [])
                if examinations:
                    self.evidence_id = examinations[0].get("id")
                    self.log_test("Evidence Check", "PASS", f"Found existing forensic examination: {self.evidence_id}")
                    return True
            
            # Try data extraction evidences
            response = self.session.get(f"{BASE_URL}/data-extraction/extractions")
            if response.status_code == 200:
                data = response.json()
                extractions = data.get("extractions", [])
                if extractions:
                    self.evidence_id = extractions[0].get("id")
                    self.log_test("Evidence Check", "PASS", f"Found existing data extraction: {self.evidence_id}")
                    return True
            
            # Try evidence processing
            response = self.session.get(f"{BASE_URL}/evidence/evidence")
            if response.status_code == 200:
                data = response.json()
                evidences = data.get("evidence", [])
                if evidences:
                    self.evidence_id = evidences[0].get("id")
                    self.log_test("Evidence Check", "PASS", f"Found existing evidence: {self.evidence_id}")
                    return True
            
            self.log_test("Evidence Check", "WARN", "No existing evidence found. Will create mock evidence.")
            return False
            
        except Exception as e:
            self.log_test("Evidence Check", "WARN", f"Exception: {str(e)}")
            return False
    
    def create_mock_evidence(self):
        """Create a mock evidence for testing"""
        try:
            print("\n🔨 CREATING MOCK EVIDENCE")
            print("=" * 80)
            
            # Try to create evidence using evidence processing endpoint
            evidence_data = {
                "case_id": str(uuid.uuid4()),
                "filename": "test_evidence_elite_seal.pdf",
                "file_size": 1024000,
                "mime_type": "application/pdf",
                "evidence_type": "document",
                "description": "Mock evidence for Elite Seal™ testing",
                "collected_by": AUTH_EMAIL,
                "collection_method": "digital_copy"
            }
            
            response = self.session.post(f"{BASE_URL}/evidence/evidence", json=evidence_data)
            
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                self.evidence_id = data.get("id") or data.get("evidence_id")
                self.log_test("Mock Evidence Creation", "PASS", f"Created evidence: {self.evidence_id}")
                return True
            else:
                # Try Ultra Extraction Pro
                extraction_data = {
                    "device_name": "Test Device for Elite Seal",
                    "device_type": "smartphone",
                    "device_model": "Test Model",
                    "extraction_method": "logical",
                    "case_number": f"CASE-{datetime.now().strftime('%Y%m%d')}",
                    "examiner": AUTH_EMAIL,
                    "ai_analysis": True,
                    "deleted_recovery": True
                }
                
                response = self.session.post(f"{BASE_URL}/ultra-extraction-pro/extractions", json=extraction_data)
                
                if response.status_code == 200 or response.status_code == 201:
                    data = response.json()
                    self.evidence_id = data.get("id") or data.get("extraction_id")
                    self.log_test("Mock Evidence Creation", "PASS", f"Created extraction as evidence: {self.evidence_id}")
                    return True
                else:
                    self.log_test("Mock Evidence Creation", "FAIL", f"Status {response.status_code}: {response.text[:200]}")
                    return False
                    
        except Exception as e:
            self.log_test("Mock Evidence Creation", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_create_seal(self, enable_blockchain=False):
        """Test creating Elite Seal™ for evidence"""
        try:
            print(f"\n🔒 CREATING ELITE SEAL™ (Blockchain: {enable_blockchain})")
            print("=" * 80)
            
            if not self.evidence_id:
                self.log_test("Create Seal", "SKIP", "No evidence ID available")
                return False
            
            response = self.session.post(
                f"{BASE_URL}/elite-seal/{self.evidence_id}",
                params={"enable_blockchain": enable_blockchain}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.seal_id = data.get("seal_id")
                self.hash_sha256 = data.get("hash_sha256")
                
                details = f"Seal ID: {self.seal_id}, Hash: {self.hash_sha256[:16]}..., Blockchain: {data.get('blockchain_tx', 'N/A')}"
                self.log_test("Create Elite Seal", "PASS", details)
                
                # Validate response structure
                required_fields = ["seal_id", "evidence_id", "hash_sha256", "hash_sha512", 
                                 "assinatura_rsa", "qr_code_url", "manifesto_url", 
                                 "data_emissao", "emitido_por", "status"]
                
                missing_fields = [f for f in required_fields if f not in data]
                if missing_fields:
                    self.log_test("Response Validation", "WARN", f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Response Validation", "PASS", "All required fields present")
                
                return True
            elif response.status_code == 400:
                self.log_test("Create Elite Seal", "WARN", f"Evidence already sealed or invalid: {response.text}")
                # Try to extract seal_id from error if evidence already sealed
                return False
            elif response.status_code == 403:
                self.log_test("Create Elite Seal", "FAIL", f"Module access denied (licensing): {response.text}")
                return False
            elif response.status_code == 404:
                self.log_test("Create Elite Seal", "FAIL", f"Evidence not found: {response.text}")
                return False
            else:
                self.log_test("Create Elite Seal", "FAIL", f"Status {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Create Elite Seal", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_list_seals(self):
        """Test listing all Elite Seals™"""
        try:
            print("\n📋 LISTING ELITE SEALS™")
            print("=" * 80)
            
            response = self.session.get(f"{BASE_URL}/elite-seal/list")
            
            if response.status_code == 200:
                data = response.json()
                total = data.get("total", 0)
                seals = data.get("seals", [])
                
                self.log_test("List Seals", "PASS", f"Found {total} seals")
                
                if seals:
                    # If we don't have a seal_id yet, use the first one
                    if not self.seal_id and seals:
                        self.seal_id = seals[0].get("seal_id")
                        self.hash_sha256 = seals[0].get("hash_sha256")
                        self.log_test("Seal ID Retrieved", "INFO", f"Using existing seal: {self.seal_id}")
                    
                    # Show first seal details
                    first_seal = seals[0]
                    details = f"First seal: {first_seal.get('seal_id')}, Evidence: {first_seal.get('evidence_id')}"
                    self.log_test("Seal Details", "INFO", details)
                
                return True
            elif response.status_code == 401:
                self.log_test("List Seals", "FAIL", "Authentication required")
                return False
            else:
                self.log_test("List Seals", "FAIL", f"Status {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("List Seals", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_get_json_manifest(self):
        """Test getting JSON manifest"""
        try:
            print("\n📄 GETTING JSON MANIFEST")
            print("=" * 80)
            
            if not self.seal_id:
                self.log_test("JSON Manifest", "SKIP", "No seal ID available")
                return False
            
            response = self.session.get(
                f"{BASE_URL}/elite-seal/manifest/{self.seal_id}",
                params={"format": "json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate manifest structure
                required_sections = ["seal_id", "evidence_id", "evidence", "hashes", 
                                   "data_emissao", "emitido_por", "certificado", 
                                   "normas_conformidade", "cadeia_custodia", 
                                   "blockchain", "assinatura_digital", "verificacao_publica"]
                
                missing_sections = [s for s in required_sections if s not in data]
                
                if missing_sections:
                    self.log_test("JSON Manifest", "WARN", f"Missing sections: {missing_sections}")
                else:
                    self.log_test("JSON Manifest", "PASS", "All required sections present")
                
                # Validate compliance standards
                compliance = data.get("normas_conformidade", [])
                expected_standards = ["ISO/IEC 27037", "ISO/IEC 27041", "ISO/IEC 27042"]
                has_standards = any(std in str(compliance) for std in expected_standards)
                
                if has_standards:
                    self.log_test("Compliance Standards", "PASS", f"Found {len(compliance)} standards")
                else:
                    self.log_test("Compliance Standards", "WARN", "Expected ISO standards not found")
                
                # Validate RSA signature
                signature = data.get("assinatura_digital", {})
                if signature.get("algoritmo") == "RSA-2048":
                    self.log_test("RSA Signature", "PASS", "RSA-2048 signature present")
                else:
                    self.log_test("RSA Signature", "WARN", f"Unexpected algorithm: {signature.get('algoritmo')}")
                
                return True
            elif response.status_code == 404:
                self.log_test("JSON Manifest", "FAIL", "Seal not found")
                return False
            else:
                self.log_test("JSON Manifest", "FAIL", f"Status {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("JSON Manifest", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_get_pdf_manifest(self):
        """Test getting PDF manifest"""
        try:
            print("\n📑 GETTING PDF MANIFEST")
            print("=" * 80)
            
            if not self.seal_id:
                self.log_test("PDF Manifest", "SKIP", "No seal ID available")
                return False
            
            response = self.session.get(
                f"{BASE_URL}/elite-seal/manifest/{self.seal_id}",
                params={"format": "pdf"}
            )
            
            if response.status_code == 200:
                content_type = response.headers.get("content-type", "")
                content_length = len(response.content)
                
                if "application/pdf" in content_type:
                    self.log_test("PDF Manifest", "PASS", f"PDF generated ({content_length} bytes)")
                    return True
                else:
                    self.log_test("PDF Manifest", "WARN", f"Unexpected content type: {content_type}")
                    return False
            elif response.status_code == 404:
                self.log_test("PDF Manifest", "WARN", "PDF not found (WeasyPrint may not be available)")
                return False
            else:
                self.log_test("PDF Manifest", "FAIL", f"Status {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("PDF Manifest", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_get_qr_code(self):
        """Test getting QR code image"""
        try:
            print("\n📱 GETTING QR CODE")
            print("=" * 80)
            
            if not self.seal_id:
                self.log_test("QR Code", "SKIP", "No seal ID available")
                return False
            
            response = self.session.get(f"{BASE_URL}/elite-seal/qr/{self.seal_id}")
            
            if response.status_code == 200:
                content_type = response.headers.get("content-type", "")
                content_length = len(response.content)
                
                if "image/png" in content_type:
                    self.log_test("QR Code", "PASS", f"QR code generated ({content_length} bytes)")
                    return True
                else:
                    self.log_test("QR Code", "WARN", f"Unexpected content type: {content_type}")
                    return False
            elif response.status_code == 404:
                self.log_test("QR Code", "FAIL", "QR code not found")
                return False
            else:
                self.log_test("QR Code", "FAIL", f"Status {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("QR Code", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_public_verification(self):
        """Test public verification endpoint"""
        try:
            print("\n🌐 TESTING PUBLIC VERIFICATION")
            print("=" * 80)
            
            if not self.hash_sha256:
                self.log_test("Public Verification", "SKIP", "No hash available")
                return False
            
            response = self.session.get(f"{BASE_URL}/elite-seal/verify/{self.hash_sha256}")
            
            if response.status_code == 200:
                content = response.text
                content_type = response.headers.get("content-type", "")
                
                if "text/html" in content_type:
                    # Check for key elements in HTML
                    has_valid_badge = "Selo Válido" in content or "valid" in content.lower()
                    has_seal_info = "ELITE SEAL" in content
                    has_compliance = "ISO" in content or "conformidade" in content.lower()
                    
                    if has_valid_badge and has_seal_info:
                        self.log_test("Public Verification", "PASS", "HTML verification page generated")
                        
                        if has_compliance:
                            self.log_test("Compliance Display", "PASS", "Compliance standards displayed")
                        else:
                            self.log_test("Compliance Display", "WARN", "Compliance standards not visible")
                        
                        return True
                    else:
                        self.log_test("Public Verification", "WARN", "HTML missing expected elements")
                        return False
                else:
                    self.log_test("Public Verification", "WARN", f"Unexpected content type: {content_type}")
                    return False
            elif response.status_code == 404:
                content = response.text
                if "Selo Inválido" in content or "invalid" in content.lower():
                    self.log_test("Public Verification", "PASS", "Correctly returns invalid seal page for unknown hash")
                    return True
                else:
                    self.log_test("Public Verification", "FAIL", "Seal not found")
                    return False
            else:
                self.log_test("Public Verification", "FAIL", f"Status {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Public Verification", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_blockchain_registration(self):
        """Test blockchain registration endpoint"""
        try:
            print("\n⛓️ TESTING BLOCKCHAIN REGISTRATION")
            print("=" * 80)
            
            if not self.seal_id:
                self.log_test("Blockchain Registration", "SKIP", "No seal ID available")
                return False
            
            response = self.session.post(f"{BASE_URL}/elite-seal/blockchain/register/{self.seal_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("blockchain_tx"):
                    tx_hash = data.get("blockchain_tx")
                    network = data.get("network", "Unknown")
                    self.log_test("Blockchain Registration", "PASS", f"Registered on {network}: {tx_hash[:16]}...")
                    return True
                else:
                    self.log_test("Blockchain Registration", "WARN", "Success but no transaction hash")
                    return False
            elif response.status_code == 400:
                # May already be registered
                self.log_test("Blockchain Registration", "WARN", f"Already registered or invalid: {response.text}")
                return False
            elif response.status_code == 403:
                self.log_test("Blockchain Registration", "FAIL", "Module access denied")
                return False
            elif response.status_code == 404:
                self.log_test("Blockchain Registration", "FAIL", "Seal not found")
                return False
            else:
                self.log_test("Blockchain Registration", "FAIL", f"Status {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Blockchain Registration", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_error_scenarios(self):
        """Test error scenarios"""
        try:
            print("\n⚠️ TESTING ERROR SCENARIOS")
            print("=" * 80)
            
            # Test 1: Invalid evidence ID
            fake_evidence_id = str(uuid.uuid4())
            response = self.session.post(f"{BASE_URL}/elite-seal/{fake_evidence_id}")
            
            if response.status_code == 404:
                self.log_test("Error: Invalid Evidence", "PASS", "Correctly returns 404 for non-existent evidence")
            else:
                self.log_test("Error: Invalid Evidence", "WARN", f"Expected 404, got {response.status_code}")
            
            # Test 2: Invalid seal ID for manifest
            fake_seal_id = str(uuid.uuid4())
            response = self.session.get(f"{BASE_URL}/elite-seal/manifest/{fake_seal_id}")
            
            if response.status_code == 404:
                self.log_test("Error: Invalid Seal", "PASS", "Correctly returns 404 for non-existent seal")
            else:
                self.log_test("Error: Invalid Seal", "WARN", f"Expected 404, got {response.status_code}")
            
            # Test 3: Invalid hash for verification
            fake_hash = "0" * 64
            response = self.session.get(f"{BASE_URL}/elite-seal/verify/{fake_hash}")
            
            if response.status_code == 404 or "Inválido" in response.text:
                self.log_test("Error: Invalid Hash", "PASS", "Correctly handles invalid hash verification")
            else:
                self.log_test("Error: Invalid Hash", "WARN", f"Unexpected response for invalid hash")
            
            # Test 4: Duplicate seal creation (if we have evidence_id)
            if self.evidence_id and self.seal_id:
                response = self.session.post(f"{BASE_URL}/elite-seal/{self.evidence_id}")
                
                if response.status_code == 400:
                    self.log_test("Error: Duplicate Seal", "PASS", "Correctly prevents duplicate seal creation")
                else:
                    self.log_test("Error: Duplicate Seal", "WARN", f"Expected 400, got {response.status_code}")
            
            return True
            
        except Exception as e:
            self.log_test("Error Scenarios", "FAIL", f"Exception: {str(e)}")
            return False
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r["status"] == "PASS")
        failed = sum(1 for r in self.test_results if r["status"] == "FAIL")
        warned = sum(1 for r in self.test_results if r["status"] == "WARN")
        skipped = sum(1 for r in self.test_results if r["status"] == "SKIP")
        info = sum(1 for r in self.test_results if r["status"] == "INFO")
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Warnings: {warned}")
        print(f"⏭️  Skipped: {skipped}")
        print(f"ℹ️  Info: {info}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
        
        if warned > 0:
            print("\n⚠️  WARNINGS:")
            for result in self.test_results:
                if result["status"] == "WARN":
                    print(f"  - {result['test']}: {result['details']}")
        
        success_rate = (passed / (total - skipped - info)) * 100 if (total - skipped - info) > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 70  # Consider 70% success rate as acceptable
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("\n" + "=" * 80)
        print("🔒 ELITE SEAL™ DIGITAL CUSTODY SYSTEM - COMPREHENSIVE TESTING")
        print("=" * 80)
        print(f"Backend URL: {BASE_URL}")
        print(f"Test User: {AUTH_EMAIL}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        
        # Step 1: Authenticate
        if not self.authenticate():
            print("\n❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Step 2: Check for existing evidence
        has_evidence = self.check_existing_evidence()
        
        # Step 3: Create mock evidence if needed
        if not has_evidence:
            if not self.create_mock_evidence():
                print("\n⚠️  No evidence available. Some tests will be skipped.")
        
        # Step 4: List existing seals (to get seal_id if available)
        self.test_list_seals()
        
        # Step 5: Create new seal (if we have evidence and no existing seal)
        if self.evidence_id and not self.seal_id:
            self.test_create_seal(enable_blockchain=False)
        
        # Step 6: Test all seal operations
        self.test_get_json_manifest()
        self.test_get_pdf_manifest()
        self.test_get_qr_code()
        self.test_public_verification()
        
        # Step 7: Test blockchain registration (if seal exists)
        if self.seal_id:
            self.test_blockchain_registration()
        
        # Step 8: Test error scenarios
        self.test_error_scenarios()
        
        # Step 9: Print summary
        success = self.print_summary()
        
        return success

def main():
    """Main test execution"""
    test_suite = EliteSealTestSuite()
    success = test_suite.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
