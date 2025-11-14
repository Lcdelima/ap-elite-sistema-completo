#!/usr/bin/env python3
"""
Backend Testing for ERBs Integrations Module
Testing the new geolocation APIs integration:
1. OpenCellID - Search ERBs by coordinates
2. WiGLE - WiFi networks and towers
3. AbuseIPDB - IP verification
4. Batch import functionality
5. Integration status check

Authentication: laura@apelite.com / laura2024
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://gravitas-law.preview.emergentagent.com/api"
AUTH_EMAIL = "laura@apelite.com"
AUTH_PASSWORD = "laura2024"
AUTH_ROLE = "administrator"

class ERBsIntegrationsTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        self.passed_tests = 0
        self.failed_tests = 0
        
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
        
        if status == "PASS":
            self.passed_tests += 1
        else:
            self.failed_tests += 1
        
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
                self.log_test("Authentication", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authentication", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_integration_status(self):
        """Test GET /api/erbs/integrations/status"""
        print("\n📊 TEST 1: INTEGRATION STATUS")
        print("=" * 80)
        
        try:
            response = self.session.get(f"{BASE_URL}/erbs/integrations/status")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if all 3 integrations are present
                if "integrations" in data:
                    integrations = data["integrations"]
                    
                    # Check OpenCellID
                    if "opencellid" in integrations:
                        opencellid = integrations["opencellid"]
                        if opencellid.get("configured") == True:
                            self.log_test("Integration Status - OpenCellID", "PASS", 
                                        f"Configured: {opencellid.get('configured')}, Status: {opencellid.get('status')}")
                        else:
                            self.log_test("Integration Status - OpenCellID", "FAIL", 
                                        f"Not configured properly: {opencellid}")
                    else:
                        self.log_test("Integration Status - OpenCellID", "FAIL", "OpenCellID not found in response")
                    
                    # Check WiGLE
                    if "wigle" in integrations:
                        wigle = integrations["wigle"]
                        if wigle.get("configured") == True:
                            self.log_test("Integration Status - WiGLE", "PASS", 
                                        f"Configured: {wigle.get('configured')}, Status: {wigle.get('status')}")
                        else:
                            self.log_test("Integration Status - WiGLE", "FAIL", 
                                        f"Not configured properly: {wigle}")
                    else:
                        self.log_test("Integration Status - WiGLE", "FAIL", "WiGLE not found in response")
                    
                    # Check AbuseIPDB
                    if "abuseipdb" in integrations:
                        abuseipdb = integrations["abuseipdb"]
                        if abuseipdb.get("configured") == True:
                            self.log_test("Integration Status - AbuseIPDB", "PASS", 
                                        f"Configured: {abuseipdb.get('configured')}, Status: {abuseipdb.get('status')}")
                        else:
                            self.log_test("Integration Status - AbuseIPDB", "FAIL", 
                                        f"Not configured properly: {abuseipdb}")
                    else:
                        self.log_test("Integration Status - AbuseIPDB", "FAIL", "AbuseIPDB not found in response")
                else:
                    self.log_test("Integration Status", "FAIL", f"'integrations' key not found in response: {data}")
            else:
                self.log_test("Integration Status", "FAIL", 
                            f"Status: {response.status_code}, Response: {response.text[:500]}")
                
        except Exception as e:
            self.log_test("Integration Status", "FAIL", f"Exception: {str(e)}")
    
    def test_opencellid_search(self):
        """Test GET /api/erbs/integrations/opencellid/search"""
        print("\n📡 TEST 2: OPENCELLID SEARCH - Av. Paulista, São Paulo")
        print("=" * 80)
        
        try:
            # Search ERBs at Av. Paulista coordinates
            params = {
                "lat": -23.5505,
                "lon": -46.6333,
                "radius": 1000
            }
            
            response = self.session.get(f"{BASE_URL}/erbs/integrations/opencellid/search", params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if data.get("success") == True:
                    erbs_count = data.get("erbs_encontradas", 0)
                    total_api = data.get("total_api", 0)
                    erbs_list = data.get("erbs", [])
                    
                    self.log_test("OpenCellID Search", "PASS", 
                                f"Found {erbs_count} new ERBs, Total from API: {total_api}, Location: Av. Paulista")
                    
                    # Check if ERBs were imported to MongoDB
                    if erbs_count > 0 and len(erbs_list) > 0:
                        # Check first ERB structure
                        first_erb = erbs_list[0]
                        required_fields = ["id", "fonte", "operadora", "mcc", "mnc", "lac", "cid", 
                                         "latitude", "longitude", "created_at", "importada_via_api"]
                        
                        missing_fields = [field for field in required_fields if field not in first_erb]
                        
                        if not missing_fields:
                            self.log_test("OpenCellID - ERB Structure", "PASS", 
                                        f"ERB has all required fields. MCC: {first_erb.get('mcc')}, MNC: {first_erb.get('mnc')}, Operator: {first_erb.get('operadora')}")
                        else:
                            self.log_test("OpenCellID - ERB Structure", "FAIL", 
                                        f"Missing fields: {missing_fields}")
                        
                        # Check metadata
                        if first_erb.get("importada_via_api") == True:
                            self.log_test("OpenCellID - Import Flag", "PASS", "ERB marked as imported via API")
                        else:
                            self.log_test("OpenCellID - Import Flag", "FAIL", "ERB not marked as imported via API")
                    else:
                        self.log_test("OpenCellID - Data Import", "PASS", 
                                    "No new ERBs found (may already exist in database or no coverage in area)")
                else:
                    self.log_test("OpenCellID Search", "FAIL", 
                                f"API returned success=False: {data.get('error', 'Unknown error')}")
            else:
                self.log_test("OpenCellID Search", "FAIL", 
                            f"Status: {response.status_code}, Response: {response.text[:500]}")
                
        except Exception as e:
            self.log_test("OpenCellID Search", "FAIL", f"Exception: {str(e)}")
    
    def test_wigle_search(self):
        """Test GET /api/erbs/integrations/wigle/search"""
        print("\n📶 TEST 3: WIGLE SEARCH - WiFi Networks and Towers")
        print("=" * 80)
        
        try:
            # Search networks at Av. Paulista coordinates
            params = {
                "lat": -23.5505,
                "lon": -46.6333,
                "radius": 0.01
            }
            
            response = self.session.get(f"{BASE_URL}/erbs/integrations/wigle/search", params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if data.get("success") == True:
                    results_count = data.get("results", 0)
                    networks = data.get("networks", [])
                    
                    self.log_test("WiGLE Search", "PASS", 
                                f"Found {results_count} networks, Returned: {len(networks)} networks (limited to 50)")
                    
                    if len(networks) > 0:
                        self.log_test("WiGLE - Network Data", "PASS", 
                                    f"Successfully retrieved network data from WiGLE API")
                    else:
                        self.log_test("WiGLE - Network Data", "PASS", 
                                    "No networks found in area (expected for some locations)")
                else:
                    self.log_test("WiGLE Search", "FAIL", 
                                f"API returned success=False: {data.get('error', 'Unknown error')}")
            else:
                self.log_test("WiGLE Search", "FAIL", 
                            f"Status: {response.status_code}, Response: {response.text[:500]}")
                
        except Exception as e:
            self.log_test("WiGLE Search", "FAIL", f"Exception: {str(e)}")
    
    def test_abuseipdb_check(self):
        """Test GET /api/erbs/integrations/abuseipdb/check/{ip}"""
        print("\n🔍 TEST 4: ABUSEIPDB IP VERIFICATION - Google DNS (8.8.8.8)")
        print("=" * 80)
        
        try:
            # Check Google DNS IP (should be clean)
            ip = "8.8.8.8"
            
            response = self.session.get(f"{BASE_URL}/erbs/integrations/abuseipdb/check/{ip}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if data.get("success") == True:
                    abuse_score = data.get("abuse_score", 0)
                    is_malicious = data.get("is_malicious", False)
                    reports = data.get("reports", 0)
                    country = data.get("country", "Unknown")
                    isp = data.get("isp", "Unknown")
                    
                    self.log_test("AbuseIPDB Check", "PASS", 
                                f"IP: {ip}, Abuse Score: {abuse_score}, Malicious: {is_malicious}, Reports: {reports}, Country: {country}, ISP: {isp}")
                    
                    # Check if details are present
                    if "details" in data:
                        self.log_test("AbuseIPDB - Details", "PASS", "Complete IP details retrieved")
                    else:
                        self.log_test("AbuseIPDB - Details", "FAIL", "Details not found in response")
                else:
                    self.log_test("AbuseIPDB Check", "FAIL", 
                                f"API returned success=False: {data.get('error', 'Unknown error')}")
            else:
                self.log_test("AbuseIPDB Check", "FAIL", 
                            f"Status: {response.status_code}, Response: {response.text[:500]}")
                
        except Exception as e:
            self.log_test("AbuseIPDB Check", "FAIL", f"Exception: {str(e)}")
    
    def test_batch_import(self):
        """Test POST /api/erbs/integrations/import/opencellid"""
        print("\n📦 TEST 5: BATCH IMPORT - Multiple Locations")
        print("=" * 80)
        
        try:
            # Import ERBs from multiple locations
            coordinates = [
                {"lat": -23.5505, "lon": -46.6333},  # São Paulo - Av. Paulista
                {"lat": -22.9068, "lon": -43.1729}   # Rio de Janeiro - Centro
            ]
            
            response = self.session.post(f"{BASE_URL}/erbs/integrations/import/opencellid", json=coordinates)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if data.get("success") == True:
                    total_coords = data.get("total_coordenadas", 0)
                    total_imported = data.get("total_erbs_importadas", 0)
                    
                    self.log_test("Batch Import", "PASS", 
                                f"Processed {total_coords} coordinates, Imported {total_imported} ERBs")
                    
                    if total_imported > 0:
                        self.log_test("Batch Import - Data", "PASS", 
                                    f"Successfully imported ERBs from multiple locations")
                    else:
                        self.log_test("Batch Import - Data", "PASS", 
                                    "No new ERBs imported (may already exist in database)")
                else:
                    self.log_test("Batch Import", "FAIL", 
                                f"API returned success=False")
            else:
                self.log_test("Batch Import", "FAIL", 
                            f"Status: {response.status_code}, Response: {response.text[:500]}")
                
        except Exception as e:
            self.log_test("Batch Import", "FAIL", f"Exception: {str(e)}")
    
    def test_duplicate_prevention(self):
        """Test duplicate prevention by importing same location twice"""
        print("\n🔄 TEST 6: DUPLICATE PREVENTION")
        print("=" * 80)
        
        try:
            # First import
            params = {
                "lat": -23.5505,
                "lon": -46.6333,
                "radius": 500
            }
            
            response1 = self.session.get(f"{BASE_URL}/erbs/integrations/opencellid/search", params=params)
            
            if response1.status_code == 200:
                data1 = response1.json()
                first_import_count = data1.get("erbs_encontradas", 0)
                
                # Second import (same location)
                response2 = self.session.get(f"{BASE_URL}/erbs/integrations/opencellid/search", params=params)
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    second_import_count = data2.get("erbs_encontradas", 0)
                    
                    # Second import should find 0 new ERBs (all duplicates)
                    if second_import_count == 0:
                        self.log_test("Duplicate Prevention", "PASS", 
                                    f"First import: {first_import_count} ERBs, Second import: {second_import_count} ERBs (duplicates prevented)")
                    else:
                        self.log_test("Duplicate Prevention", "FAIL", 
                                    f"Second import found {second_import_count} new ERBs (should be 0)")
                else:
                    self.log_test("Duplicate Prevention", "FAIL", 
                                f"Second request failed: Status {response2.status_code}")
            else:
                self.log_test("Duplicate Prevention", "FAIL", 
                            f"First request failed: Status {response1.status_code}")
                
        except Exception as e:
            self.log_test("Duplicate Prevention", "FAIL", f"Exception: {str(e)}")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = self.passed_tests + self.failed_tests
        success_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n" + "=" * 80)
        
        return self.failed_tests == 0

def main():
    """Main test execution"""
    print("\n" + "=" * 80)
    print("🚀 ERBs INTEGRATIONS - COMPREHENSIVE BACKEND TESTING")
    print("=" * 80)
    print(f"Testing: OpenCellID, WiGLE, AbuseIPDB APIs")
    print(f"Backend URL: {BASE_URL}")
    print(f"Authentication: {AUTH_EMAIL}")
    print("=" * 80)
    
    suite = ERBsIntegrationsTestSuite()
    
    # Authenticate
    if not suite.authenticate():
        print("\n❌ Authentication failed. Cannot proceed with tests.")
        sys.exit(1)
    
    # Run all tests
    suite.test_integration_status()
    suite.test_opencellid_search()
    suite.test_wigle_search()
    suite.test_abuseipdb_check()
    suite.test_batch_import()
    suite.test_duplicate_prevention()
    
    # Print summary
    all_passed = suite.print_summary()
    
    if all_passed:
        print("\n✅ ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print("\n❌ SOME TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
