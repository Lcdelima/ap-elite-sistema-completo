/**
 * Forensic Case Detail - Elite Gravitas™
 * Detalhes completos do caso + evidências + cadeia de custódia
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import { BackBar } from '../../components/BackBar';
import EvidenceUpload from '../../components/forensics/EvidenceUpload';
import CustodyTimeline from '../../components/forensics/CustodyTimeline';
import {
  Microscope,
  Upload,
  Download,
  Shield,
  FileText,
  Clock,
  User,
  MapPin,
  Calendar,
  Hash,
  Lock,
  Eye,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const ForensicCaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('evidencias');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/forensics/${caseId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setCaseData(data);
    } catch (error) {
      console.error('Erro ao buscar caso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StandardModuleLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-cyan-300 text-lg">Carregando caso pericial...</div>
        </div>
      </StandardModuleLayout>
    );
  }

  if (!caseData) {
    return (
      <StandardModuleLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-red-300 text-lg">Caso não encontrado</div>
        </div>
      </StandardModuleLayout>
    );
  }

  const tabs = [
    { id: 'evidencias', label: 'Evidências', icon: FileText, count: caseData.evidences?.length || 0 },
    { id: 'custodia', label: 'Cadeia de Custódia', icon: Shield, count: caseData.custody_chain?.length || 0 },
    { id: 'laudos', label: 'Laudos', icon: FileText, count: caseData.reports?.length || 0 },
    { id: 'dados', label: 'Dados do Caso', icon: Microscope }
  ];

  return (
    <StandardModuleLayout>
      <BackBar
        trail={['ATHENA', 'Perícias', caseData.case_number]}
        actions={
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            <Upload size={18} />
            Upload Evidência
          </button>
        }
      />

      {/* Header do Caso */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/20 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{caseData.title}</h1>
              <span className="px-4 py-1 rounded-full text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {caseData.status?.toUpperCase()}
              </span>
              <span className="px-4 py-1 rounded-full text-sm font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {caseData.priority?.toUpperCase()}
              </span>
            </div>
            <div className="text-slate-400">{caseData.case_number} • {caseData.client_name}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-3 rounded-lg border border-cyan-500/20 text-center">
              <div className="text-2xl font-bold text-cyan-300">{caseData.evidences_count || 0}</div>
              <div className="text-xs text-slate-400">Evidências</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/20 text-center">
              <div className="text-2xl font-bold text-purple-300">{caseData.reports_count || 0}</div>
              <div className="text-xs text-slate-400">Laudos</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-amber-500/20 text-center">
              <div className="text-2xl font-bold text-amber-300">{caseData.custody_events_count || 0}</div>
              <div className="text-xs text-slate-400">Eventos</div>
            </div>
          </div>
        </div>

        {caseData.description && (
          <p className="text-slate-300 max-w-4xl">{caseData.description}</p>
        )}
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
                {tab.count !== undefined && (
                  <span className="px-2 py-1 bg-slate-700/50 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* TAB: Evidências */}
        {activeTab === 'evidencias' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Evidências Coletadas</h2>
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/30 transition-all"
              >
                + Nova Evidência
              </button>
            </div>

            {caseData.evidences && caseData.evidences.length > 0 ? (
              <div className="grid gap-4">
                {caseData.evidences.map(evidence => (
                  <div
                    key={evidence.id}
                    className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="text-cyan-400" size={24} />
                          <h3 className="text-lg font-semibold text-white">{evidence.filename}</h3>
                          {evidence.sealed && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                              <Lock size={12} />
                              Lacrada
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">
                          {evidence.category} • {evidence.size_human} • {new Date(evidence.collected_at).toLocaleString('pt-BR')}
                        </div>
                        {evidence.description && (
                          <p className="text-sm text-slate-300 mt-2">{evidence.description}</p>
                        )}
                      </div>

                      <button
                        onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/evidences/${evidence.id}/download`, '_blank')}
                        className="p-2 bg-slate-700/50 hover:bg-green-500/20 text-slate-300 hover:text-green-300 rounded-lg border border-slate-600 hover:border-green-500/30 transition-all"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-700/50 text-sm">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">SHA-256</div>
                        <div className="text-cyan-300 font-mono text-xs">
                          {evidence.sha256?.substring(0, 16)}...
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Coletado por</div>
                        <div className="text-white">{evidence.collected_by || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Local</div>
                        <div className="text-white">{evidence.collection_location || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Analisada</div>
                        <div className="text-white">{evidence.analyzed ? 'Sim' : 'Não'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/50 p-12 rounded-lg border border-slate-700/50 text-center">
                <FileText size={64} className="mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhuma evidência coletada</h3>
                <p className="text-slate-400 mb-6">Faça o upload da primeira evidência</p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium"
                >
                  <Upload size={18} className="inline mr-2" />
                  Fazer Upload
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: Cadeia de Custódia */}
        {activeTab === 'custodia' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Timeline de Custódia</h2>
            {caseData.custody_chain && caseData.custody_chain.length > 0 ? (
              <div className="space-y-4">
                {caseData.custody_chain.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                        <Shield className="text-cyan-300" size={18} />
                      </div>
                      {index < caseData.custody_chain.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-700 mt-2" />
                      )}
                    </div>

                    <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-medium capitalize">
                            {event.event_type?.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-slate-300 mt-1">{event.description}</p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(event.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-700/50 text-sm">
                        <div>
                          <div className="text-xs text-slate-400">Usuário</div>
                          <div className="text-white">{event.user_name || 'Sistema'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Local</div>
                          <div className="text-white">{event.location || 'N/A'}</div>
                        </div>
                        {event.hash_after && (
                          <div>
                            <div className="text-xs text-slate-400">Hash</div>
                            <div className="text-cyan-300 font-mono text-xs">
                              {event.hash_after.substring(0, 16)}...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700/50 text-center text-slate-400">
                <Shield size={48} className="mx-auto mb-4 text-slate-600" />
                <p>Nenhum evento de custódia registrado</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Laudos */}
        {activeTab === 'laudos' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Laudos e Relatórios</h2>
            <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700/50 text-center text-slate-400">
              <FileText size={48} className="mx-auto mb-4 text-slate-600" />
              <p>Geração de laudos será implementada em breve</p>
            </div>
          </div>
        )}

        {/* TAB: Dados */}
        {activeTab === 'dados' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Informações do Caso</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Número do Caso</label>
                  <div className="text-white font-mono">{caseData.case_number}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Tipo</label>
                  <div className="text-white capitalize">{caseData.tipo}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Status</label>
                  <div className="text-white capitalize">{caseData.status}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Prioridade</label>
                  <div className="text-white capitalize">{caseData.priority}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Cliente</label>
                  <div className="text-white">{caseData.client_name}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Coleta</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Data de Coleta</label>
                  <div className="text-white">
                    {new Date(caseData.collection_date).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Local de Coleta</label>
                  <div className="text-white">{caseData.collection_location || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Perito Responsável</label>
                  <div className="text-white">{caseData.expert_user_id || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg border border-cyan-500/30 p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Upload de Evidência</h2>
            <p className="text-slate-400 mb-4">
              Componente de upload será implementado. Use API: POST /api/evidences/upload
            </p>
            <button
              onClick={() => setShowUpload(false)}
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

export default ForensicCaseDetail;
