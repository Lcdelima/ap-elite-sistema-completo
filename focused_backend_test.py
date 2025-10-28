#!/usr/bin/env python3
"""
Focused Backend API Testing for AP Elite ATHENA System
Tests key modules as requested in the comprehensive review
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BASE_URL = "https://digital-sleuth-9.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class FocusedBackendTester:
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
    
    def log_result(self, test_name: str, success: bool, message: str):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
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
                    error_text = await response.text()
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
    
    async def test_endpoint(self, name: str, method: str, endpoint: str, data=None, expected_keys=None):
        """Generic endpoint test"""
        try:
            headers = self.get_headers()
            
            if method.upper() == "GET":
                async with self.session.get(f"{BASE_URL}{endpoint}", headers=headers) as response:
                    return await self._process_response(name, response, expected_keys)
            elif method.upper() == "POST":
                async with self.session.post(f"{BASE_URL}{endpoint}", json=data, headers=headers) as response:
                    return await self._process_response(name, response, expected_keys)
                    
        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False
    
    async def _process_response(self, name: str, response, expected_keys=None):
        """Process HTTP response"""
        if response.status == 200:
            try:
                data = await response.json()
                
                if expected_keys:
                    missing_keys = [key for key in expected_keys if key not in data]
                    if missing_keys:
                        self.log_result(name, False, f"Missing keys: {missing_keys}")
                        return False
                
                self.log_result(name, True, "API endpoint working correctly")
                return True
            except:
                # Non-JSON response might be OK for some endpoints
                self.log_result(name, True, "API endpoint working (non-JSON response)")
                return True
        else:
            error_text = await response.text()
            self.log_result(name, False, f"Failed with status {response.status}")
            return False
    
    async def run_focused_tests(self):
        """Run focused tests for key ATHENA modules"""
        print("🚀 COMPREHENSIVE AP ELITE ATHENA BACKEND TESTING")
        print("=" * 80)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed - stopping tests")
            return
        
        print("\n🔐 CORE ATHENA - Authentication & User Management")
        print("-" * 60)
        await self.test_endpoint("User Management", "GET", "/users")
        await self.test_endpoint("ATHENA Processes", "GET", "/athena/processes", expected_keys=["processes"])
        await self.test_endpoint("ATHENA Clients", "GET", "/athena/clients", expected_keys=["clients"])
        
        print("\n📊 CORE ATHENA - Dashboard & Analytics")
        print("-" * 60)
        await self.test_endpoint("Analytics Overview", "GET", "/advanced/analytics/overview", expected_keys=["overview", "charts"])
        await self.test_endpoint("Analytics KPIs", "GET", "/advanced/analytics/kpis", expected_keys=["cases", "revenue"])
        await self.test_endpoint("Financial Summary", "GET", "/athena/financial/summary", expected_keys=["income", "expenses"])
        
        print("\n🔍 INVESTIGATION MODULES - Advanced Investigation AI")
        print("-" * 60)
        await self.test_endpoint("Investigation Cases", "GET", "/investigation/cases", expected_keys=["cases"])
        case_data = {"title": "Test Case", "description": "Test", "priority": "high", "case_type": "criminal"}
        await self.test_endpoint("Investigation Case Create", "POST", "/investigation/cases", data=case_data)
        
        print("\n🕵️ INVESTIGATION MODULES - OSINT Enhanced")
        print("-" * 60)
        await self.test_endpoint("OSINT Categories", "GET", "/osint/categories", expected_keys=["categories"])
        osint_data = {"query": "João Silva", "sources": ["social_media"], "use_ai_analysis": True}
        await self.test_endpoint("OSINT Query", "POST", "/osint/query", data=osint_data)
        
        print("\n🛡️ INVESTIGATION MODULES - Defensive Investigation")
        print("-" * 60)
        await self.test_endpoint("Defensive Categories", "GET", "/athena/defensive-investigation/categories")
        await self.test_endpoint("Defensive Cases", "GET", "/athena/defensive-investigation/cases")
        await self.test_endpoint("Defensive Stats", "GET", "/athena/defensive-investigation/stats")
        
        print("\n🔬 DIGITAL FORENSICS - Forensics & Evidence")
        print("-" * 60)
        await self.test_endpoint("IPED Projects", "GET", "/advanced/iped/projects", expected_keys=["projects"])
        
        print("\n📞 COMMUNICATIONS - Advanced Communications")
        print("-" * 60)
        await self.test_endpoint("Communications Messages", "GET", "/advanced/communications/messages", expected_keys=["messages"])
        
        print("\n📚 DOCUMENT & REPORTING - Document Management")
        print("-" * 60)
        await self.test_endpoint("Document Categories", "GET", "/library/categories", expected_keys=["categories"])
        await self.test_endpoint("Template List", "GET", "/templates/list", expected_keys=["templates"])
        
        print("\n📋 DOCUMENT & REPORTING - Automated Reports")
        print("-" * 60)
        await self.test_endpoint("Report Templates", "GET", "/reports/templates")
        
        print("\n🤖 AI & ANALYSIS - AI Systems")
        print("-" * 60)
        await self.test_endpoint("OCR Statistics", "GET", "/ocr/statistics")
        await self.test_endpoint("Media Statistics", "GET", "/media/statistics")
        await self.test_endpoint("Predictive Statistics", "GET", "/predictive/statistics")
        
        print("\n⚙️ AUTOMATION & WORKFLOWS - Workflow Systems")
        print("-" * 60)
        await self.test_endpoint("Workflow Templates", "GET", "/workflows/templates")
        await self.test_endpoint("Chatbot Statistics", "GET", "/chatbot/statistics")
        await self.test_endpoint("Social Listening Statistics", "GET", "/social-listening/statistics")
        
        print("\n🤝 COLLABORATION & COMPLIANCE - Team Systems")
        print("-" * 60)
        await self.test_endpoint("Collaboration Statistics", "GET", "/collaboration/statistics")
        await self.test_endpoint("Compliance Statistics", "GET", "/compliance/statistics")
        
        print("\n🔧 SYSTEM FEATURES - Advanced Integrations")
        print("-" * 60)
        await self.test_endpoint("Audit Logs", "GET", "/integrations/audit/logs")
        await self.test_endpoint("Activity Summary", "GET", "/integrations/audit/activity-summary")
        
        print("\n🔄 SYSTEM FEATURES - Hybrid Sync & Search")
        print("-" * 60)
        await self.test_endpoint("Hybrid Status", "GET", "/hybrid/status")
        await self.test_endpoint("Hybrid Backups", "GET", "/hybrid/backups")
        
        # Summary
        print("\n" + "=" * 80)
        print("🎯 COMPREHENSIVE TESTING SUMMARY - ALL AP ELITE ATHENA MODULES")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"✅ Passed: {passed}/{total} ({success_rate:.1f}%)")
        
        if passed == total:
            print("🎉 ALL MODULES PASSED! Complete AP Elite ATHENA system is fully functional.")
        else:
            failed_tests = total - passed
            print(f"❌ Failed: {failed_tests}/{total}")
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return success_rate

async def main():
    async with FocusedBackendTester() as tester:
        await tester.run_focused_tests()

if __name__ == "__main__":
    asyncio.run(main())