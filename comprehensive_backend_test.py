#!/usr/bin/env python3
"""
COMPREHENSIVE BACKEND API TESTING FOR AP ELITE ATHENA SYSTEM
Tests ALL 43+ modules including NEW modules (Executive Dashboard Pro, Deadline Manager)
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
import tempfile
import io

# Configuration
BASE_URL = "https://apelite-digital.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class ComprehensiveBackendTester:
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
            elif method == "PUT":
                async with self.session.put(f"{BASE_URL}{endpoint}", json=data, headers=headers) as response:
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
                
                self.log_result(test_name, True, f"Success - Status {response.status}")
                return data
            except:
                # Non-JSON response (like CSV/PDF)
                self.log_result(test_name, True, f"Success - Status {response.status} (Non-JSON)")
                return True
        else:
            error_text = await response.text()
            self.log_result(test_name, False, f"Failed with status {response.status}", error_text)
            return False

    # ==================== CORE SYSTEM TESTS ====================
    
    async def test_core_authentication(self):
        """Test Authentication & Login"""
        print("\n🔐 Testing Core Authentication...")
        
        # Test user creation
        user_data = {
            "name": f"Test User {datetime.now().timestamp()}",
            "email": f"testuser_{datetime.now().timestamp()}@apelite.com",
            "password": "testpass123",
            "role": "client",
            "phone": "+5511999887766"
        }
        await self.test_endpoint("/users", "POST", user_data, ["id", "name", "email", "role"], "User Creation")
        
        # Test user list
        await self.test_endpoint("/users", "GET", expected_keys=[], test_name="User Management List")
    
    async def test_core_dashboard(self):
        """Test Dashboard Analytics"""
        print("\n📊 Testing Dashboard Analytics...")
        
        # Analytics Overview
        await self.test_endpoint("/advanced/analytics/overview", "GET", 
                                expected_keys=["overview", "charts", "recent_activity"], 
                                test_name="Analytics Overview")
        
        # Analytics KPIs
        await self.test_endpoint("/advanced/analytics/kpis", "GET",
                                expected_keys=["cases", "revenue", "efficiency"],
                                test_name="Analytics KPIs")
        
        # Admin Stats
        await self.test_endpoint("/admin/stats", "GET", 
                                expected_keys=["total_cases", "active_cases"],
                                test_name="Admin Statistics")

    # ==================== CLIENTS & CASES TESTS ====================
    
    async def test_clients_cases(self):
        """Test Client Management & Process Management"""
        print("\n👥 Testing Clients & Cases...")
        
        # Test cases
        await self.test_endpoint("/cases", "GET", expected_keys=[], test_name="Cases List")
        
        # Test services
        await self.test_endpoint("/services", "GET", expected_keys=[], test_name="Services List")
        
        # Test appointments
        await self.test_endpoint("/appointments", "GET", expected_keys=[], test_name="Appointments List")
        
        # Test contact messages
        await self.test_endpoint("/contact", "GET", expected_keys=[], test_name="Contact Messages")
        
        # Test ATHENA processes
        await self.test_endpoint("/athena/processes", "GET", expected_keys=["processes"], test_name="ATHENA Processes")

    # ==================== COMMUNICATIONS TESTS ====================
    
    async def test_communications(self):
        """Test Communications Enhanced"""
        print("\n📞 Testing Communications...")
        
        # Test messages
        await self.test_endpoint("/advanced/communications/messages", "GET", 
                                expected_keys=["messages"], test_name="Communications Messages")
        
        # Test notifications
        await self.test_endpoint("/notifications/list", "GET", expected_keys=[], test_name="Notifications List")

    # ==================== CALENDAR & SCHEDULING TESTS ====================
    
    async def test_calendar_scheduling(self):
        """Test Calendar System, Video Conference, Meeting Links"""
        print("\n📅 Testing Calendar & Scheduling...")
        
        # Calendar events (if available)
        await self.test_endpoint("/calendar/events", "GET", expected_keys=[], test_name="Calendar Events")
        
        # Meeting links (if available)
        await self.test_endpoint("/meetings/links", "GET", expected_keys=[], test_name="Meeting Links")

    # ==================== FORENSICS & INVESTIGATIONS TESTS ====================
    
    async def test_forensics_investigations(self):
        """Test all forensics and investigation modules"""
        print("\n🔬 Testing Forensics & Investigations...")
        
        # Phone Interceptions Enhanced (NEW)
        await self.test_endpoint("/advanced/interception/analysis", "GET", expected_keys=[], 
                                test_name="Phone Interceptions Enhanced")
        
        # Data Interceptions
        await self.test_endpoint("/data/interceptions", "GET", expected_keys=[], 
                                test_name="Data Interceptions")
        
        # Digital Forensics
        await self.test_endpoint("/forensics/cases", "GET", expected_keys=[], 
                                test_name="Digital Forensics")
        
        # Data Extraction
        await self.test_endpoint("/extraction/data", "GET", expected_keys=[], 
                                test_name="Data Extraction")
        
        # ERBs Analysis
        await self.test_endpoint("/erbs/analysis", "GET", expected_keys=[], 
                                test_name="ERBs Analysis")
        
        # IPED Integration
        await self.test_endpoint("/advanced/iped/projects", "GET", 
                                expected_keys=["projects"], test_name="IPED Integration")
        
        # Evidence Processing
        await self.test_endpoint("/evidence/processing", "GET", expected_keys=[], 
                                test_name="Evidence Processing")
        
        # Process Analysis Pro (NEW)
        await self.test_endpoint("/process/analysis/pro", "GET", expected_keys=[], 
                                test_name="Process Analysis Pro")

    # ==================== ADVANCED INVESTIGATION TESTS ====================
    
    async def test_advanced_investigation(self):
        """Test Advanced Investigation AI, Relationship Mapping, Defensive Investigation"""
        print("\n🕵️ Testing Advanced Investigation...")
        
        # Advanced Investigation AI
        await self.test_endpoint("/investigation/cases", "GET", expected_keys=[], 
                                test_name="Advanced Investigation AI")
        
        # Relationship Mapping
        await self.test_endpoint("/relationships/persons", "GET", expected_keys=[], 
                                test_name="Relationship Mapping")
        
        # Defensive Investigation
        await self.test_endpoint("/athena/defensive-investigation/categories", "GET", 
                                expected_keys=[], test_name="Defensive Investigation")

    # ==================== DOCUMENTS & REPORTS TESTS ====================
    
    async def test_documents_reports(self):
        """Test Document Library, Template Generator, Automated Reports, Contract Generator, Document Generator"""
        print("\n📄 Testing Documents & Reports...")
        
        # Document Library
        await self.test_endpoint("/library/categories", "GET", 
                                expected_keys=["categories", "total"], test_name="Document Library")
        
        # Template Generator
        await self.test_endpoint("/templates/list", "GET", 
                                expected_keys=["templates", "total"], test_name="Template Generator")
        
        # Automated Reports (NEW)
        await self.test_endpoint("/reports/templates", "GET", expected_keys=[], 
                                test_name="Automated Reports")
        
        # Contract Generator
        await self.test_endpoint("/contracts/templates", "GET", expected_keys=[], 
                                test_name="Contract Generator")
        
        # Document Generator
        await self.test_endpoint("/documents/generate", "GET", expected_keys=[], 
                                test_name="Document Generator")

    # ==================== AI & ANALYTICS TESTS ====================
    
    async def test_ai_analytics(self):
        """Test AI Orchestrator, OCR Advanced, Media Analysis, RAG System, Predictive Analytics"""
        print("\n🤖 Testing AI & Analytics...")
        
        # OCR Advanced
        await self.test_endpoint("/ocr/statistics", "GET", expected_keys=[], 
                                test_name="OCR Advanced")
        
        # Media Analysis
        await self.test_endpoint("/media/statistics", "GET", expected_keys=[], 
                                test_name="Media Analysis")
        
        # RAG System
        await self.test_endpoint("/rag/status", "GET", expected_keys=[], 
                                test_name="RAG System")
        
        # Predictive Analytics
        await self.test_endpoint("/predictive/statistics", "GET", expected_keys=[], 
                                test_name="Predictive Analytics")

    # ==================== AUTOMATION TESTS ====================
    
    async def test_automation(self):
        """Test Workflow Automation, AI Chatbot, Social Listening"""
        print("\n⚙️ Testing Automation...")
        
        # Workflow Automation
        await self.test_endpoint("/workflow/templates", "GET", expected_keys=[], 
                                test_name="Workflow Automation")
        
        # AI Chatbot
        await self.test_endpoint("/chatbot/statistics", "GET", expected_keys=[], 
                                test_name="AI Chatbot")
        
        # Social Listening
        await self.test_endpoint("/social/statistics", "GET", expected_keys=[], 
                                test_name="Social Listening")

    # ==================== COLLABORATION & COMPLIANCE TESTS ====================
    
    async def test_collaboration_compliance(self):
        """Test Real-time Collaboration, Compliance LGPD"""
        print("\n🤝 Testing Collaboration & Compliance...")
        
        # Real-time Collaboration
        await self.test_endpoint("/collaboration/statistics", "GET", expected_keys=[], 
                                test_name="Real-time Collaboration")
        
        # Compliance LGPD
        await self.test_endpoint("/compliance/statistics", "GET", expected_keys=[], 
                                test_name="Compliance LGPD")

    # ==================== FINANCIAL TESTS ====================
    
    async def test_financial(self):
        """Test Financial Management Enhanced, Smart Fees, Blockchain Custody"""
        print("\n💰 Testing Financial...")
        
        # Financial Management Enhanced (NEW)
        await self.test_endpoint("/athena/financial/summary", "GET", 
                                expected_keys=["income", "expenses"], test_name="Financial Management Enhanced")
        
        # Smart Fees
        await self.test_endpoint("/fees/statistics", "GET", expected_keys=[], 
                                test_name="Smart Fees")
        
        # Blockchain Custody
        await self.test_endpoint("/blockchain/status", "GET", expected_keys=[], 
                                test_name="Blockchain Custody")

    # ==================== SYSTEM TESTS ====================
    
    async def test_system_features(self):
        """Test Hybrid Sync System, Global Search, Notifications, Security Features"""
        print("\n🔧 Testing System Features...")
        
        # Hybrid Sync System
        await self.test_endpoint("/hybrid/status", "GET", expected_keys=[], 
                                test_name="Hybrid Sync System")
        
        # Global Search
        await self.test_endpoint("/search/global", "GET", expected_keys=[], 
                                test_name="Global Search")
        
        # Security Features
        await self.test_endpoint("/security/status", "GET", expected_keys=[], 
                                test_name="Security Features")

    # ==================== NEW MODULES TESTS (PRIORITY) ====================
    
    async def test_new_modules_priority(self):
        """Test NEW modules with priority: Executive Dashboard Pro, Deadline Manager"""
        print("\n🆕 Testing NEW Modules (Priority)...")
        
        # Executive Dashboard Pro (NEW)
        await self.test_endpoint("/athena/dashboard/executive", "GET", expected_keys=[], 
                                test_name="Executive Dashboard Pro")
        
        # Deadline Manager (NEW)
        await self.test_endpoint("/athena/deadlines", "GET", expected_keys=[], 
                                test_name="Deadline Manager")

    # ==================== OSINT ENHANCED TESTS ====================
    
    async def test_osint_enhanced(self):
        """Test OSINT Enhanced System"""
        print("\n🌐 Testing OSINT Enhanced...")
        
        # OSINT Categories
        await self.test_endpoint("/osint/categories", "GET", 
                                expected_keys=["categories", "total_categories"], 
                                test_name="OSINT Categories")
        
        # OSINT Tools
        await self.test_endpoint("/osint/tools", "GET", expected_keys=[], 
                                test_name="OSINT Tools")
        
        # OSINT History
        await self.test_endpoint("/osint/history", "GET", expected_keys=[], 
                                test_name="OSINT History")

    # ==================== INTEGRATIONS TESTS ====================
    
    async def test_integrations(self):
        """Test Advanced Integrations"""
        print("\n🔗 Testing Advanced Integrations...")
        
        # Audit Logs
        await self.test_endpoint("/integrations/audit/logs", "GET", 
                                expected_keys=["logs", "total"], test_name="Audit Logs")
        
        # Activity Summary
        await self.test_endpoint("/integrations/audit/activity-summary", "GET", 
                                expected_keys=["activity_by_action"], test_name="Activity Summary")
        
        # Backup System
        await self.test_endpoint("/integrations/backup/create", "POST", {}, 
                                expected_keys=["status"], test_name="Backup System")

    # ==================== MAIN TEST RUNNER ====================
    
    async def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🚀 Starting COMPREHENSIVE AP ELITE ATHENA SYSTEM TESTING")
        print("=" * 80)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        # Test all modules in order of priority
        test_methods = [
            # NEW MODULES FIRST (Priority)
            self.test_new_modules_priority,
            
            # CORE SYSTEM
            self.test_core_authentication,
            self.test_core_dashboard,
            
            # CLIENTS & CASES
            self.test_clients_cases,
            
            # COMMUNICATIONS
            self.test_communications,
            
            # CALENDAR & SCHEDULING
            self.test_calendar_scheduling,
            
            # FORENSICS & INVESTIGATIONS
            self.test_forensics_investigations,
            
            # ADVANCED INVESTIGATION
            self.test_advanced_investigation,
            
            # DOCUMENTS & REPORTS
            self.test_documents_reports,
            
            # AI & ANALYTICS
            self.test_ai_analytics,
            
            # AUTOMATION
            self.test_automation,
            
            # COLLABORATION & COMPLIANCE
            self.test_collaboration_compliance,
            
            # FINANCIAL
            self.test_financial,
            
            # SYSTEM FEATURES
            self.test_system_features,
            
            # OSINT ENHANCED
            self.test_osint_enhanced,
            
            # INTEGRATIONS
            self.test_integrations,
        ]
        
        # Run all tests
        for test_method in test_methods:
            try:
                await test_method()
            except Exception as e:
                print(f"❌ Error in {test_method.__name__}: {str(e)}")
        
        # Print final summary
        self.print_final_summary()
    
    def print_final_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🎯 COMPREHENSIVE TESTING COMPLETE - FINAL SUMMARY")
        print("=" * 80)
        
        total_tests = self.passed_tests + self.failed_tests
        success_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   ✅ PASSED: {self.passed_tests}")
        print(f"   ❌ FAILED: {self.failed_tests}")
        print(f"   📈 SUCCESS RATE: {success_rate:.1f}%")
        print(f"   🔢 TOTAL TESTS: {total_tests}")
        
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

async def main():
    """Main test execution"""
    async with ComprehensiveBackendTester() as tester:
        await tester.run_comprehensive_tests()

if __name__ == "__main__":
    asyncio.run(main())