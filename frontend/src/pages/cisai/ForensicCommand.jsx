import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, AlertTriangle, CheckCircle, Clock, 
  FileText, TrendingUp, Activity, Database,
  Eye, Target, Zap, Bell, Lock, Unlock
} from 'lucide-react';
import { 
  AthenaNavigationBar, 
  AthenaLoadingSkeleton 
} from '../../components/AthenaComponents';

/**
 * 🛡️ FORENSIC COMMAND CENTER
 * Central de comando estilo CIA War Room
 */

const ForensicCommand = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cisai/command/dashboard`);
      const data = await response.json();
      setDashboard(data.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIntegrity = async (evidenciaId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/cisai/command/integrity-check?evidencia_id=${evidenciaId}`,
        { method: 'POST' }
      );
      const data = await response.json();
      alert(`Integridade: ${data.data.status}`);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <AthenaNavigationBar 
          title="Forensic Command"
          subtitle="Centro de Comando Forense"
          backDestination="/admin/athena"
        />
        <div className="container mx-auto px-6 py-8">
          <AthenaLoadingSkeleton lines={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <AthenaNavigationBar 
        title="Forensic Command Center"
        subtitle="Central de Comando - War Room"
        backDestination="/admin/athena"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="text-cyan-400" size={36} />
              War Room - Operações Ativas
            </h2>
            <p className="text-neutral-400 mt-2">Monitoramento 360º de casos e integridade</p>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              onClick={loadDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-neutral-800 border border-neutral-700
                hover:border-cyan-500/50 text-neutral-200
                transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Activity size={18} />
              Atualizar
            </motion.button>
            
            <motion.button
              onClick={() => checkIntegrity('E001')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Lock size={18} />
              Verificar Integridade
            </motion.button>
          </div>
        </div>

        {/* Alertas Críticos */}
        {dashboard?.alertas && dashboard.alertas.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="text-red-400" />
              Alertas Ativos
            </h3>
            <div className="space-y-3">
              {dashboard.alertas.map((alerta, idx) => (
                <AlertCard key={idx} alerta={alerta} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CommandStat
            icon={<FileText className="text-cyan-400" />}
            label="Casos Ativos"
            value={dashboard?.casos_ativos?.total || 0}
            sublabel={`${dashboard?.casos_ativos?.prioridade_critica || 0} críticos`}
            color="cyan"
          />
          <CommandStat
            icon={<Database className="text-blue-400" />}
            label="Evidências"
            value={dashboard?.integridade?.evidencias_totais || 0}
            sublabel={`${dashboard?.integridade?.divergencias || 0} divergências`}
            color="blue"
          />
          <CommandStat
            icon={<Clock className="text-orange-400" />}
            label="Prazos D-1"
            value={dashboard?.prazos?.d_menos_1 || 0}
            sublabel={`${dashboard?.prazos?.vencidos || 0} vencidos`}
            color="orange"
          />
          <CommandStat
            icon={<Activity className="text-green-400" />}
            label="Laudos Prontos"
            value={dashboard?.laudos?.prontos || 0}
            sublabel={`${dashboard?.laudos?.em_elaboracao || 0} em análise`}
            color="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Heatmap de Risco */}
          <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="text-red-400" />
              Heatmap de Risco
            </h3>
            
            <div className="space-y-3">
              {dashboard?.heatmap_risco?.map((caso, idx) => (
                <motion.div
                  key={idx}
                  className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-700
                    hover:border-cyan-500/50 cursor-pointer transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-white font-medium">{caso.caso_id}</span>
                      <span className={`ml-3 px-2 py-1 rounded text-xs font-medium
                        ${caso.tipo === 'crítico' ? 'bg-red-500/20 text-red-400' :
                          caso.tipo === 'alto' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-green-500/20 text-green-400'}`}>
                        {caso.tipo.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-sm">Risco:</span>
                      <span className="text-2xl font-bold text-cyan-400">{caso.risco}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          caso.risco > 7 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          caso.risco > 4 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${caso.risco * 10}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Integridade de Evidências */}
          <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="text-cyan-400" />
              Integridade de Evidências
            </h3>
            
            <div className="space-y-4">
              <IntegrityMeter
                label="Hash Verificado"
                value={dashboard?.integridade?.hash_verificado || 0}
                total={dashboard?.integridade?.evidencias_totais || 0}
                color="green"
              />
              
              <IntegrityMeter
                label="Divergências Detectadas"
                value={dashboard?.integridade?.divergencias || 0}
                total={dashboard?.integridade?.evidencias_totais || 0}
                color="red"
              />
              
              <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-cyan-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-white font-medium">Última Verificação</p>
                    <p className="text-sm text-neutral-400 mt-1">
                      {new Date(dashboard?.integridade?.ultima_verificacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => checkIntegrity('E_ALL')}
                className="w-full mt-4 px-4 py-3 rounded-xl
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  text-white font-medium shadow-lg
                  flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap size={18} />
                Verificar Todas as Evidências
              </motion.button>
            </div>
          </div>
        </div>

        {/* Prazos e Laudos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prazos Críticos */}
          <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="text-orange-400" />
              Prazos Processuais
            </h3>
            
            <div className="space-y-3">
              <PrazoCard
                tipo="D-3"
                quantidade={dashboard?.prazos?.d_menos_3 || 0}
                cor="yellow"
              />
              <PrazoCard
                tipo="D-1"
                quantidade={dashboard?.prazos?.d_menos_1 || 0}
                cor="orange"
              />
              <PrazoCard
                tipo="Vencidos"
                quantidade={dashboard?.prazos?.vencidos || 0}
                cor="red"
              />
              <PrazoCard
                tipo="Próximos 7 dias"
                quantidade={dashboard?.prazos?.proximos_7_dias || 0}
                cor="blue"
              />
            </div>
          </div>

          {/* Status de Laudos */}
          <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="text-blue-400" />
              Status de Laudos
            </h3>
            
            <div className="space-y-3">
              <LaudoCard
                status="Em Elaboração"
                quantidade={dashboard?.laudos?.em_elaboracao || 0}
                cor="blue"
              />
              <LaudoCard
                status="Aguardando Revisão"
                quantidade={dashboard?.laudos?.aguardando_revisao || 0}
                cor="yellow"
              />
              <LaudoCard
                status="Prontos"
                quantidade={dashboard?.laudos?.prontos || 0}
                cor="green"
              />
              <LaudoCard
                status="Atrasados"
                quantidade={dashboard?.laudos?.atrasados || 0}
                cor="red"
              />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 p-4 rounded-xl bg-neutral-800/30 border border-neutral-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-neutral-400">Sistema Operacional</span>
            </div>
            <span className="text-neutral-400">
              ID: {dashboard?.dashboard_id?.slice(0, 8)} | 
              Gerado em: {new Date(dashboard?.generated_at).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertCard = ({ alerta }) => (
  <motion.div
    className={`p-4 rounded-xl border-l-4 
      ${alerta.severidade === 'crítica' ? 'bg-red-500/10 border-red-500' :
        alerta.severidade === 'alta' ? 'bg-orange-500/10 border-orange-500' :
        'bg-yellow-500/10 border-yellow-500'}`}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    <div className="flex items-start gap-3">
      <AlertTriangle 
        className={`flex-shrink-0 mt-1 ${
          alerta.severidade === 'crítica' ? 'text-red-400' :
          alerta.severidade === 'alta' ? 'text-orange-400' :
          'text-yellow-400'
        }`} 
        size={20} 
      />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-white font-medium">{alerta.tipo.toUpperCase()}</span>
          <span className="text-xs text-neutral-400">
            {new Date(alerta.timestamp).toLocaleTimeString('pt-BR')}
          </span>
        </div>
        <p className="text-sm text-neutral-300">{alerta.mensagem}</p>
      </div>
    </div>
  </motion.div>
);

const CommandStat = ({ icon, label, value, sublabel, color }) => (
  <motion.div
    className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700
      hover:border-cyan-500/50 transition-all duration-300"
    whileHover={{ scale: 1.02, y: -2 }}
  >
    <div className="flex items-center justify-between mb-4">
      {icon}
    </div>
    <div className="text-3xl font-bold text-white mb-2">{value}</div>
    <div className="text-sm text-neutral-400">{label}</div>
    <div className={`text-xs text-${color}-400 mt-1`}>{sublabel}</div>
  </motion.div>
);

const IntegrityMeter = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-neutral-400 text-sm">{label}</span>
        <span className="text-white font-medium">{value}/{total}</span>
      </div>
      <div className="w-full bg-neutral-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r 
            ${color === 'green' ? 'from-green-500 to-green-600' : 
              'from-red-500 to-red-600'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const PrazoCard = ({ tipo, quantidade, cor }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50">
    <span className="text-neutral-300">{tipo}</span>
    <span className={`px-3 py-1 rounded-full text-sm font-medium
      ${cor === 'red' ? 'bg-red-500/20 text-red-400' :
        cor === 'orange' ? 'bg-orange-500/20 text-orange-400' :
        cor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-blue-500/20 text-blue-400'}`}>
      {quantidade}
    </span>
  </div>
);

const LaudoCard = ({ status, quantidade, cor }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50">
    <span className="text-neutral-300">{status}</span>
    <span className={`px-3 py-1 rounded-full text-sm font-medium
      ${cor === 'red' ? 'bg-red-500/20 text-red-400' :
        cor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
        cor === 'green' ? 'bg-green-500/20 text-green-400' :
        'bg-blue-500/20 text-blue-400'}`}>
      {quantidade}
    </span>
  </div>
);

export default ForensicCommand;
