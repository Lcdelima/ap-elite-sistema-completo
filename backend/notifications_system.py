"""
AP ELITE ATHENA - Sistema de Notificações em Tempo Real
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
import uuid
import os

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client.ap_elite

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "status": "active"}, {"_id": 0, "password": 0})
        return user
    except:
        return None

notifications_router = APIRouter(prefix="/api")

@notifications_router.post("/notifications/create")
async def create_notification(notif_data: dict, current_user: dict = Depends(get_current_user)):
    """Create new notification"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": notif_data.get("user_id"),
        "title": notif_data.get("title"),
        "message": notif_data.get("message"),
        "type": notif_data.get("type", "info"),  # info, warning, error, success
        "link": notif_data.get("link", ""),
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notifications.insert_one(notification)
    return {"message": "Notification created", "notification_id": notification["id"]}

@notifications_router.get("/notifications/list")
async def list_notifications(
    read: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    """List user notifications"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {"user_id": current_user.get("id")}
    if read is not None:
        query["read"] = read
    
    notifications = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    
    return {"notifications": notifications}

@notifications_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark notification as read"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.get("id")},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@notifications_router.put("/notifications/mark-all-read")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    await db.notifications.update_many(
        {"user_id": current_user.get("id"), "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "All notifications marked as read"}

@notifications_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Delete notification"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await db.notifications.delete_one({
        "id": notification_id,
        "user_id": current_user.get("id")
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification deleted"}

@notifications_router.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get unread notifications count"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    count = await db.notifications.count_documents({
        "user_id": current_user.get("id"),
        "read": False
    })
    
    return {"unread_count": count}