"""
AP ELITE ATHENA - Backup System
Automated database backups
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional
import uuid
import os
import subprocess
import json
from pathlib import Path

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

backup_router = APIRouter(prefix="/api/backup")

BACKUP_DIR = Path("/app/backend/backups")
BACKUP_DIR.mkdir(exist_ok=True)

@backup_router.post("/create")
async def create_backup(backup_data: dict, current_user: dict = Depends(get_current_user)):
    """Create database backup"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check permission
    user_role = current_user.get("role", "viewer")
    if user_role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    backup_id = str(uuid.uuid4())
    backup_name = backup_data.get("name", f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    
    try:
        # Create backup using mongodump
        backup_path = BACKUP_DIR / backup_id
        backup_path.mkdir(exist_ok=True)
        
        # Execute mongodump
        result = subprocess.run(
            ["mongodump", "--uri", mongo_url, "--out", str(backup_path)],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Mongodump failed: {result.stderr}")
        
        # Get backup size
        backup_size = sum(f.stat().st_size for f in backup_path.rglob('*') if f.is_file())
        
        # Save backup metadata
        backup_metadata = {
            "id": backup_id,
            "name": backup_name,
            "path": str(backup_path),
            "size_bytes": backup_size,
            "size_mb": round(backup_size / (1024 * 1024), 2),
            "created_by": current_user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "completed"
        }
        
        await db.backups.insert_one(backup_metadata)
        
        return {
            "message": "Backup created successfully",
            "backup_id": backup_id,
            "size_mb": backup_metadata["size_mb"]
        }
    
    except Exception as e:
        return {
            "message": "Backup failed",
            "error": str(e)
        }

@backup_router.get("/list")
async def list_backups(current_user: dict = Depends(get_current_user)):
    """List all backups"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check permission
    user_role = current_user.get("role", "viewer")
    if user_role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    backups = await db.backups.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    return {"backups": backups, "total": len(backups)}

@backup_router.post("/restore/{backup_id}")
async def restore_backup(backup_id: str, current_user: dict = Depends(get_current_user)):
    """Restore from backup"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check permission
    user_role = current_user.get("role", "viewer")
    if user_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admin can restore backups")
    
    backup = await db.backups.find_one({"id": backup_id}, {"_id": 0})
    
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    try:
        backup_path = Path(backup["path"])
        
        if not backup_path.exists():
            raise Exception("Backup files not found")
        
        # Execute mongorestore
        result = subprocess.run(
            ["mongorestore", "--uri", mongo_url, "--drop", str(backup_path)],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Mongorestore failed: {result.stderr}")
        
        # Log restore
        await db.restore_logs.insert_one({
            "id": str(uuid.uuid4()),
            "backup_id": backup_id,
            "restored_by": current_user.get("email"),
            "restored_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"message": "Backup restored successfully"}
    
    except Exception as e:
        return {"message": "Restore failed", "error": str(e)}

@backup_router.delete("/{backup_id}")
async def delete_backup(backup_id: str, current_user: dict = Depends(get_current_user)):
    """Delete backup"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check permission
    user_role = current_user.get("role", "viewer")
    if user_role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    backup = await db.backups.find_one({"id": backup_id}, {"_id": 0})
    
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    try:
        # Delete backup files
        backup_path = Path(backup["path"])
        if backup_path.exists():
            import shutil
            shutil.rmtree(backup_path)
        
        # Delete metadata
        await db.backups.delete_one({"id": backup_id})
        
        return {"message": "Backup deleted successfully"}
    
    except Exception as e:
        return {"message": "Delete failed", "error": str(e)}

@backup_router.get("/stats")
async def get_backup_stats(current_user: dict = Depends(get_current_user)):
    """Get backup statistics"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check permission
    user_role = current_user.get("role", "viewer")
    if user_role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    total_backups = await db.backups.count_documents({})
    
    backups = await db.backups.find({}, {"_id": 0, "size_bytes": 1}).to_list(1000)
    total_size = sum(b.get("size_bytes", 0) for b in backups)
    
    latest_backup = await db.backups.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
    
    return {
        "total_backups": total_backups,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "latest_backup": latest_backup
    }