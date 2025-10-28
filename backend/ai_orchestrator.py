"""
Sistema de Orquestração de IA Multi-Provedor
Utiliza OpenAI GPT-5, Claude Sonnet 4, e Gemini 2.5 Pro
para análises avançadas de investigação
"""

import os
import asyncio
from typing import Optional, Dict, List, Any
from datetime import datetime
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

class AIOrchestrator:
    """
    Orquestrador que gerencia múltiplos provedores de IA
    e seleciona o melhor para cada tarefa
    """
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
        # Configurações de provedores
        self.providers = {
            'openai': {
                'model': 'gpt-5',
                'strength': 'general_analysis',
                'description': 'Melhor para análise geral e raciocínio complexo'
            },
            'anthropic': {
                'model': 'claude-4-sonnet-20250514',
                'strength': 'document_analysis',
                'description': 'Excelente para análise detalhada de documentos e contexto legal'
            },
            'gemini': {
                'model': 'gemini-2.5-pro',
                'strength': 'data_processing',
                'description': 'Ótimo para processamento de grandes volumes de dados'
            }
        }
    
    def create_chat(self, provider: str, session_id: str, system_message: str) -> LlmChat:
        """Cria uma instância de chat para o provedor especificado"""
        if provider not in self.providers:
            raise ValueError(f"Provedor inválido: {provider}")
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        )
        
        config = self.providers[provider]
        chat.with_model(provider, config['model'])
        
        return chat
    
    async def analyze_with_provider(
        self,
        provider: str,
        prompt: str,
        context: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analisa com um provedor específico"""
        if not session_id:
            session_id = str(uuid.uuid4())
        
        system_message = """Você é um assistente especializado em investigações 
        criminais, perícia digital e análise de inteligência. Forneça respostas 
        precisas, detalhadas e fundamentadas."""
        
        if context:
            system_message += f"\n\nContexto adicional: {context}"
        
        try:
            chat = self.create_chat(provider, session_id, system_message)
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            return {
                'success': True,
                'provider': provider,
                'model': self.providers[provider]['model'],
                'response': response,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'provider': provider,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    async def multi_provider_analysis(
        self,
        prompt: str,
        providers: Optional[List[str]] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analisa com múltiplos provedores em paralelo para obter 
        perspectivas diversas
        """
        if not providers:
            providers = list(self.providers.keys())
        
        tasks = [
            self.analyze_with_provider(provider, prompt, context)
            for provider in providers
        ]
        
        results = await asyncio.gather(*tasks)
        
        return {
            'prompt': prompt,
            'providers_used': providers,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
    
    async def intelligent_analysis(
        self,
        task_type: str,
        prompt: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Seleciona automaticamente o melhor provedor baseado no tipo de tarefa
        """
        provider_mapping = {
            'document_analysis': 'anthropic',
            'legal_analysis': 'anthropic',
            'general_analysis': 'openai',
            'reasoning': 'openai',
            'data_processing': 'gemini',
            'pattern_detection': 'gemini',
            'osint_analysis': 'openai',
            'forensic_analysis': 'anthropic'
        }
        
        provider = provider_mapping.get(task_type, 'openai')
        
        result = await self.analyze_with_provider(provider, prompt, context)
        result['task_type'] = task_type
        result['auto_selected'] = True
        
        return result
    
    async def consensus_analysis(
        self,
        prompt: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Obtém análise de todos os provedores e gera um consenso
        """
        # Obter análises de todos os provedores
        multi_result = await self.multi_provider_analysis(prompt, context=context)
        
        # Usar OpenAI para sintetizar o consenso
        synthesis_prompt = f"""
        Analise as seguintes respostas de diferentes modelos de IA e crie uma 
        resposta de consenso que combine os melhores insights de cada uma:
        
        {self._format_multi_results(multi_result['results'])}
        
        Forneça uma análise consolidada, destacando pontos de concordância e 
        quaisquer divergências importantes.
        """
        
        consensus = await self.analyze_with_provider(
            'openai',
            synthesis_prompt,
            context=context
        )
        
        return {
            'original_prompt': prompt,
            'individual_analyses': multi_result['results'],
            'consensus': consensus['response'],
            'timestamp': datetime.now().isoformat()
        }
    
    def _format_multi_results(self, results: List[Dict]) -> str:
        """Formata resultados múltiplos para síntese"""
        formatted = []
        for i, result in enumerate(results, 1):
            if result['success']:
                formatted.append(
                    f"Análise {i} ({result['provider']} - {result['model']}):\n"
                    f"{result['response']}\n"
                )
        return "\n---\n".join(formatted)
    
    async def document_intelligence(
        self,
        document_text: str,
        analysis_type: str = 'comprehensive'
    ) -> Dict[str, Any]:
        """
        Análise inteligente de documentos usando Claude (melhor para documentos)
        """
        prompts = {
            'comprehensive': """Analise este documento de forma abrangente, incluindo:
            1. Resumo executivo
            2. Pontos-chave e informações críticas
            3. Entidades mencionadas (pessoas, organizações, locais)
            4. Implicações legais ou investigativas
            5. Recomendações de ação""",
            
            'legal': """Analise este documento do ponto de vista jurídico:
            1. Fundamentos legais citados
            2. Direitos e obrigações mencionados
            3. Questões legais relevantes
            4. Jurisprudência aplicável
            5. Riscos e oportunidades legais""",
            
            'evidence': """Analise este documento como evidência:
            1. Relevância probatória
            2. Autenticidade e integridade
            3. Conexões com outros elementos
            4. Valor probatório
            5. Pontos de contestação possíveis"""
        }
        
        prompt = prompts.get(analysis_type, prompts['comprehensive'])
        full_prompt = f"{prompt}\n\nDocumento:\n{document_text}"
        
        return await self.analyze_with_provider(
            'anthropic',
            full_prompt,
            context=f"Tipo de análise: {analysis_type}"
        )
    
    async def osint_intelligence(
        self,
        query: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Análise OSINT usando GPT-5 (melhor para raciocínio)
        """
        prompt = f"""
        Analise os seguintes dados OSINT e forneça insights investigativos:
        
        Consulta: {query}
        
        Dados coletados:
        {self._format_osint_data(data)}
        
        Forneça:
        1. Análise de padrões e conexões
        2. Informações de alto valor investigativo
        3. Possíveis linhas de investigação
        4. Alertas e bandeiras vermelhas
        5. Recomendações de ações adicionais
        """
        
        return await self.analyze_with_provider(
            'openai',
            prompt,
            context="Análise OSINT para investigação criminal"
        )
    
    def _format_osint_data(self, data: Dict[str, Any]) -> str:
        """Formata dados OSINT para análise"""
        import json
        return json.dumps(data, indent=2, ensure_ascii=False)
    
    async def pattern_detection(
        self,
        data_points: List[Dict[str, Any]],
        pattern_type: str = 'behavioral'
    ) -> Dict[str, Any]:
        """
        Detecção de padrões usando Gemini (melhor para dados)
        """
        prompt = f"""
        Analise os seguintes pontos de dados e identifique padrões {pattern_type}:
        
        {self._format_data_points(data_points)}
        
        Identifique:
        1. Padrões recorrentes
        2. Anomalias e outliers
        3. Tendências temporais
        4. Correlações significativas
        5. Previsões baseadas em padrões
        """
        
        return await self.analyze_with_provider(
            'gemini',
            prompt,
            context=f"Detecção de padrões: {pattern_type}"
        )
    
    def _format_data_points(self, data_points: List[Dict]) -> str:
        """Formata pontos de dados para análise"""
        import json
        return json.dumps(data_points, indent=2, ensure_ascii=False)
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Retorna informações sobre os provedores disponíveis"""
        return {
            'providers': self.providers,
            'available': list(self.providers.keys()),
            'total': len(self.providers)
        }


# Instância global do orquestrador
ai_orchestrator = AIOrchestrator()
