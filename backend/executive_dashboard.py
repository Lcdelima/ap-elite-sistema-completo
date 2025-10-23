"""
AP ELITE - Executive Dashboard Backend
Comprehensive KPIs and metrics for executive decision making
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from datetime import datetime, timezone, timedelta
from typing import Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/athena/dashboard", tags=["Executive Dashboard"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Simple auth dependency (reuse from other modules)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Simple token validation"""
    if not authorization or not authorization.startswith('Bearer '):
        return None
    
    # Extract token and validate with database
    token = authorization.replace('Bearer ', '')
    user = await db.users.find_one({"token": token}, {"_id": 0, "password": 0})
    
    if not user:
        return None
    
    return user

@router.get("/executive")
async def get_executive_dashboard(
    period: str = "month",
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive executive dashboard data
    Periods: week, month, quarter, year
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Calculate date range
    now = datetime.now(timezone.utc)
    
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "quarter":
        start_date = now - timedelta(days=90)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)
    
    # Get financial data
    financial_pipeline = [
        {
            "$match": {
                "date": {
                    "$gte": start_date.isoformat(),
                    "$lte": now.isoformat()
                }
            }
        },
        {
            "$group": {
                "_id": "$type",
                "total": {"$sum": "$amount"}
            }
        }
    ]
    
    financial_results = await db.financial_records.aggregate(financial_pipeline).to_list(100)
    
    revenue = 0
    expenses = 0
    for result in financial_results:
        if result["_id"] == "income":
            revenue = result["total"]
        elif result["_id"] == "expense":
            expenses = result["total"]
    
    # Previous period for comparison
    prev_start = start_date - (now - start_date)
    prev_financial = await db.financial_records.aggregate([
        {"$match": {"date": {"$gte": prev_start.isoformat(), "$lt": start_date.isoformat()}}},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}}
    ]).to_list(100)
    
    prev_revenue = 0
    for result in prev_financial:
        if result["_id"] == "income":
            prev_revenue = result["total"]
    
    # Get cases data
    total_cases = await db.cases.count_documents({})
    active_cases = await db.cases.count_documents({"status": "active"})
    new_cases = await db.cases.count_documents({
        "created_at": {"$gte": start_date.isoformat()}
    })
    completed_cases = await db.cases.count_documents({
        "status": "completed",
        "updated_at": {"$gte": start_date.isoformat()}
    })
    
    # Get clients data
    total_clients = await db.clients.count_documents({})
    new_clients = await db.clients.count_documents({
        "created_at": {"$gte": start_date.isoformat()}
    })
    active_clients = await db.clients.count_documents({"status": "active"})
    
    # Get deadlines data
    upcoming_deadlines = await db.deadlines.count_documents({
        "deadline": {"$gte": now.isoformat()},
        "completed": False
    })
    overdue_deadlines = await db.deadlines.count_documents({
        "deadline": {"$lt": now.isoformat()},
        "completed": False
    })
    completed_deadlines = await db.deadlines.count_documents({
        "completed": True,
        "updated_at": {"$gte": start_date.isoformat()}
    })
    
    # Get interceptions data
    total_interceptions = await db.phone_interceptions.count_documents({})
    critical_interceptions = await db.phone_interceptions.count_documents({
        "relevance": "critical"
    })
    analyzed_interceptions = await db.phone_interceptions.count_documents({
        "transcription": {"$ne": None, "$ne": ""}
    })
    
    # Get documents data
    received_docs = await db.documents.count_documents({
        "status": "received",
        "created_at": {"$gte": start_date.isoformat()}
    })
    pending_docs = await db.documents.count_documents({
        "status": "pending"
    })
    sent_docs = await db.documents.count_documents({
        "status": "sent",
        "created_at": {"$gte": start_date.isoformat()}
    })
    
    # Get payments data
    payments_pipeline = [
        {
            "$match": {
                "created_at": {"$gte": start_date.isoformat()}
            }
        },
        {
            "$group": {
                "_id": "$status",
                "total": {"$sum": "$amount"}
            }
        }
    ]
    
    payments_results = await db.payments.aggregate(payments_pipeline).to_list(100)
    
    received_payments = 0
    pending_payments = 0
    overdue_payments = 0
    
    for result in payments_results:
        if result["_id"] == "received":
            received_payments = result["total"]
        elif result["_id"] == "pending":
            pending_payments = result["total"]
        elif result["_id"] == "overdue":
            overdue_payments = result["total"]
    
    # Calculate team metrics (mock for now)
    team_utilization = 87
    team_tasks = 156
    team_productivity = 92
    
    # Recent activity
    recent_activity = []
    
    # Get recent cases
    recent_cases = await db.cases.find().sort("created_at", -1).limit(2).to_list(2)
    for case in recent_cases:
        recent_activity.append({
            "type": "case",
            "message": f"Novo caso aberto: {case.get('title', 'Sem título')}",
            "time": _format_time_ago(case.get("created_at"))
        })
    
    # Get recent payments
    recent_payment_docs = await db.payments.find({"status": "received"}).sort("created_at", -1).limit(1).to_list(1)
    for payment in recent_payment_docs:
        recent_activity.append({
            "type": "payment",
            "message": f"Pagamento recebido: R$ {payment.get('amount', 0):,.2f}",
            "time": _format_time_ago(payment.get("created_at"))
        })
    
    # Alerts
    alerts = []
    
    if overdue_deadlines > 0:
        alerts.append({
            "type": "critical",
            "message": f"{overdue_deadlines} prazos vencidos pendentes",
            "link": "/athena/deadlines"
        })
    
    if overdue_payments > 0:
        alerts.append({
            "type": "warning",
            "message": f"R$ {overdue_payments:,.2f} em atraso",
            "link": "/athena/financial"
        })
    
    if critical_interceptions > 0:
        alerts.append({
            "type": "info",
            "message": f"{critical_interceptions} interceptações críticas aguardando análise",
            "link": "/athena/phone-interceptions"
        })
    
    return {
        "kpis": {
            "revenue": {
                "current": revenue,
                "previous": prev_revenue,
                "target": 300000
            },
            "cases": {
                "active": active_cases,
                "completed": completed_cases,
                "new": new_cases
            },
            "clients": {
                "total": total_clients,
                "new": new_clients,
                "active": active_clients
            },
            "deadlines": {
                "upcoming": upcoming_deadlines,
                "overdue": overdue_deadlines,
                "completed": completed_deadlines
            },
            "interceptions": {
                "total": total_interceptions,
                "critical": critical_interceptions,
                "analyzed": analyzed_interceptions
            },
            "documents": {
                "received": received_docs,
                "pending": pending_docs,
                "sent": sent_docs
            },
            "payments": {
                "received": received_payments,
                "pending": pending_payments,
                "overdue": overdue_payments
            },
            "team": {
                "utilization": team_utilization,
                "tasks": team_tasks,
                "productivity": team_productivity
            }
        },
        "trends": {
            "revenue": [180000, 210000, 245000, revenue],
            "cases": [total_cases - 10, total_cases - 7, total_cases - 3, total_cases],
            "clients": [total_clients - 15, total_clients - 10, total_clients - 5, total_clients]
        },
        "alerts": alerts,
        "recentActivity": recent_activity[:4]
    }

def _format_time_ago(date_str):
    """Format datetime string to relative time"""
    if not date_str:
        return "há algum tempo"
    
    try:
        date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        diff = now - date
        
        if diff.days > 0:
            return f"há {diff.days} dia(s)"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"há {hours} hora(s)"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"há {minutes} min"
        else:
            return "agora há pouco"
    except:
        return "há algum tempo"
