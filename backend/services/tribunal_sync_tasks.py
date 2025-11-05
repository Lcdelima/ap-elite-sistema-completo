"""Celery Tasks para Sync Judicial - Elite Athena"""
from jobs.celery_app import app
from services.tribunal_adapters import AdapterFactory
import hashlib
from datetime import datetime, timezone


@app.task(name="sync_judicial.sincronizar_processo", bind=True)
def sincronizar_processo_task(self, numero_cnj: str, tribunal: str, sistema: str, credenciais: dict):
    """Sincroniza processo com tribunal"""
    
    try:
        self.update_state(state='PROGRESS', meta={'status': f'Conectando em {tribunal}...'})
        
        # Criar adaptador
        adapter = AdapterFactory.create(tribunal, sistema, credenciais)
        
        if not adapter:
            return {
                'status': 'error',
                'message': f'Adaptador para {sistema} não disponível'
            }
        
        # Login
        self.update_state(state='PROGRESS', meta={'status': 'Autenticando...'})
        if not adapter.login():
            return {
                'status': 'error',
                'message': 'Falha na autenticação'
            }
        
        # Baixar andamentos
        self.update_state(state='PROGRESS', meta={'status': 'Baixando andamentos...'})
        andamentos = adapter.baixar_andamentos(numero_cnj)
        
        # Processar cada andamento
        andamentos_salvos = []
        
        for andamento in andamentos:
            # Hash forense
            andamento_str = json.dumps(andamento, sort_keys=True)
            andamento['hash_sha256'] = hashlib.sha256(andamento_str.encode()).hexdigest()
            andamento['hash_sha512'] = hashlib.sha512(andamento_str.encode()).hexdigest()
            andamento['synced_at'] = datetime.now(timezone.utc).isoformat()
            andamento['tribunal'] = tribunal
            andamento['sistema'] = sistema
            andamento['numero_cnj'] = numero_cnj
            
            andamentos_salvos.append(andamento)
        
        return {
            'status': 'success',
            'numero_cnj': numero_cnj,
            'tribunal': tribunal,
            'andamentos_baixados': len(andamentos_salvos),
            'andamentos': andamentos_salvos
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }


@app.task(name="sync_judicial.sincronizar_todos", bind=True)
def sincronizar_todos_processos_task(self, tribunal: str, sistema: str, credenciais: dict):
    """Sincroniza todos os processos de um tribunal"""
    
    try:
        adapter = AdapterFactory.create(tribunal, sistema, credenciais)
        
        if not adapter or not adapter.login():
            return {'status': 'error', 'message': 'Falha na conexão'}
        
        # Listar processos do advogado
        processos = adapter.listar_processos()
        
        total = len(processos)
        sincronizados = 0
        
        for idx, processo in enumerate(processos):
            self.update_state(
                state='PROGRESS',
                meta={'current': idx + 1, 'total': total}
            )
            
            # Sincronizar cada processo
            numero_cnj = processo.get('numero_cnj')
            if numero_cnj:
                andamentos = adapter.baixar_andamentos(numero_cnj)
                if andamentos:
                    sincronizados += 1
        
        return {
            'status': 'success',
            'tribunal': tribunal,
            'processos_total': total,
            'processos_sincronizados': sincronizados
        }
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@app.task(name="sync_judicial.detectar_prazos", bind=True)
def detectar_prazos_task(self, andamento_id: str, descricao: str):
    """Detecta prazos em andamentos usando IA"""
    
    try:
        # TODO: Usar IA para detectar prazos
        # Palavras-chave: "intimação", "prazo", "manifestação", "dias"
        
        import re
        
        # Buscar padrões de prazo
        padroes = [
            r'prazo de (\d+) dias',
            r'no prazo de (\d+) dias',
            r'manifestação em (\d+) dias'
        ]
        
        prazos_detectados = []
        
        for padrao in padroes:
            matches = re.findall(padrao, descricao.lower())
            for match in matches:
                prazos_detectados.append({
                    'dias': int(match),
                    'tipo': 'manifestação',
                    'detectado_em': datetime.now(timezone.utc).isoformat()
                })
        
        return {
            'andamento_id': andamento_id,
            'prazos': prazos_detectados,
            'total': len(prazos_detectados)
        }
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}
