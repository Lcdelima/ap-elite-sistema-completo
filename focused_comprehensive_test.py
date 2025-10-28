#!/usr/bin/env python3
"""
FOCUSED COMPREHENSIVE BACKEND API TESTING FOR AP ELITE ATHENA SYSTEM
Tests actual working endpoints based on enhanced_server.py structure
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Configuration
BASE_URL = "https://forensic-hub-5.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class FocusedComprehensiveTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_results = []
        self.passed_tests = 0
        self.failed_tests = 0
        
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
        
        if success:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
    
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
    
    async def test_endpoint(self, endpoint: str, method: str = "GET", data: dict = None, 
                          expected_keys: list = None, test_name: str = None):
        """Generic endpoint tester"""
        if not test_name:
            test_name = f"{method} {endpoint}"
        
        try:
            headers = self.get_headers()
            
            if method == "GET":
                async with self.session.get(f"{BASE_URL}{endpoint}", headers=headers) as response:
                    return await self._process_response(response, test_name, expected_keys)
            elif method == "POST":
                async with self.session.post(f"{BASE_URL}{endpoint}", json=data, headers=headers) as response:
                    return await self._process_response(response, test_name, expected_keys)
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def _process_response(self, response, test_name, expected_keys):
        """Process HTTP response"""
        if response.status in [200, 201]:
            try:
                data = await response.json()
                
                if expected_keys:
                    missing_keys = [key for key in expected_keys if key not in data]
                    if missing_keys:
                        self.log_result(test_name, False, f"Missing keys: {missing_keys}", data)
                        return False
                
                # Get meaningful info from response
                info = ""
                if isinstance(data, dict):
                    if "total" in data:
                        info = f"Total: {data['total']}"
                    elif "processes" in data:
                        info = f"Processes: {len(data['processes'])}"
                    elif "categories" in data:
                        info = f"Categories: {len(data['categories'])}"
                    elif "templates" in data:
                        info = f"Templates: {len(data['templates'])}"
                    elif "messages" in data:
                        info = f"Messages: {len(data['messages'])}"
                    elif "projects" in data:
                        info = f"Projects: {len(data['projects'])}"
                
                self.log_result(test_name, True, f"Success - {info}" if info else "Success")
                return data
            except:
                # Non-JSON response
                self.log_result(test_name, True, f"Success - Status {response.status}")
                return True
        else:
            error_text = await response.text()
            self.log_result(test_name, False, f"Status {response.status}", error_text[:200])
            return False

    async def run_comprehensive_tests(self):
        """Run all comprehensive tests for actual working endpoints"""
        print("🚀 Starting FOCUSED COMPREHENSIVE AP ELITE ATHENA SYSTEM TESTING")
        print("=" * 80)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        # Test all actual working endpoints based on enhanced_server.py
        
        print("\n🔐 Testing Authentication & User Management...")
        await self.test_endpoint("/users", "GET", test_name="User Management List")
        
        print("\n📊 Testing Analytics & Dashboard...")
        await self.test_endpoint("/advanced/analytics/overview", "GET", test_name="Analytics Overview")
        await self.test_endpoint("/advanced/analytics/kpis", "GET", test_name="Analytics KPIs")
        await self.test_endpoint("/admin/stats", "GET", test_name="Admin Statistics")
        
        print("\n👥 Testing Core ATHENA Modules...")
        await self.test_endpoint("/athena/processes", "GET", test_name="ATHENA Processes")
        await self.test_endpoint("/athena/financial/summary", "GET", test_name="ATHENA Financial Summary")
        await self.test_endpoint("/athena/defensive-investigation/categories", "GET", test_name="Defensive Investigation Categories")
        await self.test_endpoint("/athena/defensive-investigation/cases", "GET", test_name="Defensive Investigation Cases")
        await self.test_endpoint("/athena/defensive-investigation/stats", "GET", test_name="Defensive Investigation Stats")
        
        print("\n🔬 Testing Digital Forensics & Investigation...")
        await self.test_endpoint("/advanced/iped/projects", "GET", test_name="IPED Projects")
        await self.test_endpoint("/investigation/cases", "GET", test_name="Investigation Cases")
        await self.test_endpoint("/relationships/persons", "GET", test_name="Relationship Mapping - Persons")
        await self.test_endpoint("/relationships/networks", "GET", test_name="Relationship Mapping - Networks")
        
        print("\n📞 Testing Communications...")
        await self.test_endpoint("/advanced/communications/messages", "GET", test_name="Communications Messages")
        
        print("\n📚 Testing Document & Library Systems...")
        await self.test_endpoint("/library/categories", "GET", test_name="Document Library Categories")
        await self.test_endpoint("/library/documents", "GET", test_name="Document Library Documents")
        await self.test_endpoint("/library/statistics", "GET", test_name="Document Library Statistics")
        
        print("\n🌐 Testing OSINT Enhanced...")
        await self.test_endpoint("/osint/categories", "GET", test_name="OSINT Categories")
        await self.test_endpoint("/osint/tools", "GET", test_name="OSINT Tools")
        await self.test_endpoint("/osint/history", "GET", test_name="OSINT History")
        
        print("\n📄 Testing Template Generator...")
        await self.test_endpoint("/templates/list", "GET", test_name="Template List")
        await self.test_endpoint("/templates/statistics", "GET", test_name="Template Statistics")
        await self.test_endpoint("/templates/generated/list", "GET", test_name="Generated Documents List")
        
        print("\n📊 Testing Automated Reports...")
        await self.test_endpoint("/reports/templates", "GET", test_name="Report Templates")
        
        print("\n🤖 Testing AI & Analytics Systems...")
        await self.test_endpoint("/ocr/statistics", "GET", test_name="OCR Advanced Statistics")
        await self.test_endpoint("/media/statistics", "GET", test_name="Media Analysis Statistics")
        await self.test_endpoint("/predictive/statistics", "GET", test_name="Predictive Analytics Statistics")
        await self.test_endpoint("/chatbot/statistics", "GET", test_name="AI Chatbot Statistics")
        
        print("\n⚙️ Testing Workflow & Automation...")
        await self.test_endpoint("/workflow/templates", "GET", test_name="Workflow Templates")
        await self.test_endpoint("/social/statistics", "GET", test_name="Social Listening Statistics")
        
        print("\n🤝 Testing Collaboration & Compliance...")
        await self.test_endpoint("/collaboration/statistics", "GET", test_name="Collaboration Statistics")
        await self.test_endpoint("/compliance/statistics", "GET", test_name="Compliance LGPD Statistics")
        
        print("\n💰 Testing Financial Systems...")
        await self.test_endpoint("/fees/statistics", "GET", test_name="Smart Fees Statistics")
        await self.test_endpoint("/blockchain/status", "GET", test_name="Blockchain Custody Status")
        
        print("\n🔄 Testing Hybrid & System Features...")
        await self.test_endpoint("/hybrid/status", "GET", test_name="Hybrid System Status")
        await self.test_endpoint("/hybrid/backups", "GET", test_name="Hybrid System Backups")
        
        print("\n🔗 Testing Advanced Integrations...")
        await self.test_endpoint("/integrations/audit/logs", "GET", test_name="Audit Logs")
        await self.test_endpoint("/integrations/audit/activity-summary", "GET", test_name="Activity Summary")
        
        print("\n🔒 Testing Security & Notifications...")
        await self.test_endpoint("/notifications/list", "GET", test_name="Notifications System")
        await self.test_endpoint("/security/status", "GET", test_name="Security Features")
        
        print("\n📧 Testing Email & Storage...")
        await self.test_endpoint("/email/status", "GET", test_name="Email Integration")
        await self.test_endpoint("/storage/status", "GET", test_name="Storage Integration")
        
        print("\n🔍 Testing Additional Systems...")
        await self.test_endpoint("/rag/status", "GET", test_name="RAG System")
        await self.test_endpoint("/ai/status", "GET", test_name="AI Document Analysis")
        await self.test_endpoint("/backup/status", "GET", test_name="Backup System")
        
        # Test some POST endpoints with sample data
        print("\n✏️ Testing POST Endpoints...")
        
        # Create test user
        user_data = {
            "name": f"Test User {datetime.now().timestamp()}",
            "email": f"testuser_{int(datetime.now().timestamp())}@apelite.com",
            "password": "testpass123",
            "role": "client",
            "phone": "+5511999887766"
        }
        await self.test_endpoint("/users", "POST", user_data, test_name="User Creation")
        
        # Create investigation case
        case_data = {
            "title": f"Test Investigation Case {datetime.now().timestamp()}",
            "description": "Test case for comprehensive testing",
            "case_type": "criminal",
            "priority": "medium"
        }
        await self.test_endpoint("/investigation/cases", "POST", case_data, test_name="Investigation Case Creation")
        
        # Create OSINT query
        osint_data = {
            "query": "João Silva Santos",
            "sources": ["social_media"],
            "use_ai_analysis": True
        }
        await self.test_endpoint("/osint/query", "POST", osint_data, test_name="OSINT Query Execution")
        
        # Create backup
        await self.test_endpoint("/integrations/backup/create", "POST", {}, test_name="Backup Creation")
        
        # Print final summary
        self.print_final_summary()
    
    def print_final_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🎯 FOCUSED COMPREHENSIVE TESTING COMPLETE - FINAL SUMMARY")
        print("=" * 80)
        
        total_tests = self.passed_tests + self.failed_tests
        success_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   ✅ PASSED: {self.passed_tests}")
        print(f"   ❌ FAILED: {self.failed_tests}")
        print(f"   📈 SUCCESS RATE: {success_rate:.1f}%")
        print(f"   🔢 TOTAL TESTS: {total_tests}")
        
        # Group results by category
        passed_by_category = {}
        failed_by_category = {}
        
        for result in self.test_results:
            category = result["test"].split(" - ")[0] if " - " in result["test"] else "General"
            if result["success"]:
                passed_by_category[category] = passed_by_category.get(category, 0) + 1
            else:
                failed_by_category[category] = failed_by_category.get(category, 0) + 1
        
        print(f"\n📈 SUCCESS BY MODULE:")
        all_categories = set(list(passed_by_category.keys()) + list(failed_by_category.keys()))
        for category in sorted(all_categories):
            passed = passed_by_category.get(category, 0)
            failed = failed_by_category.get(category, 0)
            total_cat = passed + failed
            rate = (passed / total_cat * 100) if total_cat > 0 else 0
            print(f"   {category}: {passed}/{total_cat} ({rate:.1f}%)")
        
        if self.failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n🏁 TESTING COMPLETED AT: {datetime.now().isoformat()}")
        
        # Determine system status
        if success_rate >= 95:
            print("🟢 SYSTEM STATUS: EXCELLENT - Production Ready")
        elif success_rate >= 85:
            print("🟡 SYSTEM STATUS: GOOD - Minor Issues")
        elif success_rate >= 70:
            print("🟠 SYSTEM STATUS: FAIR - Several Issues")
        else:
            print("🔴 SYSTEM STATUS: POOR - Major Issues")
        
        # Provide recommendations
        print(f"\n💡 RECOMMENDATIONS:")
        if success_rate >= 90:
            print("   • System is highly functional and ready for production")
            print("   • Address any remaining minor issues")
        elif success_rate >= 75:
            print("   • System is mostly functional with some issues")
            print("   • Focus on fixing authentication and routing issues")
            print("   • Review endpoint configurations")
        else:
            print("   • System needs significant attention")
            print("   • Many endpoints are not accessible or configured")
            print("   • Review server configuration and routing")
            print("   • Check authentication middleware")

async def main():
    """Main test execution"""
    async with FocusedComprehensiveTester() as tester:
        await tester.run_comprehensive_tests()

if __name__ == "__main__":
    asyncio.run(main())