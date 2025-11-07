/**
 * Deadlines Management - Elite Gravitas™
 * Gestão de Prazos com alertas inteligentes D-3/D-1/D
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import { BackBar } from '../../components/BackBar';
import {
  Calendar,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Bell,
  TrendingUp,
  FileText,
  User
} from 'lucide-react';

const DeadlinesManagement = () => {
  const navigate = useNavigate();
  const [deadlines, setDeadlines] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDeadlines();
  }, [activeFilter]);

  const fetchDeadlines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/deadlines`;
      
      if (activeFilter !== 'todos') {
        url += `?status=${activeFilter}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDeadlines(data.deadlines || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Erro ao buscar prazos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'vencido': {
        color: 'red',
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        text: 'text-red-300',
        icon: XCircle,
        label: 'Vencido'
      },
      'vence_hoje': {
        color: 'orange',
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/50',
        text: 'text-orange-300',
        icon: AlertTriangle,
        label: 'Vence Hoje'
      },
      'alerta_d1': {
        color: 'yellow',
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-300',
        icon: Clock,
        label: 'D-1'
      },
      'alerta_d3': {
        color: 'amber',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/50',
        text: 'text-amber-300',
        icon: Bell,
        label: 'D-3'
      },
      'concluido': {
        color: 'green',
        bg: 'bg-green-500/20',
        border: 'border-green-500/50',
        text: 'text-green-300',
        icon: CheckCircle,
        label: 'Concluído'
      },
      'normal': {
        color: 'blue',
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/50',
        text: 'text-blue-300',
        icon: Calendar,
        label: 'Normal'
      }
    };
    return configs[status] || configs.normal;
  };

  const getRiskConfig = (risk) => {
    const configs = {
      'baixo': { color: 'green', label: 'Baixo' },
      'medio': { color: 'yellow', label: 'Médio' },
      'alto': { color: 'orange', label: 'Alto' },
      'critico': { color: 'red', label: 'Crítico' }
    };
    return configs[risk] || configs.medio;
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      'judicial': '⚖️',
      'pericia': '🔬',
      'financeiro': '💰',
      'administrativo': '📋',
      'audiencia': '👨‍⚖️'
    };
    return icons[tipo] || '📅';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const calculateDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredDeadlines = deadlines.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StandardModuleLayout>
      <BackBar
        trail={['ATHENA', 'Gestão de Prazos']}
        actions={
          <button
            onClick={() => navigate('/athena/deadlines/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus size={18} />
            Novo Prazo
          </button>
        }
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Prazos</h1>
          <p className="text-slate-400">
            Controle D-3/D-1/D com alertas inteligentes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              activeFilter === 'todos'
                ? 'bg-cyan-900/30 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30'
            }`}
            onClick={() => setActiveFilter('todos')}
          >
            <div className="text-3xl font-bold text-white mb-1">{stats.total || 0}</div>
            <div className="text-xs text-slate-400">Total</div>
            <Calendar className="absolute top-4 right-4 text-cyan-500/30" size={32} />
          </div>

          <div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              activeFilter === 'alerta_d3'
                ? 'bg-amber-900/30 border-amber-500/50 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30'
            }`}
            onClick={() => setActiveFilter('alerta_d3')}
          >
            <div className="text-3xl font-bold text-amber-300 mb-1">{stats.alerta_d3 || 0}</div>
            <div className="text-xs text-amber-300">D-3</div>
            <Bell className="absolute top-4 right-4 text-amber-500/30" size={32} />
          </div>

          <div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              activeFilter === 'alerta_d1'
                ? 'bg-yellow-900/30 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-yellow-500/30'
            }`}
            onClick={() => setActiveFilter('alerta_d1')}
          >
            <div className="text-3xl font-bold text-yellow-300 mb-1">{stats.alerta_d1 || 0}</div>
            <div className="text-xs text-yellow-300">D-1</div>
            <Clock className="absolute top-4 right-4 text-yellow-500/30" size={32} />
          </div>

          <div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              activeFilter === 'vencido'
                ? 'bg-red-900/30 border-red-500/50 shadow-lg shadow-red-500/20'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-red-500/30'
            }`}
            onClick={() => setActiveFilter('vencido')}
          >
            <div className="text-3xl font-bold text-red-300 mb-1">{stats.vencidos || 0}</div>
            <div className="text-xs text-red-300">Vencidos</div>
            <XCircle className="absolute top-4 right-4 text-red-500/30" size={32} />
          </div>

          <div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              activeFilter === 'concluido'
                ? 'bg-green-900/30 border-green-500/50 shadow-lg shadow-green-500/20'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-green-500/30'
            }`}
            onClick={() => setActiveFilter('concluido')}
          >
            <div className="text-3xl font-bold text-green-300 mb-1">{stats.concluidos || 0}</div>
            <div className="text-xs text-green-300">Concluídos</div>
            <CheckCircle className="absolute top-4 right-4 text-green-500/30" size={32} />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'todos'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('alerta_d3')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'alerta_d3'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
              }`}
            >
              D-3
            </button>
            <button
              onClick={() => setActiveFilter('alerta_d1')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'alerta_d1'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
              }`}
            >
              D-1
            </button>
            <button
              onClick={() => setActiveFilter('vencido')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'vencido'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
              }`}
            >
              Vencidos
            </button>
            <button
              onClick={() => setActiveFilter('concluido')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'concluido'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
              }`}
            >
              Concluídos
            </button>

            <div className="flex-1" />

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar prazo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Deadlines List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Carregando prazos...</div>
        ) : filteredDeadlines.length === 0 ? (
          <div className="bg-slate-800/50 p-12 rounded-lg border border-slate-700/50 text-center">
            <Calendar size={64} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum prazo encontrado</h3>
            <p className="text-slate-400 mb-6">
              {activeFilter !== 'todos' 
                ? `Não há prazos com status "${activeFilter}"`
                : 'Comece criando seu primeiro prazo'
              }
            </p>
            {activeFilter === 'todos' && (
              <button
                onClick={() => navigate('/athena/deadlines/new')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium"
              >
                <Plus size={18} className="inline mr-2" />
                Criar Primeiro Prazo
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeadlines.map(deadline => {
              const statusConfig = getStatusConfig(deadline.status);
              const riskConfig = getRiskConfig(deadline.risk_level);
              const StatusIcon = statusConfig.icon;
              const daysRemaining = calculateDaysRemaining(deadline.due_date);

              return (
                <div
                  key={deadline.id}
                  className={`bg-slate-800/50 p-5 rounded-lg border ${statusConfig.border} hover:border-cyan-500/30 transition-all group cursor-pointer ${statusConfig.bg}`}
                  onClick={() => navigate(`/athena/deadlines/${deadline.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Tipo Icon */}
                      <div className="text-3xl">{getTipoIcon(deadline.tipo)}</div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {deadline.title}
                          </h3>
                          
                          {/* Status Badge */}
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </span>

                          {/* Risk Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${riskConfig.color}-500/20 text-${riskConfig.color}-300`}>
                            Risco: {riskConfig.label}
                          </span>
                        </div>

                        {deadline.description && (
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {deadline.description}
                          </p>
                        )}

                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Cliente</div>
                            <div className="text-white flex items-center gap-1">
                              <User size={12} />
                              {deadline.client_name}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Vencimento</div>
                            <div className={`font-medium ${statusConfig.text}`}>
                              {formatDate(deadline.due_date)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Dias Restantes</div>
                            <div className={`font-bold ${
                              daysRemaining < 0 ? 'text-red-300' :
                              daysRemaining === 0 ? 'text-orange-300' :
                              daysRemaining <= 1 ? 'text-yellow-300' :
                              daysRemaining <= 3 ? 'text-amber-300' :
                              'text-white'
                            }`}>
                              {daysRemaining < 0 ? `Vencido há ${Math.abs(daysRemaining)} dia(s)` :
                               daysRemaining === 0 ? 'Vence Hoje!' :
                               `${daysRemaining} dia(s)`}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Tipo</div>
                            <div className="text-white capitalize">{deadline.tipo.replace('_', ' ')}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Prazo Legal</div>
                            <div className="text-white">
                              {deadline.legal_days ? `${deadline.legal_days} dias` : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/athena/deadlines/${deadline.id}`);
                        }}
                        className="p-2 bg-slate-700/50 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-600 hover:border-cyan-500/30 transition-all"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      {!deadline.completed && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Open edit modal
                            }}
                            className="p-2 bg-slate-700/50 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 rounded-lg border border-slate-600 hover:border-blue-500/30 transition-all"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Mark as complete
                            }}
                            className="p-2 bg-slate-700/50 hover:bg-green-500/20 text-slate-300 hover:text-green-300 rounded-lg border border-slate-600 hover:border-green-500/30 transition-all"
                            title="Marcar como Concluído"
                          >
                            <CheckCircle size={18} />
                          </button>
                        </>
                      )}
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

export default DeadlinesManagement;
