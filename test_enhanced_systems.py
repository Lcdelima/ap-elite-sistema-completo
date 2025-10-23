#!/usr/bin/env python3
"""
Quick test for the new enhanced systems only
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BASE_URL = "https://apelite-erp.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class QuickTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, message: str):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
    
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
                    self.log_result("Authentication", False, f"Failed with status {response.status}")
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
    
    async def test_document_library_categories(self):
        """Test Document Library Categories"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/library/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("total") == 10:
                        self.log_result("Document Library Categories", True, f"Retrieved {data.get('total')} categories")
                        return True
                    else:
                        self.log_result("Document Library Categories", False, f"Expected 10 categories, got {data.get('total')}")
                        return False
                else:
                    self.log_result("Document Library Categories", False, f"Status {response.status}")
                    return False
        except Exception as e:
            self.log_result("Document Library Categories", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_categories(self):
        """Test OSINT Categories"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/osint/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("total_categories") == 10 and data.get("total_sources") >= 33:
                        self.log_result("OSINT Categories", True, f"Retrieved {data.get('total_categories')} categories with {data.get('total_sources')} sources")
                        return True
                    else:
                        self.log_result("OSINT Categories", False, f"Expected 10 categories and 33+ sources, got {data.get('total_categories')}/{data.get('total_sources')}")
                        return False
                else:
                    self.log_result("OSINT Categories", False, f"Status {response.status}")
                    return False
        except Exception as e:
            self.log_result("OSINT Categories", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_query(self):
        """Test OSINT Query"""
        try:
            query_data = {
                "query": "João Silva",
                "sources": ["social_media"],
                "use_ai_analysis": True
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/osint/query", json=query_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("query") == query_data["query"]:
                        self.log_result("OSINT Query", True, f"Successfully executed query for '{data.get('query')}'")
                        return True
                    else:
                        self.log_result("OSINT Query", False, "Query mismatch")
                        return False
                else:
                    self.log_result("OSINT Query", False, f"Status {response.status}")
                    return False
        except Exception as e:
            self.log_result("OSINT Query", False, f"Exception: {str(e)}")
            return False
    
    async def test_template_list(self):
        """Test Template List"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/templates/list", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("total") == 6:
                        self.log_result("Template List", True, f"Retrieved {data.get('total')} templates")
                        return True
                    else:
                        self.log_result("Template List", False, f"Expected 6 templates, got {data.get('total')}")
                        return False
                else:
                    self.log_result("Template List", False, f"Status {response.status}")
                    return False
        except Exception as e:
            self.log_result("Template List", False, f"Exception: {str(e)}")
            return False
    
    async def test_template_details(self):
        """Test Template Details"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/templates/aij_roteiro", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("id") == "aij_roteiro":
                        self.log_result("Template Details", True, f"Retrieved template '{data.get('name')}'")
                        return True
                    else:
                        self.log_result("Template Details", False, "Template ID mismatch")
                        return False
                else:
                    self.log_result("Template Details", False, f"Status {response.status}")
                    return False
        except Exception as e:
            self.log_result("Template Details", False, f"Exception: {str(e)}")
            return False
    
    async def run_tests(self):
        """Run all enhanced system tests"""
        print("🚀 Testing AP Elite Enhanced Systems")
        print("=" * 50)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        print("\n📚 Testing Document Library System...")
        await self.test_document_library_categories()
        
        print("\n🔍 Testing OSINT Enhanced System...")
        await self.test_osint_categories()
        await self.test_osint_query()
        
        print("\n📄 Testing Template Generator System...")
        await self.test_template_list()
        await self.test_template_details()
        
        # Summary
        print("\n" + "=" * 50)
        print("📋 ENHANCED SYSTEMS TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.results if result["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n✅ Enhanced systems tested successfully!" if passed == total else "\n⚠️  Some tests failed")
        
        return self.results

async def main():
    """Main test runner"""
    async with QuickTester() as tester:
        results = await tester.run_tests()
        
        # Save results to file
        with open("/app/enhanced_systems_test_results.json", 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n📄 Test results saved to: /app/enhanced_systems_test_results.json")

if __name__ == "__main__":
    asyncio.run(main())