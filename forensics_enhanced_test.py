#!/usr/bin/env python3
"""
Forensics Enhanced API Testing
Tests the new Forensics Enhanced backend API endpoints
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timezone
import tempfile
import io

# Configuration
BASE_URL = "https://forensic-hub-5.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class ForensicsEnhancedTester:
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
    
    async def test_forensics_stats(self):
        """Test GET /api/forensics/enhanced/stats/overview - Get forensics statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/forensics/enhanced/stats/overview", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["total", "active", "completed", "critical"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Forensics Stats", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate data types
                    for key in required_keys:
                        if not isinstance(data[key], int):
                            self.log_result("Forensics Stats", False, f"{key} should be an integer", data)
                            return False
                    
                    self.log_result("Forensics Stats", True, f"Successfully retrieved stats: {data['total']} total, {data['active']} active, {data['completed']} completed, {data['critical']} critical")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Forensics Stats", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Forensics Stats", False, f"Exception: {str(e)}")
            return False
    
    async def test_forensics_analyses_list(self):
        """Test GET /api/forensics/enhanced - List all forensic analyses"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/forensics/enhanced", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["examinations", "total"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Forensics Analyses List", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    examinations = data.get("examinations", [])
                    if not isinstance(examinations, list):
                        self.log_result("Forensics Analyses List", False, "Examinations should be a list", data)
                        return False
                    
                    total = data.get("total", 0)
                    if not isinstance(total, int):
                        self.log_result("Forensics Analyses List", False, "Total should be an integer", data)
                        return False
                    
                    self.log_result("Forensics Analyses List", True, f"Successfully retrieved {len(examinations)} examinations (total: {total})")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Forensics Analyses List", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Forensics Analyses List", False, f"Exception: {str(e)}")
            return False
    
    async def test_forensics_create_analysis(self):
        """Test POST /api/forensics/enhanced - Create a new forensic analysis"""
        try:
            # Prepare form data as specified in the request
            data = aiohttp.FormData()
            data.add_field('examId', 'CASE-001')
            data.add_field('examTitle', 'Test Forensic Analysis')
            data.add_field('examType', 'data_recovery')
            data.add_field('evidenceType', 'smartphone')
            data.add_field('deviceBrand', 'Samsung')
            data.add_field('deviceModel', 'Galaxy S21')
            data.add_field('serialNumber', 'TEST123456789')
            data.add_field('operatingSystem', 'Android 12')
            data.add_field('storageSize', '128GB')
            data.add_field('caseName', 'Test Case')
            data.add_field('caseNumber', 'CASE-001')
            data.add_field('requestor', 'Test Investigator')
            data.add_field('laboratory', 'AP Elite Lab')
            data.add_field('examDate', datetime.now(timezone.utc).isoformat())
            data.add_field('priority', 'high')
            data.add_field('objectives', 'Test analysis for data recovery')
            data.add_field('methodology', 'write_blocker')
            data.add_field('hashAlgorithm', 'SHA-256')
            data.add_field('imagingTool', 'FTK_Imager')
            data.add_field('aiEnabled', 'true')
            data.add_field('mlAnalysis', 'true')
            data.add_field('autoReport', 'true')
            data.add_field('notes', 'Test forensic analysis creation')
            
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.post(f"{BASE_URL}/forensics/enhanced", data=data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["success", "message", "exam_id", "data"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Forensics Create Analysis", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if not data.get("success"):
                        self.log_result("Forensics Create Analysis", False, f"Success flag is False", data)
                        return False
                    
                    exam_id = data.get("exam_id")
                    if not exam_id:
                        self.log_result("Forensics Create Analysis", False, "Missing exam_id", data)
                        return False
                    
                    # Validate examination data structure
                    exam_data = data.get("data", {})
                    required_exam_keys = ["id", "examId", "examTitle", "examType", "evidenceType", "priority", "status"]
                    missing_exam_keys = [key for key in required_exam_keys if key not in exam_data]
                    
                    if missing_exam_keys:
                        self.log_result("Forensics Create Analysis", False, f"Missing examination keys: {missing_exam_keys}", data)
                        return False
                    
                    self.log_result("Forensics Create Analysis", True, f"Successfully created forensic analysis with ID: {exam_id}")
                    return exam_id
                else:
                    error_text = await response.text()
                    self.log_result("Forensics Create Analysis", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Forensics Create Analysis", False, f"Exception: {str(e)}")
            return False
    
    async def test_forensics_get_analysis(self, exam_id: str):
        """Test GET /api/forensics/enhanced/{exam_id} - Get specific forensic analysis"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/forensics/enhanced/{exam_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["id", "examId", "examTitle", "examType", "evidenceType", "status", "priority"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Forensics Get Analysis", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("id") != exam_id:
                        self.log_result("Forensics Get Analysis", False, f"ID mismatch: expected {exam_id}, got {data.get('id')}", data)
                        return False
                    
                    self.log_result("Forensics Get Analysis", True, f"Successfully retrieved analysis: {data.get('examTitle')} (Status: {data.get('status')})")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Forensics Get Analysis", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Forensics Get Analysis", False, f"Exception: {str(e)}")
            return False
    
    async def test_forensics_tools(self):
        """Test GET /api/forensics/enhanced/tools - Get list of available forensic tools"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/forensics/enhanced/tools", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Forensics Tools", True, f"Successfully retrieved forensic tools")
                    return True
                elif response.status == 404:
                    self.log_result("Forensics Tools", False, "Endpoint not implemented (404 Not Found)")
                    return False
                else:
                    error_text = await response.text()
                    self.log_result("Forensics Tools", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Forensics Tools", False, f"Exception: {str(e)}")
            return False
    
    async def test_forensics_device_types(self):
        """Test GET /api/forensics/enhanced/device-types - Get supported device types"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/forensics/enhanced/device-types", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Forensics Device Types", True, f"Successfully retrieved device types")
                    return True
                elif response.status == 404:
                    self.log_result("Forensics Device Types", False, "Endpoint not implemented (404 Not Found)")
                    return False
                else:
                    error_text = await response.text()
                    self.log_result("Forensics Device Types", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Forensics Device Types", False, f"Exception: {str(e)}")
            return False
    
    async def test_forensics_analysis_types(self):
        """Test GET /api/forensics/enhanced/analysis-types - Get available analysis types"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/forensics/enhanced/analysis-types", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Forensics Analysis Types", True, f"Successfully retrieved analysis types")
                    return True
                elif response.status == 404:
                    self.log_result("Forensics Analysis Types", False, "Endpoint not implemented (404 Not Found)")
                    return False
                else:
                    error_text = await response.text()
                    self.log_result("Forensics Analysis Types", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Forensics Analysis Types", False, f"Exception: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all forensics enhanced tests"""
        print("🔬 Starting Forensics Enhanced API Testing...")
        print("=" * 60)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        # Test 1: Get forensics statistics
        await self.test_forensics_stats()
        
        # Test 2: List all forensic analyses
        await self.test_forensics_analyses_list()
        
        # Test 3: Create a new forensic analysis
        exam_id = await self.test_forensics_create_analysis()
        
        # Test 4: Get specific analysis (if creation was successful)
        if exam_id:
            await self.test_forensics_get_analysis(exam_id)
        
        # Test 5: Get forensic tools (may not be implemented)
        await self.test_forensics_tools()
        
        # Test 6: Get device types (may not be implemented)
        await self.test_forensics_device_types()
        
        # Test 7: Get analysis types (may not be implemented)
        await self.test_forensics_analysis_types()
        
        # Summary
        print("\n" + "=" * 60)
        print("🔬 FORENSICS ENHANCED API TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        print("\nDetailed Results:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return self.test_results

async def main():
    """Main test function"""
    async with ForensicsEnhancedTester() as tester:
        results = await tester.run_all_tests()
        return results

if __name__ == "__main__":
    asyncio.run(main())