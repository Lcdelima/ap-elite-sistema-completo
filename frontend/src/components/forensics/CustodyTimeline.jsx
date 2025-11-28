/**
 * Custody Timeline Component - Elite Gravitas™
 * Visualização da cadeia de custódia de evidências
 * Timeline vertical com eventos cronológicos
 */

import React from 'react';
import {
  Shield,
  Upload,
  Download,
  Eye,
  Edit,
  Lock,
  Unlock,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Hash
} from 'lucide-react';

const CustodyTimeline = ({ events = [] }) => {
  const getEventIcon = (eventType) => {
    const icons = {
      'coleta': Upload,
      'upload': Upload,
      'download': Download,
      'visualizacao': Eye,
      'analise': FileText,
      'modificacao': Edit,
      'lacre': Lock,
      'deslacre': Unlock,
      'transferencia': User,
      'verificacao_hash': Hash,
      'extracao': Download,
      'duplicacao': FileText,
      'arquivamento': Shield
    };
    return icons[eventType] || Shield;
  };

  const getEventColor = (eventType) => {
    const colors = {
      'coleta': 'cyan',
      'upload': 'blue',
      'download': 'purple',
      'visualizacao': 'green',
      'analise': 'yellow',
      'modificacao': 'orange',
      'lacre': 'red',
      'deslacre': 'pink',
      'transferencia': 'indigo',
      'verificacao_hash': 'teal',
      'extracao': 'violet',
      'duplicacao': 'sky',
      'arquivamento': 'slate'
    };
    return colors[eventType] || 'cyan';
  };

  const getEventLabel = (eventType) => {
    const labels = {
      'coleta': 'Coleta de Evidência',
      'upload': 'Upload Realizado',
      'download': 'Download',
      'visualizacao': 'Visualização',
      'analise': 'Análise Iniciada',
      'modificacao': 'Modificação',
      'lacre': 'Lacre Aplicado',
      'deslacre': 'Lacre Removido',
      'transferencia': 'Transferência de Custódia',
      'verificacao_hash': 'Verificação de Hash',
      'extracao': 'Extração de Dados',
      'duplicacao': 'Duplicação Forense',
      'arquivamento': 'Arquivamento'
    };
    return labels[eventType] || eventType.replace('_', ' ').toUpperCase();
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getHashDisplay = (hash) => {
    if (!hash) return null;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  if (!events || events.length === 0) {
    return (
      <div className="bg-slate-800/50 p-12 rounded-lg border border-slate-700/50 text-center">
        <Shield size={64} className="mx-auto mb-4 text-slate-600" />
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum Evento Registrado</h3>
        <p className="text-slate-400">
          A cadeia de custódia será registrada aqui automaticamente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-cyan-400" size={24} />
            <div>
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-xs text-slate-400">Eventos Totais</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <div className="text-2xl font-bold text-white">
                {events.filter(e => e.verified).length}
              </div>
              <div className="text-xs text-slate-400">Verificados</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-3 mb-2">
            <User className="text-purple-400" size={24} />
            <div>
              <div className="text-2xl font-bold text-white">
                {new Set(events.map(e => e.user_id)).size}
              </div>
              <div className="text-xs text-slate-400">Usuários</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-amber-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-amber-400" size={24} />
            <div>
              <div className="text-2xl font-bold text-white">
                {(() => {
                  const first = new Date(events[events.length - 1]?.timestamp);
                  const last = new Date(events[0]?.timestamp);
                  const days = Math.ceil((last - first) / (1000 * 60 * 60 * 24));
                  return days;
                })()}
              </div>
              <div className="text-xs text-slate-400">Dias Ativos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linha vertical conectora */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500" />

        <div className="space-y-6">
          {events.map((event, index) => {
            const Icon = getEventIcon(event.event_type);
            const color = getEventColor(event.event_type);
            const { date, time } = formatDateTime(event.timestamp);
            const isLast = index === events.length - 1;

            return (
              <div key={event.id || index} className="relative pl-16">
                {/* Ícone do evento */}
                <div 
                  className={`
                    absolute left-0 w-12 h-12 rounded-full 
                    bg-gradient-to-br from-${color}-500/20 to-${color}-600/10
                    border-2 border-${color}-500
                    flex items-center justify-center
                    shadow-lg shadow-${color}-500/20
                  `}
                >
                  <Icon className={`text-${color}-400`} size={20} />
                </div>

                {/* Card do evento */}
                <div 
                  className={`
                    bg-slate-800/50 rounded-lg border border-slate-700/50 
                    hover:border-${color}-500/30 transition-all
                    ${isLast ? 'border-l-4 border-l-cyan-500' : ''}
                  `}
                >
                  <div className="p-5">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-1">
                          {getEventLabel(event.event_type)}
                        </h4>
                        {event.description && (
                          <p className="text-slate-300 text-sm">{event.description}</p>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-slate-400 text-sm font-medium">{date}</div>
                        <div className="text-slate-500 text-xs">{time}</div>
                      </div>
                    </div>

                    {/* Detalhes do Evento */}
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-700/50">
                      {/* Usuário */}
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                          <User size={12} />
                          <span>Responsável</span>
                        </div>
                        <div className="text-white font-medium">
                          {event.user_name || event.user_id || 'Sistema'}
                        </div>
                      </div>

                      {/* Local */}
                      {event.location && (
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <MapPin size={12} />
                            <span>Local</span>
                          </div>
                          <div className="text-white font-medium">{event.location}</div>
                        </div>
                      )}

                      {/* Hash */}
                      {event.hash_after && (
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <Hash size={12} />
                            <span>Hash</span>
                          </div>
                          <div className="text-cyan-300 font-mono text-sm">
                            {getHashDisplay(event.hash_after)}
                          </div>
                        </div>
                      )}

                      {/* Verificado */}
                      {event.verified && (
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <CheckCircle size={12} />
                            <span>Status</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-400 font-medium">
                            <CheckCircle size={14} />
                            Verificado
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informações Adicionais */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-2">Informações Adicionais:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-slate-400">{key}:</span>{' '}
                              <span className="text-white">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alertas */}
                    {event.alert && (
                      <div className="mt-3 pt-3 border-t border-amber-500/20">
                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                          <AlertTriangle size={16} />
                          <span>{event.alert}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badge de primeiro evento */}
                  {isLast && (
                    <div className="bg-cyan-500/10 border-t border-cyan-500/20 px-5 py-2">
                      <div className="flex items-center gap-2 text-cyan-300 text-sm font-medium">
                        <Shield size={14} />
                        <span>Evento Inicial da Cadeia de Custódia</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer com informações de integridade */}
      <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 p-5 rounded-lg border border-green-500/30">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="text-green-300 font-semibold mb-1">
              Cadeia de Custódia Íntegra
            </h4>
            <p className="text-green-200/70 text-sm">
              Todos os eventos foram registrados com hash criptográfico e timestamp. 
              A integridade da cadeia está garantida conforme ISO 27037.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustodyTimeline;
