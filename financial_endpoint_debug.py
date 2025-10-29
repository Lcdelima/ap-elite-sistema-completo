#!/usr/bin/env python3
"""
Financial Endpoint Debug Script
Specifically investigates the 404 error for /api/athena/financial/summary endpoint
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BASE_URL = "https://cisai-forense.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class FinancialEndpointDebugger:
    def __init__(self):
        self.session = None
        self.auth_token = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log(self, message: str, level: str = "INFO"):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    async def authenticate(self):
        """Authenticate and get token"""
        self.log("🔐 Testing authentication with laura@apelite.com/laura2024")
        try:
            async with self.session.post(f"{BASE_URL}/auth/login", json=TEST_USER) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("token")
                    self.log(f"✅ Authentication successful - Token: {self.auth_token[:20]}...")
                    return True
                else:
                    error_text = await response.text()
                    self.log(f"❌ Authentication failed - Status: {response.status}, Response: {error_text}", "ERROR")
                    return False
        except Exception as e:
            self.log(f"❌ Authentication exception: {str(e)}", "ERROR")
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        headers = {"Content-Type": "application/json"}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers
    
    async def test_financial_endpoint_variations(self):
        """Test multiple variations of the financial endpoint"""
        self.log("🔍 Testing multiple variations of financial endpoint")
        
        endpoints_to_test = [
            "/api/athena/financial/summary",
            "/api/financial/summary", 
            "/financial/summary",
            "/athena/financial/summary"
        ]
        
        headers = self.get_headers()
        
        for endpoint in endpoints_to_test:
            full_url = f"https://cisai-forense.preview.emergentagent.com{endpoint}"
            self.log(f"Testing: {endpoint}")
            
            try:
                async with self.session.get(full_url, headers=headers) as response:
                    self.log(f"  Status: {response.status}")
                    self.log(f"  Headers: {dict(response.headers)}")
                    
                    if response.status == 200:
                        data = await response.json()
                        self.log(f"  ✅ SUCCESS - Response: {json.dumps(data, indent=2)}")
                    else:
                        error_text = await response.text()
                        self.log(f"  ❌ FAILED - Response: {error_text}")
                        
            except Exception as e:
                self.log(f"  ❌ EXCEPTION: {str(e)}")
            
            self.log("  " + "-" * 50)
    
    async def discover_athena_endpoints(self):
        """Try to discover all available /api/athena/* endpoints"""
        self.log("🔍 Discovering available /api/athena/* endpoints")
        
        # Common endpoint patterns to test
        athena_endpoints = [
            "/api/athena/",
            "/api/athena/processes",
            "/api/athena/cases",
            "/api/athena/users",
            "/api/athena/evidence",
            "/api/athena/financial",
            "/api/athena/financial/summary",
            "/api/athena/financial/records",
            "/api/athena/meetings",
            "/api/athena/analysis",
            "/api/athena/calendar",
            "/api/athena/dashboard",
            "/api/athena/tasks",
            "/api/athena/admin/stats"
        ]
        
        headers = self.get_headers()
        working_endpoints = []
        
        for endpoint in athena_endpoints:
            full_url = f"https://cisai-forense.preview.emergentagent.com{endpoint}"
            
            try:
                async with self.session.get(full_url, headers=headers) as response:
                    if response.status in [200, 201, 202]:
                        working_endpoints.append(f"{endpoint} - Status: {response.status}")
                        self.log(f"  ✅ {endpoint} - Status: {response.status}")
                    elif response.status == 404:
                        self.log(f"  ❌ {endpoint} - 404 Not Found")
                    elif response.status == 401:
                        self.log(f"  🔒 {endpoint} - 401 Unauthorized")
                    elif response.status == 403:
                        self.log(f"  🚫 {endpoint} - 403 Forbidden")
                    else:
                        self.log(f"  ⚠️  {endpoint} - Status: {response.status}")
                        
            except Exception as e:
                self.log(f"  ❌ {endpoint} - Exception: {str(e)}")
        
        self.log(f"\n📋 WORKING ENDPOINTS SUMMARY:")
        for endpoint in working_endpoints:
            self.log(f"  ✅ {endpoint}")
        
        return working_endpoints
    
    async def test_enhanced_server_endpoints(self):
        """Test endpoints that should be available in enhanced_server.py"""
        self.log("🔍 Testing enhanced_server.py endpoints")
        
        enhanced_endpoints = [
            "/api/auth/login",
            "/api/users",
            "/api/cases", 
            "/api/evidence",
            "/api/financial",
            "/api/financial/summary",
            "/api/meetings",
            "/api/calendar/events",
            "/api/dashboard/statistics",
            "/api/tasks",
            "/api/admin/stats"
        ]
        
        headers = self.get_headers()
        working_enhanced = []
        
        for endpoint in enhanced_endpoints:
            full_url = f"https://cisai-forense.preview.emergentagent.com{endpoint}"
            
            try:
                async with self.session.get(full_url, headers=headers) as response:
                    if response.status in [200, 201, 202]:
                        working_enhanced.append(f"{endpoint} - Status: {response.status}")
                        self.log(f"  ✅ {endpoint} - Status: {response.status}")
                    elif response.status == 404:
                        self.log(f"  ❌ {endpoint} - 404 Not Found")
                    else:
                        self.log(f"  ⚠️  {endpoint} - Status: {response.status}")
                        
            except Exception as e:
                self.log(f"  ❌ {endpoint} - Exception: {str(e)}")
        
        self.log(f"\n📋 WORKING ENHANCED SERVER ENDPOINTS:")
        for endpoint in working_enhanced:
            self.log(f"  ✅ {endpoint}")
        
        return working_enhanced
    
    async def check_routing_conflicts(self):
        """Check for potential routing conflicts"""
        self.log("🔍 Checking for routing conflicts")
        
        # Test if there are multiple financial endpoints
        financial_endpoints = [
            "/api/financial/summary",  # From enhanced_server.py
            "/api/athena/financial/summary"  # From super_erp_part3.py
        ]
        
        headers = self.get_headers()
        
        for endpoint in financial_endpoints:
            full_url = f"https://cisai-forense.preview.emergentagent.com{endpoint}"
            self.log(f"Testing financial endpoint: {endpoint}")
            
            try:
                async with self.session.get(full_url, headers=headers) as response:
                    self.log(f"  Status: {response.status}")
                    
                    if response.status == 200:
                        data = await response.json()
                        self.log(f"  ✅ SUCCESS - Keys: {list(data.keys())}")
                        self.log(f"  Response structure: {json.dumps(data, indent=2)}")
                    else:
                        error_text = await response.text()
                        self.log(f"  ❌ FAILED - Response: {error_text}")
                        
            except Exception as e:
                self.log(f"  ❌ EXCEPTION: {str(e)}")
    
    async def run_debug_investigation(self):
        """Run complete debug investigation"""
        self.log("🚀 Starting Financial Endpoint Debug Investigation")
        self.log("=" * 70)
        
        # Step 1: Authenticate
        if not await self.authenticate():
            self.log("❌ Cannot proceed without authentication", "ERROR")
            return
        
        # Step 2: Test financial endpoint variations
        await self.test_financial_endpoint_variations()
        
        # Step 3: Discover available athena endpoints
        await self.discover_athena_endpoints()
        
        # Step 4: Test enhanced server endpoints
        await self.test_enhanced_server_endpoints()
        
        # Step 5: Check for routing conflicts
        await self.check_routing_conflicts()
        
        self.log("=" * 70)
        self.log("🏁 Debug investigation complete")

async def main():
    """Main debug runner"""
    async with FinancialEndpointDebugger() as debugger:
        await debugger.run_debug_investigation()

if __name__ == "__main__":
    asyncio.run(main())