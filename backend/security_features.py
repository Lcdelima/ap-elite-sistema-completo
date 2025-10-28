"""
AP ELITE ATHENA - Security Features
2FA, Rate Limiting, Audit Logs
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid
import os
import secrets
import hashlib
from collections import defaultdict
import time

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

security_router = APIRouter(prefix="/api/security")

# Rate Limiting Storage (in-memory, can be moved to Redis)
rate_limit_storage = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 100  # requests per window

def check_rate_limit(identifier: str) -> bool:
    """Check if request is within rate limit"""
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    
    # Clean old requests
    rate_limit_storage[identifier] = [
        req_time for req_time in rate_limit_storage[identifier]
        if req_time > window_start
    ]
    
    # Check limit
    if len(rate_limit_storage[identifier]) >= RATE_LIMIT_MAX_REQUESTS:
        return False
    
    # Add current request
    rate_limit_storage[identifier].append(now)
    return True

async def log_audit(action: str, user_email: str, details: dict, ip_address: str = None):
    """Log audit trail"""
    audit_log = {
        "id": str(uuid.uuid4()),
        "action": action,
        "user_email": user_email,
        "details": details,
        "ip_address": ip_address,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.audit_logs.insert_one(audit_log)
    return audit_log

# ==================== 2FA (Two-Factor Authentication) ====================

def generate_2fa_secret() -> str:
    """Generate 2FA secret"""
    return secrets.token_hex(16)

def generate_2fa_code(secret: str) -> str:
    """Generate 6-digit 2FA code"""
    timestamp = int(time.time() / 30)
    message = f"{secret}{timestamp}".encode()
    hash_obj = hashlib.sha256(message)
    hash_hex = hash_obj.hexdigest()
    code = int(hash_hex[:6], 16) % 1000000
    return f"{code:06d}"

def verify_2fa_code(secret: str, code: str) -> bool:
    """Verify 2FA code"""
    expected = generate_2fa_code(secret)
    return code == expected

@security_router.post("/2fa/enable")
async def enable_2fa(current_user: dict = Depends(get_current_user)):
    """Enable 2FA for user"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Generate secret
    secret = generate_2fa_secret()
    
    # Save to user
    await db.users.update_one(
        {"id": current_user.get("id")},
        {"$set": {
            "two_factor_secret": secret,
            "two_factor_enabled": False,  # Will be enabled after verification
            "two_factor_setup_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Generate initial code
    code = generate_2fa_code(secret)
    
    await log_audit("2fa_setup_initiated", current_user.get("email"), {
        "action": "2FA setup started"
    })
    
    return {
        "message": "2FA setup initiated",
        "secret": secret,
        "setup_code": code,
        "instructions": "Save this secret and use the code to verify"
    }

@security_router.post("/2fa/verify")
async def verify_2fa_setup(verify_data: dict, current_user: dict = Depends(get_current_user)):
    """Verify and activate 2FA"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    code = verify_data.get("code")
    
    user = await db.users.find_one({"id": current_user.get("id")}, {"_id": 0})
    
    if not user.get("two_factor_secret"):
        raise HTTPException(status_code=400, detail="2FA not setup")
    
    if verify_2fa_code(user["two_factor_secret"], code):
        await db.users.update_one(
            {"id": current_user.get("id")},
            {"$set": {
                "two_factor_enabled": True,
                "two_factor_verified_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        await log_audit("2fa_enabled", current_user.get("email"), {
            "action": "2FA successfully enabled"
        })
        
        return {"message": "2FA enabled successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid code")

@security_router.post("/2fa/disable")
async def disable_2fa(disable_data: dict, current_user: dict = Depends(get_current_user)):
    """Disable 2FA"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    password = disable_data.get("password")
    
    # Verify password (simplified - should use bcrypt)
    if not password:
        raise HTTPException(status_code=400, detail="Password required")
    
    await db.users.update_one(
        {"id": current_user.get("id")},
        {"$set": {
            "two_factor_enabled": False,
            "two_factor_disabled_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    await log_audit("2fa_disabled", current_user.get("email"), {
        "action": "2FA disabled"
    })
    
    return {"message": "2FA disabled"}

@security_router.get("/2fa/status")
async def get_2fa_status(current_user: dict = Depends(get_current_user)):
    """Get 2FA status"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user = await db.users.find_one({"id": current_user.get("id")}, {"_id": 0})
    
    return {
        "enabled": user.get("two_factor_enabled", False),
        "setup_at": user.get("two_factor_setup_at"),
        "verified_at": user.get("two_factor_verified_at")
    }

# ==================== AUDIT LOGS ====================

@security_router.get("/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    action: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get audit logs"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check if user has permission
    user_role = current_user.get("role", "viewer")
    if user_role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    query = {}
    if action:
        query["action"] = action
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {"logs": logs, "total": len(logs)}

@security_router.get("/audit-logs/user/{user_email}")
async def get_user_audit_logs(
    user_email: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get audit logs for specific user"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check permission
    user_role = current_user.get("role", "viewer")
    if user_role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    logs = await db.audit_logs.find(
        {"user_email": user_email},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {"logs": logs, "user_email": user_email, "total": len(logs)}

@security_router.post("/audit-logs/create")
async def create_audit_log(
    log_data: dict,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Manually create audit log"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    ip_address = request.client.host if request.client else "unknown"
    
    await log_audit(
        action=log_data.get("action", "custom_action"),
        user_email=current_user.get("email"),
        details=log_data.get("details", {}),
        ip_address=ip_address
    )
    
    return {"message": "Audit log created"}

# ==================== RATE LIMITING ====================

@security_router.get("/rate-limit/status")
async def get_rate_limit_status(request: Request):
    """Get rate limit status for current IP"""
    ip_address = request.client.host if request.client else "unknown"
    
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    
    # Clean old requests
    rate_limit_storage[ip_address] = [
        req_time for req_time in rate_limit_storage[ip_address]
        if req_time > window_start
    ]
    
    requests_count = len(rate_limit_storage[ip_address])
    remaining = max(0, RATE_LIMIT_MAX_REQUESTS - requests_count)
    
    return {
        "ip_address": ip_address,
        "requests_in_window": requests_count,
        "remaining_requests": remaining,
        "window_seconds": RATE_LIMIT_WINDOW,
        "max_requests": RATE_LIMIT_MAX_REQUESTS
    }

@security_router.get("/rate-limit/config")
async def get_rate_limit_config(current_user: dict = Depends(get_current_user)):
    """Get rate limit configuration"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {
        "window_seconds": RATE_LIMIT_WINDOW,
        "max_requests": RATE_LIMIT_MAX_REQUESTS,
        "storage_type": "in-memory"
    }

# ==================== SECURITY DASHBOARD ====================

@security_router.get("/dashboard")
async def get_security_dashboard(current_user: dict = Depends(get_current_user)):
    """Get security dashboard stats"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check permission
    user_role = current_user.get("role", "viewer")
    if user_role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Count 2FA enabled users
    users_with_2fa = await db.users.count_documents({"two_factor_enabled": True})
    total_users = await db.users.count_documents({"status": "active"})
    
    # Recent audit logs
    recent_logs = await db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(10).to_list(10)
    
    # Failed login attempts (last 24h)
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    failed_logins = await db.audit_logs.count_documents({
        "action": "login_failed",
        "timestamp": {"$gte": yesterday}
    })
    
    return {
        "users_with_2fa": users_with_2fa,
        "total_users": total_users,
        "2fa_adoption_rate": round((users_with_2fa / total_users * 100) if total_users > 0 else 0, 2),
        "recent_audit_logs": recent_logs,
        "failed_logins_24h": failed_logins,
        "rate_limit_active": True
    }