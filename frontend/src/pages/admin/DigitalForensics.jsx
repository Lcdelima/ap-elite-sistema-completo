import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  Eye, 
  Download, 
  Play, 
  Pause,
  BarChart3, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  FileText,
  HardDrive,
  Smartphone,
  Monitor,
  Hash,
  Clock,
  Database,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DigitalForensics = ({ currentUser }) => {
  const [evidence, setEvidence] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [ipedProjects, setIpedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('evidence');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [processingJobs, setProcessingJobs] = useState([]);

  useEffect(() => {
    fetchEvidence();
    fetchAnalyses();
    fetchIPEDProjects();
  }, []);

  const fetchEvidence = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      // Fetch evidence from all cases (admin view)
      const response = await axios.get(`${API}/evidence`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvidence(response.data || []);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error('Erro ao carregar evidências');
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/analysis/interception`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyses(response.data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setAnalyses([]);
    }
  };

  const fetchIPEDProjects = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/iped/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIpedProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching IPED projects:', error);
      setIpedProjects([]);
    }
  };

  const getEvidenceTypeIcon = (type) => {
    const icons = {
      'computer': Monitor,
      'phone': Smartphone,
      'storage': HardDrive,
      'digital': Database,
      'document': FileText,
      'audio': Play,
      'video': Play,
      'image': Eye
    };
    return icons[type] || FileText;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'Pendente', className: 'bg-yellow-500', icon: Clock },
      'analyzing': { label: 'Analisando', className: 'bg-blue-500', icon: Zap },
      'completed': { label: 'Concluído', className: 'bg-green-500', icon: CheckCircle },
      'failed': { label: 'Falha', className: 'bg-red-500', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} text-white flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getConfidentialityBadge = (level) => {
    const config = {
      'public': { label: 'Público', className: 'bg-gray-500' },
      'restricted': { label: 'Restrito', className: 'bg-blue-500' },
      'confidential': { label: 'Confidencial', className: 'bg-orange-500' },
      'secret': { label: 'Secreto', className: 'bg-red-500' }
    };
    
    const badgeConfig = config[level] || config['restricted'];
    
    return (
      <Badge className={`${badgeConfig.className} text-white`}>
        <Shield className="h-3 w-3 mr-1" />
        {badgeConfig.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const filteredEvidence = evidence.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.evidence_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startAnalysis = async (evidenceId, analysisType) => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      await axios.post(`${API}/analysis/interception`, {
        evidence_id: evidenceId,
        case_id: selectedEvidence.case_id,
        analysis_type: analysisType,
        source_data: selectedEvidence.file_path,
        analyst_id: currentUser.id,
        analysis_params: {}
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Análise iniciada com sucesso');
      fetchAnalyses();
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error('Erro ao iniciar análise');
    }
  };

  const createIPEDProject = async (evidenceIds, projectName) => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      await axios.post(`${API}/iped/projects`, {
        case_id: selectedEvidence.case_id,
        project_name: projectName,
        evidence_ids: evidenceIds,
        analyst_id: currentUser.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Projeto IPED criado com sucesso');
      fetchIPEDProjects();
    } catch (error) {
      console.error('Error creating IPED project:', error);
      toast.error('Erro ao criar projeto IPED');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando módulo de perícia digital...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Perícia Digital</h1>
          <p className="text-slate-400">Análise forense e processamento de evidências digitais</p>
        </div>
        <div className="flex space-x-2">
          <Button className="btn-primary flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Nova Evidência</span>
          </Button>
          <Button className="btn-secondary flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Projeto IPED</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Evidências</p>
                <p className="text-2xl font-bold text-white">{evidence.length}</p>
              </div>
              <Database className="h-6 w-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Analisando</p>
                <p className="text-2xl font-bold text-blue-400">
                  {evidence.filter(e => e.analysis_status === 'analyzing').length}
                </p>
              </div>
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Concluídas</p>
                <p className="text-2xl font-bold text-green-400">
                  {evidence.filter(e => e.analysis_status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Projetos IPED</p>
                <p className="text-2xl font-bold text-purple-400">{ipedProjects.length}</p>
              </div>
              <HardDrive className="h-6 w-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Análises</p>
                <p className="text-2xl font-bold text-orange-400">{analyses.length}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'evidence', label: 'Evidências', icon: Database },
          { id: 'analysis', label: 'Análises', icon: BarChart3 },
          { id: 'iped', label: 'Projetos IPED', icon: HardDrive },
          { id: 'interception', label: 'Interceptações', icon: Shield }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar evidências, análises ou projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Evidence Tab */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidence.map((item) => {
              const IconComponent = getEvidenceTypeIcon(item.type);
              return (
                <Card key={item.id} className="bg-slate-800 border-slate-700 card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-cyan-500 bg-opacity-20 rounded-lg">
                          <IconComponent className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-sm">{item.name}</CardTitle>
                          <p className="text-slate-400 text-xs">{item.evidence_number}</p>
                        </div>
                      </div>
                      {getStatusBadge(item.analysis_status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tipo:</span>
                        <span className="text-white capitalize">{item.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tamanho:</span>
                        <span className="text-white">{formatFileSize(item.file_size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Origem:</span>
                        <span className="text-white truncate max-w-24">{item.source}</span>
                      </div>
                      
                      {/* Hashes */}
                      {(item.hash_md5 || item.hash_sha256) && (
                        <div className="bg-slate-700 p-2 rounded text-xs">
                          {item.hash_md5 && (
                            <div className="flex items-center space-x-1">
                              <Hash className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-400">MD5:</span>
                              <span className="text-slate-300 font-mono truncate">{item.hash_md5}</span>
                            </div>
                          )}
                          {item.hash_sha256 && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Hash className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-400">SHA256:</span>
                              <span className="text-slate-300 font-mono truncate">{item.hash_sha256}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Confidentiality */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Nível:</span>
                        {getConfidentialityBadge(item.confidentiality)}
                      </div>
                      
                      {/* Progress for analyzing items */}
                      {item.analysis_status === 'analyzing' && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Progresso</span>
                            <span className="text-slate-300">75%</span>
                          </div>
                          <Progress value={75} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 btn-primary"
                        onClick={() => setSelectedEvidence(item)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Analisar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="btn-secondary"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredEvidence.length === 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <Database className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-400">Nenhuma evidência encontrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Análises em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhuma análise em andamento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium">{analysis.analysis_type}</h4>
                        <p className="text-slate-300 text-sm">Evidência: {analysis.evidence_id}</p>
                        <p className="text-slate-400 text-sm">Iniciada: {formatDate(analysis.analysis_date)}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(analysis.status)}
                        <div className="mt-2">
                          <Progress value={analysis.progress} className="w-24 h-2" />
                          <span className="text-xs text-slate-400">{analysis.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* IPED Projects Tab */}
      {activeTab === 'iped' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <HardDrive className="h-5 w-5" />
              <span>Projetos IPED</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ipedProjects.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <HardDrive className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhum projeto IPED criado</p>
                <Button className="mt-4 btn-primary">Criar Primeiro Projeto</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ipedProjects.map((project) => (
                  <Card key={project.id} className="bg-slate-700 border-slate-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm">{project.project_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Evidências:</span>
                          <span className="text-white">{project.evidence_ids?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          {getStatusBadge(project.status)}
                        </div>
                        {project.total_items && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Itens:</span>
                            <span className="text-white">{project.total_items.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {project.status === 'processing' && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Progresso</span>
                              <span className="text-slate-300">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" className="flex-1 btn-primary">
                          <Eye className="h-3 w-3 mr-1" />
                          Abrir
                        </Button>
                        <Button size="sm" variant="outline" className="btn-secondary">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interception Analysis Tab */}
      {activeTab === 'interception' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Análise Telefônica</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">Análise de interceptações telefônicas e dados de CDR</p>
              <Button className="btn-primary w-full">Iniciar Análise Telefônica</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Análise Telemática</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">Análise de dados de navegação e interceptações digitais</p>
              <Button className="btn-primary w-full">Iniciar Análise Telemática</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evidence Details Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{selectedEvidence.name}</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvidence(null)}
                  className="text-slate-300 border-slate-600"
                >
                  Fechar
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Analysis Options */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Opções de Análise</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full btn-primary justify-start"
                      onClick={() => startAnalysis(selectedEvidence.id, 'phone')}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Análise Telefônica
                    </Button>
                    <Button 
                      className="w-full btn-primary justify-start"
                      onClick={() => startAnalysis(selectedEvidence.id, 'telematics')}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Análise Telemática
                    </Button>
                    <Button 
                      className="w-full btn-primary justify-start"
                      onClick={() => createIPEDProject([selectedEvidence.id], `IPED_${selectedEvidence.evidence_number}`)}
                    >
                      <HardDrive className="h-4 w-4 mr-2" />
                      Criar Projeto IPED
                    </Button>
                    <Button className="w-full btn-secondary justify-start">
                      <Hash className="h-4 w-4 mr-2" />
                      Verificar Integridade
                    </Button>
                  </div>
                </div>
                
                {/* Evidence Details */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Detalhes da Evidência</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400">Número:</span>
                      <p className="text-white">{selectedEvidence.evidence_number}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Tipo:</span>
                      <p className="text-white capitalize">{selectedEvidence.type}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Origem:</span>
                      <p className="text-white">{selectedEvidence.source}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Tamanho:</span>
                      <p className="text-white">{formatFileSize(selectedEvidence.file_size)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Status da Análise:</span>
                      <div className="mt-1">{getStatusBadge(selectedEvidence.analysis_status)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Nível de Confidencialidade:</span>
                      <div className="mt-1">{getConfidentialityBadge(selectedEvidence.confidentiality)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalForensics;