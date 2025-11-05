"""Serviço RAG para Jurisprudência - Elite Athena"""
from emergentintegrations.llm.openai import ChatOpenAI
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
import json

load_dotenv()


class EliteLexRAG:
    """Sistema RAG para consulta de jurisprudência e doutrina"""
    
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        self.client = ChatOpenAI(api_key=self.api_key)
        
        # TODO: Integrar ChromaDB para vetorização
        # Por enquanto, usar conhecimento do modelo
    
    async def search_jurisprudence(
        self,
        query: str,
        area: str = "criminal",
        court: str = "all"  # stf, stj, trf, tj
    ) -> Dict[str, Any]:
        """Busca jurisprudência relevante"""
        
        system_prompt = f"""
Você é um assistente jurídico especializado em jurisprudência brasileira.
Área de especialização: {area}
Tribunal: {court}

Sua tarefa é encontrar jurisprudências relevantes e fornecer:
1. Súmula ou ementário
2. Tribunal e número do processo (se aplicável)
3. Resumo da decisão
4. Relevância para o caso
"""
        
        try:
            response = await self.client.chat(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.3
            )
            
            return {
                "query": query,
                "area": area,
                "court": court,
                "result": response.choices[0].message.content,
                "provider": "elite_lex_rag"
            }
            
        except Exception as e:
            raise Exception(f"Erro na busca de jurisprudência: {str(e)}")
    
    async def analyze_process(
        self,
        process_description: str,
        analysis_type: str = "prescricao"  # prescricao, nulidades, dosimetria
    ) -> Dict[str, Any]:
        """Analisa processo com IA jurídica"""
        
        prompts = {
            "prescricao": "Analise a prescrição penal considerando: data do fato, reclusão, pena máxima, causas interruptivas.",
            "nulidades": "Identifique possíveis nulidades processuais: formais, absolutas, relativas.",
            "dosimetria": "Analise a dosimetria da pena: circunstâncias judiciais, atenuantes, agravantes, causas de aumento/diminuição."
        }
        
        system_prompt = f"""
Você é um especialista em direito penal brasileiro.
Tarefa: {prompts.get(analysis_type, 'Análise geral')}

Forneça uma análise técnica detalhada, citando artigos relevantes do CP/CPP.
"""
        
        try:
            response = await self.client.chat(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": process_description}
                ],
                temperature=0.2
            )
            
            return {
                "analysis_type": analysis_type,
                "result": response.choices[0].message.content,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            raise Exception(f"Erro na análise: {str(e)}")
