/**
 * Jobs Management - Elite Gravitas™
 * Gestão de trabalhos/engajamentos por cliente
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import { BackBar } from '../../components/BackBar';
import {
  Briefcase,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react';

const JobsManagement = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    risk_level: '',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.risk_level) queryParams.append('risk_level', filters.risk_level);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/jobs?${queryParams}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setJobs(data.jobs || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Erro ao buscar jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'novo': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', icon: Clock },
      'em_andamento': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: TrendingUp },
      'pausado': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', icon: AlertCircle },
      'concluido': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: CheckCircle },
      'cancelado': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: AlertCircle }
    };
    const config = statusConfig[status] || statusConfig.novo;
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon size={12} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getRiskBadge = (risk) => {
    const riskConfig = {
      'baixo': { bg: 'bg-green-500/20', text: 'text-green-300' },
      'medio': { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
      'alto': { bg: 'bg-orange-500/20', text: 'text-orange-300' },
      'critico': { bg: 'bg-red-500/20', text: 'text-red-300' }
    };
    const config = riskConfig[risk] || riskConfig.medio;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {risk.toUpperCase()}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      'judicial_process': '⚖️',
      'pericia': '🔬',
      'contrato': '📄',
      'consultoria': '💼',
      'investigacao': '🔍',
      'comunicacao': '📧',
      'interceptacao': '📞',
      'diversos': '📋'
    };
    return icons[type] || '📋';
  };

  return (
    <StandardModuleLayout>
      <BackBar
        trail={['ATHENA', 'Gestão de Jobs']}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus size={18} />
            Novo Job
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Novo', count: stats.novo || 0, color: 'blue' },
            { label: 'Em Andamento', count: stats.em_andamento || 0, color: 'yellow' },
            { label: 'Pausado', count: stats.pausado || 0, color: 'gray' },
            { label: 'Concluído', count: stats.concluido || 0, color: 'green' },
            { label: 'Cancelado', count: stats.cancelado || 0, color: 'red' }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-${stat.color}-900/30 to-${stat.color}-800/20 p-4 rounded-lg border border-${stat.color}-500/30`}
            >
              <div className="text-2xl font-bold text-white">{stat.count}</div>
              <div className={`text-xs text-${stat.color}-300`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Tipo de Job</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="judicial_process">Processo Judicial</option>
                <option value="pericia">Perícia</option>
                <option value="contrato">Contrato</option>
                <option value="consultoria">Consultoria</option>
                <option value="investigacao">Investigação</option>
                <option value="comunicacao">Comunicação</option>
                <option value="interceptacao">Interceptação</option>
                <option value="diversos">Diversos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="novo">Novo</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="pausado">Pausado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Nível de Risco</label>
              <select
                value={filters.risk_level}
                onChange={(e) => setFilters({...filters, risk_level: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="baixo">Baixo</option>
                <option value="medio">Médio</option>
                <option value="alto">Alto</option>
                <option value="critico">Crítico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Número, título..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Carregando jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-slate-800/50 p-12 rounded-lg border border-slate-700/50 text-center">
            <Briefcase size={64} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum job encontrado</h3>
            <p className="text-slate-400 mb-6">Comece criando seu primeiro job</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium"
            >
              <Plus size={18} className="inline mr-2" />
              Criar Primeiro Job
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all group cursor-pointer"
                onClick={() => navigate(`/athena/jobs/${job.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(job.type)}</span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {job.title}
                      </h3>
                      {getStatusBadge(job.status)}
                      {getRiskBadge(job.risk_level)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                      <span className="font-mono">{job.job_number}</span>
                      <span>•</span>
                      <span>{job.client_name}</span>
                    </div>
                    {job.description && (
                      <p className="text-sm text-slate-300 line-clamp-2">{job.description}</p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/athena/jobs/${job.id}`);
                    }}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-600 hover:border-cyan-500/30 transition-all flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Ver Detalhes
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-4 pt-4 border-t border-slate-700/50 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <FileText size={14} />
                      <span className="text-xs">Arquivos</span>
                    </div>
                    <div className="text-white font-medium">{job.files_count || 0}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Calendar size={14} />
                      <span className="text-xs">Prazos</span>
                    </div>
                    <div className="text-white font-medium">{job.deadlines_count || 0}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Users size={14} />
                      <span className="text-xs">Equipe</span>
                    </div>
                    <div className="text-white font-medium">{(job.team_members?.length || 0) + 1}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <DollarSign size={14} />
                      <span className="text-xs">Faturado</span>
                    </div>
                    <div className="text-green-300 font-medium">
                      R$ {job.total_billed?.toLocaleString('pt-BR') || '0'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Clock size={14} />
                      <span className="text-xs">Horas</span>
                    </div>
                    <div className="text-white font-medium">{job.hours_worked || 0}h</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Criado</div>
                    <div className="text-white font-medium">
                      {new Date(job.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Job Modal (Placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg border border-cyan-500/30 p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Criar Novo Job</h2>
            <p className="text-slate-400 mb-4">
              Modal de criação em desenvolvimento. Backend pronto e funcional.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default JobsManagement;
