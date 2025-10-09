#!/usr/bin/env python3
"""
Backend API Testing for AP Elite ERP Advanced Features
Tests all advanced ERP features including analytics, interception analysis, IPED integration, and communications.
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
BASE_URL = "https://legaltech-hub-5.preview.emergentagent.com/api"
TEST_USER = {
    "email": "laura@apelite.com",
    "password": "laura2024",
    "role": "administrator"
}

class BackendTester:
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
    
    async def test_analytics_overview(self):
        """Test GET /api/advanced/analytics/overview"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/advanced/analytics/overview", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["overview", "charts", "recent_activity"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Analytics Overview", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Check overview data
                    overview = data.get("overview", {})
                    overview_keys = ["total_cases", "active_cases", "total_evidence", "total_analysis"]
                    overview_missing = [key for key in overview_keys if key not in overview]
                    
                    if overview_missing:
                        self.log_result("Analytics Overview", False, f"Missing overview keys: {overview_missing}", data)
                        return False
                    
                    # Check charts data
                    charts = data.get("charts", {})
                    chart_keys = ["cases_by_status", "cases_timeline", "financial_timeline", "evidence_by_type"]
                    chart_missing = [key for key in chart_keys if key not in charts]
                    
                    if chart_missing:
                        self.log_result("Analytics Overview", False, f"Missing chart keys: {chart_missing}", data)
                        return False
                    
                    self.log_result("Analytics Overview", True, "Successfully retrieved analytics overview with all required data")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Analytics Overview", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Analytics Overview", False, f"Exception: {str(e)}")
            return False
    
    async def test_analytics_kpis(self):
        """Test GET /api/advanced/analytics/kpis"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/advanced/analytics/kpis", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate KPI structure
                    required_sections = ["cases", "revenue", "efficiency"]
                    missing_sections = [section for section in required_sections if section not in data]
                    
                    if missing_sections:
                        self.log_result("Analytics KPIs", False, f"Missing KPI sections: {missing_sections}", data)
                        return False
                    
                    # Check cases KPIs
                    cases = data.get("cases", {})
                    cases_keys = ["current_month", "last_month", "growth_percentage"]
                    cases_missing = [key for key in cases_keys if key not in cases]
                    
                    if cases_missing:
                        self.log_result("Analytics KPIs", False, f"Missing cases KPI keys: {cases_missing}", data)
                        return False
                    
                    # Check revenue KPIs
                    revenue = data.get("revenue", {})
                    revenue_keys = ["current_month", "last_month", "growth_percentage", "net_current"]
                    revenue_missing = [key for key in revenue_keys if key not in revenue]
                    
                    if revenue_missing:
                        self.log_result("Analytics KPIs", False, f"Missing revenue KPI keys: {revenue_missing}", data)
                        return False
                    
                    # Check efficiency KPIs
                    efficiency = data.get("efficiency", {})
                    efficiency_keys = ["avg_case_duration", "completion_rate", "pending_evidence"]
                    efficiency_missing = [key for key in efficiency_keys if key not in efficiency]
                    
                    if efficiency_missing:
                        self.log_result("Analytics KPIs", False, f"Missing efficiency KPI keys: {efficiency_missing}", data)
                        return False
                    
                    self.log_result("Analytics KPIs", True, "Successfully retrieved KPIs with all required metrics")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Analytics KPIs", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Analytics KPIs", False, f"Exception: {str(e)}")
            return False
    
    async def test_interception_upload(self):
        """Test POST /api/advanced/interception/upload"""
        try:
            # Create a temporary audio file for testing
            temp_content = b"fake audio content for testing"
            
            # Prepare form data
            data = aiohttp.FormData()
            data.add_field('case_id', 'test-case-123')
            data.add_field('evidence_id', 'test-evidence-456')
            data.add_field('analysis_type', 'phone')
            data.add_field('file', temp_content, filename='test_audio.mp3', content_type='audio/mpeg')
            
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.post(f"{BASE_URL}/advanced/interception/upload", data=data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "analysis_id", "file_path", "status"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Interception Upload", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "pending":
                        self.log_result("Interception Upload", False, f"Expected status 'pending', got '{data.get('status')}'", data)
                        return False
                    
                    self.log_result("Interception Upload", True, f"Successfully uploaded file, analysis_id: {data.get('analysis_id')}")
                    return data.get("analysis_id")
                else:
                    error_text = await response.text()
                    self.log_result("Interception Upload", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Interception Upload", False, f"Exception: {str(e)}")
            return False
    
    async def test_iped_create_project(self):
        """Test POST /api/advanced/iped/create-project"""
        try:
            project_data = {
                "case_id": "test-case-789",
                "project_name": "Test IPED Project",
                "evidence_ids": ["evidence-1", "evidence-2"],
                "analyst_id": "test-analyst-123"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/advanced/iped/create-project", json=project_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["project_id", "status", "project_path", "message"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("IPED Create Project", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "created":
                        self.log_result("IPED Create Project", False, f"Expected status 'created', got '{data.get('status')}'", data)
                        return False
                    
                    self.log_result("IPED Create Project", True, f"Successfully created IPED project: {data.get('project_id')}")
                    return data.get("project_id")
                else:
                    error_text = await response.text()
                    self.log_result("IPED Create Project", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("IPED Create Project", False, f"Exception: {str(e)}")
            return False
    
    async def test_iped_list_projects(self):
        """Test GET /api/advanced/iped/projects"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/advanced/iped/projects", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "projects" not in data:
                        self.log_result("IPED List Projects", False, "Missing 'projects' key in response", data)
                        return False
                    
                    projects = data.get("projects", [])
                    if not isinstance(projects, list):
                        self.log_result("IPED List Projects", False, "Projects should be a list", data)
                        return False
                    
                    self.log_result("IPED List Projects", True, f"Successfully retrieved {len(projects)} IPED projects")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("IPED List Projects", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("IPED List Projects", False, f"Exception: {str(e)}")
            return False
    
    async def test_communications_email(self):
        """Test POST /api/advanced/communications/email/send"""
        try:
            # Prepare form data
            data = aiohttp.FormData()
            data.add_field('recipient', 'test@example.com')
            data.add_field('subject', 'Test Email from ERP System')
            data.add_field('content', 'This is a test email sent from the AP Elite ERP system.')
            data.add_field('case_id', 'test-case-email-123')
            
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.post(f"{BASE_URL}/advanced/communications/email/send", data=data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message_id", "status", "recipient", "message"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Communications Email", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "sent":
                        self.log_result("Communications Email", False, f"Expected status 'sent', got '{data.get('status')}'", data)
                        return False
                    
                    self.log_result("Communications Email", True, f"Successfully sent email, message_id: {data.get('message_id')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Communications Email", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Communications Email", False, f"Exception: {str(e)}")
            return False
    
    async def test_communications_whatsapp(self):
        """Test POST /api/advanced/communications/whatsapp/send"""
        try:
            # Prepare form data
            data = aiohttp.FormData()
            data.add_field('phone', '+5511999887766')
            data.add_field('message', 'Test WhatsApp message from AP Elite ERP system.')
            data.add_field('case_id', 'test-case-whatsapp-123')
            
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.post(f"{BASE_URL}/advanced/communications/whatsapp/send", data=data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message_id", "status", "phone", "message"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Communications WhatsApp", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "sent":
                        self.log_result("Communications WhatsApp", False, f"Expected status 'sent', got '{data.get('status')}'", data)
                        return False
                    
                    self.log_result("Communications WhatsApp", True, f"Successfully sent WhatsApp message, message_id: {data.get('message_id')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Communications WhatsApp", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Communications WhatsApp", False, f"Exception: {str(e)}")
            return False
    
    async def test_communications_video_room(self):
        """Test POST /api/advanced/communications/video/create-room"""
        try:
            # Prepare form data
            data = aiohttp.FormData()
            data.add_field('title', 'Test Video Conference')
            data.add_field('scheduled_time', (datetime.now(timezone.utc).replace(microsecond=0) + 
                                            timedelta(hours=1)).isoformat())
            data.add_field('participants', 'participant1@example.com')
            data.add_field('participants', 'participant2@example.com')
            data.add_field('case_id', 'test-case-video-123')
            
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.post(f"{BASE_URL}/advanced/communications/video/create-room", data=data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["meeting_id", "room_id", "meeting_link", "password", "message"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Communications Video Room", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate meeting link format
                    meeting_link = data.get("meeting_link", "")
                    if not meeting_link.startswith("https://meet.jit.si/apelite-"):
                        self.log_result("Communications Video Room", False, f"Invalid meeting link format: {meeting_link}", data)
                        return False
                    
                    self.log_result("Communications Video Room", True, f"Successfully created video room: {data.get('room_id')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Communications Video Room", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Communications Video Room", False, f"Exception: {str(e)}")
            return False
    
    async def test_communications_messages(self):
        """Test GET /api/advanced/communications/messages"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/advanced/communications/messages", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "messages" not in data:
                        self.log_result("Communications Messages", False, "Missing 'messages' key in response", data)
                        return False
                    
                    messages = data.get("messages", [])
                    if not isinstance(messages, list):
                        self.log_result("Communications Messages", False, "Messages should be a list", data)
                        return False
                    
                    self.log_result("Communications Messages", True, f"Successfully retrieved {len(messages)} messages")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Communications Messages", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Communications Messages", False, f"Exception: {str(e)}")
            return False
    
    async def test_pdf_report_generation(self):
        """Test POST /api/integrations/reports/case/{case_id}"""
        case_id = "930acd82-3003-4872-8c23-c08b9ca5e541"  # Using existing case
        try:
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/integrations/reports/case/{case_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["status", "filename", "download_url"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("PDF Report Generation", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "success":
                        self.log_result("PDF Report Generation", False, f"Expected status 'success', got '{data.get('status')}'", data)
                        return False
                    
                    self.log_result("PDF Report Generation", True, f"Successfully generated PDF report: {data.get('filename')}")
                    return data.get("filename")
                else:
                    error_text = await response.text()
                    self.log_result("PDF Report Generation", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("PDF Report Generation", False, f"Exception: {str(e)}")
            return False
    
    async def test_email_with_report(self):
        """Test POST /api/integrations/email/send-report"""
        case_id = "930acd82-3003-4872-8c23-c08b9ca5e541"  # Using existing case
        try:
            params = {
                "case_id": case_id,
                "recipient_email": "test@apelite.com"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/integrations/email/send-report", params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["status", "message", "recipient"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Email with Report", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "success":
                        self.log_result("Email with Report", False, f"Expected status 'success', got '{data.get('status')}'", data)
                        return False
                    
                    self.log_result("Email with Report", True, f"Successfully queued email to: {data.get('recipient')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Email with Report", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Email with Report", False, f"Exception: {str(e)}")
            return False
    
    async def test_data_export_csv(self):
        """Test GET /api/integrations/export/cases/csv"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/integrations/export/cases/csv", headers=headers) as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    content_disposition = response.headers.get('content-disposition', '')
                    
                    # Validate response
                    if 'text/csv' not in content_type:
                        self.log_result("Data Export CSV", False, f"Expected CSV content-type, got: {content_type}")
                        return False
                    
                    if 'attachment' not in content_disposition:
                        self.log_result("Data Export CSV", False, f"Expected attachment disposition, got: {content_disposition}")
                        return False
                    
                    if not content or len(content) < 10:
                        self.log_result("Data Export CSV", False, "CSV content is empty or too short")
                        return False
                    
                    self.log_result("Data Export CSV", True, f"Successfully exported CSV data ({len(content)} bytes)")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Data Export CSV", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Data Export CSV", False, f"Exception: {str(e)}")
            return False
    
    async def test_data_export_json_cases(self):
        """Test GET /api/integrations/export/cases/json"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/integrations/export/cases/json", headers=headers) as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    content_disposition = response.headers.get('content-disposition', '')
                    
                    # Validate response
                    if 'application/json' not in content_type:
                        self.log_result("Data Export JSON Cases", False, f"Expected JSON content-type, got: {content_type}")
                        return False
                    
                    if 'attachment' not in content_disposition:
                        self.log_result("Data Export JSON Cases", False, f"Expected attachment disposition, got: {content_disposition}")
                        return False
                    
                    # Try to parse JSON
                    try:
                        import json
                        data = json.loads(content)
                        if not isinstance(data, list):
                            self.log_result("Data Export JSON Cases", False, "Expected JSON array of cases")
                            return False
                    except json.JSONDecodeError:
                        self.log_result("Data Export JSON Cases", False, "Invalid JSON format")
                        return False
                    
                    self.log_result("Data Export JSON Cases", True, f"Successfully exported JSON cases data ({len(data)} cases)")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Data Export JSON Cases", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Data Export JSON Cases", False, f"Exception: {str(e)}")
            return False
    
    async def test_data_export_json_analytics(self):
        """Test GET /api/integrations/export/analytics/json"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/integrations/export/analytics/json", headers=headers) as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    content_disposition = response.headers.get('content-disposition', '')
                    
                    # Validate response
                    if 'application/json' not in content_type:
                        self.log_result("Data Export JSON Analytics", False, f"Expected JSON content-type, got: {content_type}")
                        return False
                    
                    if 'attachment' not in content_disposition:
                        self.log_result("Data Export JSON Analytics", False, f"Expected attachment disposition, got: {content_disposition}")
                        return False
                    
                    # Try to parse JSON
                    try:
                        import json
                        data = json.loads(content)
                        required_keys = ["export_date", "total_cases", "active_cases", "cases_by_status"]
                        missing_keys = [key for key in required_keys if key not in data]
                        
                        if missing_keys:
                            self.log_result("Data Export JSON Analytics", False, f"Missing analytics keys: {missing_keys}")
                            return False
                    except json.JSONDecodeError:
                        self.log_result("Data Export JSON Analytics", False, "Invalid JSON format")
                        return False
                    
                    self.log_result("Data Export JSON Analytics", True, "Successfully exported analytics JSON data")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Data Export JSON Analytics", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Data Export JSON Analytics", False, f"Exception: {str(e)}")
            return False
    
    async def test_backup_creation(self):
        """Test POST /api/integrations/backup/create"""
        try:
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/integrations/backup/create", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["status", "backup_id", "filename", "download_url"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Backup Creation", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "success":
                        self.log_result("Backup Creation", False, f"Expected status 'success', got '{data.get('status')}'", data)
                        return False
                    
                    self.log_result("Backup Creation", True, f"Successfully created backup: {data.get('filename')}")
                    return data.get("filename")
                else:
                    error_text = await response.text()
                    self.log_result("Backup Creation", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Backup Creation", False, f"Exception: {str(e)}")
            return False
    
    async def test_audit_logs(self):
        """Test GET /api/integrations/audit/logs"""
        try:
            headers = self.get_headers()
            # Test with filters
            params = {"limit": 50, "action": "generate_report"}
            async with self.session.get(f"{BASE_URL}/integrations/audit/logs", headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["logs", "total"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Audit Logs", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    logs = data.get("logs", [])
                    if not isinstance(logs, list):
                        self.log_result("Audit Logs", False, "Logs should be a list")
                        return False
                    
                    self.log_result("Audit Logs", True, f"Successfully retrieved {len(logs)} audit logs")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Audit Logs", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Audit Logs", False, f"Exception: {str(e)}")
            return False
    
    async def test_activity_summary(self):
        """Test GET /api/integrations/audit/activity-summary"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/integrations/audit/activity-summary", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["activity_by_action", "top_users", "recent_activity"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Activity Summary", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate data types
                    for key in required_keys:
                        if not isinstance(data[key], list):
                            self.log_result("Activity Summary", False, f"{key} should be a list")
                            return False
                    
                    self.log_result("Activity Summary", True, "Successfully retrieved activity summary")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Activity Summary", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Activity Summary", False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting AP Elite ERP Advanced Features Backend Testing")
        print("=" * 70)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        print("\n📊 Testing Analytics APIs...")
        await self.test_analytics_overview()
        await self.test_analytics_kpis()
        
        print("\n🎧 Testing Interception Analysis APIs...")
        analysis_id = await self.test_interception_upload()
        
        print("\n🔍 Testing IPED Integration APIs...")
        project_id = await self.test_iped_create_project()
        await self.test_iped_list_projects()
        
        print("\n📱 Testing Communications APIs...")
        await self.test_communications_email()
        await self.test_communications_whatsapp()
        await self.test_communications_video_room()
        await self.test_communications_messages()
        
        print("\n🔧 Testing Advanced Integrations APIs...")
        await self.test_pdf_report_generation()
        await self.test_email_with_report()
        await self.test_data_export_csv()
        await self.test_data_export_json_cases()
        await self.test_data_export_json_analytics()
        await self.test_backup_creation()
        await self.test_audit_logs()
        await self.test_activity_summary()
        
        # Summary
        print("\n" + "=" * 70)
        print("📋 TEST SUMMARY")
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
        
        print("\n✅ All advanced ERP features tested successfully!" if passed == total else "\n⚠️  Some tests failed - check logs above")
        
        return self.test_results

async def main():
    """Main test runner"""
    async with BackendTester() as tester:
        results = await tester.run_all_tests()
        
        # Save results to file
        results_file = Path("/app/backend_test_results.json")
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n📄 Test results saved to: {results_file}")

if __name__ == "__main__":
    asyncio.run(main())