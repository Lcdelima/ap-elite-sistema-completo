"""Middleware de verificação de entitlements - Elite Athena"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from core.entitlements import EntitlementsService
import re

# Mapeamento de paths para módulos
MODULE_MAPPING = {
    r'^/api/advocacia': 'advocacia',
    r'^/api/pericia': 'pericia',
    r'^/api/admin': 'admin',
    r'^/api/comunicacao': 'comunicacao',
    r'^/api/sala-aula': 'sala-aula',
    r'^/api/diversos': 'diversos',
    r'^/api/osint': 'osint',
    r'^/api/ia': 'ia'
}

# Rotas públicas (sem verificação)
PUBLIC_ROUTES = [
    r'^/api/auth',
    r'^/$',
    r'^/docs',
    r'^/openapi.json'
]


class EntitlementsMiddleware:
    """Middleware para verificar licenças de acesso aos módulos"""
    
    def __init__(self, app, db):
        self.app = app
        self.entitlements_service = EntitlementsService(db)
    
    async def __call__(self, request: Request, call_next):
        # Verificar se é rota pública
        path = request.url.path
        
        for public_pattern in PUBLIC_ROUTES:
            if re.match(public_pattern, path):
                return await call_next(request)
        
        # Extrair módulo do path
        module = self.extract_module(path)
        
        if not module:
            # Rota não mapeada, permitir (pode ser rota legacy)
            return await call_next(request)
        
        # Verificar autenticação
        user = request.state.user if hasattr(request.state, 'user') else None
        
        if not user:
            return JSONResponse(
                status_code=401,
                content={"detail": "Autenticação necessária"}
            )
        
        # Verificar entitlement
        has_access = await self.entitlements_service.check_access(
            user['id'], 
            module
        )
        
        if not has_access:
            return JSONResponse(
                status_code=403,
                content={
                    "detail": f"Módulo '{module}' não disponível no seu plano",
                    "module": module,
                    "upgrade_required": True
                }
            )
        
        # Permitir acesso
        response = await call_next(request)
        return response
    
    def extract_module(self, path: str) -> str:
        """Extrai o nome do módulo do path"""
        for pattern, module in MODULE_MAPPING.items():
            if re.match(pattern, path):
                return module
        return None
