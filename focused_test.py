#!/usr/bin/env python3
"""
Focused Backend Testing for AP Elite ATHENA System
Testing specific endpoints as requested in review
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timezone

# Configuration
BASE_URL = "https://apelite-digital.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class FocusedTester:
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
    
    async def test_user_management_list(self):
        """Test GET /api/users/list - User Management API"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/users/list", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["users", "total"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("User Management List", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    users = data.get("users", [])
                    if not isinstance(users, list):
                        self.log_result("User Management List", False, "Users should be a list", data)
                        return False
                    
                    self.log_result("User Management List", True, f"Successfully retrieved {len(users)} users (total: {data.get('total')})")
                    return True
                elif response.status == 401:
                    error_text = await response.text()
                    self.log_result("User Management List", False, f"Authentication failed (401)", error_text)
                    return False
                elif response.status == 403:
                    error_text = await response.text()
                    self.log_result("User Management List", False, f"Permission denied (403)", error_text)
                    return False
                elif response.status == 500:
                    error_text = await response.text()
                    self.log_result("User Management List", False, f"Server error (500) - This was the reported issue", error_text)
                    return False
                else:
                    error_text = await response.text()
                    self.log_result("User Management List", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("User Management List", False, f"Exception: {str(e)}")
            return False
    
    async def test_smart_fees_statistics(self):
        """Test GET /api/fees/statistics - Smart Fees Backend"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/fees/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["total_calculations", "total_invoices", "features", "integrations"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Smart Fees Statistics", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate data types
                    if not isinstance(data.get("features"), list):
                        self.log_result("Smart Fees Statistics", False, "Features should be a list", data)
                        return False
                    
                    if not isinstance(data.get("integrations"), list):
                        self.log_result("Smart Fees Statistics", False, "Integrations should be a list", data)
                        return False
                    
                    self.log_result("Smart Fees Statistics", True, f"Successfully retrieved fees statistics: {data.get('total_calculations')} calculations, {data.get('total_invoices')} invoices")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Smart Fees Statistics", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Smart Fees Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def run_focused_tests(self):
        """Run the focused tests"""
        print("🎯 Starting Focused Backend Testing for AP Elite ATHENA System")
        print("=" * 70)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed - cannot proceed with tests")
            return
        
        print("\n🔍 Testing Specific Endpoints:")
        print("-" * 40)
        
        # Test the specific endpoints mentioned in the review request
        await self.test_user_management_list()
        await self.test_smart_fees_statistics()
        
        # Summary
        print("\n📊 Test Summary:")
        print("=" * 40)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return self.test_results

async def main():
    async with FocusedTester() as tester:
        results = await tester.run_focused_tests()
        return results

if __name__ == "__main__":
    asyncio.run(main())