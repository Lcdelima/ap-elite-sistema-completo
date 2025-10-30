import React, { useState, useEffect } from 'react';
import { Building2, Plus, Settings, List, Calendar, AlertTriangle, CheckCircle, Clock, FileText, Users, Scale } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const IntegracaoTribunais = () => {
  const [configs, setConfigs] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, configsRes, processosRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/tribunais/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/tribunais/config`, { headers }),
        fetch(`${BACKEND_URL}/api/tribunais/processos?limit=10`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (configsRes.ok) {
        const data = await configsRes.json();
        setConfigs(data.configs || []);
      }
      if (processosRes.ok) {
        const data = await processosRes.json();
        setProcessos(data.processos || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <StandardModuleLayout>
      <div className="p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Building2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Integração com Tribunais</h1>
              <p className="text-blue-100">🏛️ Sincronização Nacional - TJ, STJ, STF, CNJ - PJe, ESAJ, SEEU, ePoC, Projudi</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Processos Integrados</p>
                <p className="text-3xl font-bold text-white">{stats.total_processos || 0}</p>
              </div>
              <Scale className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Configurações</p>
                <p className="text-3xl font-bold text-white">{stats.total_configuracoes || 0}</p>
              </div>
              <Settings className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tribunais Ativos</p>
                <p className="text-3xl font-bold text-white">{stats.tribunais_integrados || 0}</p>
              </div>
              <CheckCircle className="text-cyan-400" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cobertura</p>
                <p className="text-3xl font-bold text-white">27 Estados</p>
              </div>
              <Building2 className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800 rounded-lg mb-6">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Configurações de Tribunais</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-400">Carregando...</div>
          ) : configs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma configuração cadastrada</p>
              <button className="mt-4 text-blue-400 hover:text-blue-300">
                Configurar primeiro tribunal
              </button>
            </div>
          ) : (
            <div className="p-4">
              {configs.map((config, idx) => (
                <div key={idx} className="bg-slate-750 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{config.tribunal} - {config.sistema}</p>
                      <p className="text-gray-400 text-sm">{config.endpoint}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${config.habilitado ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                      {config.habilitado ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processos Recentes */}
        <div className="bg-slate-800 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Processos Sincronizados</h2>
          </div>
          
          {processos.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <List size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum processo sincronizado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-semibold">Número</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Tribunal</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Sistema</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Status</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Prazos</th>
                  </tr>
                </thead>
                <tbody>
                  {processos.map((proc, idx) => (
                    <tr key={idx} className="hover:bg-slate-700 transition">
                      <td className="p-4 text-white font-mono text-sm">{proc.numero_processo}</td>
                      <td className="p-4 text-gray-300">{proc.tribunal}</td>
                      <td className="p-4 text-gray-300">{proc.sistema}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {proc.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {proc.prazos_proximos?.length || 0} próximos
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StandardModuleLayout>
  );
};

export default IntegracaoTribunais;
