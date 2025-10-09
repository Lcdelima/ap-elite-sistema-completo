"""
AP ELITE - Sistema de Mapeamento de Relacionamentos
Análise de redes criminosas e conexões entre pessoas
Data: 2025
"""

import json
import asyncio
import aiofiles
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uuid
from pathlib import Path
import networkx as nx
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import numpy as np
from collections import defaultdict, Counter
import math

# Import for LLM integration
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os

# Configure Emergent LLM
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-aD33e9977E0D345EfD')
llm_chat = LlmChat(api_key=EMERGENT_LLM_KEY)

# Router configuration
relationships_router = APIRouter(prefix="/api/relationships")

# File paths
RELATIONSHIPS_DATA_PATH = Path("/app/backend/relationships_data")
NETWORKS_PATH = RELATIONSHIPS_DATA_PATH / "networks"
VISUALIZATIONS_PATH = RELATIONSHIPS_DATA_PATH / "visualizations"
ANALYSIS_PATH = RELATIONSHIPS_DATA_PATH / "analysis"

# Create directories
for path in [RELATIONSHIPS_DATA_PATH, NETWORKS_PATH, VISUALIZATIONS_PATH, ANALYSIS_PATH]:
    path.mkdir(parents=True, exist_ok=True)

# Data Models
class Person(BaseModel):
    id: str
    name: str
    cpf: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    criminal_record: bool = False
    risk_level: str = "unknown"  # low, medium, high, critical
    aliases: List[str] = []
    metadata: Dict = {}

class Relationship(BaseModel):
    id: str
    person1_id: str
    person2_id: str
    relationship_type: str  # family, business, criminal, communication, financial
    strength: float  # 0.0 to 1.0
    frequency: int = 0  # frequency of interactions
    first_contact: Optional[str] = None
    last_contact: Optional[str] = None
    evidence_sources: List[str] = []
    metadata: Dict = {}

class CriminalNetwork(BaseModel):
    id: str
    name: str
    description: str
    network_type: str  # organized_crime, fraud, trafficking, corruption
    status: str  # active, inactive, under_investigation
    members: List[str] = []  # person IDs
    hierarchy: Dict = {}
    created_at: str
    updated_at: str

class NetworkAnalysis(BaseModel):
    network_id: str
    centrality_measures: Dict
    community_detection: Dict
    key_players: List[Dict]
    risk_assessment: Dict
    recommendations: List[str]
    timestamp: str

# ==================== GRAPH ANALYSIS FUNCTIONS ====================

class NetworkAnalyzer:
    def __init__(self):
        self.graph = nx.Graph()
        self.directed_graph = nx.DiGraph()

    async def add_person(self, person: Person):
        """Adicionar pessoa ao grafo"""
        self.graph.add_node(person.id, **person.dict())
        self.directed_graph.add_node(person.id, **person.dict())

    async def add_relationship(self, relationship: Relationship):
        """Adicionar relacionamento ao grafo"""
        self.graph.add_edge(
            relationship.person1_id,
            relationship.person2_id,
            **relationship.dict()
        )
        # For directed graph, consider hierarchy
        if relationship.relationship_type in ['criminal_leader', 'boss', 'subordinate']:
            self.directed_graph.add_edge(
                relationship.person1_id,
                relationship.person2_id,
                **relationship.dict()
            )

    async def calculate_centrality_measures(self) -> Dict:
        """Calcular medidas de centralidade"""
        try:
            centrality = {}
            
            if len(self.graph.nodes()) > 0:
                # Degree Centrality - quem tem mais conexões
                centrality['degree'] = nx.degree_centrality(self.graph)
                
                # Betweenness Centrality - quem é ponte entre grupos
                centrality['betweenness'] = nx.betweenness_centrality(self.graph)
                
                # Closeness Centrality - quem está mais próximo de todos
                centrality['closeness'] = nx.closeness_centrality(self.graph)
                
                # Eigenvector Centrality - quem tem conexões importantes
                try:
                    centrality['eigenvector'] = nx.eigenvector_centrality(self.graph, max_iter=1000)
                except:
                    centrality['eigenvector'] = {}
                
                # PageRank - influência na rede
                centrality['pagerank'] = nx.pagerank(self.graph)

            return centrality
        except Exception as e:
            return {"error": str(e)}

    async def detect_communities(self) -> Dict:
        """Detectar comunidades na rede"""
        try:
            communities = {}
            
            if len(self.graph.nodes()) > 2:
                # Louvain community detection
                try:
                    import community as community_louvain
                    partition = community_louvain.best_partition(self.graph)
                    communities['louvain'] = partition
                except:
                    pass
                
                # Connected components
                components = list(nx.connected_components(self.graph))
                communities['connected_components'] = [list(comp) for comp in components]
                
                # Cliques (grupos totalmente conectados)
                cliques = list(nx.find_cliques(self.graph))
                communities['cliques'] = [list(clique) for clique in cliques if len(clique) >= 3]

            return communities
        except Exception as e:
            return {"error": str(e)}

    async def identify_key_players(self, centrality_measures: Dict) -> List[Dict]:
        """Identificar jogadores-chave na rede"""
        try:
            key_players = []
            
            # Top players by different measures
            for measure, scores in centrality_measures.items():
                if isinstance(scores, dict) and scores:
                    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
                    top_3 = sorted_scores[:3]
                    
                    for person_id, score in top_3:
                        player = {
                            "person_id": person_id,
                            "measure": measure,
                            "score": score,
                            "importance": "high" if score > 0.7 else "medium" if score > 0.4 else "low"
                        }
                        key_players.append(player)

            return key_players
        except Exception as e:
            return [{"error": str(e)}]

    async def analyze_network_structure(self) -> Dict:
        """Analisar estrutura da rede"""
        try:
            analysis = {}
            
            if len(self.graph.nodes()) > 0:
                # Basic metrics
                analysis['nodes_count'] = self.graph.number_of_nodes()
                analysis['edges_count'] = self.graph.number_of_edges()
                analysis['density'] = nx.density(self.graph)
                
                # Connectivity
                analysis['is_connected'] = nx.is_connected(self.graph)
                analysis['number_of_components'] = nx.number_connected_components(self.graph)
                
                # Clustering
                analysis['average_clustering'] = nx.average_clustering(self.graph)
                
                # Path lengths
                if nx.is_connected(self.graph):
                    analysis['average_shortest_path'] = nx.average_shortest_path_length(self.graph)
                    analysis['diameter'] = nx.diameter(self.graph)
                
                # Degree distribution
                degrees = [d for n, d in self.graph.degree()]
                analysis['degree_distribution'] = {
                    'min': min(degrees) if degrees else 0,
                    'max': max(degrees) if degrees else 0,
                    'average': np.mean(degrees) if degrees else 0,
                    'std': np.std(degrees) if degrees else 0
                }

            return analysis
        except Exception as e:
            return {"error": str(e)}

    async def generate_visualization(self, output_path: str, layout_type: str = "spring") -> str:
        """Gerar visualização da rede"""
        try:
            plt.figure(figsize=(15, 10))
            plt.clf()
            
            if len(self.graph.nodes()) == 0:
                plt.text(0.5, 0.5, 'Nenhum dado para visualização', 
                        horizontalalignment='center', verticalalignment='center',
                        transform=plt.gca().transAxes, fontsize=16)
                plt.savefig(output_path, dpi=150, bbox_inches='tight')
                return output_path

            # Choose layout
            if layout_type == "circular":
                pos = nx.circular_layout(self.graph)
            elif layout_type == "hierarchical":
                pos = nx.spring_layout(self.graph, k=2, iterations=50)
            else:  # spring layout (default)
                pos = nx.spring_layout(self.graph, k=1.5, iterations=50)

            # Node colors based on risk level
            node_colors = []
            for node in self.graph.nodes():
                node_data = self.graph.nodes[node]
                risk = node_data.get('risk_level', 'unknown')
                if risk == 'critical':
                    node_colors.append('red')
                elif risk == 'high':
                    node_colors.append('orange')
                elif risk == 'medium':
                    node_colors.append('yellow')
                elif risk == 'low':
                    node_colors.append('green')
                else:
                    node_colors.append('lightblue')

            # Edge colors based on relationship type
            edge_colors = []
            edge_widths = []
            for edge in self.graph.edges():
                edge_data = self.graph.edges[edge]
                rel_type = edge_data.get('relationship_type', 'unknown')
                strength = edge_data.get('strength', 0.5)
                
                if rel_type == 'criminal':
                    edge_colors.append('red')
                elif rel_type == 'business':
                    edge_colors.append('blue')
                elif rel_type == 'family':
                    edge_colors.append('green')
                elif rel_type == 'communication':
                    edge_colors.append('purple')
                else:
                    edge_colors.append('gray')
                
                edge_widths.append(strength * 3)

            # Draw network
            nx.draw_networkx_nodes(self.graph, pos, node_color=node_colors, 
                                 node_size=300, alpha=0.8)
            nx.draw_networkx_edges(self.graph, pos, edge_color=edge_colors,
                                 width=edge_widths, alpha=0.6)
            
            # Add labels
            labels = {}
            for node in self.graph.nodes():
                node_data = self.graph.nodes[node]
                name = node_data.get('name', f'Person {node[:8]}')
                labels[node] = name[:15]  # Truncate long names
            
            nx.draw_networkx_labels(self.graph, pos, labels, font_size=8)

            # Add legend
            legend_elements = [
                plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='red', 
                          markersize=8, label='Risco Crítico'),
                plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='orange', 
                          markersize=8, label='Risco Alto'),
                plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='yellow', 
                          markersize=8, label='Risco Médio'),
                plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='green', 
                          markersize=8, label='Risco Baixo'),
                plt.Line2D([0], [0], color='red', linewidth=3, label='Criminal'),
                plt.Line2D([0], [0], color='blue', linewidth=3, label='Negócios'),
                plt.Line2D([0], [0], color='green', linewidth=3, label='Família'),
                plt.Line2D([0], [0], color='purple', linewidth=3, label='Comunicação'),
            ]
            
            plt.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1.3, 1))
            
            plt.title("Mapa de Relacionamentos - Rede Criminal", fontsize=16, fontweight='bold')
            plt.axis('off')
            plt.tight_layout()
            plt.savefig(output_path, dpi=150, bbox_inches='tight')
            plt.close()
            
            return output_path

        except Exception as e:
            # Create error image
            plt.figure(figsize=(10, 6))
            plt.text(0.5, 0.5, f'Erro na visualização: {str(e)}', 
                    horizontalalignment='center', verticalalignment='center',
                    transform=plt.gca().transAxes, fontsize=12)
            plt.axis('off')
            plt.savefig(output_path, dpi=150, bbox_inches='tight')
            plt.close()
            return output_path

# ==================== AI ANALYSIS FUNCTIONS ====================

async def analyze_criminal_network_ai(network_data: Dict, relationships: List[Dict]) -> Dict:
    """Análise de rede criminal usando IA"""
    try:
        prompt = f"""
        Analise esta rede criminal e forneça insights estratégicos:

        Dados da Rede: {json.dumps(network_data, indent=2)}
        Relacionamentos: {json.dumps(relationships[:10], indent=2)}

        Análise Requerida:
        1. HIERARQUIA CRIMINAL identificada
        2. PAPÉIS E FUNÇÕES de cada membro
        3. PONTOS FRACOS da organização
        4. ESTRATÉGIAS DE INVESTIGAÇÃO recomendadas
        5. RISCOS E AMEAÇAS potenciais
        6. PRÓXIMOS ALVOS para investigação
        7. PADRÕES OPERACIONAIS observados
        8. GRAU DE PERICULOSIDADE da rede (1-10)

        Responda em formato JSON estruturado para relatório policial.
        """

        response = await llm_provider.complete(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o",
            max_tokens=2000
        )

        ai_analysis = json.loads(response.choices[0].message.content)

        return {
            "analysis_type": "criminal_network_ai",
            "ai_insights": ai_analysis,
            "confidence": 0.85,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {
            "analysis_type": "criminal_network_ai",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def predict_network_evolution(network_data: Dict, historical_data: List[Dict] = None) -> Dict:
    """Prever evolução da rede criminal"""
    try:
        prompt = f"""
        Com base nos dados desta rede criminal, preveja sua evolução:

        Rede Atual: {json.dumps(network_data, indent=2)}

        Previsões Requeridas:
        1. CRESCIMENTO DA REDE (novos membros prováveis)
        2. MUDANÇAS NA HIERARQUIA
        3. NOVAS ATIVIDADES CRIMINOSAS possíveis
        4. RISCOS DE EXPANSÃO territorial
        5. VULNERABILIDADES que podem se desenvolver
        6. CRONOGRAMA estimado de mudanças
        7. INDICADORES DE ALERTA para monitoramento
        8. AÇÕES PREVENTIVAS recomendadas

        Responda em formato JSON com previsões para 3, 6 e 12 meses.
        """

        response = await llm_provider.complete(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o",
            max_tokens=1800
        )

        predictions = json.loads(response.choices[0].message.content)

        return {
            "analysis_type": "network_evolution_prediction",
            "predictions": predictions,
            "confidence": 0.75,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {
            "analysis_type": "network_evolution_prediction",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# ==================== API ENDPOINTS ====================

@relationships_router.post("/persons")
async def create_person(person_data: Dict):
    """Criar nova pessoa na rede"""
    person_id = str(uuid.uuid4())
    
    person = Person(
        id=person_id,
        name=person_data.get("name", ""),
        cpf=person_data.get("cpf"),
        phone=person_data.get("phone"),
        email=person_data.get("email"),
        address=person_data.get("address"),
        occupation=person_data.get("occupation"),
        criminal_record=person_data.get("criminal_record", False),
        risk_level=person_data.get("risk_level", "unknown"),
        aliases=person_data.get("aliases", []),
        metadata=person_data.get("metadata", {})
    )
    
    # Save person data
    person_file = RELATIONSHIPS_DATA_PATH / f"person_{person_id}.json"
    async with aiofiles.open(person_file, 'w') as f:
        await f.write(person.json())
    
    return {"message": "Pessoa criada com sucesso", "person": person.dict()}

@relationships_router.post("/relationships")
async def create_relationship(relationship_data: Dict):
    """Criar novo relacionamento"""
    relationship_id = str(uuid.uuid4())
    
    relationship = Relationship(
        id=relationship_id,
        person1_id=relationship_data["person1_id"],
        person2_id=relationship_data["person2_id"],
        relationship_type=relationship_data["relationship_type"],
        strength=relationship_data.get("strength", 0.5),
        frequency=relationship_data.get("frequency", 0),
        first_contact=relationship_data.get("first_contact"),
        last_contact=relationship_data.get("last_contact"),
        evidence_sources=relationship_data.get("evidence_sources", []),
        metadata=relationship_data.get("metadata", {})
    )
    
    # Save relationship data
    relationship_file = RELATIONSHIPS_DATA_PATH / f"relationship_{relationship_id}.json"
    async with aiofiles.open(relationship_file, 'w') as f:
        await f.write(relationship.json())
    
    return {"message": "Relacionamento criado com sucesso", "relationship": relationship.dict()}

@relationships_router.post("/networks")
async def create_criminal_network(network_data: Dict, background_tasks: BackgroundTasks):
    """Criar nova rede criminal"""
    network_id = str(uuid.uuid4())
    
    network = CriminalNetwork(
        id=network_id,
        name=network_data["name"],
        description=network_data.get("description", ""),
        network_type=network_data.get("network_type", "organized_crime"),
        status=network_data.get("status", "under_investigation"),
        members=network_data.get("members", []),
        hierarchy=network_data.get("hierarchy", {}),
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
    
    # Save network data
    network_file = NETWORKS_PATH / f"network_{network_id}.json"
    async with aiofiles.open(network_file, 'w') as f:
        await f.write(network.json())
    
    # Schedule background analysis
    background_tasks.add_task(analyze_network_background, network_id)
    
    return {"message": "Rede criminal criada com sucesso", "network": network.dict()}

async def analyze_network_background(network_id: str):
    """Análise de rede em background"""
    try:
        # Load network data
        network_file = NETWORKS_PATH / f"network_{network_id}.json"
        async with aiofiles.open(network_file, 'r') as f:
            network_data = json.loads(await f.read())
        
        # Load all persons and relationships
        analyzer = NetworkAnalyzer()
        
        # Add persons to graph
        person_files = list(RELATIONSHIPS_DATA_PATH.glob("person_*.json"))
        for person_file in person_files:
            async with aiofiles.open(person_file, 'r') as f:
                person_data = json.loads(await f.read())
                if person_data["id"] in network_data.get("members", []):
                    person = Person(**person_data)
                    await analyzer.add_person(person)
        
        # Add relationships to graph
        relationship_files = list(RELATIONSHIPS_DATA_PATH.glob("relationship_*.json"))
        for rel_file in relationship_files:
            async with aiofiles.open(rel_file, 'r') as f:
                rel_data = json.loads(await f.read())
                # Check if both persons are in the network
                if (rel_data["person1_id"] in network_data.get("members", []) and
                    rel_data["person2_id"] in network_data.get("members", [])):
                    relationship = Relationship(**rel_data)
                    await analyzer.add_relationship(relationship)
        
        # Perform analysis
        centrality = await analyzer.calculate_centrality_measures()
        communities = await analyzer.detect_communities()
        key_players = await analyzer.identify_key_players(centrality)
        structure = await analyzer.analyze_network_structure()
        
        # Generate visualization
        viz_path = VISUALIZATIONS_PATH / f"network_{network_id}_visualization.png"
        await analyzer.generate_visualization(str(viz_path))
        
        # AI Analysis
        relationships_data = []
        for rel_file in relationship_files:
            async with aiofiles.open(rel_file, 'r') as f:
                rel_data = json.loads(await f.read())
                if (rel_data["person1_id"] in network_data.get("members", []) and
                    rel_data["person2_id"] in network_data.get("members", [])):
                    relationships_data.append(rel_data)
        
        ai_analysis = await analyze_criminal_network_ai(network_data, relationships_data)
        predictions = await predict_network_evolution(network_data)
        
        # Compile analysis results
        analysis_result = NetworkAnalysis(
            network_id=network_id,
            centrality_measures=centrality,
            community_detection=communities,
            key_players=key_players,
            risk_assessment={
                "structure_analysis": structure,
                "ai_analysis": ai_analysis,
                "predictions": predictions
            },
            recommendations=[
                "Monitorar membros com alta centralidade",
                "Investigar comunicações entre comunidades detectadas",
                "Focar nos key players identificados",
                "Implementar vigilância baseada nas previsões"
            ],
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        # Save analysis
        analysis_file = ANALYSIS_PATH / f"network_analysis_{network_id}.json"
        async with aiofiles.open(analysis_file, 'w') as f:
            await f.write(analysis_result.json())

    except Exception as e:
        print(f"Erro na análise de rede {network_id}: {str(e)}")

@relationships_router.get("/networks/{network_id}/analysis")
async def get_network_analysis(network_id: str):
    """Obter análise completa da rede"""
    try:
        analysis_file = ANALYSIS_PATH / f"network_analysis_{network_id}.json"
        
        if not analysis_file.exists():
            raise HTTPException(status_code=404, detail="Análise não encontrada")
        
        async with aiofiles.open(analysis_file, 'r') as f:
            analysis_data = json.loads(await f.read())
        
        # Check for visualization
        viz_path = VISUALIZATIONS_PATH / f"network_{network_id}_visualization.png"
        visualization_available = viz_path.exists()
        
        return {
            "analysis": analysis_data,
            "visualization_available": visualization_available,
            "visualization_path": str(viz_path) if visualization_available else None
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@relationships_router.get("/networks")
async def list_networks():
    """Listar todas as redes criminais"""
    try:
        network_files = list(NETWORKS_PATH.glob("network_*.json"))
        networks = []
        
        for network_file in network_files:
            async with aiofiles.open(network_file, 'r') as f:
                network_data = json.loads(await f.read())
                networks.append(network_data)
        
        return {"networks": networks}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@relationships_router.get("/persons")
async def list_persons():
    """Listar todas as pessoas"""
    try:
        person_files = list(RELATIONSHIPS_DATA_PATH.glob("person_*.json"))
        persons = []
        
        for person_file in person_files:
            async with aiofiles.open(person_file, 'r') as f:
                person_data = json.loads(await f.read())
                persons.append(person_data)
        
        return {"persons": persons}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@relationships_router.post("/networks/{network_id}/visualize")
async def generate_network_visualization(network_id: str, layout_type: str = "spring"):
    """Gerar nova visualização da rede"""
    try:
        # Load network and rebuild graph
        network_file = NETWORKS_PATH / f"network_{network_id}.json"
        async with aiofiles.open(network_file, 'r') as f:
            network_data = json.loads(await f.read())
        
        analyzer = NetworkAnalyzer()
        
        # Load persons and relationships (similar to analyze_network_background)
        person_files = list(RELATIONSHIPS_DATA_PATH.glob("person_*.json"))
        for person_file in person_files:
            async with aiofiles.open(person_file, 'r') as f:
                person_data = json.loads(await f.read())
                if person_data["id"] in network_data.get("members", []):
                    person = Person(**person_data)
                    await analyzer.add_person(person)
        
        relationship_files = list(RELATIONSHIPS_DATA_PATH.glob("relationship_*.json"))
        for rel_file in relationship_files:
            async with aiofiles.open(rel_file, 'r') as f:
                rel_data = json.loads(await f.read())
                if (rel_data["person1_id"] in network_data.get("members", []) and
                    rel_data["person2_id"] in network_data.get("members", [])):
                    relationship = Relationship(**rel_data)
                    await analyzer.add_relationship(relationship)
        
        # Generate visualization
        viz_path = VISUALIZATIONS_PATH / f"network_{network_id}_{layout_type}.png"
        await analyzer.generate_visualization(str(viz_path), layout_type)
        
        return {
            "message": "Visualização gerada com sucesso",
            "visualization_path": str(viz_path),
            "layout_type": layout_type
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Initialize relationship mapping system
async def initialize_relationship_system():
    """Initialize the relationship mapping system"""
    print("🕸️ Relationship Mapping System initialized")
    print(f"📊 Network Analysis: Ready")
    print(f"🤖 AI Criminal Network Analysis: Enabled")
    print(f"📈 Visualization Tools: Active")

# Run initialization
asyncio.create_task(initialize_relationship_system())