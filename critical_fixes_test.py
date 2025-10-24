#!/usr/bin/env python3
"""
Critical Backend Fixes Testing for AP Elite ATHENA System
Testing the 3 high-priority backend fixes:
1. Executive Dashboard Pro endpoint (/api/athena/dashboard/executive)
2. Deadline Manager endpoint (/api/athena/deadlines)
3. User Management endpoint (/api/users)
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timezone, timedelta

# Configuration
BASE_URL = "https://lawtech-suite.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class CriticalFixesTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_results = []
        
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
        status = "✅ PASS" if success else "❌ FAIL"
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
    
    # ==================== TEST 1: EXECUTIVE DASHBOARD PRO ====================
    
    async def test_executive_dashboard_default(self):
        """Test GET /api/athena/dashboard/executive (default period)"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/dashboard/executive", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["kpis", "trends", "alerts", "recentActivity"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Executive Dashboard Default", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate KPIs structure
                    kpis = data.get("kpis", {})
                    expected_kpi_sections = ["revenue", "cases", "clients", "deadlines", "interceptions", "documents", "payments", "team"]
                    missing_kpi_sections = [section for section in expected_kpi_sections if section not in kpis]
                    
                    if missing_kpi_sections:
                        self.log_result("Executive Dashboard Default", False, f"Missing KPI sections: {missing_kpi_sections}", data)
                        return False
                    
                    # Validate revenue KPIs
                    revenue = kpis.get("revenue", {})
                    if not all(key in revenue for key in ["current", "previous", "target"]):
                        self.log_result("Executive Dashboard Default", False, "Missing revenue KPI fields", data)
                        return False
                    
                    # Validate cases KPIs
                    cases = kpis.get("cases", {})
                    if not all(key in cases for key in ["active", "completed", "new"]):
                        self.log_result("Executive Dashboard Default", False, "Missing cases KPI fields", data)
                        return False
                    
                    # Validate trends
                    trends = data.get("trends", {})
                    if not all(key in trends for key in ["revenue", "cases", "clients"]):
                        self.log_result("Executive Dashboard Default", False, "Missing trends data", data)
                        return False
                    
                    self.log_result("Executive Dashboard Default", True, "Successfully retrieved comprehensive executive dashboard with all KPIs")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Executive Dashboard Default", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Executive Dashboard Default", False, f"Exception: {str(e)}")
            return False
    
    async def test_executive_dashboard_periods(self):
        """Test Executive Dashboard with different periods"""
        periods = ["week", "month", "quarter", "year"]
        
        for period in periods:
            try:
                headers = self.get_headers()
                params = {"period": period}
                async with self.session.get(f"{BASE_URL}/athena/dashboard/executive", headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Basic validation
                        if "kpis" not in data:
                            self.log_result(f"Executive Dashboard ({period})", False, "Missing KPIs in response", data)
                            return False
                        
                        self.log_result(f"Executive Dashboard ({period})", True, f"Successfully retrieved dashboard for {period} period")
                    else:
                        error_text = await response.text()
                        self.log_result(f"Executive Dashboard ({period})", False, f"Failed with status {response.status}", error_text)
                        return False
            except Exception as e:
                self.log_result(f"Executive Dashboard ({period})", False, f"Exception: {str(e)}")
                return False
        
        return True
    
    # ==================== TEST 2: DEADLINE MANAGER ====================
    
    async def test_deadline_manager_list(self):
        """Test GET /api/athena/deadlines - List all deadlines"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/deadlines", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "deadlines" not in data:
                        self.log_result("Deadline Manager List", False, "Missing 'deadlines' key in response", data)
                        return False
                    
                    deadlines = data.get("deadlines", [])
                    if not isinstance(deadlines, list):
                        self.log_result("Deadline Manager List", False, "Deadlines should be a list", data)
                        return False
                    
                    # Check if deadlines have status calculation
                    for deadline in deadlines:
                        if "status" not in deadline:
                            self.log_result("Deadline Manager List", False, "Deadline missing status field", deadline)
                            return False
                    
                    self.log_result("Deadline Manager List", True, f"Successfully retrieved {len(deadlines)} deadlines with status")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Deadline Manager List", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Deadline Manager List", False, f"Exception: {str(e)}")
            return False
    
    async def test_deadline_manager_create(self):
        """Test POST /api/athena/deadlines - Create new deadline"""
        try:
            deadline_data = {
                "processNumber": "0001234-56.2024.8.26.0100",
                "processTitle": "Ação Penal - Furto Qualificado",
                "client": "João Silva Santos",
                "court": "1ª Vara Criminal de São Paulo",
                "type": "Prazo Recursal",
                "deadline": "2025-01-15T23:59:59Z",
                "description": "Prazo para apresentação de recurso de apelação",
                "responsible": "advogada",
                "priority": "high"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/athena/deadlines", json=deadline_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "deadline_id", "status"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Deadline Manager Create", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    deadline_id = data.get("deadline_id")
                    if not deadline_id:
                        self.log_result("Deadline Manager Create", False, "No deadline_id returned", data)
                        return False
                    
                    self.log_result("Deadline Manager Create", True, f"Successfully created deadline: {deadline_id}")
                    return deadline_id
                else:
                    error_text = await response.text()
                    self.log_result("Deadline Manager Create", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Deadline Manager Create", False, f"Exception: {str(e)}")
            return False
    
    async def test_deadline_manager_get_single(self, deadline_id):
        """Test GET /api/athena/deadlines/{deadline_id} - Get single deadline"""
        if not deadline_id:
            self.log_result("Deadline Manager Get Single", False, "No deadline_id provided")
            return False
        
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/deadlines/{deadline_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["id", "processNumber", "processTitle", "client", "deadline", "status"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Deadline Manager Get Single", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("id") != deadline_id:
                        self.log_result("Deadline Manager Get Single", False, f"ID mismatch: expected {deadline_id}, got {data.get('id')}", data)
                        return False
                    
                    self.log_result("Deadline Manager Get Single", True, f"Successfully retrieved deadline: {data.get('processTitle')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Deadline Manager Get Single", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Deadline Manager Get Single", False, f"Exception: {str(e)}")
            return False
    
    async def test_deadline_manager_alerts(self):
        """Test GET /api/athena/deadlines/alerts/upcoming - Get D-3 and D-1 alerts"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/deadlines/alerts/upcoming", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["d3_alerts", "d1_alerts", "total_alerts"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Deadline Manager Alerts", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    d3_alerts = data.get("d3_alerts", [])
                    d1_alerts = data.get("d1_alerts", [])
                    total_alerts = data.get("total_alerts", 0)
                    
                    if not isinstance(d3_alerts, list) or not isinstance(d1_alerts, list):
                        self.log_result("Deadline Manager Alerts", False, "Alerts should be lists", data)
                        return False
                    
                    if total_alerts != len(d3_alerts) + len(d1_alerts):
                        self.log_result("Deadline Manager Alerts", False, "Total alerts count mismatch", data)
                        return False
                    
                    self.log_result("Deadline Manager Alerts", True, f"Successfully retrieved alerts: {len(d3_alerts)} D-3, {len(d1_alerts)} D-1")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Deadline Manager Alerts", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Deadline Manager Alerts", False, f"Exception: {str(e)}")
            return False
    
    # ==================== TEST 3: USER MANAGEMENT ====================
    
    async def test_user_management_list(self):
        """Test GET /api/users - List all users"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/users", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["users", "total"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("User Management List", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    users = data.get("users", [])
                    total = data.get("total", 0)
                    
                    if not isinstance(users, list):
                        self.log_result("User Management List", False, "Users should be a list", data)
                        return False
                    
                    if len(users) != total:
                        self.log_result("User Management List", False, f"Users count mismatch: {len(users)} vs {total}", data)
                        return False
                    
                    # Check user structure
                    if users:
                        user = users[0]
                        required_user_keys = ["id", "name", "email", "role"]
                        missing_user_keys = [key for key in required_user_keys if key not in user]
                        
                        if missing_user_keys:
                            self.log_result("User Management List", False, f"Missing user keys: {missing_user_keys}", user)
                            return False
                        
                        # Ensure password is not exposed
                        if "password" in user:
                            self.log_result("User Management List", False, "Password field should not be exposed", user)
                            return False
                    
                    self.log_result("User Management List", True, f"Successfully retrieved {total} users")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("User Management List", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("User Management List", False, f"Exception: {str(e)}")
            return False
    
    async def test_user_management_list_alias(self):
        """Test GET /api/users/list - List users (alias endpoint)"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/users/list", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Should have same structure as /api/users
                    required_keys = ["users", "total"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("User Management List Alias", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    users = data.get("users", [])
                    total = data.get("total", 0)
                    
                    if not isinstance(users, list):
                        self.log_result("User Management List Alias", False, "Users should be a list", data)
                        return False
                    
                    self.log_result("User Management List Alias", True, f"Successfully retrieved {total} users via alias endpoint")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("User Management List Alias", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("User Management List Alias", False, f"Exception: {str(e)}")
            return False
    
    async def test_user_management_unauthorized(self):
        """Test User Management without authentication"""
        try:
            # Test without auth headers
            async with self.session.get(f"{BASE_URL}/users") as response:
                if response.status == 401:
                    self.log_result("User Management Unauthorized", True, "Correctly returned 401 for unauthorized access")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("User Management Unauthorized", False, f"Expected 401, got {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("User Management Unauthorized", False, f"Exception: {str(e)}")
            return False
    
    # ==================== MAIN TEST RUNNER ====================
    
    async def run_all_tests(self):
        """Run all critical fixes tests"""
        print("🔧 CRITICAL FIXES VERIFICATION - Testing 3 high-priority backend fixes")
        print("=" * 80)
        
        # Step 1: Authentication
        if not await self.authenticate():
            print("❌ Authentication failed - cannot proceed with tests")
            return
        
        print("\n🎯 TEST 1: EXECUTIVE DASHBOARD PRO")
        print("-" * 50)
        
        # Test Executive Dashboard
        await self.test_executive_dashboard_default()
        await self.test_executive_dashboard_periods()
        
        print("\n🎯 TEST 2: DEADLINE MANAGER")
        print("-" * 50)
        
        # Test Deadline Manager
        await self.test_deadline_manager_list()
        deadline_id = await self.test_deadline_manager_create()
        if deadline_id:
            await self.test_deadline_manager_get_single(deadline_id)
        await self.test_deadline_manager_alerts()
        
        print("\n🎯 TEST 3: USER MANAGEMENT")
        print("-" * 50)
        
        # Test User Management
        await self.test_user_management_list()
        await self.test_user_management_list_alias()
        await self.test_user_management_unauthorized()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  - {result['test']}: {result['message']}")
        
        return self.test_results

async def main():
    """Main test execution"""
    async with CriticalFixesTester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())