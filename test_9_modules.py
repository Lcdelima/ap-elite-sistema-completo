#!/usr/bin/env python3
"""
Focused Backend API Testing for 9 New Modules
Tests the 9 new frontend modules' backend APIs specifically
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BASE_URL = "https://forensic-repairfix.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class ModuleTester:
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
    
    async def test_ocr_statistics(self):
        """Test GET /api/ocr/statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/ocr/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("OCR Statistics", True, f"OCR system available with {data.get('total_processed', 0)} processed")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("OCR Statistics", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("OCR Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_media_statistics(self):
        """Test GET /api/media/statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/media/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Media Statistics", True, f"Media system available with {data.get('total_transcriptions', 0)} transcriptions")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Media Statistics", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Media Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_workflow_templates(self):
        """Test GET /api/workflows/templates"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/workflows/templates", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Workflow Templates", True, f"Workflow system available with {data.get('total', 0)} templates")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Workflow Templates", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Workflow Templates", False, f"Exception: {str(e)}")
            return False
    
    async def test_chatbot_statistics(self):
        """Test GET /api/chatbot/statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/chatbot/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Chatbot Statistics", True, f"Chatbot system available with {data.get('total_sessions', 0)} sessions")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Chatbot Statistics", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Chatbot Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_social_listening_statistics(self):
        """Test GET /api/social-listening/statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/social-listening/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Social Listening Statistics", True, f"Social listening available with {data.get('total_alerts', 0)} alerts")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Social Listening Statistics", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Social Listening Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_collaboration_statistics(self):
        """Test GET /api/collaboration/statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/collaboration/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Collaboration Statistics", True, f"Collaboration system available with {data.get('total_documents', 0)} documents")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Collaboration Statistics", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Collaboration Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_predictive_statistics(self):
        """Test GET /api/predictive/statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/predictive/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Predictive Statistics", True, f"Predictive analytics available with {data.get('total_predictions', 0)} predictions")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Predictive Statistics", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Predictive Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_compliance_statistics(self):
        """Test GET /api/compliance/statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/compliance/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Compliance Statistics", True, f"Compliance system available with {data.get('total_consents', 0)} consents")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Compliance Statistics", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Compliance Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_automated_reports_templates(self):
        """Test GET /api/reports/templates"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/reports/templates", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    templates = data.get("templates", [])
                    self.log_result("Automated Reports Templates", True, f"Reports system available with {len(templates)} templates")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Automated Reports Templates", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Automated Reports Templates", False, f"Exception: {str(e)}")
            return False
    
    async def run_focused_tests(self):
        """Run focused tests on 9 new modules"""
        print("🚀 Testing 9 New Backend Modules for AP Elite")
        print("=" * 60)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        print("\n🔍 Testing OCR Advanced System...")
        await self.test_ocr_statistics()
        
        print("\n🎥 Testing Media Analysis System...")
        await self.test_media_statistics()
        
        print("\n⚙️ Testing Workflow Automation...")
        await self.test_workflow_templates()
        
        print("\n🤖 Testing AI Chatbot...")
        await self.test_chatbot_statistics()
        
        print("\n📱 Testing Social Listening...")
        await self.test_social_listening_statistics()
        
        print("\n👥 Testing Real-time Collaboration...")
        await self.test_collaboration_statistics()
        
        print("\n📈 Testing Predictive Analytics...")
        await self.test_predictive_statistics()
        
        print("\n🛡️ Testing Compliance LGPD...")
        await self.test_compliance_statistics()
        
        print("\n📊 Testing Automated Reports...")
        await self.test_automated_reports_templates()
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 9 NEW MODULES TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return self.test_results

async def main():
    """Main test runner"""
    async with ModuleTester() as tester:
        results = await tester.run_focused_tests()
        
        print(f"\n📄 Test completed with {len(results)} tests")

if __name__ == "__main__":
    asyncio.run(main())