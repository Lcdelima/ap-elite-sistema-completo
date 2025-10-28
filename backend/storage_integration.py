"""
AP ELITE ATHENA - Cloud Storage Integration
Local + Prepared for AWS S3/Azure/GCP
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional
import uuid
import os
import shutil
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

storage_router = APIRouter(prefix="/api/storage")

# Local storage path
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def get_storage_config():
    """Get storage configuration"""
    return {
        "type": os.environ.get("STORAGE_TYPE", "local"),  # local, s3, azure, gcp
        "max_file_size": int(os.environ.get("MAX_FILE_SIZE", "100")) * 1024 * 1024,  # MB to bytes
        "allowed_extensions": os.environ.get("ALLOWED_EXTENSIONS", "pdf,docx,xlsx,jpg,png,mp4,mp3").split(",")
    }

@storage_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    category: str = "general",
    description: str = "",
    current_user: dict = Depends(get_current_user)
):
    """Upload file to storage"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    config = get_storage_config()
    
    # Check file extension
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in config["allowed_extensions"]:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(config['allowed_extensions'])}"
        )
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Save metadata to database
    file_metadata = {
        "id": file_id,
        "original_filename": file.filename,
        "stored_filename": filename,
        "file_path": str(file_path),
        "file_size": file_size,
        "file_type": file_ext,
        "mime_type": file.content_type,
        "category": category,
        "description": description,
        "uploaded_by": current_user.get("email"),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "storage_type": config["type"]
    }
    
    await db.file_storage.insert_one(file_metadata)
    
    return {
        "message": "File uploaded successfully",
        "file_id": file_id,
        "filename": file.filename,
        "size": file_size,
        "url": f"/api/storage/download/{file_id}"
    }

@storage_router.get("/download/{file_id}")
async def download_file(file_id: str, current_user: dict = Depends(get_current_user)):
    """Download file from storage"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get file metadata
    file_metadata = await db.file_storage.find_one({"id": file_id}, {"_id": 0})
    
    if not file_metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = Path(file_metadata["file_path"])
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return {
        "file_id": file_id,
        "filename": file_metadata["original_filename"],
        "file_path": str(file_path),
        "download_url": f"/api/storage/files/{file_id}"
    }

@storage_router.get("/list")
async def list_files(
    category: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """List uploaded files"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {}
    if category:
        query["category"] = category
    
    files = await db.file_storage.find(query, {"_id": 0}).sort("uploaded_at", -1).limit(limit).to_list(limit)
    
    return {"files": files, "total": len(files)}

@storage_router.delete("/{file_id}")
async def delete_file(file_id: str, current_user: dict = Depends(get_current_user)):
    """Delete file from storage"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get file metadata
    file_metadata = await db.file_storage.find_one({"id": file_id}, {"_id": 0})
    
    if not file_metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete physical file
    file_path = Path(file_metadata["file_path"])
    if file_path.exists():
        os.remove(file_path)
    
    # Delete metadata
    await db.file_storage.delete_one({"id": file_id})
    
    return {"message": "File deleted successfully"}

@storage_router.get("/stats")
async def get_storage_stats(current_user: dict = Depends(get_current_user)):
    """Get storage statistics"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    total_files = await db.file_storage.count_documents({})
    
    # Calculate total size
    files = await db.file_storage.find({}, {"_id": 0, "file_size": 1}).to_list(10000)
    total_size = sum(f.get("file_size", 0) for f in files)
    
    # Count by category
    categories = await db.file_storage.distinct("category")
    by_category = {}
    for cat in categories:
        count = await db.file_storage.count_documents({"category": cat})
        by_category[cat] = count
    
    return {
        "total_files": total_files,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "by_category": by_category
    }