"""
Contract Generator Complete - Backend API
Sistema de geração de contratos automatizados
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Router
contracts_router = APIRouter(prefix="/api/athena/contracts", tags=["Contracts"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# Models
class ContractData(BaseModel):
    clientId: str
    contractData: dict

# Endpoints
@contracts_router.post("/generate")
async def generate_contract(data: ContractData):
    """Generate a contract PDF"""
    try:
        # In production, this would generate actual PDF
        # For now, simulate PDF generation
        
        contract_id = str(uuid.uuid4())
        
        # Save contract record
        contract_record = {
            "id": contract_id,
            "clientId": data.clientId,
            "contractData": data.contractData,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "generated"
        }
        
        await db.contracts.insert_one(contract_record)
        
        # In production, return actual PDF blob
        # For now, return success message
        return {
            "message": "Contrato gerado com sucesso",
            "contract_id": contract_id,
            "pdf_url": f"/api/athena/contracts/download/{contract_id}"
        }
    
    except Exception as e:
        print(f"Error generating contract: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@contracts_router.get("")
async def get_contracts():
    """Get all contracts"""
    try:
        contracts = await db.contracts.find().to_list(length=100)
        
        for contract in contracts:
            if '_id' in contract:
                del contract['_id']
        
        return {"contracts": contracts}
    except Exception as e:
        print(f"Error fetching contracts: {e}")
        return {"contracts": []}

@contracts_router.get("/download/{contract_id}")
async def download_contract(contract_id: str):
    """Download contract PDF"""
    try:
        contract = await db.contracts.find_one({"id": contract_id})
        
        if not contract:
            raise HTTPException(status_code=404, detail="Contrato não encontrado")
        
        # In production, return actual PDF file
        # For now, return placeholder
        return {"message": "Download iniciado", "contract_id": contract_id}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error downloading contract: {e}")
        raise HTTPException(status_code=500, detail=str(e))
