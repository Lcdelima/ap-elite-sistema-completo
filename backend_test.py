#!/usr/bin/env python3
"""
Backend API Testing for AP Elite ATHENA System
Tests all ATHENA system modules including authentication, processes, financial, ERBs, integrations, and security.
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
BASE_URL = "https://ai-investigator-2.preview.emergentagent.com/api"
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

    # ==================== NEW ENHANCED SYSTEMS TESTS ====================
    
    async def test_document_library_categories(self):
        """Test GET /api/library/categories - Document Library Categories"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/library/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["categories", "total"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Document Library Categories", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    categories = data.get("categories", {})
                    if not isinstance(categories, dict):
                        self.log_result("Document Library Categories", False, "Categories should be a dictionary", data)
                        return False
                    
                    # Should have 10 categories
                    if data.get("total") != 10:
                        self.log_result("Document Library Categories", False, f"Expected 10 categories, got {data.get('total')}", data)
                        return False
                    
                    self.log_result("Document Library Categories", True, f"Successfully retrieved {data.get('total')} document categories")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Document Library Categories", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Document Library Categories", False, f"Exception: {str(e)}")
            return False
    
    async def test_document_library_documents(self):
        """Test GET /api/library/documents - List Documents"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/library/documents", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["documents", "total", "limit", "skip"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Document Library Documents", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    documents = data.get("documents", [])
                    if not isinstance(documents, list):
                        self.log_result("Document Library Documents", False, "Documents should be a list", data)
                        return False
                    
                    self.log_result("Document Library Documents", True, f"Successfully retrieved {len(documents)} documents (total: {data.get('total')})")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Document Library Documents", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Document Library Documents", False, f"Exception: {str(e)}")
            return False
    
    async def test_document_library_statistics(self):
        """Test GET /api/library/statistics - Library Statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/library/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["total_documents", "indexed_documents", "by_category", "total_analyses", "categories_available"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Document Library Statistics", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate data types
                    if not isinstance(data.get("by_category"), list):
                        self.log_result("Document Library Statistics", False, "by_category should be a list")
                        return False
                    
                    if not isinstance(data.get("categories_available"), dict):
                        self.log_result("Document Library Statistics", False, "categories_available should be a dict")
                        return False
                    
                    self.log_result("Document Library Statistics", True, f"Library stats: {data.get('total_documents')} docs, {data.get('total_analyses')} analyses")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Document Library Statistics", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Document Library Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_categories(self):
        """Test GET /api/osint/categories - OSINT Categories"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/osint/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["categories", "total_categories", "total_sources"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("OSINT Categories", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Should have 10 categories
                    if data.get("total_categories") != 10:
                        self.log_result("OSINT Categories", False, f"Expected 10 categories, got {data.get('total_categories')}", data)
                        return False
                    
                    # Should have 33+ sources
                    if data.get("total_sources") < 33:
                        self.log_result("OSINT Categories", False, f"Expected 33+ sources, got {data.get('total_sources')}", data)
                        return False
                    
                    self.log_result("OSINT Categories", True, f"Successfully retrieved {data.get('total_categories')} categories with {data.get('total_sources')} sources")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("OSINT Categories", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("OSINT Categories", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_query(self):
        """Test POST /api/osint/query - Execute OSINT Query"""
        try:
            query_data = {
                "query": "João Silva",
                "sources": ["social_media"],
                "use_ai_analysis": True
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/osint/query", json=query_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["query", "categories_searched", "sources", "collected_data", "timestamp"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("OSINT Query", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("query") != query_data["query"]:
                        self.log_result("OSINT Query", False, f"Query mismatch: expected {query_data['query']}, got {data.get('query')}", data)
                        return False
                    
                    # Should have AI analysis if requested
                    if query_data["use_ai_analysis"] and "ai_analysis" not in data:
                        self.log_result("OSINT Query", False, "AI analysis was requested but not provided", data)
                        return False
                    
                    self.log_result("OSINT Query", True, f"Successfully executed OSINT query for '{data.get('query')}'")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("OSINT Query", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("OSINT Query", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_analyze_person(self):
        """Test POST /api/osint/analyze-person - Analyze Person"""
        try:
            params = {
                "name": "João Silva",
                "cpf": "12345678900"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/osint/analyze-person", params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["person", "sources_available", "multi_provider_analysis", "timestamp"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("OSINT Analyze Person", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    person = data.get("person", {})
                    if person.get("nome") != params["name"]:
                        self.log_result("OSINT Analyze Person", False, f"Name mismatch: expected {params['name']}, got {person.get('nome')}", data)
                        return False
                    
                    # Should have multi-provider analysis
                    analysis = data.get("multi_provider_analysis", {})
                    if "results" not in analysis:
                        self.log_result("OSINT Analyze Person", False, "Missing results in multi_provider_analysis", data)
                        return False
                    
                    self.log_result("OSINT Analyze Person", True, f"Successfully analyzed person '{params['name']}' with multi-AI")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("OSINT Analyze Person", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("OSINT Analyze Person", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_analyze_company(self):
        """Test POST /api/osint/analyze-company - Analyze Company"""
        try:
            params = {
                "cnpj": "12345678000100"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/osint/analyze-company", params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["company", "sources", "analysis", "timestamp"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("OSINT Analyze Company", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    company = data.get("company", {})
                    if company.get("cnpj") != params["cnpj"]:
                        self.log_result("OSINT Analyze Company", False, f"CNPJ mismatch: expected {params['cnpj']}, got {company.get('cnpj')}", data)
                        return False
                    
                    # Should have analysis
                    if not data.get("analysis"):
                        self.log_result("OSINT Analyze Company", False, "Missing analysis content", data)
                        return False
                    
                    self.log_result("OSINT Analyze Company", True, f"Successfully analyzed company CNPJ '{params['cnpj']}'")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("OSINT Analyze Company", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("OSINT Analyze Company", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_history(self):
        """Test GET /api/osint/history - Query History"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/osint/history", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["queries", "total"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("OSINT History", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    queries = data.get("queries", [])
                    if not isinstance(queries, list):
                        self.log_result("OSINT History", False, "Queries should be a list", data)
                        return False
                    
                    self.log_result("OSINT History", True, f"Successfully retrieved {len(queries)} OSINT queries from history")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("OSINT History", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("OSINT History", False, f"Exception: {str(e)}")
            return False
    
    async def test_osint_tools(self):
        """Test GET /api/osint/tools - OSINT Tools"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/osint/tools", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["categories", "total_categories", "total_tools"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("OSINT Tools", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Should have 10 categories
                    if data.get("total_categories") != 10:
                        self.log_result("OSINT Tools", False, f"Expected 10 categories, got {data.get('total_categories')}", data)
                        return False
                    
                    self.log_result("OSINT Tools", True, f"Successfully retrieved {data.get('total_categories')} tool categories with {data.get('total_tools')} tools")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("OSINT Tools", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("OSINT Tools", False, f"Exception: {str(e)}")
            return False
    
    async def test_template_list(self):
        """Test GET /api/templates/list - Template List"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/templates/list", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["templates", "total", "categories"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Template List", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Should have 6 templates
                    if data.get("total") != 6:
                        self.log_result("Template List", False, f"Expected 6 templates, got {data.get('total')}", data)
                        return False
                    
                    templates = data.get("templates", [])
                    if not isinstance(templates, list):
                        self.log_result("Template List", False, "Templates should be a list", data)
                        return False
                    
                    self.log_result("Template List", True, f"Successfully retrieved {data.get('total')} templates")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Template List", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Template List", False, f"Exception: {str(e)}")
            return False
    
    async def test_template_details(self):
        """Test GET /api/templates/{template_id} - Template Details"""
        template_ids = ["aij_roteiro", "procuracao"]
        
        for template_id in template_ids:
            try:
                headers = self.get_headers()
                async with self.session.get(f"{BASE_URL}/templates/{template_id}", headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Validate response structure
                        required_keys = ["id", "name", "description", "category", "fields", "structure"]
                        missing_keys = [key for key in required_keys if key not in data]
                        
                        if missing_keys:
                            self.log_result(f"Template Details ({template_id})", False, f"Missing keys: {missing_keys}", data)
                            return False
                        
                        if data.get("id") != template_id:
                            self.log_result(f"Template Details ({template_id})", False, f"ID mismatch: expected {template_id}, got {data.get('id')}", data)
                            return False
                        
                        self.log_result(f"Template Details ({template_id})", True, f"Successfully retrieved template '{data.get('name')}'")
                    else:
                        error_text = await response.text()
                        self.log_result(f"Template Details ({template_id})", False, f"Failed with status {response.status}", error_text)
                        return False
            except Exception as e:
                self.log_result(f"Template Details ({template_id})", False, f"Exception: {str(e)}")
                return False
        
        return True
    
    async def test_template_statistics(self):
        """Test GET /api/templates/statistics - Template Statistics"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/templates/statistics", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["total_templates", "total_generated", "total_drafts", "by_template"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Template Statistics", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Should have 6 templates
                    if data.get("total_templates") != 6:
                        self.log_result("Template Statistics", False, f"Expected 6 templates, got {data.get('total_templates')}", data)
                        return False
                    
                    self.log_result("Template Statistics", True, f"Template stats: {data.get('total_templates')} templates, {data.get('total_generated')} generated")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Template Statistics", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Template Statistics", False, f"Exception: {str(e)}")
            return False
    
    async def test_template_generated_list(self):
        """Test GET /api/templates/generated/list - Generated Documents List"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/templates/generated/list", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["documents", "total"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Template Generated List", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    documents = data.get("documents", [])
                    if not isinstance(documents, list):
                        self.log_result("Template Generated List", False, "Documents should be a list", data)
                        return False
                    
                    self.log_result("Template Generated List", True, f"Successfully retrieved {len(documents)} generated documents")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Template Generated List", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Template Generated List", False, f"Exception: {str(e)}")
            return False

    # ==================== DEFENSIVE INVESTIGATION TESTS ====================
    
    async def test_defensive_investigation_categories(self):
        """Test GET /api/athena/defensive-investigation/categories"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/defensive-investigation/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "categories" not in data:
                        self.log_result("Defensive Investigation Categories", False, "Missing 'categories' key in response", data)
                        return False
                    
                    categories = data.get("categories", {})
                    if not isinstance(categories, dict):
                        self.log_result("Defensive Investigation Categories", False, "Categories should be a dictionary", data)
                        return False
                    
                    # Check for expected categories
                    expected_categories = ["Social Media", "Search Engines", "Public Records", "Technical Analysis"]
                    found_categories = list(categories.keys())
                    
                    self.log_result("Defensive Investigation Categories", True, f"Successfully retrieved {len(found_categories)} OSINT categories")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Defensive Investigation Categories", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Defensive Investigation Categories", False, f"Exception: {str(e)}")
            return False
    
    async def test_defensive_investigation_cases(self):
        """Test GET /api/athena/defensive-investigation/cases"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/defensive-investigation/cases", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "cases" not in data:
                        self.log_result("Defensive Investigation Cases", False, "Missing 'cases' key in response", data)
                        return False
                    
                    cases = data.get("cases", [])
                    if not isinstance(cases, list):
                        self.log_result("Defensive Investigation Cases", False, "Cases should be a list", data)
                        return False
                    
                    self.log_result("Defensive Investigation Cases", True, f"Successfully retrieved {len(cases)} investigation cases")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Defensive Investigation Cases", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Defensive Investigation Cases", False, f"Exception: {str(e)}")
            return False
    
    async def test_defensive_investigation_favorites(self):
        """Test GET /api/athena/defensive-investigation/favorites"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/defensive-investigation/favorites", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "favorites" not in data:
                        self.log_result("Defensive Investigation Favorites", False, "Missing 'favorites' key in response", data)
                        return False
                    
                    favorites = data.get("favorites", [])
                    if not isinstance(favorites, list):
                        self.log_result("Defensive Investigation Favorites", False, "Favorites should be a list", data)
                        return False
                    
                    self.log_result("Defensive Investigation Favorites", True, f"Successfully retrieved {len(favorites)} favorite sources")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Defensive Investigation Favorites", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Defensive Investigation Favorites", False, f"Exception: {str(e)}")
            return False
    
    async def test_defensive_investigation_stats(self):
        """Test GET /api/athena/defensive-investigation/stats"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/defensive-investigation/stats", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["total_cases", "active_cases", "completed_cases", "recent_cases", "total_categories"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Defensive Investigation Stats", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate data types
                    for key in ["total_cases", "active_cases", "completed_cases", "total_categories"]:
                        if not isinstance(data[key], int):
                            self.log_result("Defensive Investigation Stats", False, f"{key} should be an integer")
                            return False
                    
                    if not isinstance(data["recent_cases"], list):
                        self.log_result("Defensive Investigation Stats", False, "recent_cases should be a list")
                        return False
                    
                    self.log_result("Defensive Investigation Stats", True, f"Successfully retrieved stats - Total: {data['total_cases']}, Active: {data['active_cases']}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Defensive Investigation Stats", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Defensive Investigation Stats", False, f"Exception: {str(e)}")
            return False
    
    async def test_defensive_investigation_case_creation(self):
        """Test POST /api/athena/defensive-investigation/case"""
        try:
            case_data = {
                "title": "Test Investigation Case",
                "description": "Testing case creation for defensive investigation",
                "target": "test-target@example.com",
                "type": "person"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/athena/defensive-investigation/case", json=case_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "case_id", "case"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Defensive Investigation Case Creation", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    case = data.get("case", {})
                    if not case.get("id") or not case.get("title"):
                        self.log_result("Defensive Investigation Case Creation", False, "Case missing required fields", data)
                        return False
                    
                    self.log_result("Defensive Investigation Case Creation", True, f"Successfully created investigation case: {data.get('case_id')}")
                    return data.get("case_id")
                else:
                    error_text = await response.text()
                    self.log_result("Defensive Investigation Case Creation", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Defensive Investigation Case Creation", False, f"Exception: {str(e)}")
            return False

    # ==================== HYBRID SYSTEM TESTS ====================
    
    async def test_hybrid_status(self):
        """Test GET /api/hybrid/status"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/hybrid/status", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["online_status", "local_data_path", "database_size", "disk_space", "record_counts"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Hybrid Status", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate disk_space structure
                    disk_space = data.get("disk_space", {})
                    disk_keys = ["total", "used", "free", "percent"]
                    disk_missing = [key for key in disk_keys if key not in disk_space]
                    
                    if disk_missing:
                        self.log_result("Hybrid Status", False, f"Missing disk_space keys: {disk_missing}", data)
                        return False
                    
                    # Validate record_counts structure
                    record_counts = data.get("record_counts", {})
                    expected_tables = ["users", "cases", "clients_enhanced", "evidence", "financial_records"]
                    
                    online_status = "online" if data.get("online_status") else "offline"
                    self.log_result("Hybrid Status", True, f"System status: {online_status}, Local records: {sum(record_counts.values())}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Hybrid Status", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Hybrid Status", False, f"Exception: {str(e)}")
            return False
    
    async def test_hybrid_sync(self):
        """Test POST /api/hybrid/sync"""
        try:
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/hybrid/sync", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "status"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Hybrid Sync", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "running":
                        self.log_result("Hybrid Sync", False, f"Expected status 'running', got '{data.get('status')}'", data)
                        return False
                    
                    self.log_result("Hybrid Sync", True, f"Sync initiated successfully: {data.get('message')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Hybrid Sync", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Hybrid Sync", False, f"Exception: {str(e)}")
            return False
    
    async def test_hybrid_backups_list(self):
        """Test GET /api/hybrid/backups"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/hybrid/backups", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "backups" not in data:
                        self.log_result("Hybrid Backups List", False, "Missing 'backups' key in response", data)
                        return False
                    
                    backups = data.get("backups", [])
                    if not isinstance(backups, list):
                        self.log_result("Hybrid Backups List", False, "Backups should be a list", data)
                        return False
                    
                    # Validate backup structure if backups exist
                    if backups:
                        backup = backups[0]
                        backup_keys = ["filename", "path", "size", "created", "modified"]
                        backup_missing = [key for key in backup_keys if key not in backup]
                        
                        if backup_missing:
                            self.log_result("Hybrid Backups List", False, f"Missing backup keys: {backup_missing}", data)
                            return False
                    
                    self.log_result("Hybrid Backups List", True, f"Successfully retrieved {len(backups)} backup files")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Hybrid Backups List", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Hybrid Backups List", False, f"Exception: {str(e)}")
            return False
    
    async def test_hybrid_backup_create(self):
        """Test POST /api/hybrid/backup"""
        try:
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/hybrid/backup", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["status", "backup_file", "timestamp", "size"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Hybrid Backup Create", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("status") != "success":
                        self.log_result("Hybrid Backup Create", False, f"Expected status 'success', got '{data.get('status')}'", data)
                        return False
                    
                    # Validate backup file info
                    backup_file = data.get("backup_file", "")
                    if not backup_file or "ap_elite_backup_" not in backup_file:
                        self.log_result("Hybrid Backup Create", False, f"Invalid backup file name: {backup_file}", data)
                        return False
                    
                    size = data.get("size", 0)
                    self.log_result("Hybrid Backup Create", True, f"Backup created successfully: {data.get('timestamp')}, Size: {size} bytes")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Hybrid Backup Create", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Hybrid Backup Create", False, f"Exception: {str(e)}")
            return False

    # ==================== ADVANCED INVESTIGATION SYSTEM TESTS ====================
    
    async def test_investigation_list_cases(self):
        """Test GET /api/investigation/cases - List investigation cases"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/investigation/cases", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "cases" not in data:
                        self.log_result("Investigation List Cases", False, "Missing 'cases' key in response", data)
                        return False
                    
                    cases = data.get("cases", [])
                    if not isinstance(cases, list):
                        self.log_result("Investigation List Cases", False, "Cases should be a list", data)
                        return False
                    
                    self.log_result("Investigation List Cases", True, f"Successfully retrieved {len(cases)} investigation cases")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Investigation List Cases", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation List Cases", False, f"Exception: {str(e)}")
            return False
    
    async def test_investigation_create_case(self):
        """Test POST /api/investigation/cases - Create investigation case"""
        try:
            case_data = {
                "title": "Investigação de Fraude Financeira",
                "description": "Caso de investigação envolvendo transações suspeitas e documentos falsificados",
                "status": "active",
                "priority": "high"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/investigation/cases", json=case_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "case"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Investigation Create Case", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    case = data.get("case", {})
                    case_required_keys = ["id", "case_number", "title", "status", "priority"]
                    case_missing = [key for key in case_required_keys if key not in case]
                    
                    if case_missing:
                        self.log_result("Investigation Create Case", False, f"Missing case keys: {case_missing}", data)
                        return False
                    
                    self.log_result("Investigation Create Case", True, f"Successfully created investigation case: {case.get('case_number')}")
                    return case.get("id")
                else:
                    error_text = await response.text()
                    self.log_result("Investigation Create Case", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation Create Case", False, f"Exception: {str(e)}")
            return False
    
    async def test_investigation_evidence_upload(self):
        """Test POST /api/investigation/evidence/upload - Upload evidence"""
        try:
            # Create test evidence file
            test_content = b"Este e um documento de teste para analise forense. Contem informacoes importantes sobre o caso de investigacao criminal."
            
            # Prepare form data
            data = aiohttp.FormData()
            data.add_field('case_id', 'test-case-investigation-123')
            data.add_field('evidence_name', 'Documento Suspeito - Teste')
            data.add_field('evidence_type', 'document')
            data.add_field('file', test_content, filename='documento_suspeito.txt', content_type='text/plain')
            
            headers = {}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.post(f"{BASE_URL}/investigation/evidence/upload", data=data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "evidence", "analysis_status"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Investigation Evidence Upload", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    evidence = data.get("evidence", {})
                    evidence_required_keys = ["id", "evidence_number", "name", "type", "hash_value"]
                    evidence_missing = [key for key in evidence_required_keys if key not in evidence]
                    
                    if evidence_missing:
                        self.log_result("Investigation Evidence Upload", False, f"Missing evidence keys: {evidence_missing}", data)
                        return False
                    
                    if data.get("analysis_status") != "scheduled":
                        self.log_result("Investigation Evidence Upload", False, f"Expected analysis_status 'scheduled', got '{data.get('analysis_status')}'", data)
                        return False
                    
                    self.log_result("Investigation Evidence Upload", True, f"Successfully uploaded evidence: {evidence.get('evidence_number')}")
                    return evidence.get("id")
                else:
                    error_text = await response.text()
                    self.log_result("Investigation Evidence Upload", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation Evidence Upload", False, f"Exception: {str(e)}")
            return False
    
    async def test_investigation_case_analysis(self):
        """Test GET /api/investigation/cases/{case_id}/analysis - Get case analysis"""
        case_id = "test-case-investigation-123"
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/investigation/cases/{case_id}/analysis", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["case_id", "evidence_count", "evidence", "pattern_analysis"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Investigation Case Analysis", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("case_id") != case_id:
                        self.log_result("Investigation Case Analysis", False, f"Case ID mismatch: expected {case_id}, got {data.get('case_id')}", data)
                        return False
                    
                    pattern_analysis = data.get("pattern_analysis", {})
                    if "analysis_type" not in pattern_analysis:
                        self.log_result("Investigation Case Analysis", False, "Missing analysis_type in pattern_analysis", data)
                        return False
                    
                    self.log_result("Investigation Case Analysis", True, f"Successfully retrieved case analysis with {data.get('evidence_count')} evidence items")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Investigation Case Analysis", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation Case Analysis", False, f"Exception: {str(e)}")
            return False
    
    async def test_investigation_evidence_analysis(self):
        """Test GET /api/investigation/evidence/{evidence_id} - Get evidence analysis"""
        evidence_id = "test-evidence-123"
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/investigation/evidence/{evidence_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Should return evidence and/or detailed_analysis
                    if "evidence" not in data and "detailed_analysis" not in data:
                        self.log_result("Investigation Evidence Analysis", False, "Missing evidence or detailed_analysis in response", data)
                        return False
                    
                    self.log_result("Investigation Evidence Analysis", True, "Successfully retrieved evidence analysis")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Investigation Evidence Analysis", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation Evidence Analysis", False, f"Exception: {str(e)}")
            return False
    
    async def test_investigation_osint_search_social_media(self):
        """Test POST /api/investigation/osint/search - Social Media OSINT search"""
        try:
            # Test social media search
            search_data = {
                "query": "João Silva Santos",
                "type": "social_media",
                "platforms": ["facebook", "instagram", "twitter"]
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/investigation/osint/search", json=search_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["search_type", "query", "results"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Investigation OSINT Search - Social Media", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("search_type") != "social_media":
                        self.log_result("Investigation OSINT Search - Social Media", False, f"Expected search_type 'social_media', got '{data.get('search_type')}'", data)
                        return False
                    
                    self.log_result("Investigation OSINT Search - Social Media", True, f"Successfully performed social media search for: {data.get('query')}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Investigation OSINT Search - Social Media", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation OSINT Search - Social Media", False, f"Exception: {str(e)}")
            return False
    
    async def test_investigation_osint_search_geolocation(self):
        """Test POST /api/investigation/osint/search - Geolocation OSINT search"""
        try:
            # Test geolocation search
            search_data = {
                "query": "Análise de Localização",
                "type": "geolocation",
                "coordinates": [-23.5505, -46.6333]  # São Paulo coordinates
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/investigation/osint/search", json=search_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["analysis_type", "location_info"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Investigation OSINT Search - Geolocation", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("analysis_type") != "geolocation":
                        self.log_result("Investigation OSINT Search - Geolocation", False, f"Expected analysis_type 'geolocation', got '{data.get('analysis_type')}'", data)
                        return False
                    
                    self.log_result("Investigation OSINT Search - Geolocation", True, "Successfully performed geolocation analysis")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Investigation OSINT Search - Geolocation", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation OSINT Search - Geolocation", False, f"Exception: {str(e)}")
            return False
    
    async def test_investigation_osint_search_person_verification(self):
        """Test POST /api/investigation/osint/search - Person Verification OSINT search"""
        try:
            # Test person verification search
            search_data = {
                "query": "Verificação de Pessoa",
                "type": "person_verification",
                "person_data": {
                    "name": "Maria Silva Santos",
                    "cpf": "123.456.789-00",
                    "phone": "+5511987654321"
                }
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/investigation/osint/search", json=search_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["verification_type", "input_data", "results"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Investigation OSINT Search - Person Verification", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    if data.get("verification_type") != "personal_data":
                        self.log_result("Investigation OSINT Search - Person Verification", False, f"Expected verification_type 'personal_data', got '{data.get('verification_type')}'", data)
                        return False
                    
                    self.log_result("Investigation OSINT Search - Person Verification", True, "Successfully performed person verification")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Investigation OSINT Search - Person Verification", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation OSINT Search - Person Verification", False, f"Exception: {str(e)}")
            return False
    
    async def test_relationships_list_persons(self):
        """Test GET /api/relationships/persons - List persons"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/relationships/persons", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "persons" not in data:
                        self.log_result("Relationships List Persons", False, "Missing 'persons' key in response", data)
                        return False
                    
                    persons = data.get("persons", [])
                    if not isinstance(persons, list):
                        self.log_result("Relationships List Persons", False, "Persons should be a list", data)
                        return False
                    
                    self.log_result("Relationships List Persons", True, f"Successfully retrieved {len(persons)} persons")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Relationships List Persons", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Relationships List Persons", False, f"Exception: {str(e)}")
            return False
    
    async def test_relationships_list_networks(self):
        """Test GET /api/relationships/networks - List criminal networks"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/relationships/networks", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "networks" not in data:
                        self.log_result("Relationships List Networks", False, "Missing 'networks' key in response", data)
                        return False
                    
                    networks = data.get("networks", [])
                    if not isinstance(networks, list):
                        self.log_result("Relationships List Networks", False, "Networks should be a list", data)
                        return False
                    
                    self.log_result("Relationships List Networks", True, f"Successfully retrieved {len(networks)} criminal networks")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Relationships List Networks", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Relationships List Networks", False, f"Exception: {str(e)}")
            return False
    
    async def test_reports_list_templates(self):
        """Test GET /api/reports/templates - List report templates"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/reports/templates", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "templates" not in data:
                        self.log_result("Reports List Templates", False, "Missing 'templates' key in response", data)
                        return False
                    
                    templates = data.get("templates", [])
                    if not isinstance(templates, list):
                        self.log_result("Reports List Templates", False, "Templates should be a list", data)
                        return False
                    
                    # Check for expected templates
                    expected_templates = ["investigation", "forensic", "osint", "network"]
                    found_template_ids = [t.get("id") for t in templates]
                    
                    missing_templates = [t for t in expected_templates if t not in found_template_ids]
                    if missing_templates:
                        self.log_result("Reports List Templates", False, f"Missing expected templates: {missing_templates}", data)
                        return False
                    
                    self.log_result("Reports List Templates", True, f"Successfully retrieved {len(templates)} report templates")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Reports List Templates", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Reports List Templates", False, f"Exception: {str(e)}")
            return False
        
        # Test geolocation search
        try:
            search_data = {
                "query": "Localização suspeita",
                "type": "geolocation",
                "coordinates": [-23.5505, -46.6333]  # São Paulo coordinates
            }
            
            async with self.session.post(f"{BASE_URL}/investigation/osint/search", json=search_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get("analysis_type") != "geolocation":
                        self.log_result("Investigation OSINT Search - Geolocation", False, f"Expected analysis_type 'geolocation', got '{data.get('analysis_type')}'", data)
                        return False
                    
                    location_info = data.get("location_info", {})
                    if "coordinates" not in location_info:
                        self.log_result("Investigation OSINT Search - Geolocation", False, "Missing coordinates in location_info", data)
                        return False
                    
                    self.log_result("Investigation OSINT Search - Geolocation", True, "Successfully performed geolocation analysis")
                else:
                    error_text = await response.text()
                    self.log_result("Investigation OSINT Search - Geolocation", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation OSINT Search - Geolocation", False, f"Exception: {str(e)}")
            return False
        
        # Test person verification
        try:
            search_data = {
                "query": "Verificação de pessoa",
                "type": "person_verification",
                "person_data": {
                    "name": "Maria Silva Santos",
                    "cpf": "123.456.789-00",
                    "phone": "+5511999887766"
                }
            }
            
            async with self.session.post(f"{BASE_URL}/investigation/osint/search", json=search_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get("verification_type") != "personal_data":
                        self.log_result("Investigation OSINT Search - Person Verification", False, f"Expected verification_type 'personal_data', got '{data.get('verification_type')}'", data)
                        return False
                    
                    results = data.get("results", {})
                    verification_keys = ["name_verification", "cpf_verification", "phone_verification"]
                    verification_missing = [key for key in verification_keys if key not in results]
                    
                    if verification_missing:
                        self.log_result("Investigation OSINT Search - Person Verification", False, f"Missing verification keys: {verification_missing}", data)
                        return False
                    
                    self.log_result("Investigation OSINT Search - Person Verification", True, "Successfully performed person verification")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Investigation OSINT Search - Person Verification", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Investigation OSINT Search - Person Verification", False, f"Exception: {str(e)}")
            return False
    
    # ==================== RELATIONSHIP MAPPING TESTS ====================
    
    async def test_relationships_create_person(self):
        """Test POST /api/relationships/persons - Create person"""
        try:
            person_data = {
                "name": "Carlos Eduardo Silva",
                "cpf": "987.654.321-00",
                "phone": "+5511888777666",
                "email": "carlos.silva@email.com",
                "occupation": "Empresário",
                "criminal_record": True,
                "risk_level": "high",
                "aliases": ["Carlinhos", "CEO Silva"]
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/relationships/persons", json=person_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "person"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Relationships Create Person", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    person = data.get("person", {})
                    person_required_keys = ["id", "name", "risk_level"]
                    person_missing = [key for key in person_required_keys if key not in person]
                    
                    if person_missing:
                        self.log_result("Relationships Create Person", False, f"Missing person keys: {person_missing}", data)
                        return False
                    
                    self.log_result("Relationships Create Person", True, f"Successfully created person: {person.get('name')}")
                    return person.get("id")
                else:
                    error_text = await response.text()
                    self.log_result("Relationships Create Person", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Relationships Create Person", False, f"Exception: {str(e)}")
            return False
    
    async def test_relationships_create_relationship(self):
        """Test POST /api/relationships/relationships - Create relationship"""
        try:
            relationship_data = {
                "person1_id": "person-123",
                "person2_id": "person-456",
                "relationship_type": "criminal",
                "strength": 0.8,
                "frequency": 15,
                "first_contact": "2024-01-15",
                "last_contact": "2024-12-20",
                "evidence_sources": ["interceptacao_telefonica", "vigilancia"]
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/relationships/relationships", json=relationship_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "relationship"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Relationships Create Relationship", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    relationship = data.get("relationship", {})
                    rel_required_keys = ["id", "person1_id", "person2_id", "relationship_type", "strength"]
                    rel_missing = [key for key in rel_required_keys if key not in relationship]
                    
                    if rel_missing:
                        self.log_result("Relationships Create Relationship", False, f"Missing relationship keys: {rel_missing}", data)
                        return False
                    
                    self.log_result("Relationships Create Relationship", True, f"Successfully created {relationship.get('relationship_type')} relationship")
                    return relationship.get("id")
                else:
                    error_text = await response.text()
                    self.log_result("Relationships Create Relationship", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Relationships Create Relationship", False, f"Exception: {str(e)}")
            return False
    
    async def test_relationships_create_network(self):
        """Test POST /api/relationships/networks - Create criminal network"""
        try:
            network_data = {
                "name": "Organização Criminosa Silva",
                "description": "Rede especializada em lavagem de dinheiro e fraudes financeiras",
                "network_type": "organized_crime",
                "status": "under_investigation",
                "members": ["person-123", "person-456", "person-789"],
                "hierarchy": {
                    "leader": "person-123",
                    "lieutenants": ["person-456"],
                    "operatives": ["person-789"]
                }
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/relationships/networks", json=network_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "network"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Relationships Create Network", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    network = data.get("network", {})
                    network_required_keys = ["id", "name", "network_type", "status", "members"]
                    network_missing = [key for key in network_required_keys if key not in network]
                    
                    if network_missing:
                        self.log_result("Relationships Create Network", False, f"Missing network keys: {network_missing}", data)
                        return False
                    
                    self.log_result("Relationships Create Network", True, f"Successfully created criminal network: {network.get('name')}")
                    return network.get("id")
                else:
                    error_text = await response.text()
                    self.log_result("Relationships Create Network", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Relationships Create Network", False, f"Exception: {str(e)}")
            return False
    
    async def test_relationships_network_analysis(self):
        """Test GET /api/relationships/networks/{network_id}/analysis - Network analysis"""
        network_id = "test-network-123"
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/relationships/networks/{network_id}/analysis", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["analysis", "visualization_available"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Relationships Network Analysis", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    analysis = data.get("analysis", {})
                    analysis_required_keys = ["network_id", "centrality_measures", "community_detection", "key_players", "risk_assessment"]
                    analysis_missing = [key for key in analysis_required_keys if key not in analysis]
                    
                    if analysis_missing:
                        self.log_result("Relationships Network Analysis", False, f"Missing analysis keys: {analysis_missing}", data)
                        return False
                    
                    self.log_result("Relationships Network Analysis", True, f"Successfully retrieved network analysis, visualization available: {data.get('visualization_available')}")
                    return True
                elif response.status == 404:
                    self.log_result("Relationships Network Analysis", True, "Network analysis not found (expected for test network)")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Relationships Network Analysis", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Relationships Network Analysis", False, f"Exception: {str(e)}")
            return False
    
    # ==================== AUTOMATED REPORTS TESTS ====================
    
    async def test_reports_generate(self):
        """Test POST /api/reports/generate - Generate report"""
        try:
            report_request = {
                "template_id": "investigation",
                "case_id": "test-case-report-123",
                "title": "Relatório de Investigação Criminal - Teste",
                "parameters": {
                    "include_evidence": True,
                    "include_network": True
                },
                "include_charts": True,
                "include_evidence": True,
                "format": "pdf"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/reports/generate", json=report_request, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_keys = ["message", "request_id", "estimated_time"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("Reports Generate", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    request_id = data.get("request_id")
                    if not request_id:
                        self.log_result("Reports Generate", False, "Missing request_id in response", data)
                        return False
                    
                    self.log_result("Reports Generate", True, f"Successfully initiated report generation, request_id: {request_id}")
                    return request_id
                else:
                    error_text = await response.text()
                    self.log_result("Reports Generate", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Reports Generate", False, f"Exception: {str(e)}")
            return False
    
    async def test_reports_templates(self):
        """Test GET /api/reports/templates - List report templates"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/reports/templates", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if "templates" not in data:
                        self.log_result("Reports Templates", False, "Missing 'templates' key in response", data)
                        return False
                    
                    templates = data.get("templates", [])
                    if not isinstance(templates, list):
                        self.log_result("Reports Templates", False, "Templates should be a list", data)
                        return False
                    
                    # Check for expected templates
                    expected_templates = ["investigation", "forensic", "osint", "network"]
                    found_templates = [t.get("id") for t in templates]
                    
                    missing_templates = [t for t in expected_templates if t not in found_templates]
                    if missing_templates:
                        self.log_result("Reports Templates", False, f"Missing expected templates: {missing_templates}", data)
                        return False
                    
                    self.log_result("Reports Templates", True, f"Successfully retrieved {len(templates)} report templates")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Reports Templates", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Reports Templates", False, f"Exception: {str(e)}")
            return False
    
    async def test_reports_status(self):
        """Test GET /api/reports/status/{request_id} - Check report status"""
        request_id = "test-request-123"
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/reports/status/{request_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Should have status field
                    if "status" not in data:
                        self.log_result("Reports Status", False, "Missing 'status' key in response", data)
                        return False
                    
                    status = data.get("status")
                    if status not in ["processing", "completed", "failed"]:
                        self.log_result("Reports Status", False, f"Invalid status value: {status}", data)
                        return False
                    
                    if status == "completed":
                        # Should have report and download_url
                        if "report" not in data or "download_url" not in data:
                            self.log_result("Reports Status", False, "Missing report or download_url for completed status", data)
                            return False
                    
                    self.log_result("Reports Status", True, f"Successfully retrieved report status: {status}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("Reports Status", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("Reports Status", False, f"Exception: {str(e)}")
            return False

    # ==================== ATHENA SYSTEM TESTS ====================
    
    async def test_athena_processes(self):
        """Test GET /api/athena/processes"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/processes", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if "processes" not in data:
                        self.log_result("ATHENA Processes", False, "Missing 'processes' key in response", data)
                        return False
                    
                    processes = data.get("processes", [])
                    if not isinstance(processes, list):
                        self.log_result("ATHENA Processes", False, "Processes should be a list", data)
                        return False
                    
                    self.log_result("ATHENA Processes", True, f"Successfully retrieved {len(processes)} processes")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("ATHENA Processes", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("ATHENA Processes", False, f"Exception: {str(e)}")
            return False
    
    async def test_athena_financial_summary(self):
        """Test GET /api/athena/financial/summary"""
        try:
            headers = self.get_headers()
            async with self.session.get(f"{BASE_URL}/athena/financial/summary", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    required_keys = ["income", "expenses", "net", "period"]
                    missing_keys = [key for key in required_keys if key not in data]
                    
                    if missing_keys:
                        self.log_result("ATHENA Financial Summary", False, f"Missing keys: {missing_keys}", data)
                        return False
                    
                    # Validate period structure
                    period = data.get("period", {})
                    if not isinstance(period, dict) or "start" not in period or "end" not in period:
                        self.log_result("ATHENA Financial Summary", False, "Invalid period structure", data)
                        return False
                    
                    # Check for additional expected keys
                    additional_keys = ["by_category", "profit_margin"]
                    for key in additional_keys:
                        if key not in data:
                            self.log_result("ATHENA Financial Summary", False, f"Missing additional key: {key}", data)
                            return False
                    
                    self.log_result("ATHENA Financial Summary", True, f"Financial summary retrieved - Net: R$ {data.get('net', 0):.2f}, Period: {period.get('start', '')[:10]} to {period.get('end', '')[:10]}")
                    return True
                else:
                    error_text = await response.text()
                    self.log_result("ATHENA Financial Summary", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("ATHENA Financial Summary", False, f"Exception: {str(e)}")
            return False
    
    async def test_user_creation(self):
        """Test POST /api/users - User Management"""
        try:
            user_data = {
                "name": "Test User ATHENA",
                "email": f"testuser_{datetime.now().timestamp()}@apelite.com",
                "password": "testpass123",
                "role": "client",
                "phone": "+5535999887766"
            }
            
            headers = self.get_headers()
            async with self.session.post(f"{BASE_URL}/users", json=user_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("User Creation", True, f"Successfully created user: {data.get('id')}")
                    return data.get('id')
                else:
                    error_text = await response.text()
                    self.log_result("User Creation", False, f"Failed with status {response.status}", error_text)
                    return False
        except Exception as e:
            self.log_result("User Creation", False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run Advanced Investigation Tools Backend Tests"""
        print("🚀 Starting AP Elite Advanced Investigation Tools Testing")
        print("=" * 70)
        
        # Authenticate first
        if not await self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        print("\n🔍 Testing Investigation System - Core Endpoints...")
        await self.test_investigation_list_cases()
        await self.test_investigation_create_case()
        
        print("\n🌐 Testing OSINT Advanced Search...")
        await self.test_investigation_osint_search_social_media()
        await self.test_investigation_osint_search_geolocation()
        await self.test_investigation_osint_search_person_verification()
        
        print("\n🕸️ Testing Relationship Mapping...")
        await self.test_relationships_list_persons()
        await self.test_relationships_list_networks()
        
        print("\n📊 Testing Report Templates...")
        await self.test_reports_list_templates()
        
        print("\n🔄 Testing Hybrid System Status...")
        await self.test_hybrid_status()
        
        print("\n🔬 Testing Additional Investigation Features...")
        await self.test_investigation_evidence_upload()
        await self.test_investigation_case_analysis()
        await self.test_investigation_evidence_analysis()
        
        print("\n🕸️ Testing Relationship Creation...")
        await self.test_relationships_create_person()
        await self.test_relationships_create_relationship()
        await self.test_relationships_create_network()
        await self.test_relationships_network_analysis()
        
        print("\n📊 Testing Report Generation...")
        await self.test_reports_generate()
        await self.test_reports_status()
        
        print("\n🔄 Testing Hybrid System Operations...")
        await self.test_hybrid_sync()
        await self.test_hybrid_backups_list()
        await self.test_hybrid_backup_create()
        await self.test_interception_upload()
        await self.test_iped_create_project()
        await self.test_iped_list_projects()
        await self.test_communications_email()
        await self.test_communications_whatsapp()
        await self.test_communications_video_room()
        await self.test_communications_messages()
        
        print("\n📊 Testing Advanced Integrations...")
        await self.test_pdf_report_generation()
        await self.test_email_with_report()
        await self.test_data_export_csv()
        await self.test_data_export_json_cases()
        await self.test_data_export_json_analytics()
        await self.test_backup_creation()
        await self.test_audit_logs()
        await self.test_activity_summary()
        
        print("\n📚 Testing Document Library System...")
        await self.test_document_library_categories()
        await self.test_document_library_documents()
        await self.test_document_library_statistics()
        
        print("\n🔍 Testing OSINT Enhanced System...")
        await self.test_osint_categories()
        await self.test_osint_query()
        await self.test_osint_analyze_person()
        await self.test_osint_analyze_company()
        await self.test_osint_history()
        await self.test_osint_tools()
        
        print("\n📄 Testing Template Generator System...")
        await self.test_template_list()
        await self.test_template_details()
        await self.test_template_statistics()
        await self.test_template_generated_list()
        
        # Summary
        print("\n" + "=" * 70)
        print("📋 ATHENA SYSTEM TEST SUMMARY")
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
        
        print("\n✅ ATHENA system tested successfully!" if passed == total else "\n⚠️  Some tests failed - check logs above")
        
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