import React, { useState, useEffect } from 'react';
import { 
  HardDrive,
  Database,
  Search,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Upload,
  Download,
  Play,
  Bookmark,
  Tag,
  Filter,
  Settings,
  Zap,
  Eye,
  Folder,
  Hash,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IPEDIntegration = ({ currentUser }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProcessing, setActiveProcessing] = useState([]);
  
  // Sample IPED project data
  const [ipedProjects, setIpedProjects] = useState([
    {
      id: 'iped-1',
      case_id: 'case-1',
      project_name: 'Projeto_Caso_001_PericiaMobile',
      evidence_ids: ['ev-001', 'ev-002'],
      iped_version: '4.1.8',
      status: 'completed',
      progress: 100,
      total_items: 245678,
      processed_items: 245678,
      analyst_id: currentUser?.id,
      processing_start: new Date('2024-10-01T09:00:00').toISOString(),
      processing_end: new Date('2024-10-01T14:30:00').toISOString(),
      categories: {
        'Documentos': 12456,
        'Imagens': 8934,
        'Vídeos': 234,
        'Áudios': 567,
        'Contatos': 89,
        'Mensagens': 3456,
        'Aplicativos': 145,
        'Bancos de Dados': 23,
        'Arquivos Sistema': 45789,
        'Outros': 123985
      },
      bookmarks: [
        { name: 'Conversas Suspeitas', count: 23, category: 'Mensagens' },
        { name: 'Imagens Relevantes', count: 45, category: 'Imagens' },
        { name: 'Documentos Importantes', count: 12, category: 'Documentos' },
        { name: 'Contatos de Interesse', count: 8, category: 'Contatos' }
      ]
    },
    {
      id: 'iped-2', 
      case_id: 'case-2',
      project_name: 'Projeto_Caso_002_ComputadorEmpresa',
      evidence_ids: ['ev-003'],
      iped_version: '4.1.8',
      status: 'processing',
      progress: 67,
      total_items: 1234567,
      processed_items: 827000,
      analyst_id: currentUser?.id,
      processing_start: new Date().toISOString(),
      processing_end: null,
      categories: {},
      bookmarks: []
    }
  ]);

  useEffect(() => {
    fetchProjects();
    fetchEvidence();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/iped/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data || ipedProjects);
    } catch (error) {
      console.error('Error fetching IPED projects:', error);
      setProjects(ipedProjects); // Use sample data
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/evidence`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvidence(response.data || []);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      setEvidence([]);
    }
  };

  const createNewProject = async () => {
    try {
      const projectName = `Projeto_${Date.now()}`;
      const selectedEvidenceIds = evidence.slice(0, 2).map(e => e.id); // Demo selection
      
      const token = localStorage.getItem('ap_elite_token');
      await axios.post(`${API}/iped/projects`, {
        case_id: 'case-1',
        project_name: projectName,
        evidence_ids: selectedEvidenceIds,
        analyst_id: currentUser.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Projeto IPED criado com sucesso');
      fetchProjects();
    } catch (error) {
      console.error('Error creating IPED project:', error);
      toast.error('Erro ao criar projeto IPED');
    }
  };

  const startProcessing = async (projectId) => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      await axios.post(`${API}/iped/projects/${projectId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Processamento IPED iniciado');
      fetchProjects();
    } catch (error) {
      console.error('Error starting IPED processing:', error);
      toast.error('Erro ao iniciar processamento');
    }
  };

  const getStatusBadge = (status, progress = 0) => {
    const config = {
      'created': { label: 'Criado', className: 'bg-gray-500', icon: Folder },
      'processing': { label: `Processando (${progress}%)`, className: 'bg-blue-500', icon: Zap },
      'indexed': { label: 'Indexado', className: 'bg-yellow-500', icon: Database },
      'completed': { label: 'Concluído', className: 'bg-green-500', icon: CheckCircle },
      'failed': { label: 'Falha', className: 'bg-red-500', icon: AlertTriangle }
    };
    
    const statusConfig = config[status] || config['created'];
    const IconComponent = statusConfig.icon;
    
    return (
      <Badge className={`${statusConfig.className} text-white flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{statusConfig.label}</span>
      </Badge>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Documentos': FileText,
      'Imagens': Image,
      'Vídeos': Video,
      'Áudios': Music,
      'Contatos': Users,
      'Mensagens': MessageCircle,
      'Aplicativos': Smartphone,
      'Bancos de Dados': Database,
      'Arquivos Sistema': Settings,
      'Outros': Archive
    };
    return icons[category] || Archive;
  };

  const formatNumber = (num) => {
    return num.toLocaleString('pt-BR');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const calculateProcessingTime = (start, end) => {
    if (!end) return 'Em andamento';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const exportIPEDData = async (projectId, format) => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.post(`${API}/iped/projects/${projectId}/export`, {
        format: format,
        include_bookmarks: true,
        include_timeline: true
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `iped_export_${projectId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Dados exportados em formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting IPED data:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando integração IPED...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Integração IPED</h1>
          <p className="text-slate-400">Sistema avançado de processamento e análise forense</p>
        </div>
        <div className="flex space-x-2">
          <Button className="btn-secondary flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Importar Evidências</span>
          </Button>
          <Button 
            className="btn-primary flex items-center space-x-2"
            onClick={createNewProject}
          >
            <HardDrive className="h-4 w-4" />
            <span>Novo Projeto</span>
          </Button>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <HardDrive className="h-8 w-8 mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{projects.length}</p>
            <p className="text-slate-400 text-sm">Projetos IPED</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {projects.filter(p => p.status === 'processing').length}
            </p>
            <p className="text-slate-400 text-sm">Processando</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {projects.filter(p => p.status === 'completed').length}
            </p>
            <p className="text-slate-400 text-sm">Concluídos</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 mx-auto text-cyan-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {formatNumber(projects.reduce((sum, p) => sum + (p.total_items || 0), 0))}
            </p>
            <p className="text-slate-400 text-sm">Itens Analisados</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Projetos IPED</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="bg-slate-700 p-4 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-white font-semibold">{project.project_name}</h3>
                      {getStatusBadge(project.status, project.progress)}
                      <Badge className="bg-slate-600 text-white">v{project.iped_version}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Evidências:</span>
                        <p className="text-white">{project.evidence_ids.length} itens</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Total de Itens:</span>
                        <p className="text-white">{formatNumber(project.total_items || 0)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Processados:</span>
                        <p className="text-white">{formatNumber(project.processed_items || 0)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Tempo:</span>
                        <p className="text-white">{calculateProcessingTime(project.processing_start, project.processing_end)}</p>
                      </div>
                    </div>
                    
                    {project.status === 'processing' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Progresso do Processamento</span>
                          <span className="text-slate-300">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      className="btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open IPED project
                        toast.info('Abrindo projeto no IPED...');
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Abrir
                    </Button>
                    
                    {project.status === 'created' && (
                      <Button 
                        size="sm" 
                        className="btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          startProcessing(project.id);
                        }}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Processar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Detalhes do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-slate-400">Nome do Projeto:</span>
                  <p className="text-white font-medium">{selectedProject.project_name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Versão IPED:</span>
                  <p className="text-white">{selectedProject.iped_version}</p>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedProject.status, selectedProject.progress)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Início do Processamento:</span>
                  <p className="text-white">{formatDate(selectedProject.processing_start)}</p>
                </div>
                {selectedProject.processing_end && (
                  <div>
                    <span className="text-slate-400">Fim do Processamento:</span>
                    <p className="text-white">{formatDate(selectedProject.processing_end)}</p>
                  </div>
                )}
                
                {selectedProject.status === 'completed' && (
                  <div className="space-y-2 pt-4 border-t border-slate-700">
                    <Button 
                      className="w-full btn-primary"
                      onClick={() => exportIPEDData(selectedProject.id, 'json')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar JSON
                    </Button>
                    <Button 
                      className="w-full btn-secondary"
                      onClick={() => exportIPEDData(selectedProject.id, 'csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Project Results */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="categories" className="space-y-4">
              <TabsList className="bg-slate-800 border-slate-700">
                <TabsTrigger value="categories" className="data-[state=active]:bg-cyan-500">
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="data-[state=active]:bg-cyan-500">
                  Marcadores
                </TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-cyan-500">
                  Timeline
                </TabsTrigger>
              </TabsList>

              {/* Categories Tab */}
              <TabsContent value="categories">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Categorias de Arquivos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(selectedProject.categories || {}).map(([category, count]) => {
                        const IconComponent = getCategoryIcon(category);
                        const percentage = selectedProject.total_items ? (count / selectedProject.total_items * 100).toFixed(1) : 0;
                        
                        return (
                          <div key={category} className="bg-slate-700 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4 text-cyan-400" />
                                <span className="text-white font-medium">{category}</span>
                              </div>
                              <Badge className="bg-slate-600 text-white">{percentage}%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-white">{formatNumber(count)}</span>
                              <div className="w-20 bg-slate-600 rounded-full h-2">
                                <div 
                                  className="bg-cyan-500 h-2 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, percentage)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookmarks Tab */}
              <TabsContent value="bookmarks">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Bookmark className="h-5 w-5" />
                      <span>Marcadores Importantes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedProject.bookmarks?.map((bookmark, index) => (
                        <div key={index} className="bg-slate-700 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Bookmark className="h-5 w-5 text-yellow-400" />
                              <div>
                                <p className="text-white font-medium">{bookmark.name}</p>
                                <p className="text-slate-400 text-sm">{bookmark.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{bookmark.count} itens</p>
                              <Button size="sm" variant="outline" className="mt-1 text-slate-300 border-slate-500">
                                <Eye className="h-3 w-3 mr-1" />
                                Visualizar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-slate-400">
                          <Bookmark className="h-8 w-8 mx-auto mb-2" />
                          <p>Nenhum marcador criado ainda</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Timeline de Processamento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="text-white font-medium">Projeto Criado</p>
                          <p className="text-slate-400 text-sm">{formatDate(selectedProject.created_at || new Date())}</p>
                        </div>
                      </div>
                      
                      {selectedProject.processing_start && (
                        <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <div>
                            <p className="text-white font-medium">Processamento Iniciado</p>
                            <p className="text-slate-400 text-sm">{formatDate(selectedProject.processing_start)}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedProject.processing_end && (
                        <div className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                          <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                          <div>
                            <p className="text-white font-medium">Processamento Concluído</p>
                            <p className="text-slate-400 text-sm">{formatDate(selectedProject.processing_end)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPEDIntegration;