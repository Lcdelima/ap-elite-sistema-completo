"""
AP ELITE ATHENA - User Management & Permissions System
Sistema completo de gerenciamento de usuários com permissões por níveis
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
import uuid
import bcrypt
import os

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client.ap_elite

# Security
security = HTTPBearer()

# Auth dependency
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

user_router = APIRouter(prefix="/api")

# User Roles and Permissions
USER_ROLES = {
    "super_admin": {
        "name": "Super Administrador",
        "level": 10,
        "permissions": ["all"]
    },
    "admin": {
        "name": "Administrador",
        "level": 8,
        "permissions": ["manage_users", "manage_clients", "manage_cases", "view_reports", "manage_financial"]
    },
    "manager": {
        "name": "Gerente",
        "level": 6,
        "permissions": ["manage_clients", "manage_cases", "view_reports"]
    },
    "lawyer": {
        "name": "Advogado",
        "level": 5,
        "permissions": ["manage_cases", "view_clients", "create_documents"]
    },
    "analyst": {
        "name": "Analista",
        "level": 4,
        "permissions": ["view_cases", "view_clients", "create_reports"]
    },
    "client": {
        "name": "Cliente",
        "level": 2,
        "permissions": ["view_own_cases", "view_own_documents"]
    },
    "viewer": {
        "name": "Visualizador",
        "level": 1,
        "permissions": ["view_dashboard"]
    }
}

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def check_permission(current_user: dict, required_permission: str) -> bool:
    """Check if user has required permission"""
    user_role = current_user.get("role", "viewer")
    role_permissions = USER_ROLES.get(user_role, {}).get("permissions", [])
    
    if "all" in role_permissions:
        return True
    
    return required_permission in role_permissions


# ==================== USER MANAGEMENT ENDPOINTS ====================

@user_router.post("/users/create")
async def create_user(user_data: dict, current_user: dict = Depends(get_current_user)):
    """Create new user (employee or client)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check if current user has permission
    if not check_permission(current_user, "manage_users"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Validate required fields
    required_fields = ["email", "password", "name", "role", "user_type"]
    for field in required_fields:
        if field not in user_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Validate role
    if user_data["role"] not in USER_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Hash password
    hashed_password = hash_password(user_data["password"])
    
    # Create user
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user_data["email"],
        "password": hashed_password,
        "name": user_data["name"],
        "role": user_data["role"],
        "user_type": user_data["user_type"],  # "employee" or "client"
        "phone": user_data.get("phone", ""),
        "cpf": user_data.get("cpf", ""),
        "department": user_data.get("department", ""),
        "status": "active",
        "created_by": current_user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
        "metadata": user_data.get("metadata", {})
    }
    
    await db.users.insert_one(new_user)
    
    # Remove password from response
    new_user.pop("password")
    
    return {"message": "User created successfully", "user": new_user}


@user_router.get("/users/list")
async def list_users(
    user_type: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all users with filters"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check permission - allow admins and super_admins
    user_role = current_user.get("role", "client")
    if user_role not in ["administrator", "super_admin", "admin"] and not check_permission(current_user, "manage_users"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Build filter query
    filter_query = {}
    if user_type:
        filter_query["user_type"] = user_type
    if role:
        filter_query["role"] = role
    if status:
        filter_query["status"] = status
    
    # Get users
    users = await db.users.find(filter_query, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(500)
    
    return {"users": users, "total": len(users)}


@user_router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get user details"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Users can view their own profile or admins can view any profile
    if user_id != current_user.get("id") and not check_permission(current_user, "manage_users"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"user": user}


@user_router.put("/users/{user_id}")
async def update_user(user_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update user information"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Users can update their own profile or admins can update any profile
    is_self_update = user_id == current_user.get("id")
    has_admin_permission = check_permission(current_user, "manage_users")
    
    if not is_self_update and not has_admin_permission:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Don't allow users to change their own role
    if is_self_update and "role" in update_data:
        raise HTTPException(status_code=403, detail="Cannot change your own role")
    
    # Handle password change
    if "password" in update_data:
        update_data["password"] = hash_password(update_data["password"])
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or no changes made")
    
    # Get updated user
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    
    return {"message": "User updated successfully", "user": user}


@user_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Delete user (soft delete - change status to inactive)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not check_permission(current_user, "manage_users"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Cannot delete yourself
    if user_id == current_user.get("id"):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "status": "inactive",
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("email")
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deactivated successfully"}


@user_router.post("/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, password_data: dict, current_user: dict = Depends(get_current_user)):
    """Reset user password"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not check_permission(current_user, "manage_users"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    new_password = password_data.get("new_password")
    if not new_password:
        raise HTTPException(status_code=400, detail="New password required")
    
    hashed_password = hash_password(new_password)
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "password": hashed_password,
            "password_reset_at": datetime.now(timezone.utc).isoformat(),
            "password_reset_by": current_user.get("email")
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Password reset successfully"}


@user_router.get("/users/roles/list")
async def list_roles(current_user: dict = Depends(get_current_user)):
    """Get list of available roles and their permissions"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {"roles": USER_ROLES}


@user_router.get("/users/stats/summary")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Get user statistics"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not check_permission(current_user, "manage_users"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"status": "active"})
    employees = await db.users.count_documents({"user_type": "employee"})
    clients = await db.users.count_documents({"user_type": "client"})
    
    # Count by role
    role_counts = {}
    for role in USER_ROLES.keys():
        count = await db.users.count_documents({"role": role})
        role_counts[role] = count
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "employees": employees,
        "clients": clients,
        "by_role": role_counts
    }


@user_router.post("/users/bulk-create")
async def bulk_create_users(users_data: dict, current_user: dict = Depends(get_current_user)):
    """Create multiple users at once"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not check_permission(current_user, "manage_users"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    users_list = users_data.get("users", [])
    if not users_list:
        raise HTTPException(status_code=400, detail="No users provided")
    
    created_users = []
    errors = []
    
    for user_data in users_list:
        try:
            # Check required fields
            if not all(k in user_data for k in ["email", "password", "name", "role", "user_type"]):
                errors.append({"email": user_data.get("email", "unknown"), "error": "Missing required fields"})
                continue
            
            # Check if exists
            exists = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
            if exists:
                errors.append({"email": user_data["email"], "error": "User already exists"})
                continue
            
            # Create user
            new_user = {
                "id": str(uuid.uuid4()),
                "email": user_data["email"],
                "password": hash_password(user_data["password"]),
                "name": user_data["name"],
                "role": user_data["role"],
                "user_type": user_data["user_type"],
                "phone": user_data.get("phone", ""),
                "cpf": user_data.get("cpf", ""),
                "department": user_data.get("department", ""),
                "status": "active",
                "created_by": current_user.get("email"),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_login": None
            }
            
            await db.users.insert_one(new_user)
            new_user.pop("password")
            created_users.append(new_user)
            
        except Exception as e:
            errors.append({"email": user_data.get("email", "unknown"), "error": str(e)})
    
    return {
        "message": f"Bulk creation completed",
        "created": len(created_users),
        "errors": len(errors),
        "users": created_users,
        "error_details": errors
    }
