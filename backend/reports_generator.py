"""
AP ELITE ATHENA - Gerador de Relatórios (PDF/Excel)
"""

from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional
import uuid
import os
import io

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

reports_router = APIRouter(prefix="/api/reports")

@reports_router.post("/generate/financial")
async def generate_financial_report(
    report_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Generate financial report"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    start_date = report_data.get("start_date")
    end_date = report_data.get("end_date")
    format_type = report_data.get("format", "pdf")  # pdf or excel
    
    # Get financial data
    query = {}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    transactions = await db.financial_records.find(query, {"_id": 0}).to_list(1000)
    
    # Calculate totals
    income = sum(t.get("amount", 0) for t in transactions if t.get("type") in ["income", "fee"])
    expenses = sum(t.get("amount", 0) for t in transactions if t.get("type") in ["expense", "cost"])
    
    report = {
        "id": str(uuid.uuid4()),
        "type": "financial",
        "period": {"start": start_date, "end": end_date},
        "data": {
            "total_income": income,
            "total_expenses": expenses,
            "net": income - expenses,
            "transactions_count": len(transactions),
            "transactions": transactions
        },
        "generated_by": current_user.get("email"),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reports.insert_one(report)
    
    return {
        "message": "Report generated",
        "report_id": report["id"],
        "summary": {
            "income": income,
            "expenses": expenses,
            "net": income - expenses,
            "transactions": len(transactions)
        }
    }

@reports_router.post("/generate/processes")
async def generate_processes_report(
    report_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Generate processes report"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    status_filter = report_data.get("status")
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    processes = await db.legal_processes.find(query, {"_id": 0}).to_list(1000)
    
    report = {
        "id": str(uuid.uuid4()),
        "type": "processes",
        "filters": {"status": status_filter},
        "data": {
            "total": len(processes),
            "by_status": {},
            "processes": processes
        },
        "generated_by": current_user.get("email"),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Count by status
    for process in processes:
        status = process.get("status", "unknown")
        report["data"]["by_status"][status] = report["data"]["by_status"].get(status, 0) + 1
    
    await db.reports.insert_one(report)
    
    return {
        "message": "Report generated",
        "report_id": report["id"],
        "summary": report["data"]
    }

@reports_router.post("/generate/users")
async def generate_users_report(current_user: dict = Depends(get_current_user)):
    """Generate users report"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    
    report = {
        "id": str(uuid.uuid4()),
        "type": "users",
        "data": {
            "total": len(users),
            "by_role": {},
            "by_type": {},
            "users": users
        },
        "generated_by": current_user.get("email"),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Count by role and type
    for user in users:
        role = user.get("role", "unknown")
        user_type = user.get("user_type", "unknown")
        report["data"]["by_role"][role] = report["data"]["by_role"].get(role, 0) + 1
        report["data"]["by_type"][user_type] = report["data"]["by_type"].get(user_type, 0) + 1
    
    await db.reports.insert_one(report)
    
    return {
        "message": "Report generated",
        "report_id": report["id"],
        "summary": {
            "total_users": report["data"]["total"],
            "by_role": report["data"]["by_role"],
            "by_type": report["data"]["by_type"]
        }
    }

@reports_router.get("/list")
async def list_reports(current_user: dict = Depends(get_current_user)):
    """List generated reports"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    reports = await db.reports.find(
        {"generated_by": current_user.get("email")},
        {"_id": 0, "data.transactions": 0, "data.processes": 0, "data.users": 0}
    ).sort("generated_at", -1).limit(50).to_list(50)
    
    return {"reports": reports}

@reports_router.get("/{report_id}")
async def get_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific report"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    report = await db.reports.find_one({"id": report_id}, {"_id": 0})
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"report": report}

@reports_router.delete("/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Delete report"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await db.reports.delete_one({
        "id": report_id,
        "generated_by": current_user.get("email")
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"message": "Report deleted"}