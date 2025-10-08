import React, { useState, useEffect } from 'react';
import { 
  Phone,
  Smartphone,
  Radio,
  Map,
  Clock,
  Users,
  Search,
  Upload,
  Download,
  Play,
  Pause,
  SkipForward,
  Volume2,
  FileAudio,
  MessageCircle,
  Navigation,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Eye,
  Zap,
  Target,
  Network
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InterceptionAnalysis = ({ currentUser }) => {
  const [analyses, setAnalyses] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('phone');
  const [processingJobs, setProcessingJobs] = useState([]);
  const [analysisResults, setAnalysisResults] = useState({});

  // Sample data for demonstration
  const [phoneAnalyses, setPhoneAnalyses] = useState([
    {
      id: '1',
      case_id: 'case-1',
      evidence_id: 'ev-001',
      analysis_type: 'phone',
      status: 'completed',
      progress: 100,
      source_data: 'CDR_Dataset_001.csv',
      analyst_id: currentUser?.id,
      analysis_date: new Date().toISOString(),
      results: {
        total_calls: 1247,
        total_contacts: 89,
        analysis_period: '30 dias',
        top_contacts: [
          { name: 'Contato A', number: '+55 11 9****-0001', calls: 145, duration: '12h 34min' },
          { name: 'Contato B', number: '+55 11 9****-0002', calls: 98, duration: '8h 45min' },
          { name: 'Contato C', number: '+55 11 9****-0003', calls: 67, duration: '5h 23min' }
        ],
        timeline_analysis: {
          most_active_hour: '14:00-15:00',
          most_active_day: 'Terça-feira',
          average_call_duration: '4min 32s'
        },
        geographic_data: {
          locations_count: 23,
          most_frequent_location: 'São Paulo - Centro',
          coverage_area: 'Grande São Paulo'
        }
      },
      extracted_calls: 1247,
      extracted_messages: 2341,
      extracted_contacts: 89
    }
  ]);

  const [telematicsAnalyses, setTelematicsAnalyses] = useState([
    {
      id: '2',
      case_id: 'case-1',
      evidence_id: 'ev-002',
      analysis_type: 'telematics',
      status: 'processing',
      progress: 65,
      source_data: 'Vehicle_Telematics_Data.json',
      analyst_id: currentUser?.id,
      analysis_date: new Date().toISOString(),
      results: {
        total_trips: 234,
        total_distance: '12.456 km',
        analysis_period: '15 dias',
        routes_analyzed: 45,
        speed_violations: 23,
        location_points: 5678,
        most_visited_locations: [
          { name: 'Escritório Central', visits: 45, time: '156h' },
          { name: 'Tribunal de Justiça', visits: 23, time: '67h' },
          { name: 'Residência', visits: 89, time: '234h' }
        ]
      }
    }
  ]);

  useEffect(() => {
    fetchAnalyses();
    fetchEvidence();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/analysis/interception`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyses(response.data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      // Use sample data for demo
      setAnalyses([...phoneAnalyses, ...telematicsAnalyses]);
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

  const startNewAnalysis = async (analysisType, evidenceId) => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      
      const analysisData = {
        case_id: 'case-1', // Should be selected from UI
        evidence_id: evidenceId,
        analysis_type: analysisType,
        source_data: `data_${evidenceId}.raw`,
        analyst_id: currentUser.id,
        analysis_params: getAnalysisParams(analysisType)
      };
      
      await axios.post(`${API}/analysis/interception`, analysisData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Análise ${analysisType} iniciada com sucesso`);
      fetchAnalyses();
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error('Erro ao iniciar análise');
    }
  };

  const getAnalysisParams = (type) => {
    const params = {
      'phone': {
        extract_calls: true,
        extract_sms: true,
        extract_contacts: true,
        timeline_analysis: true,
        frequency_analysis: true,
        geographic_analysis: true
      },
      'telematics': {
        extract_routes: true,
        extract_locations: true,
        speed_analysis: true,
        timeline_analysis: true,
        geofencing: true,
        pattern_analysis: true
      }
    };
    return params[type] || {};
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const config = {
      'pending': { label: 'Aguardando', className: 'bg-yellow-500', icon: Clock },
      'processing': { label: 'Processando', className: 'bg-blue-500', icon: Zap },
      'completed': { label: 'Concluído', className: 'bg-green-500', icon: Eye },
      'failed': { label: 'Falha', className: 'bg-red-500', icon: Target }
    };
    
    const statusConfig = config[status] || config['pending'];
    const IconComponent = statusConfig.icon;
    
    return (
      <Badge className={`${statusConfig.className} text-white flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{statusConfig.label}</span>
      </Badge>
    );
  };

  const renderPhoneAnalysis = (analysis) => {
    if (!analysis.results) return null;
    
    const { results } = analysis;
    
    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">{results.total_calls}</p>
              <p className="text-slate-400 text-sm">Total de Ligações</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">{analysis.extracted_messages}</p>
              <p className="text-slate-400 text-sm">Mensagens</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{results.total_contacts}</p>
              <p className="text-slate-400 text-sm">Contatos Únicos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-orange-400 mb-2" />
              <p className="text-2xl font-bold text-white">{results.analysis_period}</p>
              <p className="text-slate-400 text-sm">Período Analisado</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Contacts */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Principais Contatos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.top_contacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{contact.name}</p>
                      <p className="text-slate-400 text-sm">{contact.number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{contact.calls} ligações</p>
                    <p className="text-slate-400 text-sm">{contact.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Análise Temporal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-slate-400">Horário Mais Ativo:</span>
                <p className="text-white font-semibold">{results.timeline_analysis.most_active_hour}</p>
              </div>
              <div>
                <span className="text-slate-400">Dia Mais Ativo:</span>
                <p className="text-white font-semibold">{results.timeline_analysis.most_active_day}</p>
              </div>
              <div>
                <span className="text-slate-400">Duração Média:</span>
                <p className="text-white font-semibold">{results.timeline_analysis.average_call_duration}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Map className="h-5 w-5" />
                <span>Dados Geográficos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-slate-400">Localizações:</span>
                <p className="text-white font-semibold">{results.geographic_data.locations_count}</p>
              </div>
              <div>
                <span className="text-slate-400">Local Mais Frequente:</span>
                <p className="text-white font-semibold">{results.geographic_data.most_frequent_location}</p>
              </div>
              <div>
                <span className="text-slate-400">Área de Cobertura:</span>
                <p className="text-white font-semibold">{results.geographic_data.coverage_area}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderTelematicsAnalysis = (analysis) => {
    if (!analysis.results) return null;
    
    const { results } = analysis;
    
    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 text-center">
              <Navigation className="h-8 w-8 mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">{results.total_trips}</p>
              <p className="text-slate-400 text-sm">Total de Viagens</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 text-center">
              <Map className="h-8 w-8 mx-auto text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">{results.total_distance}</p>
              <p className="text-slate-400 text-sm">Distância Total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{results.routes_analyzed}</p>
              <p className="text-slate-400 text-sm">Rotas Analisadas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto text-red-400 mb-2" />
              <p className="text-2xl font-bold text-white">{results.speed_violations}</p>
              <p className="text-slate-400 text-sm">Violações</p>
            </CardContent>
          </Card>
        </div>

        {/* Most Visited Locations */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Map className="h-5 w-5" />
              <span>Locais Mais Visitados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.most_visited_locations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{location.name}</p>
                      <p className="text-slate-400 text-sm">Tempo total: {location.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{location.visits} visitas</p>
                    <Button size="sm" variant="outline" className="mt-1 text-slate-300 border-slate-500">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver no Mapa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const generateAnalysisReport = async (analysisId) => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.post(`${API}/analysis/${analysisId}/report`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_analise_${analysisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Relatório gerado e baixado com sucesso');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando módulo de análise de interceptações...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Análise de Interceptações</h1>
          <p className="text-slate-400">Processamento avançado de dados telefônicos e telemáticos</p>
        </div>
        <div className="flex space-x-2">
          <Button className="btn-secondary flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Importar Dados</span>
          </Button>
          <Button className="btn-primary flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Nova Análise</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="phone" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Phone className="h-4 w-4 mr-2" />
            Análise Telefônica
          </TabsTrigger>
          <TabsTrigger value="telematics" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Radio className="h-4 w-4 mr-2" />
            Análise Telemática
          </TabsTrigger>
          <TabsTrigger value="network" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Network className="h-4 w-4 mr-2" />
            Análise de Rede
          </TabsTrigger>
        </TabsList>

        {/* Phone Analysis Tab */}
        <TabsContent value="phone" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analysis List */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Análises Telefônicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {phoneAnalyses.map((analysis) => (
                      <div 
                        key={analysis.id}
                        onClick={() => setSelectedAnalysis(analysis)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedAnalysis?.id === analysis.id 
                            ? 'bg-cyan-500 bg-opacity-20 border border-cyan-400' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium text-sm">{analysis.source_data}</p>
                          {getStatusBadge(analysis.status)}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(analysis.analysis_date)}</span>
                        </div>
                        {analysis.status === 'processing' && (
                          <div className="mt-2">
                            <Progress value={analysis.progress} className="h-1" />
                            <span className="text-xs text-slate-400">{analysis.progress}% completo</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full mt-4 btn-primary"
                    onClick={() => startNewAnalysis('phone', 'new-evidence')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Análise Telefônica
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="lg:col-span-2">
              {selectedAnalysis && selectedAnalysis.analysis_type === 'phone' ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Resultados da Análise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderPhoneAnalysis(selectedAnalysis)}
                    
                    <div className="mt-6 flex space-x-3">
                      <Button className="btn-primary flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Exportar Dados</span>
                      </Button>
                      <Button 
                        className="btn-secondary flex items-center space-x-2"
                        onClick={() => generateAnalysisReport(selectedAnalysis.id)}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Gerar Relatório</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-800 border-slate-700 h-full">
                  <CardContent className="p-12 text-center flex items-center justify-center">
                    <div>
                      <Phone className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <p className="text-slate-400">Selecione uma análise para ver os resultados</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Telematics Analysis Tab */}
        <TabsContent value="telematics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analysis List */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Análises Telemáticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {telematicsAnalyses.map((analysis) => (
                      <div 
                        key={analysis.id}
                        onClick={() => setSelectedAnalysis(analysis)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedAnalysis?.id === analysis.id 
                            ? 'bg-cyan-500 bg-opacity-20 border border-cyan-400' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium text-sm">{analysis.source_data}</p>
                          {getStatusBadge(analysis.status)}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(analysis.analysis_date)}</span>
                        </div>
                        {analysis.status === 'processing' && (
                          <div className="mt-2">
                            <Progress value={analysis.progress} className="h-1" />
                            <span className="text-xs text-slate-400">{analysis.progress}% completo</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full mt-4 btn-primary"
                    onClick={() => startNewAnalysis('telematics', 'new-telematics-evidence')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Análise Telemática
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="lg:col-span-2">
              {selectedAnalysis && selectedAnalysis.analysis_type === 'telematics' ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Resultados da Análise Telemática</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderTelematicsAnalysis(selectedAnalysis)}
                    
                    <div className="mt-6 flex space-x-3">
                      <Button className="btn-primary flex items-center space-x-2">
                        <Map className="h-4 w-4" />
                        <span>Ver Mapa Interativo</span>
                      </Button>
                      <Button className="btn-secondary flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Exportar KML</span>
                      </Button>
                      <Button 
                        className="btn-secondary flex items-center space-x-2"
                        onClick={() => generateAnalysisReport(selectedAnalysis.id)}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Relatório PDF</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-800 border-slate-700 h-full">
                  <CardContent className="p-12 text-center flex items-center justify-center">
                    <div>
                      <Radio className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <p className="text-slate-400">Selecione uma análise telemática para ver os resultados</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Network Analysis Tab */}
        <TabsContent value="network" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Análise de Rede de Contatos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-400">
                <Network className="h-12 w-12 mx-auto mb-4" />
                <p className="mb-4">Sistema de análise de rede social em desenvolvimento</p>
                <p className="text-sm">Em breve: Visualização de redes de contatos, análise de vínculos e mapeamento de relacionamentos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterceptionAnalysis;