#!/usr/bin/env python3
"""
Focused Critical Endpoints Test - Quick Assessment
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime

BASE_URL = "https://elite-detective-1.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class FocusedTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30))
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, message: str, duration=None):
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "duration_ms": duration
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        duration_str = f" ({duration:.2f}ms)" if duration else ""
        print(f"{status} {test_name}: {message}{duration_str}")
    
    async def authenticate(self):
        try:
            start_time = time.time()
            async with self.session.post(f"{BASE_URL}/auth/login", json=TEST_USER) as response:
                duration = (time.time() - start_time) * 1000
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("token")
                    self.log_result("Authentication", True, f"Authenticated as {TEST_USER['email']}", duration)
                    return True
                else:
                    self.log_result("Authentication", False, f"Status {response.status}", duration)
                    return False
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def get_headers(self):
        headers = {"Content-Type": "application/json"}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers
    
    async def test_endpoint(self, name: str, method: str, url: str, **kwargs):
        try:
            headers = self.get_headers()
            start_time = time.time()
            
            if method.upper() == "GET":
                async with self.session.get(url, headers=headers, **kwargs) as response:
                    duration = (time.time() - start_time) * 1000
                    success = response.status == 200
                    if success:
                        data = await response.json()
                        self.log_result(name, True, f"Status 200", duration)
                    else:
                        error_text = await response.text()
                        self.log_result(name, False, f"Status {response.status}", duration)
                    return success
            elif method.upper() == "POST":
                async with self.session.post(url, headers=headers, **kwargs) as response:
                    duration = (time.time() - start_time) * 1000
                    success = response.status == 200
                    if success:
                        data = await response.json()
                        self.log_result(name, True, f"Status 200", duration)
                    else:
                        error_text = await response.text()
                        self.log_result(name, False, f"Status {response.status}", duration)
                    return success
        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False
    
    async def run_critical_tests(self):
        print("🎯 FOCUSED CRITICAL ENDPOINTS TEST")
        print("=" * 60)
        
        # Test remaining critical endpoints that might have issues
        critical_endpoints = [
            ("Report Templates", "GET", f"{BASE_URL}/reports/templates"),
            ("Social Listening Stats", "GET", f"{BASE_URL}/social/statistics"),
            ("Investigation Evidence Upload Fix", "POST", f"{BASE_URL}/investigation/evidence/upload"),
            ("OSINT Categories", "GET", f"{BASE_URL}/osint/categories"),
            ("Template Statistics", "GET", f"{BASE_URL}/templates/statistics"),
            ("Document Library Stats", "GET", f"{BASE_URL}/library/statistics"),
            ("Backup Creation", "POST", f"{BASE_URL}/integrations/backup/create"),
            ("PDF Report Generation", "POST", f"{BASE_URL}/integrations/reports/case/test-case"),
            ("Email Integration", "POST", f"{BASE_URL}/integrations/email/send-report"),
            ("Data Export CSV", "GET", f"{BASE_URL}/integrations/export/cases/csv"),
        ]
        
        for name, method, url in critical_endpoints:
            if "evidence/upload" in url:
                # Special handling for file upload
                await self.test_evidence_upload_fixed()
            elif "email/send-report" in url:
                # Special handling for email
                await self.test_email_integration()
            else:
                await self.test_endpoint(name, method, url)
        
        # Generate summary
        total = len(self.results) - 1  # Exclude authentication
        successful = sum(1 for r in self.results[1:] if r["success"])
        success_rate = (successful / total) * 100 if total > 0 else 0
        
        print(f"\n📊 SUMMARY:")
        print(f"   • Total Tests: {total}")
        print(f"   • Success Rate: {success_rate:.1f}% ({successful}/{total})")
        
        failed_tests = [r for r in self.results if not r["success"] and r["test"] != "Authentication"]
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        return success_rate >= 90.0
    
    async def test_evidence_upload_fixed(self):
        """Test evidence upload with correct parameters"""
        try:
            # Create proper form data with required fields
            data = aiohttp.FormData()
            data.add_field('case_id', 'test-case-123')
            data.add_field('evidence_name', 'Test Evidence Document')  # Required field
            data.add_field('evidence_type', 'document')
            data.add_field('file', b'test evidence content', filename='evidence.txt', content_type='text/plain')
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            start_time = time.time()
            async with self.session.post(f"{BASE_URL}/investigation/evidence/upload", data=data, headers=headers) as response:
                duration = (time.time() - start_time) * 1000
                success = response.status == 200
                if success:
                    result = await response.json()
                    self.log_result("Evidence Upload Fixed", True, f"Uploaded evidence: {result.get('evidence_id')}", duration)
                else:
                    error_text = await response.text()
                    self.log_result("Evidence Upload Fixed", False, f"Status {response.status}", duration)
                return success
        except Exception as e:
            self.log_result("Evidence Upload Fixed", False, f"Exception: {str(e)}")
            return False
    
    async def test_email_integration(self):
        """Test email integration with parameters"""
        try:
            params = {
                "case_id": "test-case-123",
                "recipient_email": "test@apelite.com"
            }
            
            headers = self.get_headers()
            start_time = time.time()
            async with self.session.post(f"{BASE_URL}/integrations/email/send-report", params=params, headers=headers) as response:
                duration = (time.time() - start_time) * 1000
                success = response.status == 200
                if success:
                    result = await response.json()
                    self.log_result("Email Integration", True, f"Email queued successfully", duration)
                else:
                    error_text = await response.text()
                    self.log_result("Email Integration", False, f"Status {response.status}", duration)
                return success
        except Exception as e:
            self.log_result("Email Integration", False, f"Exception: {str(e)}")
            return False

async def main():
    async with FocusedTester() as tester:
        if await tester.authenticate():
            await tester.run_critical_tests()
        else:
            print("❌ Authentication failed")

if __name__ == "__main__":
    asyncio.run(main())