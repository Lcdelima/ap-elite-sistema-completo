"""
AP ELITE - Sistema Híbrido de Sincronização Online/Offline
Autor: Sistema Elite Athena
Data: 2025

Este módulo implementa sincronização bidirecional entre:
- SQLite Local (Offline)
- MongoDB Nuvem (Online)
"""

import os
import sqlite3
import asyncio
import json
import aiofiles
import aiosqlite
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
import psutil
import platform
import shutil
import hashlib

# Configuração do Router
hybrid_router = APIRouter(prefix="/api/hybrid")

# Configuração de Paths
if platform.system() == "Windows":
    LOCAL_DATA_PATH = Path("C:/AP_Elite")
else:
    LOCAL_DATA_PATH = Path.home() / "AP_Elite"

LOCAL_DB_PATH = LOCAL_DATA_PATH / "dados" / "ap_elite_local.db"
BACKUP_PATH = LOCAL_DATA_PATH / "backup"
CONFIG_PATH = LOCAL_DATA_PATH / "config" / "sync_config.json"
LOG_PATH = LOCAL_DATA_PATH / "logs" / "sync.log"

# Criar diretórios se não existirem
for path in [LOCAL_DATA_PATH / "dados", BACKUP_PATH, LOCAL_DATA_PATH / "config", LOCAL_DATA_PATH / "logs"]:
    path.mkdir(parents=True, exist_ok=True)

class HybridSyncManager:
    def __init__(self):
        self.mongo_client = None
        self.mongo_db = None
        self.sqlite_db = None
        self.is_online = False
        self.last_sync = None
        self.sync_running = False
        
    async def initialize(self):
        """Inicializar sistema híbrido"""
        try:
            # Configurar MongoDB (nuvem)
            mongo_url = os.environ.get('MONGO_URL')
            if mongo_url:
                self.mongo_client = AsyncIOMotorClient(mongo_url)
                self.mongo_db = self.mongo_client[os.environ.get('DB_NAME', 'ap_elite')]
                self.is_online = await self.check_connection()
            
            # Configurar SQLite (local)
            await self.setup_local_database()
            
            # Carregar configurações
            await self.load_config()
            
            self.log("Sistema híbrido inicializado com sucesso")
            return True
            
        except Exception as e:
            self.log(f"Erro ao inicializar sistema híbrido: {str(e)}", "ERROR")
            return False
    
    async def setup_local_database(self):
        """Configurar banco SQLite local"""
        async with aiosqlite.connect(LOCAL_DB_PATH) as db:
            # Tabelas principais
            await db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    role TEXT,
                    active BOOLEAN,
                    created_at TEXT,
                    updated_at TEXT,
                    last_sync TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS cases (
                    id TEXT PRIMARY KEY,
                    case_number TEXT,
                    title TEXT,
                    description TEXT,
                    status TEXT,
                    client_id TEXT,
                    assigned_to TEXT,
                    start_date TEXT,
                    completion_date TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    last_sync TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS clients_enhanced (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    phone TEXT,
                    cpf TEXT,
                    rg TEXT,
                    address TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    last_sync TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS evidence (
                    id TEXT PRIMARY KEY,
                    case_id TEXT,
                    evidence_number TEXT,
                    name TEXT,
                    type TEXT,
                    description TEXT,
                    file_path TEXT,
                    hash_value TEXT,
                    analysis_status TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    last_sync TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS financial_records (
                    id TEXT PRIMARY KEY,
                    type TEXT,
                    amount REAL,
                    description TEXT,
                    category TEXT,
                    date TEXT,
                    case_id TEXT,
                    client_id TEXT,
                    created_by TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    last_sync TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS sync_status (
                    table_name TEXT PRIMARY KEY,
                    last_sync TEXT,
                    sync_count INTEGER DEFAULT 0,
                    last_error TEXT,
                    status TEXT DEFAULT 'ok'
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS sync_conflicts (
                    id TEXT PRIMARY KEY,
                    table_name TEXT,
                    record_id TEXT,
                    local_data TEXT,
                    remote_data TEXT,
                    conflict_type TEXT,
                    resolved BOOLEAN DEFAULT FALSE,
                    created_at TEXT
                )
            """)
            
            await db.commit()
    
    async def check_connection(self):
        """Verificar conexão com MongoDB"""
        try:
            if self.mongo_client:
                await self.mongo_client.admin.command('ping')
                return True
            return False
        except:
            return False
    
    def log(self, message: str, level: str = "INFO"):
        """Sistema de log"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}\n"
        
        try:
            with open(LOG_PATH, "a", encoding="utf-8") as f:
                f.write(log_entry)
        except:
            pass
        
        print(f"HYBRID {level}: {message}")
    
    async def load_config(self):
        """Carregar configurações"""
        default_config = {
            "sync_interval_minutes": 5,
            "backup_time": "23:00",
            "auto_backup": True,
            "auto_sync": True,
            "conflict_resolution": "newest_wins",
            "max_backup_files": 30
        }
        
        try:
            if CONFIG_PATH.exists():
                async with aiofiles.open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    self.config = json.loads(content)
            else:
                self.config = default_config
                await self.save_config()
        except:
            self.config = default_config
    
    async def save_config(self):
        """Salvar configurações"""
        try:
            async with aiofiles.open(CONFIG_PATH, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(self.config, indent=2))
        except Exception as e:
            self.log(f"Erro ao salvar config: {str(e)}", "ERROR")
    
    async def sync_table_to_local(self, table_name: str):
        """Sincronizar tabela do MongoDB para SQLite"""
        try:
            if not self.is_online:
                return False
            
            # Buscar dados do MongoDB
            mongo_collection = self.mongo_db[table_name]
            cursor = mongo_collection.find({}, {"_id": 0})
            remote_data = await cursor.to_list(length=None)
            
            if not remote_data:
                return True
            
            async with aiosqlite.connect(LOCAL_DB_PATH) as db:
                for record in remote_data:
                    # Verificar se registro já existe localmente
                    async with db.execute(f"SELECT last_sync FROM {table_name} WHERE id = ?", (record['id'],)) as cursor:
                        local_record = await cursor.fetchone()
                    
                    record['last_sync'] = datetime.now(timezone.utc).isoformat()
                    
                    if local_record:
                        # Atualizar registro existente
                        columns = ', '.join([f"{k} = ?" for k in record.keys()])
                        await db.execute(f"UPDATE {table_name} SET {columns} WHERE id = ?", 
                                       list(record.values()) + [record['id']])
                    else:
                        # Inserir novo registro
                        placeholders = ', '.join(['?' for _ in record.keys()])
                        columns = ', '.join(record.keys())
                        await db.execute(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})", 
                                       list(record.values()))
                
                await db.commit()
            
            # Atualizar status de sincronização
            await self.update_sync_status(table_name, len(remote_data))
            return True
            
        except Exception as e:
            self.log(f"Erro ao sincronizar {table_name} para local: {str(e)}", "ERROR")
            return False
    
    async def sync_table_to_remote(self, table_name: str):
        """Sincronizar tabela do SQLite para MongoDB"""
        try:
            if not self.is_online:
                return False
            
            async with aiosqlite.connect(LOCAL_DB_PATH) as db:
                async with db.execute(f"SELECT * FROM {table_name}") as cursor:
                    local_records = await cursor.fetchall()
                
                if not local_records:
                    return True
                
                # Obter nomes das colunas
                columns = [description[0] for description in cursor.description]
                
                mongo_collection = self.mongo_db[table_name]
                
                for record_tuple in local_records:
                    record = dict(zip(columns, record_tuple))
                    
                    # Remover last_sync antes de enviar
                    record.pop('last_sync', None)
                    
                    # Verificar se existe no MongoDB
                    existing = await mongo_collection.find_one({"id": record['id']})
                    
                    if existing:
                        # Atualizar no MongoDB
                        await mongo_collection.update_one(
                            {"id": record['id']},
                            {"$set": record}
                        )
                    else:
                        # Inserir no MongoDB
                        await mongo_collection.insert_one(record)
            
            return True
            
        except Exception as e:
            self.log(f"Erro ao sincronizar {table_name} para remoto: {str(e)}", "ERROR")
            return False
    
    async def update_sync_status(self, table_name: str, record_count: int):
        """Atualizar status de sincronização"""
        try:
            async with aiosqlite.connect(LOCAL_DB_PATH) as db:
                await db.execute("""
                    INSERT OR REPLACE INTO sync_status 
                    (table_name, last_sync, sync_count, status) 
                    VALUES (?, ?, ?, 'ok')
                """, (table_name, datetime.now(timezone.utc).isoformat(), record_count))
                await db.commit()
        except Exception as e:
            self.log(f"Erro ao atualizar sync status: {str(e)}", "ERROR")
    
    async def full_sync(self):
        """Sincronização completa bidirecional"""
        if self.sync_running:
            return {"status": "already_running"}
        
        self.sync_running = True
        sync_results = {}
        
        try:
            self.is_online = await self.check_connection()
            
            if not self.is_online:
                self.log("Sistema offline - sincronização adiada")
                return {"status": "offline", "message": "Sistema funcionando offline"}
            
            # Tabelas para sincronizar
            tables = ["users", "cases", "clients_enhanced", "evidence", "financial_records"]
            
            self.log("Iniciando sincronização completa...")
            
            for table in tables:
                # Sincronizar do remoto para local
                remote_to_local = await self.sync_table_to_local(table)
                
                # Sincronizar do local para remoto
                local_to_remote = await self.sync_table_to_remote(table)
                
                sync_results[table] = {
                    "remote_to_local": remote_to_local,
                    "local_to_remote": local_to_remote,
                    "status": "success" if remote_to_local and local_to_remote else "partial"
                }
            
            self.last_sync = datetime.now(timezone.utc)
            self.log(f"Sincronização completa finalizada: {sync_results}")
            
            return {
                "status": "success",
                "last_sync": self.last_sync.isoformat(),
                "results": sync_results
            }
            
        except Exception as e:
            self.log(f"Erro na sincronização completa: {str(e)}", "ERROR")
            return {"status": "error", "message": str(e)}
        
        finally:
            self.sync_running = False
    
    async def create_backup(self):
        """Criar backup dos dados locais"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = BACKUP_PATH / f"ap_elite_backup_{timestamp}.db"
            
            # Copiar banco SQLite
            shutil.copy2(LOCAL_DB_PATH, backup_file)
            
            # Manter apenas os últimos backups
            backup_files = list(BACKUP_PATH.glob("ap_elite_backup_*.db"))
            backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            max_backups = self.config.get("max_backup_files", 30)
            for old_backup in backup_files[max_backups:]:
                old_backup.unlink()
            
            self.log(f"Backup criado: {backup_file.name}")
            
            return {
                "status": "success",
                "backup_file": str(backup_file),
                "timestamp": timestamp,
                "size": backup_file.stat().st_size
            }
            
        except Exception as e:
            self.log(f"Erro ao criar backup: {str(e)}", "ERROR")
            return {"status": "error", "message": str(e)}
    
    async def get_system_status(self):
        """Obter status do sistema híbrido"""
        try:
            # Verificar conexão
            self.is_online = await self.check_connection()
            
            # Status do disco
            disk_usage = psutil.disk_usage(str(LOCAL_DATA_PATH))
            
            # Contadores de registros
            async with aiosqlite.connect(LOCAL_DB_PATH) as db:
                counts = {}
                tables = ["users", "cases", "clients_enhanced", "evidence", "financial_records"]
                
                for table in tables:
                    async with db.execute(f"SELECT COUNT(*) FROM {table}") as cursor:
                        count = await cursor.fetchone()
                        counts[table] = count[0] if count else 0
                
                # Status de sincronização
                async with db.execute("SELECT * FROM sync_status") as cursor:
                    sync_status = await cursor.fetchall()
            
            # Arquivos de backup
            backup_files = list(BACKUP_PATH.glob("ap_elite_backup_*.db"))
            
            return {
                "online_status": self.is_online,
                "last_sync": self.last_sync.isoformat() if self.last_sync else None,
                "sync_running": self.sync_running,
                "local_data_path": str(LOCAL_DATA_PATH),
                "database_size": LOCAL_DB_PATH.stat().st_size if LOCAL_DB_PATH.exists() else 0,
                "disk_space": {
                    "total": disk_usage.total,
                    "used": disk_usage.used,
                    "free": disk_usage.free,
                    "percent": disk_usage.percent
                },
                "record_counts": counts,
                "sync_status": [dict(zip(["table_name", "last_sync", "sync_count", "last_error", "status"], row)) for row in sync_status],
                "backup_count": len(backup_files),
                "config": self.config
            }
            
        except Exception as e:
            self.log(f"Erro ao obter status: {str(e)}", "ERROR")
            return {"status": "error", "message": str(e)}

# Instância global do gerenciador
sync_manager = HybridSyncManager()

# ==================== ENDPOINTS DA API ====================

@hybrid_router.get("/status")
async def get_hybrid_status():
    """Obter status do sistema híbrido"""
    return await sync_manager.get_system_status()

@hybrid_router.post("/sync")
async def manual_sync(background_tasks: BackgroundTasks):
    """Sincronização manual"""
    background_tasks.add_task(sync_manager.full_sync)
    return {"message": "Sincronização iniciada", "status": "running"}

@hybrid_router.post("/backup")
async def create_backup():
    """Criar backup manual"""
    return await sync_manager.create_backup()

@hybrid_router.get("/backups")
async def list_backups():
    """Listar backups disponíveis"""
    try:
        backup_files = []
        for backup_file in BACKUP_PATH.glob("ap_elite_backup_*.db"):
            stat = backup_file.stat()
            backup_files.append({
                "filename": backup_file.name,
                "path": str(backup_file),
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
        
        backup_files.sort(key=lambda x: x['created'], reverse=True)
        return {"backups": backup_files}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@hybrid_router.put("/config")
async def update_config(config_data: dict):
    """Atualizar configurações"""
    try:
        sync_manager.config.update(config_data)
        await sync_manager.save_config()
        return {"message": "Configurações atualizadas", "config": sync_manager.config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@hybrid_router.get("/local-data/{table_name}")
async def get_local_data(table_name: str, limit: int = 100):
    """Obter dados locais de uma tabela"""
    try:
        async with aiosqlite.connect(LOCAL_DB_PATH) as db:
            async with db.execute(f"SELECT * FROM {table_name} LIMIT ?", (limit,)) as cursor:
                records = await cursor.fetchall()
                columns = [description[0] for description in cursor.description]
        
        data = [dict(zip(columns, record)) for record in records]
        return {"table": table_name, "count": len(data), "data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@hybrid_router.delete("/local-data")
async def clear_local_data():
    """Limpar dados locais (CUIDADO!)"""
    try:
        # Criar backup antes de limpar
        backup_result = await sync_manager.create_backup()
        
        # Limpar banco SQLite
        async with aiosqlite.connect(LOCAL_DB_PATH) as db:
            tables = ["users", "cases", "clients_enhanced", "evidence", "financial_records", "sync_status", "sync_conflicts"]
            for table in tables:
                await db.execute(f"DELETE FROM {table}")
            await db.commit()
        
        sync_manager.log("Dados locais limpos - backup criado automaticamente")
        
        return {
            "message": "Dados locais limpos com sucesso",
            "backup_created": backup_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TAREFAS AUTOMÁTICAS ====================

async def auto_sync_task():
    """Tarefa automática de sincronização"""
    while True:
        try:
            if sync_manager.config.get("auto_sync", True) and not sync_manager.sync_running:
                await sync_manager.full_sync()
            
            # Aguardar intervalo configurado
            interval = sync_manager.config.get("sync_interval_minutes", 5)
            await asyncio.sleep(interval * 60)
            
        except Exception as e:
            sync_manager.log(f"Erro na sincronização automática: {str(e)}", "ERROR")
            await asyncio.sleep(60)  # Aguardar 1 minuto em caso de erro

async def auto_backup_task():
    """Tarefa automática de backup"""
    while True:
        try:
            if sync_manager.config.get("auto_backup", True):
                now = datetime.now()
                backup_time = sync_manager.config.get("backup_time", "23:00")
                backup_hour, backup_minute = map(int, backup_time.split(":"))
                
                if now.hour == backup_hour and now.minute == backup_minute:
                    await sync_manager.create_backup()
                    await asyncio.sleep(60)  # Evitar múltiplos backups no mesmo minuto
            
            await asyncio.sleep(30)  # Verificar a cada 30 segundos
            
        except Exception as e:
            sync_manager.log(f"Erro no backup automático: {str(e)}", "ERROR")
            await asyncio.sleep(300)  # Aguardar 5 minutos em caso de erro

# Inicializar sistema na importação
asyncio.create_task(sync_manager.initialize())