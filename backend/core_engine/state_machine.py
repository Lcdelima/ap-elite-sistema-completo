"""
STATE MACHINE UNIVERSAL
Todos os módulos seguem estes estados
"""

from enum import Enum
from typing import Dict, List, Optional
from datetime import datetime, timezone
import json


class UniversalState(str, Enum):
    """Estados universais para TODOS os módulos"""
    CREATED = "created"
    VALIDATING_INPUT = "validating_input"
    INPUT_VALID = "input_valid"
    INITIALIZED = "initialized"
    RUNNING = "running"
    PROCESSING = "processing"
    GENERATING_OUTPUT = "generating_output"
    VALIDATING_OUTPUT = "validating_output"
    COMPLETED = "completed"
    FAILED = "failed"
    ABORTED = "aborted"
    WAITING_DEPENDENCY = "waiting_dependency"


class StateMachine:
    """Máquina de estados para processos"""
    
    VALID_TRANSITIONS = {
        UniversalState.CREATED: [UniversalState.VALIDATING_INPUT, UniversalState.FAILED],
        UniversalState.VALIDATING_INPUT: [UniversalState.INPUT_VALID, UniversalState.FAILED],
        UniversalState.INPUT_VALID: [UniversalState.INITIALIZED, UniversalState.FAILED],
        UniversalState.INITIALIZED: [UniversalState.RUNNING, UniversalState.FAILED],
        UniversalState.RUNNING: [UniversalState.PROCESSING, UniversalState.FAILED],
        UniversalState.PROCESSING: [UniversalState.GENERATING_OUTPUT, UniversalState.FAILED],
        UniversalState.GENERATING_OUTPUT: [UniversalState.VALIDATING_OUTPUT, UniversalState.FAILED],
        UniversalState.VALIDATING_OUTPUT: [UniversalState.COMPLETED, UniversalState.FAILED],
        UniversalState.COMPLETED: [],
        UniversalState.FAILED: [],
        UniversalState.ABORTED: []
    }
    
    def __init__(self, initial_state: UniversalState = UniversalState.CREATED):
        self.current_state = initial_state
        self.state_history = [{
            "state": initial_state.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": {}
        }]
    
    def transition(self, new_state: UniversalState, metadata: Optional[Dict] = None) -> bool:
        """Transição de estado com validação"""
        if new_state not in self.VALID_TRANSITIONS.get(self.current_state, []):
            return False
        
        self.current_state = new_state
        self.state_history.append({
            "state": new_state.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {}
        })
        
        return True
    
    def get_state(self) -> str:
        return self.current_state.value
    
    def get_history(self) -> List[Dict]:
        return self.state_history
