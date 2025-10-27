#!/usr/bin/env python3
"""
Functional Backend API Testing for 9 New Modules
Tests actual functionality of the 9 new modules' backend APIs
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BASE_URL = "https://apelite-digital.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class FunctionalTester:
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
    
    async def test_ocr_process(self):
        """Test POST /api/ocr/process - OCR Processing"""
        try:
            # Create a test image file
            test_content = b"fake image content for OCR testing"
            
            # Prepare form data
            data = aiohttp.FormData()
            data.add_field('file', test_content, filename='test_document.jpg', content_type='image/jpeg')
            data.add_field('provider', 'google')
            
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.post(f"{BASE_URL}/ocr/process", data=data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("ocr_id"):
                        self.log_result("OCR Process", True, f"Successfully processed OCR with provider {data.get('provider')}")
                        return True
                    else:
                        self.log_result("OCR Process", False, "OCR processing failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("OCR Process", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("OCR Process", False, f"Exception: {str(e)}")
            return False
    
    async def test_media_transcribe_audio(self):
        """Test POST /api/media/transcribe-audio - Audio Transcription"""
        try:
            # Create a test audio file
            test_content = b"fake audio content for transcription testing"
            
            # Prepare form data
            data = aiohttp.FormData()
            data.add_field('file', test_content, filename='test_audio.mp3', content_type='audio/mpeg')
            data.add_field('language', 'pt-BR')
            
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.post(f"{BASE_URL}/media/transcribe-audio", data=data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("transcription_id"):
                        self.log_result("Media Transcribe Audio", True, f"Successfully transcribed audio, {data.get('speakers_detected')} speakers detected")
                        return True
                    else:
                        self.log_result("Media Transcribe Audio", False, "Audio transcription failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Media Transcribe Audio", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Media Transcribe Audio", False, f"Exception: {str(e)}")
            return False
    
    async def test_workflow_create_from_template(self):
        """Test POST /api/workflows/create-from-template - Create Workflow from Template"""
        try:
            params = {
                "template_key": "criminal_defense",
                "case_id": "test-case-workflow-123"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/workflows/create-from-template", params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("workflow_id"):
                        self.log_result("Workflow Create from Template", True, f"Successfully created workflow: {data.get('template')}")
                        return data.get("workflow_id")
                    else:
                        self.log_result("Workflow Create from Template", False, "Workflow creation failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Workflow Create from Template", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Workflow Create from Template", False, f"Exception: {str(e)}")
            return False
    
    async def test_chatbot_create_session(self):
        """Test POST /api/chatbot/session/create - Create Chat Session"""
        try:
            session_data = {
                "user_id": "test-user-123",
                "channel": "web"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/chatbot/session/create", json=session_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("session_id"):
                        self.log_result("Chatbot Create Session", True, f"Successfully created chat session: {data.get('session_id')}")
                        return data.get("session_id")
                    else:
                        self.log_result("Chatbot Create Session", False, "Session creation failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Chatbot Create Session", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Chatbot Create Session", False, f"Exception: {str(e)}")
            return False
    
    async def test_social_listening_create_alert(self):
        """Test POST /api/social-listening/alerts/create - Create Monitoring Alert"""
        try:
            alert_data = {
                "keywords": ["AP Elite", "investigação criminal"],
                "platforms": ["Twitter", "Facebook", "Instagram"],
                "alert_email": "test@apelite.com",
                "alert_frequency": "realtime"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/social-listening/alerts/create", json=alert_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("alert_id"):
                        self.log_result("Social Listening Create Alert", True, f"Successfully created alert for {len(data.get('keywords', []))} keywords")
                        return True
                    else:
                        self.log_result("Social Listening Create Alert", False, "Alert creation failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Social Listening Create Alert", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Social Listening Create Alert", False, f"Exception: {str(e)}")
            return False
    
    async def test_collaboration_create_document(self):
        """Test POST /api/collaboration/documents/create - Create Collaborative Document"""
        try:
            doc_data = {
                "title": "Documento de Teste Colaborativo",
                "content": "Este é um documento de teste para colaboração em tempo real.",
                "doc_type": "investigation_report",
                "created_by": "test-user-123"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/collaboration/documents/create", json=doc_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("document_id"):
                        self.log_result("Collaboration Create Document", True, f"Successfully created document: {data.get('title')}")
                        return data.get("document_id")
                    else:
                        self.log_result("Collaboration Create Document", False, "Document creation failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Collaboration Create Document", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Collaboration Create Document", False, f"Exception: {str(e)}")
            return False
    
    async def test_predictive_predict_outcome(self):
        """Test POST /api/predictive/predict-outcome - Predict Case Outcome"""
        try:
            prediction_data = {
                "case_type": "criminal_defense",
                "evidence_quality": "high",
                "lawyer_experience": 15,
                "judge_profile": "conservative"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/predictive/predict-outcome", json=prediction_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("case_type") and "success_probability" in data:
                        self.log_result("Predictive Predict Outcome", True, f"Successfully predicted outcome: {data.get('success_probability')}% success probability")
                        return True
                    else:
                        self.log_result("Predictive Predict Outcome", False, "Prediction failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Predictive Predict Outcome", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Predictive Predict Outcome", False, f"Exception: {str(e)}")
            return False
    
    async def test_compliance_register_consent(self):
        """Test POST /api/compliance/consent/register - Register LGPD Consent"""
        try:
            consent_data = {
                "user_id": "test-user-123",
                "purpose": "Investigação criminal e análise de evidências",
                "data_types": ["nome", "cpf", "email", "telefone"],
                "retention_period": "5 anos"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/compliance/consent/register", json=consent_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("consent_id"):
                        self.log_result("Compliance Register Consent", True, f"Successfully registered consent: {data.get('consent_id')}")
                        return data.get("consent_id")
                    else:
                        self.log_result("Compliance Register Consent", False, "Consent registration failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Compliance Register Consent", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Compliance Register Consent", False, f"Exception: {str(e)}")
            return False
    
    async def test_automated_reports_generate(self):
        """Test POST /api/reports/generate - Generate Automated Report"""
        try:
            report_data = {
                "template_id": "investigation",
                "case_id": "test-case-123",
                "title": "Relatório de Teste Automatizado",
                "parameters": {},
                "include_charts": True,
                "include_evidence": True,
                "format": "pdf"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/reports/generate", json=report_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("request_id") and data.get("message"):
                        self.log_result("Automated Reports Generate", True, f"Successfully initiated report generation: {data.get('request_id')}")
                        return data.get("request_id")
                    else:
                        self.log_result("Automated Reports Generate", False, "Report generation failed - missing required fields")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Automated Reports Generate", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Automated Reports Generate", False, f"Exception: {str(e)}")
            return False
    
    async def run_functional_tests(self):
        """Run functional tests on 9 new modules"""
        print("🚀 Functional Testing 9 New Backend Modules for AP Elite")
        print("=" * 70)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        print("\n🔍 Testing OCR Advanced System - File Processing...")
        await self.test_ocr_process()
        
        print("\n🎥 Testing Media Analysis System - Audio Transcription...")
        await self.test_media_transcribe_audio()
        
        print("\n⚙️ Testing Workflow Automation - Template Creation...")
        await self.test_workflow_create_from_template()
        
        print("\n🤖 Testing AI Chatbot - Session Management...")
        await self.test_chatbot_create_session()
        
        print("\n📱 Testing Social Listening - Alert Creation...")
        await self.test_social_listening_create_alert()
        
        print("\n👥 Testing Real-time Collaboration - Document Creation...")
        await self.test_collaboration_create_document()
        
        print("\n📈 Testing Predictive Analytics - Outcome Prediction...")
        await self.test_predictive_predict_outcome()
        
        print("\n🛡️ Testing Compliance LGPD - Consent Registration...")
        await self.test_compliance_register_consent()
        
        print("\n📊 Testing Automated Reports - Report Generation...")
        await self.test_automated_reports_generate()
        
        # Summary
        print("\n" + "=" * 70)
        print("📋 9 NEW MODULES FUNCTIONAL TEST SUMMARY")
        print("=" * 70)
        
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
        else:
            print("\n🎉 ALL FUNCTIONAL TESTS PASSED!")
        
        return self.test_results

async def main():
    """Main test runner"""
    async with FunctionalTester() as tester:
        results = await tester.run_functional_tests()
        
        print(f"\n📄 Functional testing completed with {len(results)} tests")

if __name__ == "__main__":
    asyncio.run(main())