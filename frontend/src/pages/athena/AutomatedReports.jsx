import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  FileBarChart,
  Loader,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AutomatedReports = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [reportForm, setReportForm] = useState({
    investigation_id: '',
    case_number: '',
    investigator_name: '',
    location: '',
    date_range: {
      start: '',
      end: ''
    },
    include_evidence: true,
    include_timeline: true,
    include_suspects: true,
    include_analysis: true
  });

  useEffect(() => {
    fetchTemplates();
    fetchReports();
  }, []);

  const fetchTemplates = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/reports/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplates(res.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    }
  };

  const fetchReports = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/reports/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReports(res.data.reports || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      toast.error('Selecione um template');
      return;
    }

    if (!reportForm.case_number || !reportForm.investigator_name) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setGenerating(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const payload = {
        template_type: selectedTemplate,
        ...reportForm
      };

      const res = await axios.post(
        `${BACKEND_URL}/api/reports/generate`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Relatório gerado com sucesso!');
      
      // Refresh reports list
      await fetchReports();
      
      // Reset form
      setReportForm({
        investigation_id: '',
        case_number: '',
        investigator_name: '',
        location: '',
        date_range: { start: '', end: '' },
        include_evidence: true,
        include_timeline: true,
        include_suspects: true,
        include_analysis: true
      });
      setSelectedTemplate('');
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (requestId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(
        `${BACKEND_URL}/api/reports/download/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${requestId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Erro ao baixar relatório');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-500', icon: CheckCircle, text: 'Concluído' },
      processing: { color: 'bg-yellow-500', icon: Clock, text: 'Processando' },
      failed: { color: 'bg-red-500', icon: AlertCircle, text: 'Erro' }
    };

    const config = statusConfig[status] || statusConfig.processing;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/athena')}
            className="flex items-center text-white hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar para Athena
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileBarChart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Relatórios Automatizados</h1>
              <p className="text-indigo-100">Geração inteligente de relatórios com IA</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Relatórios Gerados</p>
                  <p className="text-3xl font-bold text-white">{reports.length}</p>
                </div>
                <FileText className="h-10 w-10 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Templates</p>
                  <p className="text-3xl font-bold text-white">{templates.length}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Processando</p>
                  <p className="text-3xl font-bold text-white">
                    {reports.filter(r => r.status === 'processing').length}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Concluídos</p>
                  <p className="text-3xl font-bold text-white">
                    {reports.filter(r => r.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Generation Form */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-indigo-500" />
              Gerar Novo Relatório
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Selecionar Template *
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Escolha um template...</option>
                  {templates.map((template, idx) => (
                    <option key={idx} value={template.type}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Número do Caso *
                </label>
                <input
                  type="text"
                  value={reportForm.case_number}
                  onChange={(e) => setReportForm({...reportForm, case_number: e.target.value})}
                  placeholder="Ex: IP-2025-001"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Investigation ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ID da Investigação
                </label>
                <input
                  type="text"
                  value={reportForm.investigation_id}
                  onChange={(e) => setReportForm({...reportForm, investigation_id: e.target.value})}
                  placeholder="ID interno"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Investigator Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Nome do Investigador *
                </label>
                <input
                  type="text"
                  value={reportForm.investigator_name}
                  onChange={(e) => setReportForm({...reportForm, investigator_name: e.target.value})}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Localização
                </label>
                <input
                  type="text"
                  value={reportForm.location}
                  onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                  placeholder="Cidade/Estado"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data Início
                </label>
                <input
                  type="date"
                  value={reportForm.date_range.start}
                  onChange={(e) => setReportForm({
                    ...reportForm,
                    date_range: {...reportForm.date_range, start: e.target.value}
                  })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data Fim
                </label>
                <input
                  type="date"
                  value={reportForm.date_range.end}
                  onChange={(e) => setReportForm({
                    ...reportForm,
                    date_range: {...reportForm.date_range, end: e.target.value}
                  })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Checkboxes for inclusion options */}
              <div className="md:col-span-2 space-y-3">
                <p className="text-sm font-medium text-gray-300 mb-2">Incluir no Relatório:</p>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportForm.include_evidence}
                    onChange={(e) => setReportForm({...reportForm, include_evidence: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-300">Evidências coletadas</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportForm.include_timeline}
                    onChange={(e) => setReportForm({...reportForm, include_timeline: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-300">Linha do tempo</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportForm.include_suspects}
                    onChange={(e) => setReportForm({...reportForm, include_suspects: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-300">Suspeitos e envolvidos</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportForm.include_analysis}
                    onChange={(e) => setReportForm({...reportForm, include_analysis: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-300">Análise e conclusões (IA)</span>
                </label>
              </div>

              {/* Generate Button */}
              <div className="md:col-span-2">
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {generating ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Gerando Relatório...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5" />
                      <span>Gerar Relatório com IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <FileBarChart className="h-6 w-6 mr-2 text-purple-500" />
              Relatórios Gerados
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum relatório gerado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {report.case_number || `Relatório #${idx + 1}`}
                          </h3>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                          <div>
                            <span className="font-medium">Template:</span> {report.template_type}
                          </div>
                          <div>
                            <span className="font-medium">Investigador:</span> {report.investigator_name}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>{' '}
                            {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span> {report.request_id?.slice(0, 8)}...
                          </div>
                        </div>
                      </div>

                      {report.status === 'completed' && (
                        <button
                          onClick={() => handleDownload(report.request_id)}
                          className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomatedReports;
