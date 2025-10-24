import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StandardModuleLayout,
  ActionButton,
  StandardCard,
  StandardSearchBar,
  StandardEmptyState,
  StandardAlert
} from '../../components/StandardModuleLayout';
import { Badge } from '../../components/ui/badge';
import {
  FileBarChart, Download, Clock, CheckCircle, AlertCircle,
  TrendingUp, BarChart3, FileText, User, MapPin, Calendar,
  Filter, Plus, Eye, Sparkles, Zap, Archive, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const AutomatedReportsComplete = () => {
  const [templates, setTemplates] = useState([]);
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('ap_elite_token');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTemplates(),
      fetchReports()
    ]);
    setLoading(false);
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/reports/templates`, {
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
      const res = await axios.get(`${backendUrl}/api/reports/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReports(res.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
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
      const payload = {
        template_type: selectedTemplate,
        ...reportForm
      };

      await axios.post(
        `${backendUrl}/api/reports/generate`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Relatório gerado com sucesso!');
      
      await fetchReports();
      
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
      const res = await axios.get(
        `${backendUrl}/api/reports/download/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

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
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const getStats = () => {
    return {
      total: reports.length,
      completed: reports.filter(r => r.status === 'completed').length,
      processing: reports.filter(r => r.status === 'processing').length,
      templates: templates.length
    };
  };

  const stats = getStats();

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.investigator_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const headerActions = [
    {
      label: 'Gerar Relatório',
      icon: Plus,
      onClick: () => document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' }),
      variant: 'primary'
    },
    {
      label: 'Atualizar',
      icon: RefreshCw,
      onClick: fetchReports,
      variant: 'default'
    }
  ];

  return (
    <StandardModuleLayout
      title="Relatórios Automatizados Profissionais"
      subtitle="Sistema avançado de geração inteligente de relatórios com IA"
      icon={FileBarChart}
      color="cyan"
      category="Relatórios"
      actions={headerActions}
      loading={loading}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Relatórios Gerados</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="h-10 w-10 text-indigo-400" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Templates</p>
              <p className="text-3xl font-bold text-white">{stats.templates}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-400" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Processando</p>
              <p className="text-3xl font-bold text-white">{stats.processing}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-400 animate-pulse" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Concluídos</p>
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </StandardCard>
      </div>

      {/* Report Generation Form */}
      <StandardCard
        id="report-form"
        title="Gerar Novo Relatório"
        icon={FileText}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleGenerateReport(); }} className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Selecionar Template *
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
              required
            >
              <option value="">Escolha um template...</option>
              {templates.map((template, idx) => (
                <option key={idx} value={template.type}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                required
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                required
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Checkboxes for inclusion options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Incluir no Relatório:
            </p>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reportForm.include_evidence}
                onChange={(e) => setReportForm({...reportForm, include_evidence: e.target.checked})}
                className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-gray-300">Evidências coletadas</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reportForm.include_timeline}
                onChange={(e) => setReportForm({...reportForm, include_timeline: e.target.checked})}
                className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-gray-300">Linha do tempo</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reportForm.include_suspects}
                onChange={(e) => setReportForm({...reportForm, include_suspects: e.target.checked})}
                className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-gray-300">Suspeitos e envolvidos</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reportForm.include_analysis}
                onChange={(e) => setReportForm({...reportForm, include_analysis: e.target.checked})}
                className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-gray-300">Análise e conclusões (IA)</span>
            </label>
          </div>

          {/* Generate Button */}
          <div className="pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
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
        </form>
      </StandardCard>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <StandardSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por caso ou investigador..."
        />
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">Todos os Status</option>
            <option value="completed">Concluídos</option>
            <option value="processing">Em Processamento</option>
            <option value="failed">Com Erro</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <StandardCard
        title="Relatórios Gerados"
        icon={FileBarChart}
      >
        {filteredReports.length === 0 ? (
          <StandardEmptyState
            icon={FileText}
            title="Nenhum relatório encontrado"
            description="Gere seu primeiro relatório automatizado com IA"
            action={{
              label: 'Gerar Relatório',
              icon: Plus,
              onClick: () => document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' }),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report, idx) => (
              <div
                key={idx}
                className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
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
                        {report.created_at ? new Date(report.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> {report.request_id?.slice(0, 8)}...
                      </div>
                    </div>
                  </div>

                  {report.status === 'completed' && (
                    <ActionButton
                      label="Download"
                      icon={Download}
                      onClick={() => handleDownload(report.request_id)}
                      variant="primary"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </StandardCard>
    </StandardModuleLayout>
  );
};

export default AutomatedReportsComplete;
