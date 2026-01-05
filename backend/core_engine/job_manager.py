"""
JOB MANAGER - Gerenciador de Jobs Reais
TODO clique no frontend = JOB com execução real
"""

import uuid
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from pathlib import Path
import json

from core_engine.state_machine import StateMachine, UniversalState
from core_engine.logger_forense import ForensicLogger


class Job:
    """Job executável"""
    
    def __init__(self, module_path: str, input_data: Dict, operator: str):
        self.id = str(uuid.uuid4())
        self.module_path = module_path
        self.input_data = input_data
        self.operator = operator
        
        self.state_machine = StateMachine()
        self.logger = ForensicLogger(module_path, self.id)
        
        self.output = None
        self.error = None
        self.created_at = datetime.now(timezone.utc)
        self.started_at = None
        self.completed_at = None
        
        self.logger.log("JOB_CREATED", {
            "module": module_path,
            "operator": operator,
            "input_summary": str(input_data)[:200]
        })
    
    def get_status(self) -> Dict:
        """Status atual do job"""
        return {
            "id": self.id,
            "module": self.module_path,
            "state": self.state_machine.get_state(),
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "output": self.output,
            "error": str(self.error) if self.error else None
        }


class JobManager:
    """Gerenciador central de jobs"""
    
    def __init__(self):
        self.jobs: Dict[str, Job] = {}
        self.jobs_dir = Path("/app/backend/evidence/jobs")
        self.jobs_dir.mkdir(exist_ok=True, parents=True)
    
    def create_job(self, module_path: str, input_data: Dict, operator: str = "system") -> str:
        """CRIA JOB COM ID ÚNICO"""
        job = Job(module_path, input_data, operator)
        self.jobs[job.id] = job
        
        # Salva job no disco
        self._save_job(job)
        
        return job.id
    
    async def execute_job(self, job_id: str) -> Dict:
        """EXECUTA JOB REAL"""
        job = self.jobs.get(job_id)
        if not job:
            raise ValueError(f"Job {job_id} não encontrado")
        
        job.started_at = datetime.now(timezone.utc)
        
        # Transição: CREATED -> VALIDATING_INPUT
        job.state_machine.transition(UniversalState.VALIDATING_INPUT)
        job.logger.log_state_change("CREATED", "VALIDATING_INPUT")
        
        try:
            # VALIDAR INPUT
            if not self._validate_input(job.input_data):
                raise ValueError("Input inválido")
            
            job.state_machine.transition(UniversalState.INPUT_VALID)
            job.state_machine.transition(UniversalState.INITIALIZED)
            job.state_machine.transition(UniversalState.RUNNING)
            
            job.logger.log("EXECUTION_STARTED", {"module": job.module_path})
            
            # EXECUTAR MOTOR DO MÓDULO
            result = await self._execute_module_engine(job)
            
            job.state_machine.transition(UniversalState.GENERATING_OUTPUT)
            job.output = result
            
            job.state_machine.transition(UniversalState.VALIDATING_OUTPUT)
            job.state_machine.transition(UniversalState.COMPLETED)
            
            job.completed_at = datetime.now(timezone.utc)
            job.logger.log("JOB_COMPLETED", {"output_summary": str(result)[:200]})
            
        except Exception as e:
            job.state_machine.transition(UniversalState.FAILED)
            job.error = e
            job.logger.log_error(e, {"job_id": job_id})
        
        # Atualiza job no disco
        self._save_job(job)
        
        return job.get_status()
    
    async def _execute_module_engine(self, job: Job) -> Dict:
        """CHAMA MOTOR REAL DO MÓDULO"""
        try:
            # Importa dinamicamente o engine do módulo
            module_parts = job.module_path.split('/')
            module_import_path = f"athena_modules.{'.'.join(module_parts)}.engine"
            
            from importlib import import_module
            module_engine = import_module(module_import_path)
            
            # Executa motor
            result = await module_engine.execute(job.input_data, job.logger)
            
            return result
            
        except ImportError as e:
            # Módulo ainda não tem engine - retorna mock
            job.logger.log("ENGINE_NOT_FOUND", {
                "module": job.module_path,
                "error": str(e),
                "fallback": "mock_execution"
            }, level="WARNING")
            
            return {
                "status": "MOCK_EXECUTION",
                "message": f"Motor {job.module_path} ainda não implementado",
                "data": {}
            }
    
    def _validate_input(self, input_data: Dict) -> bool:
        """Valida dados de entrada"""
        return isinstance(input_data, dict)
    
    def _save_job(self, job: Job):
        """Salva job no disco"""
        job_file = self.jobs_dir / f"{job.id}.json"
        with open(job_file, 'w') as f:
            json.dump(job.get_status(), f, indent=2, default=str)
    
    def get_job(self, job_id: str) -> Optional[Job]:
        """Obtém job por ID"""
        return self.jobs.get(job_id)
    
    def list_jobs(self, module_path: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Lista jobs"""
        jobs_list = list(self.jobs.values())
        
        if module_path:
            jobs_list = [j for j in jobs_list if j.module_path == module_path]
        
        return [j.get_status() for j in jobs_list[:limit]]
