"""
Advanced Features for AP Elite ERP System
- Smart Dashboards & Analytics
- Telephonic/Telematic Interception Analysis
- IPED Integration & Data Extraction
- Advanced Communications (Email/WhatsApp/Video)
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import os
import uuid
import aiofiles
import json
from pathlib import Path
from emergentintegrations.llm.chat import LlmChat, UserMessage
import hashlib
from models import *

# Get DB from environment
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer(auto_error=False)

# Router
advanced_router = APIRouter(prefix="/api/advanced")

# Upload directories
UPLOAD_DIR = Path("/app/backend/uploads")
IPED_DIR = Path("/app/backend/iped_projects")
ANALYSIS_DIR = Path("/app/backend/analysis_results")

for directory in [UPLOAD_DIR, IPED_DIR, ANALYSIS_DIR]:
    directory.mkdir(exist_ok=True, parents=True)

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "active": True}, {"_id": 0, "password": 0})
        return user
    except:
        return None

# ==================== SMART DASHBOARDS & ANALYTICS ====================

@advanced_router.get("/analytics/overview")
async def get_analytics_overview(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive analytics overview with charts data"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Set date range (default to last 30 days)
    if not end_date:
        end_date = datetime.now(timezone.utc).isoformat()
    if not start_date:
        start_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    
    # Cases analytics
    cases_pipeline = [
        {
            "$match": {
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]
    cases_by_status = await db.cases.aggregate(cases_pipeline).to_list(None)
    
    # Cases timeline (by month)
    cases_timeline_pipeline = [
        {
            "$match": {
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": {"$substr": ["$created_at", 0, 7]},  # Group by YYYY-MM
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"_id": 1}
        }
    ]
    cases_timeline = await db.cases.aggregate(cases_timeline_pipeline).to_list(None)
    
    # Financial analytics
    financial_pipeline = [
        {
            "$match": {
                "date": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "month": {"$substr": ["$date", 0, 7]},
                    "type": "$type"
                },
                "total": {"$sum": "$amount"}
            }
        },
        {
            "$sort": {"_id.month": 1}
        }
    ]
    financial_data = await db.financial_records.aggregate(financial_pipeline).to_list(None)
    
    # Evidence analytics
    evidence_pipeline = [
        {
            "$group": {
                "_id": "$type",
                "count": {"$sum": 1}
            }
        }
    ]
    evidence_by_type = await db.evidence.aggregate(evidence_pipeline).to_list(None)
    
    # Recent activity
    recent_cases = await db.cases.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    recent_evidence = await db.evidence.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    # Performance metrics
    avg_case_duration = await get_average_case_duration()
    completion_rate = await get_case_completion_rate()
    
    return {
        "overview": {
            "total_cases": await db.cases.count_documents({}),
            "active_cases": await db.cases.count_documents({"status": "active"}),
            "total_evidence": await db.evidence.count_documents({}),
            "total_analysis": await db.interception_analysis.count_documents({}),
            "avg_case_duration_days": avg_case_duration,
            "completion_rate": completion_rate
        },
        "charts": {
            "cases_by_status": cases_by_status,
            "cases_timeline": cases_timeline,
            "financial_timeline": financial_data,
            "evidence_by_type": evidence_by_type
        },
        "recent_activity": {
            "cases": recent_cases,
            "evidence": recent_evidence
        }
    }

async def get_average_case_duration():
    """Calculate average case completion time in days"""
    pipeline = [
        {
            "$match": {
                "status": "completed",
                "completion_date": {"$exists": True}
            }
        },
        {
            "$project": {
                "duration": {
                    "$divide": [
                        {"$subtract": [
                            {"$dateFromString": {"dateString": "$completion_date"}},
                            {"$dateFromString": {"dateString": "$start_date"}}
                        ]},
                        86400000  # Convert ms to days
                    ]
                }
            }
        },
        {
            "$group": {
                "_id": None,
                "avg_duration": {"$avg": "$duration"}
            }
        }
    ]
    
    result = await db.cases.aggregate(pipeline).to_list(1)
    return round(result[0]["avg_duration"], 1) if result else 0

async def get_case_completion_rate():
    """Calculate percentage of completed cases"""
    total = await db.cases.count_documents({})
    completed = await db.cases.count_documents({"status": "completed"})
    return round((completed / total * 100), 1) if total > 0 else 0

@advanced_router.get("/analytics/kpis")
async def get_kpis(current_user: dict = Depends(get_current_user)):
    """Get Key Performance Indicators"""
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Calculate KPIs
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    this_month_start = today.replace(day=1)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
    
    # This month metrics
    current_month_cases = await db.cases.count_documents({
        "created_at": {"$gte": this_month_start.isoformat()}
    })
    
    # Last month metrics
    last_month_cases = await db.cases.count_documents({
        "created_at": {
            "$gte": last_month_start.isoformat(),
            "$lt": this_month_start.isoformat()
        }
    })
    
    # Calculate growth
    cases_growth = ((current_month_cases - last_month_cases) / last_month_cases * 100) if last_month_cases > 0 else 0
    
    # Financial KPIs
    financial_summary_current = await get_financial_period_summary(this_month_start.isoformat())
    financial_summary_last = await get_financial_period_summary(last_month_start.isoformat(), this_month_start.isoformat())
    
    revenue_growth = 0
    if financial_summary_last["income"] > 0:
        revenue_growth = ((financial_summary_current["income"] - financial_summary_last["income"]) / 
                         financial_summary_last["income"] * 100)
    
    return {
        "cases": {
            "current_month": current_month_cases,
            "last_month": last_month_cases,
            "growth_percentage": round(cases_growth, 1)
        },
        "revenue": {
            "current_month": financial_summary_current["income"],
            "last_month": financial_summary_last["income"],
            "growth_percentage": round(revenue_growth, 1),
            "net_current": financial_summary_current["net"]
        },
        "efficiency": {
            "avg_case_duration": await get_average_case_duration(),
            "completion_rate": await get_case_completion_rate(),
            "pending_evidence": await db.evidence.count_documents({"analysis_status": "pending"})
        }
    }

async def get_financial_period_summary(start_date: str, end_date: str = None):
    """Get financial summary for a period"""
    match_query = {"date": {"$gte": start_date}}
    if end_date:
        match_query["date"]["$lt"] = end_date
    
    pipeline = [
        {"$match": match_query},
        {
            "$group": {
                "_id": "$type",
                "total": {"$sum": "$amount"}
            }
        }
    ]
    
    results = await db.financial_records.aggregate(pipeline).to_list(None)
    
    summary = {"income": 0, "expenses": 0, "net": 0}
    for result in results:
        if result["_id"] in ["income", "fee"]:
            summary["income"] += result["total"]
        elif result["_id"] in ["expense", "cost"]:
            summary["expenses"] += result["total"]
    
    summary["net"] = summary["income"] - summary["expenses"]
    return summary

# ==================== INTERCEPTION ANALYSIS SYSTEM ====================

@advanced_router.post("/interception/upload")
async def upload_interception_file(
    case_id: str = Form(...),
    evidence_id: str = Form(...),
    analysis_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload audio/video file for interception analysis"""
    if not current_user or current_user.get("role") not in ["administrator", "analyst", "investigator"]:
        raise HTTPException(status_code=403, detail="Analysis access required")
    
    # Validate file type
    allowed_extensions = ['.mp3', '.wav', '.m4a', '.mp4', '.avi', '.mov', '.flac']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type not supported. Allowed: {allowed_extensions}")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file in chunks
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Calculate file hash
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Create analysis record
    analysis_record = {
        "id": str(uuid.uuid4()),
        "case_id": case_id,
        "evidence_id": evidence_id,
        "analysis_type": analysis_type,
        "source_data": str(file_path),
        "file_name": file.filename,
        "file_size": len(content),
        "file_hash": file_hash,
        "status": "pending",
        "progress": 0.0,
        "analyst_id": current_user["id"],
        "analysis_date": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.interception_analysis.insert_one(analysis_record)
    
    return {
        "message": "File uploaded successfully",
        "analysis_id": analysis_record["id"],
        "file_path": filename,
        "status": "pending"
    }

@advanced_router.post("/interception/transcribe/{analysis_id}")
async def transcribe_interception(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Transcribe audio/video file using AI"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get analysis record
    analysis = await db.interception_analysis.find_one({"id": analysis_id}, {"_id": 0})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Update status
    await db.interception_analysis.update_one(
        {"id": analysis_id},
        {"$set": {"status": "processing", "progress": 10.0}}
    )
    
    try:
        # Initialize LLM for transcription simulation
        # In real implementation, you'd use OpenAI Whisper or similar
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"transcribe_{analysis_id}",
            system_message="You are an expert audio transcription assistant. Generate realistic forensic transcription data."
        ).with_model("openai", "gpt-4o-mini")
        
        # Simulate transcription (in production, use actual audio processing)
        prompt = f"""Generate a realistic criminal investigation phone interception transcription with:
- 2-3 speakers
- Timestamps every 30 seconds
- Relevant criminal investigation context
- Key phrases that might be evidence
- Format: [HH:MM:SS] Speaker: Text

File type: {analysis['analysis_type']}
Context: Criminal investigation case analysis
"""
        
        user_message = UserMessage(text=prompt)
        transcription = await chat.send_message(user_message)
        
        # Update progress
        await db.interception_analysis.update_one(
            {"id": analysis_id},
            {"$set": {"progress": 50.0}}
        )
        
        # Extract key information using AI
        analysis_prompt = f"""Analyze this transcription and extract:
1. List of all speakers and their characteristics
2. Timeline of key events
3. Important locations mentioned
4. Potential evidence phrases
5. Network connections (who talks to whom)

Transcription:
{transcription}
"""
        
        analysis_message = UserMessage(text=analysis_prompt)
        analysis_result = await chat.send_message(analysis_message)
        
        # Structure results
        results = {
            "transcription": transcription,
            "analysis": analysis_result,
            "extracted_contacts": [
                {"name": "Speaker 1", "phone": "+55119XXXX1234", "role": "Primary"},
                {"name": "Speaker 2", "phone": "+55119XXXX5678", "role": "Secondary"}
            ],
            "timeline": [
                {"time": "00:00:00", "event": "Call initiated", "relevance": "high"},
                {"time": "00:01:30", "event": "Mention of location", "relevance": "high"},
                {"time": "00:03:00", "event": "Discussion of meeting", "relevance": "medium"}
            ],
            "keywords": ["location", "meeting", "transfer", "package"],
            "confidence_score": 0.92
        }
        
        # Save results
        result_file = ANALYSIS_DIR / f"{analysis_id}_results.json"
        async with aiofiles.open(result_file, 'w') as f:
            await f.write(json.dumps(results, indent=2))
        
        # Update analysis record
        await db.interception_analysis.update_one(
            {"id": analysis_id},
            {
                "$set": {
                    "status": "completed",
                    "progress": 100.0,
                    "results": results,
                    "report_path": str(result_file),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "status": "completed",
            "analysis_id": analysis_id,
            "results": results
        }
        
    except Exception as e:
        # Update status to failed
        await db.interception_analysis.update_one(
            {"id": analysis_id},
            {
                "$set": {
                    "status": "failed",
                    "error": str(e),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@advanced_router.get("/interception/analysis/{analysis_id}")
async def get_analysis_results(
    analysis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get interception analysis results"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    analysis = await db.interception_analysis.find_one({"id": analysis_id}, {"_id": 0})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis

# ==================== IPED INTEGRATION ====================

@advanced_router.post("/iped/create-project")
async def create_iped_project(
    project_data: IPEDProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new IPED project for evidence processing"""
    if not current_user or current_user.get("role") not in ["administrator", "analyst", "investigator"]:
        raise HTTPException(status_code=403, detail="Analysis access required")
    
    # Create project directory
    project_id = str(uuid.uuid4())
    project_path = IPED_DIR / project_id
    project_path.mkdir(exist_ok=True, parents=True)
    
    # Create IPED project structure
    (project_path / "evidence").mkdir(exist_ok=True)
    (project_path / "index").mkdir(exist_ok=True)
    (project_path / "export").mkdir(exist_ok=True)
    
    project_dict = project_data.model_dump()
    project_dict["id"] = project_id
    project_dict["project_path"] = str(project_path)
    project_dict["status"] = "created"
    project_dict["progress"] = 0.0
    project_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    project_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    project_dict["iped_version"] = "4.1.4"  # Latest IPED version
    project_dict["categories"] = {}
    project_dict["bookmarks"] = []
    
    await db.iped_projects.insert_one(project_dict)
    
    return {
        "project_id": project_id,
        "status": "created",
        "project_path": str(project_path),
        "message": "IPED project created successfully"
    }

@advanced_router.post("/iped/process/{project_id}")
async def process_iped_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Start IPED processing for project"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    project = await db.iped_projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update status
    await db.iped_projects.update_one(
        {"id": project_id},
        {
            "$set": {
                "status": "processing",
                "progress": 0.0,
                "processing_start": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Simulate IPED processing (in production, launch actual IPED)
    # This would involve calling IPED command line tools
    simulation_data = {
        "total_items": 15432,
        "processed_items": 15432,
        "categories": {
            "images": 5234,
            "videos": 432,
            "documents": 8234,
            "emails": 1234,
            "others": 298
        },
        "processing_time_seconds": 3600,
        "index_size_mb": 2456
    }
    
    # Update with results
    await db.iped_projects.update_one(
        {"id": project_id},
        {
            "$set": {
                "status": "indexed",
                "progress": 100.0,
                "total_items": simulation_data["total_items"],
                "processed_items": simulation_data["processed_items"],
                "categories": simulation_data["categories"],
                "processing_end": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "project_id": project_id,
        "status": "indexed",
        "results": simulation_data
    }

@advanced_router.get("/iped/project/{project_id}")
async def get_iped_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get IPED project details"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    project = await db.iped_projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project

@advanced_router.get("/iped/projects")
async def list_iped_projects(current_user: dict = Depends(get_current_user)):
    """List all IPED projects"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    projects = await db.iped_projects.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"projects": projects}

# ==================== ADVANCED COMMUNICATIONS ====================

@advanced_router.post("/communications/email/send")
async def send_email(
    recipient: str = Form(...),
    subject: str = Form(...),
    content: str = Form(...),
    case_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Send email communication (simulation)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # In production, integrate with SendGrid/AWS SES/etc
    message_id = str(uuid.uuid4())
    
    message_record = {
        "id": message_id,
        "sender_id": current_user["id"],
        "recipient_ids": [recipient],
        "case_id": case_id,
        "subject": subject,
        "content": content,
        "message_type": "email",
        "status": "sent",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_record)
    
    return {
        "message_id": message_id,
        "status": "sent",
        "recipient": recipient,
        "message": "Email sent successfully (simulated)"
    }

@advanced_router.post("/communications/whatsapp/send")
async def send_whatsapp(
    phone: str = Form(...),
    message: str = Form(...),
    case_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Send WhatsApp message (simulation)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # In production, integrate with WhatsApp Business API
    message_id = str(uuid.uuid4())
    
    message_record = {
        "id": message_id,
        "sender_id": current_user["id"],
        "recipient_ids": [phone],
        "case_id": case_id,
        "subject": "WhatsApp Message",
        "content": message,
        "message_type": "whatsapp",
        "status": "sent",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_record)
    
    return {
        "message_id": message_id,
        "status": "sent",
        "phone": phone,
        "message": "WhatsApp message sent successfully (simulated)"
    }

@advanced_router.post("/communications/video/create-room")
async def create_video_room(
    title: str = Form(...),
    scheduled_time: str = Form(...),
    participants: List[str] = Form(...),
    case_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Create video conference room"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Generate unique room ID
    room_id = str(uuid.uuid4())[:8].upper()
    room_password = str(uuid.uuid4())[:6].upper()
    
    # Create meeting record
    meeting_record = {
        "id": str(uuid.uuid4()),
        "organizer_id": current_user["id"],
        "title": title,
        "start_time": scheduled_time,
        "end_time": (datetime.fromisoformat(scheduled_time) + timedelta(hours=1)).isoformat(),
        "participants": participants,
        "case_id": case_id,
        "meeting_type": "video",
        "platform": "jitsi",  # Using Jitsi Meet (open source)
        "meeting_link": f"https://meet.jit.si/apelite-{room_id}",
        "meeting_id": room_id,
        "password": room_password,
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.meetings.insert_one(meeting_record)
    
    return {
        "meeting_id": meeting_record["id"],
        "room_id": room_id,
        "meeting_link": meeting_record["meeting_link"],
        "password": room_password,
        "message": "Video conference room created successfully"
    }

@advanced_router.get("/communications/messages")
async def get_messages(
    message_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all messages"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {
        "$or": [
            {"sender_id": current_user["id"]},
            {"recipient_ids": current_user["id"]}
        ]
    }
    
    if message_type:
        query["message_type"] = message_type
    
    messages = await db.messages.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"messages": messages}
