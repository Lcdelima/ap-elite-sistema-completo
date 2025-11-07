/**
 * Cliente 360° - Elite Gravitas™
 * Visão completa do cliente: Dados, Jobs, Documentos, Prazos, Financeiro, Mensagens
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import { BackBar } from '../../components/BackBar';
import {
  User,
  Briefcase,
  FileText,
  Calendar,
  DollarSign,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  ExternalLink
} from 'lucide-react';

const Cliente360 = () => {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState('dados');
  const [clientData, setClientData] = useState(null);
  const [jobsSummary, setJobsSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Busca dados do cliente
      const clientRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const clientsData = await clientRes.json();
      const client = clientsData.find(c => c.id === clientId);
      setClientData(client);

      // Busca resumo de jobs
      const jobsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/jobs/client/${clientId}/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const jobsData = await jobsRes.json();
      setJobsSummary(jobsData);
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dados', label: 'Dados', icon: User },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'prazos', label: 'Prazos & Audiências', icon: Calendar },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'mensagens', label: 'Mensagens', icon: MessageSquare }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'novo': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
      'em_andamento': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
      'pausado': { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
      'concluido': { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
      'cancelado': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' }
    };
    const config = statusConfig[status] || statusConfig.novo;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getRiskBadge = (risk) => {
    const riskConfig = {
      'baixo': { bg: 'bg-green-500/20', text: 'text-green-300', icon: CheckCircle },
      'medio': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: AlertCircle },
      'alto': { bg: 'bg-orange-500/20', text: 'text-orange-300', icon: AlertCircle },
      'critico': { bg: 'bg-red-500/20', text: 'text-red-300', icon: AlertCircle }
    };
    const config = riskConfig[risk] || riskConfig.medio;
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {risk.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <StandardModuleLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-cyan-300 text-lg">Carregando dados do cliente...</div>
        </div>
      </StandardModuleLayout>
    );
  }

  if (!clientData) {
    return (
      <StandardModuleLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-red-300 text-lg">Cliente não encontrado</div>
        </div>
      </StandardModuleLayout>
    );
  }

  return (
    <StandardModuleLayout>
      <BackBar trail={['ATHENA', 'Clientes', clientData.full_name || clientData.name]} />

      {/* Header do Cliente */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/20 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {(clientData.full_name || clientData.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {clientData.full_name || clientData.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                {clientData.email && (
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    <span>{clientData.email}</span>
                  </div>
                )}
                {clientData.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={14} />
                    <span>{clientData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Rápidas */}
          {jobsSummary && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                <div className="text-2xl font-bold text-cyan-300">{jobsSummary.total_jobs}</div>
                <div className="text-xs text-slate-400">Total Jobs</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-300">
                  R$ {jobsSummary.financial?.total_billed?.toLocaleString('pt-BR') || '0'}
                </div>
                <div className="text-xs text-slate-400">Faturado</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-300">
                  {jobsSummary.jobs_by_status?.concluido || 0}
                </div>
                <div className="text-xs text-slate-400">Concluídos</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/50 border-b border-slate-700/50">
        <div className="flex gap-1 px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-300 bg-slate-800/50'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* TAB: Dados */}
        {activeTab === 'dados' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Nome Completo</label>
                  <div className="text-white">{clientData.full_name || clientData.name}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Email</label>
                  <div className="text-white">{clientData.email || '-'}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Telefone</label>
                  <div className="text-white">{clientData.phone || '-'}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">CPF/CNPJ</label>
                  <div className="text-white">{clientData.cpf || clientData.cnpj || '-'}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Endereço</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Endereço Completo</label>
                  <div className="text-white">{clientData.address || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400">Cidade</label>
                    <div className="text-white">{clientData.city || '-'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Estado</label>
                    <div className="text-white">{clientData.state || '-'}</div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">CEP</label>
                  <div className="text-white">{clientData.cep || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Jobs */}
        {activeTab === 'jobs' && jobsSummary && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Todos os Jobs ({jobsSummary.total_jobs})</h3>
              <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/30 transition-all">
                + Novo Job
              </button>
            </div>

            <div className="grid gap-4">
              {jobsSummary.jobs && jobsSummary.jobs.map(job => (
                <div key={job.id} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                        {getStatusBadge(job.status)}
                        {getRiskBadge(job.risk_level)}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">{job.job_number}</div>
                      <div className="text-sm text-slate-300">{job.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Tipo</div>
                      <div className="text-sm text-cyan-300 capitalize">
                        {job.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-700/50">
                    <div>
                      <div className="text-xs text-slate-400">Arquivos</div>
                      <div className="text-sm text-white font-medium">{job.files_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Prazos</div>
                      <div className="text-sm text-white font-medium">{job.deadlines_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Faturado</div>
                      <div className="text-sm text-green-300 font-medium">
                        R$ {job.total_billed?.toLocaleString('pt-BR') || '0'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Criado em</div>
                      <div className="text-sm text-white">
                        {new Date(job.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Documentos */}
        {activeTab === 'documentos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Documentos do Cliente</h3>
              <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/30 transition-all">
                + Upload Documento
              </button>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700/50 text-center text-slate-400">
              <FileText size={48} className="mx-auto mb-4 text-slate-600" />
              <p>Documentos serão carregados via API de arquivos</p>
            </div>
          </div>
        )}

        {/* TAB: Prazos */}
        {activeTab === 'prazos' && jobsSummary && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Próximos Prazos</h3>
            {jobsSummary.upcoming_deadlines && jobsSummary.upcoming_deadlines.length > 0 ? (
              <div className="grid gap-4">
                {jobsSummary.upcoming_deadlines.map(deadline => (
                  <div key={deadline.id} className="bg-slate-800/50 p-4 rounded-lg border border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="text-amber-300" size={20} />
                        <div>
                          <div className="text-white font-medium">{deadline.title}</div>
                          <div className="text-sm text-slate-400">
                            Vencimento: {new Date(deadline.due_date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium">
                        {deadline.level || 'PRAZO'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700/50 text-center text-slate-400">
                <Calendar size={48} className="mx-auto mb-4 text-slate-600" />
                <p>Nenhum prazo pendente</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Financeiro */}
        {activeTab === 'financeiro' && jobsSummary && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Resumo Financeiro</h3>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-6 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-300" size={24} />
                  <div className="text-sm text-green-300">Total Faturado</div>
                </div>
                <div className="text-3xl font-bold text-white">
                  R$ {jobsSummary.financial?.total_billed?.toLocaleString('pt-BR') || '0'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="text-blue-300" size={24} />
                  <div className="text-sm text-blue-300">Total Pago</div>
                </div>
                <div className="text-3xl font-bold text-white">
                  R$ {jobsSummary.financial?.total_paid?.toLocaleString('pt-BR') || '0'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 p-6 rounded-lg border border-amber-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="text-amber-300" size={24} />
                  <div className="text-sm text-amber-300">Pendente</div>
                </div>
                <div className="text-3xl font-bold text-white">
                  R$ {jobsSummary.financial?.pending?.toLocaleString('pt-BR') || '0'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Mensagens */}
        {activeTab === 'mensagens' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Mensagens</h3>
              <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/30 transition-all">
                + Nova Mensagem
              </button>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700/50 text-center text-slate-400">
              <MessageSquare size={48} className="mx-auto mb-4 text-slate-600" />
              <p>Sistema de mensagens em desenvolvimento</p>
            </div>
          </div>
        )}
      </div>
    </StandardModuleLayout>
  );
};

export default Cliente360;
