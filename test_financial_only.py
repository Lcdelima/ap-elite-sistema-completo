#!/usr/bin/env python3
"""
Test only the ATHENA Financial Summary endpoint
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

class FinancialTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def authenticate(self):
        """Authenticate and get token"""
        try:
            async with self.session.post(f"{BASE_URL}/auth/login", json=TEST_USER) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("token")
                    print(f"✅ Authentication successful")
                    return True
                else:
                    print(f"❌ Authentication failed - Status: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Authentication exception: {str(e)}")
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        headers = {"Content-Type": "application/json"}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers
    
    async def test_athena_financial_summary(self):
        """Test GET /api/athena/financial/summary"""
        print("🔍 Testing ATHENA Financial Summary endpoint...")
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/financial/summary", headers=headers) as response:
                print(f"Status: {response.status}")
                
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ SUCCESS - Response received")
                    print(f"Response structure: {json.dumps(data, indent=2)}")
                    
                    # Validate required keys
                    required_keys = ["income", "expenses", "net", "period", "by_category", "profit_margin"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        print(f"❌ Missing keys: {missing_keys}")
                        return False
                    
                    # Validate period structure
                    period = data.get("period", {})
                    if not isinstance(period, dict) or "start" not in period or "end" not in period:
                        print(f"❌ Invalid period structure: {period}")
                        return False
                    
                    print(f"✅ All validation checks passed!")
                    print(f"📊 Financial Summary:")
                    print(f"   Income: R$ {data.get('income', 0):.2f}")
                    print(f"   Expenses: R$ {data.get('expenses', 0):.2f}")
                    print(f"   Net: R$ {data.get('net', 0):.2f}")
                    print(f"   Period: {period.get('start', '')[:10]} to {period.get('end', '')[:10]}")
                    print(f"   Profit Margin: {data.get('profit_margin', 0)}%")
                    print(f"   Categories: {len(data.get('by_category', []))} entries")
                    
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Failed with status {response.status}")
                    print(f"Response: {error_text}")
                    return False
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False
    
    async def run_test(self):
        """Run the financial endpoint test"""
        print("🚀 Testing ATHENA Financial Summary Endpoint")
        print("=" * 50)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Test the endpoint
        result = await self.test_athena_financial_summary()
        
        print("=" * 50)
        if result:
            print("🎉 ATHENA Financial Summary endpoint is working correctly!")
        else:
            print("❌ ATHENA Financial Summary endpoint test failed")
        
        return result

async def main():
    """Main test runner"""
    async with FinancialTester() as tester:
        await tester.run_test()

if __name__ == "__main__":
    asyncio.run(main())