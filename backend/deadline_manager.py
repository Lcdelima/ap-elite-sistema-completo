"""
AP ELITE - Deadline Manager Backend
D-3 and D-1 deadline management with double-checking
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from datetime import datetime, timezone, timedelta
from typing import Optional
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/athena/deadlines", tags=["Deadline Manager"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Simple auth dependency
async def get_current_user(authorization: str = None):
    """Simple token validation"""
    if not authorization or not authorization.startswith('Bearer '):
        return None
    return {"id": "user123", "email": "laura@apelite.com", "role": "administrator"}

def calculate_deadline_status(deadline_str, completed=False):
    """Calculate status based on deadline"""
    if completed:
        return 'completed'
    
    try:
        deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        diff = (deadline - now).days
        
        if diff < 0:
            return 'overdue'
        elif diff <= 1:
            return 'd-1'
        elif diff <= 3:
            return 'd-3'
        else:
            return 'upcoming'
    except:
        return 'upcoming'

@router.get("")
async def list_deadlines(
    filter_status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    List all deadlines with D-3 and D-1 alerts
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {}
    if filter_status and filter_status != 'all':
        if filter_status == 'completed':
            query['completed'] = True
        else:
            query['completed'] = False
    
    deadlines = await db.deadlines.find(query, {"_id": 0}).sort("deadline", 1).to_list(500)
    
    # Calculate status for each deadline
    for deadline in deadlines:
        deadline['status'] = calculate_deadline_status(
            deadline.get('deadline'),
            deadline.get('completed', False)
        )
        
        # Calculate days until
        try:
            deadline_date = datetime.fromisoformat(deadline.get('deadline').replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            deadline['daysUntil'] = (deadline_date - now).days
        except:
            deadline['daysUntil'] = 0
    
    return {"deadlines": deadlines}

@router.post("")
async def create_deadline(
    deadline_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Create new deadline with automatic D-3 and D-1 alerts
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Validate required fields
    required_fields = ["processNumber", "processTitle", "client", "court", "type", "deadline", "description"]
    for field in required_fields:
        if field not in deadline_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    deadline_id = str(uuid.uuid4())
    
    deadline = {
        "id": deadline_id,
        "processNumber": deadline_data["processNumber"],
        "processTitle": deadline_data["processTitle"],
        "client": deadline_data["client"],
        "court": deadline_data["court"],
        "type": deadline_data["type"],
        "deadline": deadline_data["deadline"],
        "description": deadline_data["description"],
        "responsible": deadline_data.get("responsible", "advogada"),
        "priority": deadline_data.get("priority", "high"),
        "documents": deadline_data.get("documents", []),
        "autoAlerts": deadline_data.get("autoAlerts", True),
        "alerts": {
            "d3": deadline_data.get("alertD3", True),
            "d1": deadline_data.get("alertD1", True)
        },
        "notes": deadline_data.get("notes", ""),
        "completed": False,
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Calculate initial status
    deadline['status'] = calculate_deadline_status(deadline['deadline'], False)
    
    await db.deadlines.insert_one(deadline)
    
    return {
        "message": "Deadline created successfully",
        "deadline_id": deadline_id,
        "status": deadline['status']
    }

@router.patch("/{deadline_id}/complete")
async def complete_deadline(
    deadline_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark deadline as completed
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await db.deadlines.update_one(
        {"id": deadline_id},
        {
            "$set": {
                "completed": True,
                "completed_by": current_user["id"],
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "status": "completed"
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Deadline not found")
    
    return {"message": "Deadline marked as completed"}

@router.get("/{deadline_id}")
async def get_deadline(
    deadline_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get single deadline details
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    deadline = await db.deadlines.find_one({"id": deadline_id}, {"_id": 0})
    
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    
    # Calculate current status
    deadline['status'] = calculate_deadline_status(
        deadline.get('deadline'),
        deadline.get('completed', False)
    )
    
    return deadline

@router.put("/{deadline_id}")
async def update_deadline(
    deadline_id: str,
    deadline_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Update deadline information
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    update_data = {
        **deadline_data,
        "updated_by": current_user["id"],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Recalculate status if deadline date changed
    if "deadline" in deadline_data:
        update_data["status"] = calculate_deadline_status(
            deadline_data["deadline"],
            deadline_data.get("completed", False)
        )
    
    result = await db.deadlines.update_one(
        {"id": deadline_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Deadline not found")
    
    return {"message": "Deadline updated successfully"}

@router.delete("/{deadline_id}")
async def delete_deadline(
    deadline_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete deadline
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await db.deadlines.delete_one({"id": deadline_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deadline not found")
    
    return {"message": "Deadline deleted successfully"}

@router.get("/alerts/upcoming")
async def get_upcoming_alerts(
    current_user: dict = Depends(get_current_user)
):
    """
    Get deadlines with upcoming D-3 and D-1 alerts
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    now = datetime.now(timezone.utc)
    d3_date = now + timedelta(days=3)
    d1_date = now + timedelta(days=1)
    
    # Get D-3 deadlines
    d3_deadlines = await db.deadlines.find({
        "deadline": {
            "$gte": now.isoformat(),
            "$lte": d3_date.isoformat()
        },
        "completed": False,
        "alerts.d3": True
    }, {"_id": 0}).to_list(100)
    
    # Get D-1 deadlines
    d1_deadlines = await db.deadlines.find({
        "deadline": {
            "$gte": now.isoformat(),
            "$lte": d1_date.isoformat()
        },
        "completed": False,
        "alerts.d1": True
    }, {"_id": 0}).to_list(100)
    
    return {
        "d3_alerts": d3_deadlines,
        "d1_alerts": d1_deadlines,
        "total_alerts": len(d3_deadlines) + len(d1_deadlines)
    }
