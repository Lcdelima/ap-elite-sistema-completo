/**
 * Forensics Management - Elite Gravitas™
 * Dashboard completo de perícias digitais
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import { BackBar } from '../../components/BackBar';
import {
  Microscope,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Archive,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  Shield,
  TrendingUp
} from 'lucide-react';

const ForensicsManagement = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tipo: '',
    status: '',
    priority: ''
  });

  useEffect(() => {
    fetchCases();
    fetchStats();
  }, [filters]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/forensics?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error('Erro ao buscar casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/forensics/stats/overview`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const forensicTypes = {
    'celular': { icon: '📱', name: 'Celular', color: 'blue' },
    'hd': { icon: '💾', name: 'HD/SSD', color: 'purple' },
    'nuvem': { icon: '☁️', name: 'Nuvem', color: 'cyan' },
    'rede': { icon: '🌐', name: 'Rede', color: 'green' },
    'sistema': { icon: '🖥️', name: 'Sistema', color: 'orange' },
    'memoria': { icon: '🧠', name: 'Memória', color: 'red' },
    'email': { icon: '📧', name: 'E-mail', color: 'yellow' }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'coleta': { color: 'blue', icon: Clock, label: 'Coleta' },
      'analise': { color: 'yellow', icon: TrendingUp, label: 'Análise' },
      'laudo': { color: 'purple', icon: FileText, label: 'Laudo' },
      'concluido': { color: 'green', icon: CheckCircle, label: 'Concluído' },
      'arquivado': { color: 'gray', icon: Archive, label: 'Arquivado' }
    };
    return configs[status] || configs.coleta;
  };

  const getPriorityBadge = (priority) => {
    const configs = {
      'baixa': 'bg-green-500/20 text-green-300',
      'normal': 'bg-blue-500/20 text-blue-300',
      'alta': 'bg-orange-500/20 text-orange-300',
      'urgente': 'bg-red-500/20 text-red-300'
    };
    return configs[priority] || configs.normal;
  };

  return (
    <StandardModuleLayout>
      <BackBar
        trail={['ATHENA', 'Perícia Digital Forense']}
        actions={
          <button
            onClick={() => navigate('/athena/forensics/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus size={18} />
            Novo Caso Pericial
          </button>
        }
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Perícia Digital Forense</h1>
          <p className="text-slate-400">
            Núcleo técnico-científico com compliance ISO 27037
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-4 rounded-lg border border-cyan-500/30">
            <div className="text-3xl font-bold text-white mb-1">{stats.total_cases || 0}</div>
            <div className="text-xs text-cyan-300">Total de Casos</div>
            <Microscope className="absolute top-4 right-4 text-cyan-500/30" size={32} />
          </div>

          {stats.by_status && Object.entries(stats.by_status).slice(0, 4).map(([status, count]) => {
            const config = getStatusConfig(status);
            const Icon = config.icon;
            return (
              <div key={status} className={`bg-gradient-to-br from-${config.color}-900/30 to-${config.color}-800/20 p-4 rounded-lg border border-${config.color}-500/30`}>
                <div className="text-3xl font-bold text-white mb-1">{count}</div>
                <div className={`text-xs text-${config.color}-300`}>{config.label}</div>
                <Icon className={`absolute top-4 right-4 text-${config.color}-500/30`} size={32} />
              </div>
            );
          })}
        </div>

        {/* Tipos de Perícia */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Tipos de Perícia Disponíveis</h2>
          <div className="grid grid-cols-7 gap-3">
            {Object.entries(forensicTypes).map(([key, type]) => (
              <div
                key={key}
                className={`bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-${type.color}-500/30 transition-all cursor-pointer text-center group`}
                onClick={() => setFilters({...filters, tipo: key})}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm text-white group-hover:text-cyan-300 transition-colors">{type.name}</div>
                <div className={`text-xs text-${type.color}-400 mt-1`}>
                  {stats.by_tipo?.[key] || 0} casos
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Tipo</label>
              <select
                value={filters.tipo}
                onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todos</option>
                {Object.entries(forensicTypes).map(([key, type]) => (
                  <option key={key} value={key}>{type.name}</option>
                ))}
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
                <option value="coleta">Coleta</option>
                <option value="analise">Análise</option>
                <option value="laudo">Laudo</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Prioridade</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todas</option>
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ tipo: '', status: '', priority: '' })}
                className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg text-sm transition-all"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Cases List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Carregando casos...</div>
        ) : cases.length === 0 ? (
          <div className="bg-slate-800/50 p-12 rounded-lg border border-slate-700/50 text-center">
            <Microscope size={64} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum caso pericial encontrado</h3>
            <p className="text-slate-400 mb-6">Comece criando seu primeiro caso</p>
            <button
              onClick={() => navigate('/athena/forensics/new')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium"
            >
              <Plus size={18} className="inline mr-2" />
              Criar Primeiro Caso
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map(case_item => {
              const statusConfig = getStatusConfig(case_item.status);
              const StatusIcon = statusConfig.icon;
              const typeInfo = forensicTypes[case_item.tipo] || forensicTypes.sistema;

              return (
                <div
                  key={case_item.id}
                  className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/athena/forensics/${case_item.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{typeInfo.icon}</div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {case_item.title}
                          </h3>
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-500/20 text-${statusConfig.color}-300 border border-${statusConfig.color}-500/30`}>
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(case_item.priority)}`}>
                            {case_item.priority?.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-sm text-slate-400 mb-3">
                          {case_item.case_number} • {case_item.client_name}
                        </div>

                        {case_item.description && (
                          <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                            {case_item.description}
                          </p>
                        )}

                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Tipo</div>
                            <div className="text-white capitalize">{typeInfo.name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Evidências</div>
                            <div className="text-cyan-300 font-medium">{case_item.evidences_count || 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Laudos</div>
                            <div className="text-purple-300 font-medium">{case_item.reports_count || 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Eventos Custódia</div>
                            <div className="text-amber-300 font-medium">{case_item.custody_events_count || 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Criado em</div>
                            <div className="text-white">
                              {new Date(case_item.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/athena/forensics/${case_item.id}`);
                        }}
                        className="p-2 bg-slate-700/50 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-600 hover:border-cyan-500/30 transition-all"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StandardModuleLayout>
  );
};

export default ForensicsManagement;
