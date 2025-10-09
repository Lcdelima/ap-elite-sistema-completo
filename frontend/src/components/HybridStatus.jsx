import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, HardDrive, Cloud, RotateCcw, Clock, AlertCircle, CheckCircle, Download, Settings, RefreshCw } from 'lucide-react';

const HybridStatus = () => {
  const [status, setStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/hybrid/status`);
      const data = await response.json();
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar status híbrido:', error);
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/hybrid/sync`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (response.ok) {
        // Aguardar um pouco e atualizar status
        setTimeout(() => {
          fetchStatus();
          setSyncing(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setSyncing(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/hybrid/backup`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (response.ok) {
        alert('Backup criado com sucesso!');
        fetchStatus();
      } else {
        alert('Erro ao criar backup: ' + result.message);
      }
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      alert('Erro ao criar backup');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          <span>Carregando status do sistema...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Erro ao carregar status do sistema híbrido</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Principal */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Sistema Híbrido Online/Offline</h2>
          <button
            onClick={handleManualSync}
            disabled={syncing || status.sync_running}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              syncing || status.sync_running
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${syncing || status.sync_running ? 'animate-spin' : ''}`} />
            {syncing || status.sync_running ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Status de Conexão */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            {status.online_status ? (
              <>
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Wifi className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Online</p>
                  <p className="text-sm text-green-600">Conectado à nuvem</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-orange-100 p-2 rounded-full mr-3">
                  <WifiOff className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-900">Offline</p>
                  <p className="text-sm text-orange-600">Funcionando localmente</p>
                </div>
              </>
            )}
          </div>

          {/* Última Sincronização */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Última Sincronização</p>
              <p className="text-sm text-gray-600">{formatDate(status.last_sync)}</p>
            </div>
          </div>

          {/* Armazenamento Local */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Dados Locais</p>
              <p className="text-sm text-gray-600">{formatBytes(status.database_size)}</p>
            </div>
          </div>
        </div>

        {/* Contadores de Registros */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {status.record_counts && Object.entries(status.record_counts).map(([table, count]) => (
            <div key={table} className="text-center p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{table.replace('_', ' ')}</p>
            </div>
          ))}
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleCreateBackup}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Criar Backup
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
          </button>
          
          <button
            onClick={fetchStatus}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar Status
          </button>
        </div>

        {/* Localização dos Dados */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">📁 Localização dos Dados</h3>
          <p className="text-sm text-blue-800">
            <strong>Pasta Principal:</strong> {status.local_data_path}
          </p>
          <div className="mt-2 text-sm text-blue-700">
            <p>• <strong>Banco Local:</strong> {status.local_data_path}/dados/ap_elite_local.db</p>
            <p>• <strong>Backups:</strong> {status.local_data_path}/backup/</p>
            <p>• <strong>Configurações:</strong> {status.local_data_path}/config/</p>
            <p>• <strong>Logs:</strong> {status.local_data_path}/logs/</p>
          </div>
        </div>
      </div>

      {/* Detalhes Avançados */}
      {showDetails && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes do Sistema</h3>
          
          {/* Espaço em Disco */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Espaço em Disco</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Usado: {formatBytes(status.disk_space?.used)}</span>
                <span>Livre: {formatBytes(status.disk_space?.free)}</span>
                <span>Total: {formatBytes(status.disk_space?.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${status.disk_space?.percent || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">{status.disk_space?.percent}% usado</p>
            </div>
          </div>

          {/* Status de Sincronização por Tabela */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Status de Sincronização por Tabela</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-50 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Tabela</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Última Sync</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Registros</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {status.sync_status?.map((sync, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                        {sync.table_name.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {formatDate(sync.last_sync)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {sync.sync_count}
                      </td>
                      <td className="px-4 py-2">
                        {sync.status === 'ok' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Configurações */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Configurações Ativas</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Sincronização Automática:</strong> {status.config?.auto_sync ? 'Ativada' : 'Desativada'}</p>
                  <p><strong>Intervalo de Sync:</strong> {status.config?.sync_interval_minutes} minutos</p>
                </div>
                <div>
                  <p><strong>Backup Automático:</strong> {status.config?.auto_backup ? 'Ativado' : 'Desativado'}</p>
                  <p><strong>Horário do Backup:</strong> {status.config?.backup_time}</p>
                </div>
              </div>
              <p className="mt-2"><strong>Backups Salvos:</strong> {status.backup_count} arquivos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HybridStatus;