from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import json
from models import *

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer(auto_error=False)

# FastAPI app
app = FastAPI(
    title="AP Elite - Sistema de Gestão Criminal",
    description="Sistema completo de gestão para perícia criminal e advocacia",
    version="2.0.0"
)

# CORS - Use environment variable for production security
# For production: Set ALLOWED_ORIGINS in environment to restrict origins
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api_router = APIRouter(prefix="/api")

# Dependency for authentication
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    
    # Extract user ID from token (simplified for demo)
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "active": True}, {"_id": 0, "password": 0})
        return user
    except:
        return None

# ==================== AUTHENTICATION ====================

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({
        "email": login_data.email, 
        "role": login_data.role,
        "active": True
    }, {"_id": 0})
    
    if not user or user["password"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user["id"],
        action="login",
        resource_type="user",
        resource_id=user["id"],
        details={"email": user["email"], "role": user["role"]}
    )
    
    audit_doc = audit_log.model_dump()
    audit_doc['timestamp'] = audit_doc['timestamp'].isoformat()
    audit_doc['created_at'] = audit_doc['created_at'].isoformat()
    audit_doc['updated_at'] = audit_doc['updated_at'].isoformat()
    
    await db.audit_logs.insert_one(audit_doc)
    
    user.pop("password", None)
    return {
        "user": user,
        "token": f"token_{user['id']}_{datetime.now().timestamp()}"
    }

# ==================== USER MANAGEMENT ====================

@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") != "administrator":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Auto-generate case number
    user_count = await db.users.count_documents({"role": user_data.role})
    
    user_dict = user_data.model_dump()
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    user_obj.password = "***"
    return user_obj

# Disabled - using user_management.py endpoints instead to avoid conflicts
# @api_router.get("/users", response_model=List[User])
# async def get_users(current_user: dict = Depends(get_current_user)):
#     if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
#         raise HTTPException(status_code=403, detail="Access denied")
#     
#     users = await db.users.find({"active": True}, {"_id": 0, "password": 0}).to_list(200)
#     
#     for user in users:
#         if isinstance(user.get('created_at'), str):
#             user['created_at'] = datetime.fromisoformat(user['created_at'])
#         if isinstance(user.get('updated_at'), str):
#             user['updated_at'] = datetime.fromisoformat(user['updated_at'])
#     
#     return users

# ==================== CASE MANAGEMENT ====================

@api_router.post("/cases", response_model=Case)
async def create_case(case_data: CaseCreate, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Auto-generate case number
    case_count = await db.cases.count_documents({})
    case_number = f"AP{datetime.now().year}{case_count + 1:04d}"
    
    case_dict = case_data.model_dump()
    case_dict['case_number'] = case_number
    case_dict['assigned_to'] = current_user['id']
    
    if case_dict.get('estimated_completion'):
        case_dict['estimated_completion'] = datetime.fromisoformat(case_dict['estimated_completion'])
    
    case_obj = Case(**case_dict)
    
    doc = case_obj.model_dump()
    doc['start_date'] = doc['start_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc.get('estimated_completion'):
        doc['estimated_completion'] = doc['estimated_completion'].isoformat()
    
    await db.cases.insert_one(doc)
    return case_obj

@api_router.get("/cases")
async def get_cases(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        query = {}
        if current_user.get("role") == "client":
            query["client_id"] = current_user["id"]
        
        cases = await db.cases.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        
        for case in cases:
            # Safely convert dates
            if isinstance(case.get('start_date'), str):
                try:
                    case['start_date'] = datetime.fromisoformat(case['start_date'])
                except:
                    pass
            if isinstance(case.get('created_at'), str):
                try:
                    case['created_at'] = datetime.fromisoformat(case['created_at'])
                except:
                    pass
            if isinstance(case.get('completion_date'), str):
                try:
                    case['completion_date'] = datetime.fromisoformat(case['completion_date'])
                except:
                    pass
        
        return {"cases": cases, "total": len(cases)}
    except Exception as e:
        print(f"Error in get_cases: {e}")
        return {"cases": [], "total": 0}
    
    return cases

@api_router.put("/cases/{case_id}/status")
async def update_case_status(case_id: str, status: str, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if status == "completed":
        update_data["completion_date"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.cases.update_one(
        {"id": case_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 1:
        return {"message": "Case status updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Case not found")

# ==================== EVIDENCE MANAGEMENT ====================

@api_router.post("/evidence", response_model=Evidence)
async def create_evidence(evidence_data: EvidenceCreate, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Auto-generate evidence number
    case_evidence_count = await db.evidence.count_documents({"case_id": evidence_data.case_id})
    evidence_number = f"EV{case_evidence_count + 1:03d}"
    
    evidence_dict = evidence_data.model_dump()
    evidence_dict['evidence_number'] = evidence_number
    
    # Add to chain of custody
    custody_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": current_user['id'],
        "user_name": current_user['name'],
        "action": "created",
        "location": "AP Elite - Evidence Storage"
    }
    evidence_dict['chain_of_custody'] = [custody_entry]
    
    evidence_obj = Evidence(**evidence_dict)
    
    doc = evidence_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.evidence.insert_one(doc)
    
    # Update case evidence count
    await db.cases.update_one(
        {"id": evidence_data.case_id},
        {"$inc": {"evidence_count": 1}}
    )
    
    return evidence_obj

@api_router.get("/evidence/case/{case_id}", response_model=List[Evidence])
async def get_case_evidence(case_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    evidence = await db.evidence.find({"case_id": case_id}, {"_id": 0}).to_list(100)
    
    for item in evidence:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    
    return evidence

# ==================== FINANCIAL MANAGEMENT ====================

@api_router.post("/financial", response_model=FinancialRecord)
async def create_financial_record(record_data: FinancialRecordCreate, current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    record_dict = record_data.model_dump()
    record_obj = FinancialRecord(**record_dict)
    
    doc = record_obj.model_dump()
    doc['date'] = doc['date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.financial_records.insert_one(doc)
    return record_obj

@api_router.get("/financial", response_model=List[FinancialRecord])
async def get_financial_records(current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    records = await db.financial_records.find({}, {"_id": 0}).sort("date", -1).to_list(200)
    
    for record in records:
        if isinstance(record.get('date'), str):
            record['date'] = datetime.fromisoformat(record['date'])
    
    return records

@api_router.get("/financial/summary")
async def get_financial_summary(current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Calculate current month summary
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    pipeline = [
        {
            "$match": {
                "date": {"$gte": start_of_month.isoformat()}
            }
        },
        {
            "$group": {
                "_id": "$type",
                "total": {"$sum": "$amount"}
            }
        }
    ]
    
    results = await db.financial_records.aggregate(pipeline).to_list(None)
    
    summary = {
        "income": 0,
        "expenses": 0,
        "net": 0,
        "month": start_of_month.strftime("%B %Y")
    }
    
    for result in results:
        if result["_id"] in ["income", "fee"]:
            summary["income"] += result["total"]
        elif result["_id"] in ["expense", "cost"]:
            summary["expenses"] += result["total"]
    
    summary["net"] = summary["income"] - summary["expenses"]
    
    return summary

# ==================== MEETING MANAGEMENT ====================

@api_router.post("/meetings", response_model=Meeting)
async def create_meeting(meeting_data: MeetingCreate, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    meeting_dict = meeting_data.model_dump()
    meeting_dict['organizer_id'] = current_user['id']
    meeting_dict['start_time'] = datetime.fromisoformat(meeting_dict['start_time'])
    meeting_dict['end_time'] = datetime.fromisoformat(meeting_dict['end_time'])
    
    # Generate meeting link for video conferences
    if meeting_dict['meeting_type'] == 'video':
        meeting_id = str(uuid.uuid4())[:8].upper()
        meeting_dict['meeting_id'] = meeting_id
        meeting_dict['meeting_link'] = f"https://meet.apelite.com/room/{meeting_id}"
        meeting_dict['password'] = str(uuid.uuid4())[:6].upper()
    
    meeting_obj = Meeting(**meeting_dict)
    
    doc = meeting_obj.model_dump()
    doc['start_time'] = doc['start_time'].isoformat()
    doc['end_time'] = doc['end_time'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.meetings.insert_one(doc)
    return meeting_obj

@api_router.get("/meetings", response_model=List[Meeting])
async def get_meetings(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get meetings where user is organizer or participant
    query = {
        "$or": [
            {"organizer_id": current_user['id']},
            {"participants": current_user['id']}
        ]
    }
    
    meetings = await db.meetings.find(query, {"_id": 0}).sort("start_time", 1).to_list(100)
    
    for meeting in meetings:
        if isinstance(meeting.get('start_time'), str):
            meeting['start_time'] = datetime.fromisoformat(meeting['start_time'])
        if isinstance(meeting.get('end_time'), str):
            meeting['end_time'] = datetime.fromisoformat(meeting['end_time'])
    
    return meetings

# ==================== ANALYSIS MANAGEMENT ====================

@api_router.post("/analysis/interception", response_model=InterceptionAnalysis)
async def create_interception_analysis(analysis_data: InterceptionAnalysisCreate, current_user: dict = Depends(get_current_user)):
    if not current_user or current_user.get("role") not in ["administrator", "analyst", "investigator"]:
        raise HTTPException(status_code=403, detail="Analysis access required")
    
    analysis_dict = analysis_data.model_dump()
    analysis_obj = InterceptionAnalysis(**analysis_dict)
    
    doc = analysis_obj.model_dump()
    doc['analysis_date'] = doc['analysis_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.interception_analysis.insert_one(doc)
    
    # Start background processing (in real implementation)
    # await start_analysis_processing(analysis_obj.id)
    
    return analysis_obj

@api_router.get("/analysis/interception/case/{case_id}", response_model=List[InterceptionAnalysis])
async def get_case_interception_analysis(case_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    analyses = await db.interception_analysis.find({"case_id": case_id}, {"_id": 0}).to_list(100)
    
    for analysis in analyses:
        if isinstance(analysis.get('analysis_date'), str):
            analysis['analysis_date'] = datetime.fromisoformat(analysis['analysis_date'])
    
    return analyses

# ==================== CALENDAR MANAGEMENT ====================

@api_router.post("/calendar/events", response_model=CalendarEvent)
async def create_calendar_event(event_data: CalendarEventCreate, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    event_dict = event_data.model_dump()
    event_dict['organizer_id'] = current_user['id']
    event_dict['start_time'] = datetime.fromisoformat(event_dict['start_time'])
    event_dict['end_time'] = datetime.fromisoformat(event_dict['end_time'])
    
    event_obj = CalendarEvent(**event_dict)
    
    doc = event_obj.model_dump()
    doc['start_time'] = doc['start_time'].isoformat()
    doc['end_time'] = doc['end_time'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.calendar_events.insert_one(doc)
    return event_obj

@api_router.get("/calendar/events", response_model=List[CalendarEvent])
async def get_calendar_events(start_date: str = None, end_date: str = None, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {
        "$or": [
            {"organizer_id": current_user['id']},
            {"attendees": current_user['id']}
        ]
    }
    
    if start_date and end_date:
        query["start_time"] = {
            "$gte": start_date,
            "$lte": end_date
        }
    
    events = await db.calendar_events.find(query, {"_id": 0}).sort("start_time", 1).to_list(200)
    
    for event in events:
        if isinstance(event.get('start_time'), str):
            event['start_time'] = datetime.fromisoformat(event['start_time'])
        if isinstance(event.get('end_time'), str):
            event['end_time'] = datetime.fromisoformat(event['end_time'])
    
    return events

# ==================== DASHBOARD ANALYTICS ====================

@api_router.get("/dashboard/statistics")
async def get_dashboard_statistics(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Base statistics
    stats = {
        "cases": {
            "total": await db.cases.count_documents({}),
            "active": await db.cases.count_documents({"status": "active"}),
            "completed_this_month": await db.cases.count_documents({
                "status": "completed",
                "completion_date": {"$gte": datetime.now().replace(day=1).isoformat()}
            })
        },
        "evidence": {
            "total": await db.evidence.count_documents({}),
            "pending_analysis": await db.evidence.count_documents({"analysis_status": "pending"}),
            "analyzing": await db.evidence.count_documents({"analysis_status": "analyzing"})
        },
        "meetings": {
            "today": await db.meetings.count_documents({
                "start_time": {
                    "$gte": datetime.now().replace(hour=0, minute=0, second=0).isoformat(),
                    "$lt": (datetime.now().replace(hour=0, minute=0, second=0) + timedelta(days=1)).isoformat()
                }
            }),
            "this_week": await db.meetings.count_documents({
                "start_time": {
                    "$gte": (datetime.now() - timedelta(days=datetime.now().weekday())).isoformat(),
                    "$lt": (datetime.now() + timedelta(days=7-datetime.now().weekday())).isoformat()
                }
            })
        }
    }
    
    # Role-specific statistics
    if current_user.get("role") == "administrator":
        stats["users"] = {
            "total_clients": await db.users.count_documents({"role": "client", "active": True}),
            "total_staff": await db.users.count_documents({"role": {"$ne": "client"}, "active": True}),
            "active_today": await db.audit_logs.distinct("user_id", {
                "action": "login",
                "timestamp": {"$gte": datetime.now().replace(hour=0, minute=0, second=0).isoformat()}
            })
        }
        
        # Financial summary
        financial_summary = await get_financial_summary(current_user)
        stats["financial"] = financial_summary
    
    return stats

# ==================== TASK MANAGEMENT ====================

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    task_dict = task_data.model_dump()
    task_dict['created_by'] = current_user['id']
    
    if task_dict.get('due_date'):
        task_dict['due_date'] = datetime.fromisoformat(task_dict['due_date'])
    
    task_obj = Task(**task_dict)
    
    doc = task_obj.model_dump()
    if doc.get('due_date'):
        doc['due_date'] = doc['due_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.tasks.insert_one(doc)
    return task_obj

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {
        "$or": [
            {"assigned_to": current_user['id']},
            {"created_by": current_user['id']}
        ]
    }
    
    tasks = await db.tasks.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for task in tasks:
        if isinstance(task.get('due_date'), str):
            task['due_date'] = datetime.fromisoformat(task['due_date'])
    
    return tasks

# Admin stats endpoint - must be defined BEFORE include_router
@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get admin dashboard statistics"""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Get counts with safe defaults
        total_cases = await db.cases.count_documents({}) if db.cases else 0
        active_cases = await db.cases.count_documents({"status": "active"}) if db.cases else 0
        total_clients = await db.users.count_documents({"role": "client"}) if db.users else 0
        
        # Count appointments
        total_appointments = await db.appointments.count_documents({}) if db.appointments else 0
        pending_appointments = await db.appointments.count_documents({"status": "pending"}) if db.appointments else 0
        
        # Count documents and messages
        total_documents = await db.documents.count_documents({}) if db.documents else 0
        unread_messages = await db.messages.count_documents({"read": False}) if db.messages else 0
        
        stats = {
            "totalCases": total_cases,
            "activeCases": active_cases,
            "totalClients": total_clients,
            "totalAppointments": total_appointments,
            "pendingAppointments": pending_appointments,
            "totalDocuments": total_documents,
            "unreadMessages": unread_messages,
            "monthly_revenue": 0.0
        }
        
        # Calculate monthly revenue safely
        try:
            first_day_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            pipeline = [
                {
                    "$match": {
                        "type": {"$in": ["income", "fee"]},
                        "date": {"$gte": first_day_of_month.isoformat()}
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "total": {"$sum": "$amount"}
                    }
                }
            ]
            
            if db.financial_records:
                result = await db.financial_records.aggregate(pipeline).to_list(1)
                if result:
                    stats["monthly_revenue"] = result[0]["total"]
        except Exception as e:
            print(f"Error calculating revenue: {e}")
            # Continue without revenue data
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching admin stats: {e}")
        # Return default stats instead of error
        return {
            "totalCases": 0,
            "activeCases": 0,
            "totalClients": 0,
            "totalAppointments": 0,
            "pendingAppointments": 0,
            "totalDocuments": 0,
            "unreadMessages": 0,
            "monthly_revenue": 0.0
        }

# Import advanced features
from advanced_features import advanced_router
from advanced_integrations import integrations_router

# Import Super ERP (18 modules)
import sys
sys.path.append('/app/backend')
from super_erp import super_router
# Import super_erp_part3 to register additional endpoints including financial
import super_erp_part3
from user_management import user_router
from athena_enhanced_apis import enhanced_router
from notifications_system import notifications_router
from reports_generator import reports_router as reports_gen_router
from email_integration import email_router
from storage_integration import storage_router
from ai_document_analysis import ai_router
from security_features import security_router
from backup_system import backup_router
from hybrid_sync_system import hybrid_router
from advanced_investigation_ai import investigation_router
from relationship_mapping import relationships_router
from automated_reports import reports_router as automated_reports_router
from document_library_system import router as library_router
from osint_enhanced import router as osint_enhanced_router
from template_generator import router as template_router
from rag_system import router as rag_router
from ocr_advanced import router as ocr_router
from media_analysis import router as media_router
from blockchain_custody import router as blockchain_router
from compliance_lgpd import router as compliance_router
from workflow_automation import router as workflow_router
from predictive_analytics import router as predictive_router
from smart_fees import router as fees_router
from ai_chatbot import router as chatbot_router
from social_listening import router as social_router
from collaboration_realtime import router as collaboration_router
from global_search import router as search_router
from executive_dashboard import router as executive_dashboard_router
from deadline_manager import router as deadline_router
from phone_interceptions_pro import router as phone_interceptions_router
from juridico_completo import router as juridico_router
from documentos_juridicos import router as documentos_router
from process_analysis_complete import process_analysis_router
from contracts_complete import contracts_router
from document_library_complete import library_complete_router
from automated_reports_complete import reports_complete_router
from advanced_investigation_complete import investigation_complete_router
from digital_forensics_complete import forensics_router
from forensics_enhanced import forensics_enhanced_router

# Add all routes to main app
app.include_router(api_router)
app.include_router(advanced_router)
app.include_router(integrations_router)
app.include_router(super_router)
app.include_router(user_router)
app.include_router(enhanced_router)
app.include_router(notifications_router)
app.include_router(reports_gen_router)
app.include_router(email_router)
app.include_router(storage_router)
app.include_router(ai_router)
app.include_router(security_router)
app.include_router(backup_router)
app.include_router(hybrid_router)
app.include_router(investigation_router)
app.include_router(relationships_router)
app.include_router(automated_reports_router)
app.include_router(library_router)
app.include_router(osint_enhanced_router)
app.include_router(template_router)
app.include_router(rag_router)
app.include_router(ocr_router)
app.include_router(media_router)
app.include_router(blockchain_router)
app.include_router(compliance_router)
app.include_router(workflow_router)
app.include_router(predictive_router)
app.include_router(fees_router)
app.include_router(chatbot_router)
app.include_router(social_router)
app.include_router(collaboration_router)
app.include_router(search_router)
app.include_router(executive_dashboard_router)
app.include_router(deadline_router)
app.include_router(phone_interceptions_router)
app.include_router(juridico_router)
app.include_router(documentos_router)
app.include_router(process_analysis_router)
app.include_router(contracts_router)
app.include_router(library_complete_router)
app.include_router(reports_complete_router)
app.include_router(investigation_complete_router)
app.include_router(forensics_router)

# Health check
@app.get("/")
async def root():
    return {"message": "AP Elite - Sistema de Gestão Criminal v2.0", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)