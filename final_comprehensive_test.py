#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE TEST - AP Elite ATHENA System
Tests all critical endpoints as requested in the review request.
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BASE_URL = "https://forensic-hub-5.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class FinalComprehensiveTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_results = []
        self.failed_tests = []
        self.passed_tests = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, message: str, response_data=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        if success:
            self.passed_tests.append(test_name)
            status = "✅ PASS"
        else:
            self.failed_tests.append({"test": test_name, "message": message, "response": response_data})
            status = "❌ FAIL"
            
        print(f"{status} {test_name}: {message}")
        if not success and response_data:
            print(f"   Response: {response_data}")
    
    async def authenticate(self):
        """Authenticate and get token"""
        try:
            async with self.session.post(f"{BASE_URL}/auth/login", json=TEST_USER) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("token")
                    self.log_result("Authentication", True, f"Successfully authenticated as {TEST_USER['email']}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Authentication", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        headers = {"Content-Type": "application/json"}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers
    
    # ==================== CRITICAL ENDPOINTS TESTS ====================
    
    async def test_dashboard_metrics(self):
        """Test GET /api/athena/dashboard/metrics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/dashboard/metrics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Dashboard Metrics", True, "Successfully retrieved dashboard metrics")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Dashboard Metrics", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Dashboard Metrics", False, f"Exception: {str(e)}")
            return False
    
    async def test_dashboard_executive(self):
        """Test GET /api/athena/dashboard/executive"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/dashboard/executive", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check if data has kpis structure (actual implementation)
                    if "kpis" in data:
                        kpis = data.get("kpis", {})
                        required_kpi_keys = ["revenue", "cases", "clients", "deadlines", "interceptions", "documents", "payments", "team"]
                        missing_keys = [key for key in required_kpi_keys if key not in kpis]
                        
                        if missing_keys:
                            self.log_result("Dashboard Executive", False, f"Missing KPI keys: {missing_keys}", data)
                            return False
                        
                        # Also check for trends and alerts
                        if "trends" not in data or "alerts" not in data:
                            self.log_result("Dashboard Executive", False, "Missing trends or alerts", data)
                            return False
                        
                        self.log_result("Dashboard Executive", True, "Successfully retrieved executive dashboard with all KPIs, trends, and alerts")
                        return True
                    else:
                        # Fallback to original structure check
                        required_keys = ["financial", "cases", "clients", "deadlines", "interceptions", "documents", "payments", "team"]
                        missing_keys = [key for key in required_keys if key not in data]
                        
                        if missing_keys:
                            self.log_result("Dashboard Executive", False, f"Missing keys: {missing_keys}", data)
                            return False
                        
                        self.log_result("Dashboard Executive", True, "Successfully retrieved executive dashboard with all KPIs")
                        return True
                else:
                    error_text = await response.text()
                    self.log_result("Dashboard Executive", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Dashboard Executive", False, f"Exception: {str(e)}")
            return False
    
    async def test_cases(self):
        """Test GET /api/cases"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/cases", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Should be a list of cases
                    if isinstance(data, list):
                        self.log_result("Cases", True, f"Successfully retrieved {len(data)} cases")
                        return True
                    elif isinstance(data, dict) and "cases" in data:
                        cases = data.get("cases", [])
                        self.log_result("Cases", True, f"Successfully retrieved {len(cases)} cases")
                        return True
                    else:
                        self.log_result("Cases", False, "Unexpected response format", data)
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Cases", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Cases", False, f"Exception: {str(e)}")
            return False
    
    async def test_athena_clients(self):
        """Test GET /api/athena/clients"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/clients", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "clients" in data:
                        clients = data.get("clients", [])
                        self.log_result("ATHENA Clients", True, f"Successfully retrieved {len(clients)} clients")
                        return True
                    else:
                        self.log_result("ATHENA Clients", False, "Missing 'clients' key in response", data)
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("ATHENA Clients", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("ATHENA Clients", False, f"Exception: {str(e)}")
            return False
    
    async def test_athena_processes(self):
        """Test GET /api/athena/processes"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/processes", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "processes" in data:
                        processes = data.get("processes", [])
                        self.log_result("ATHENA Processes", True, f"Successfully retrieved {len(processes)} processes")
                        return True
                    else:
                        self.log_result("ATHENA Processes", False, "Missing 'processes' key in response", data)
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("ATHENA Processes", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("ATHENA Processes", False, f"Exception: {str(e)}")
            return False
    
    async def test_financial_summary(self):
        """Test GET /api/athena/financial/summary"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/financial/summary", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate financial summary structure
                    required_keys = ["income", "expenses", "net", "period"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Financial Summary", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    self.log_result("Financial Summary", True, f"Successfully retrieved financial summary - Net: {data.get('net', 0)}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Financial Summary", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Financial Summary", False, f"Exception: {str(e)}")
            return False
    
    async def test_interceptions_statistics(self):
        """Test GET /api/athena/interceptions/statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/interceptions/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Interceptions Statistics", True, "Successfully retrieved interceptions statistics")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Interceptions Statistics", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Interceptions Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_interceptions_list(self):
        """Test GET /api/athena/interceptions/list"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/interceptions/list", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "interceptions" in data:
                        interceptions = data.get("interceptions", [])
                        self.log_result("Interceptions List", True, f"Successfully retrieved {len(interceptions)} interceptions")
                        return True
                    else:
                        self.log_result("Interceptions List", True, "Successfully retrieved interceptions list")
                        return True
                else:
                    error_text = await response.text()
                    self.log_result("Interceptions List", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Interceptions List", False, f"Exception: {str(e)}")
            return False
    
    async def test_interceptions_metadata_categories(self):
        """Test GET /api/athena/interceptions/metadata/categories"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/interceptions/metadata/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Interceptions Metadata Categories", True, "Successfully retrieved interceptions metadata categories")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Interceptions Metadata Categories", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Interceptions Metadata Categories", False, f"Exception: {str(e)}")
            return False
    
    async def test_interceptions_legal_foundations(self):
        """Test GET /api/athena/interceptions/legal/foundations"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/interceptions/legal/foundations", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Interceptions Legal Foundations", True, "Successfully retrieved interceptions legal foundations")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Interceptions Legal Foundations", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Interceptions Legal Foundations", False, f"Exception: {str(e)}")
            return False
    
    async def test_deadlines(self):
        """Test GET /api/athena/deadlines"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/deadlines", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "deadlines" in data:
                        deadlines = data.get("deadlines", [])
                        self.log_result("Deadlines", True, f"Successfully retrieved {len(deadlines)} deadlines")
                        return True
                    elif isinstance(data, list):
                        self.log_result("Deadlines", True, f"Successfully retrieved {len(data)} deadlines")
                        return True
                    else:
                        self.log_result("Deadlines", True, "Successfully retrieved deadlines")
                        return True
                else:
                    error_text = await response.text()
                    self.log_result("Deadlines", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Deadlines", False, f"Exception: {str(e)}")
            return False
    
    async def test_deadlines_alerts_upcoming(self):
        """Test GET /api/athena/deadlines/alerts/upcoming"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/deadlines/alerts/upcoming", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Should have D-3 and D-1 alerts structure
                    if "d_3_alerts" in data and "d_1_alerts" in data:
                        d3_count = len(data.get("d_3_alerts", []))
                        d1_count = len(data.get("d_1_alerts", []))
                        self.log_result("Deadlines Alerts Upcoming", True, f"Successfully retrieved D-3 alerts: {d3_count}, D-1 alerts: {d1_count}")
                        return True
                    else:
                        self.log_result("Deadlines Alerts Upcoming", True, "Successfully retrieved upcoming deadline alerts")
                        return True
                else:
                    error_text = await response.text()
                    self.log_result("Deadlines Alerts Upcoming", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Deadlines Alerts Upcoming", False, f"Exception: {str(e)}")
            return False
    
    async def test_users(self):
        """Test GET /api/users"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/users", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "users" in data:
                        users = data.get("users", [])
                        self.log_result("Users", True, f"Successfully retrieved {len(users)} users")
                        return True
                    elif isinstance(data, list):
                        self.log_result("Users", True, f"Successfully retrieved {len(data)} users")
                        return True
                    else:
                        self.log_result("Users", True, "Successfully retrieved users")
                        return True
                else:
                    error_text = await response.text()
                    self.log_result("Users", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Users", False, f"Exception: {str(e)}")
            return False
    
    async def test_library_categories(self):
        """Test GET /api/library/categories"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/library/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "categories" in data:
                        total = data.get("total", 0)
                        self.log_result("Document Library Categories", True, f"Successfully retrieved {total} document categories")
                        return True
                    else:
                        self.log_result("Document Library Categories", True, "Successfully retrieved document library categories")
                        return True
                else:
                    error_text = await response.text()
                    self.log_result("Document Library Categories", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Document Library Categories", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_categories(self):
        """Test GET /api/osint/categories"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/osint/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "total_categories" in data:
                        categories = data.get("total_categories", 0)
                        sources = data.get("total_sources", 0)
                        self.log_result("OSINT Categories", True, f"Successfully retrieved {categories} OSINT categories with {sources} sources")
                        return True
                    else:
                        self.log_result("OSINT Categories", True, "Successfully retrieved OSINT categories")
                        return True
                else:
                    error_text = await response.text()
                    self.log_result("OSINT Categories", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("OSINT Categories", False, f"Exception: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all critical endpoint tests"""
        print("🎯 STARTING FINAL COMPREHENSIVE TEST - AP Elite ATHENA System")
        print("=" * 80)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed - cannot proceed with tests")
            return
        
        print("\n🔍 Testing Critical Endpoints...")
        print("-" * 50)
        
        # Test all critical endpoints
        test_methods = [
            self.test_dashboard_metrics,
            self.test_dashboard_executive,
            self.test_cases,
            self.test_athena_clients,
            self.test_athena_processes,
            self.test_financial_summary,
            self.test_interceptions_statistics,
            self.test_interceptions_list,
            self.test_interceptions_metadata_categories,
            self.test_interceptions_legal_foundations,
            self.test_deadlines,
            self.test_deadlines_alerts_upcoming,
            self.test_users,
            self.test_library_categories,
            self.test_osint_categories
        ]
        
        for test_method in test_methods:
            await test_method()
        
        # Print summary
        print("\n" + "=" * 80)
        print("🎯 FINAL COMPREHENSIVE TEST RESULTS")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_count = len(self.passed_tests)
        failed_count = len(self.failed_tests)
        success_rate = (passed_count / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📊 SUMMARY:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_count}")
        print(f"   Failed: {failed_count}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        if self.passed_tests:
            print(f"\n✅ PASSED TESTS ({len(self.passed_tests)}):")
            for test in self.passed_tests:
                print(f"   ✅ {test}")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            for failed in self.failed_tests:
                print(f"   ❌ {failed['test']}: {failed['message']}")
        
        print("\n" + "=" * 80)
        
        if success_rate >= 90:
            print("🎉 EXCELLENT! System is production-ready with high success rate.")
        elif success_rate >= 75:
            print("✅ GOOD! System is mostly functional with minor issues to address.")
        elif success_rate >= 50:
            print("⚠️  MODERATE! System has significant issues that need attention.")
        else:
            print("❌ CRITICAL! System has major failures requiring immediate fixes.")

async def main():
    """Main test execution"""
    async with FinalComprehensiveTester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())