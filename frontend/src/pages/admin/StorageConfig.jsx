import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const StorageConfig = () => {
  const [provider, setProvider] = useState('s3');
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  
  const [s3Config, setS3Config] = useState({
    aws_access_key_id: '',
    aws_secret_access_key: '',
    region: 'us-east-1',
    bucket_name: ''
  });

  const saveConfig = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('user_id') || 'test-user';
      
      const configData = {
        user_id: userId,
        provider: provider,
        credentials: provider === 's3' ? s3Config : {},
        bucket_name: s3Config.bucket_name,
        is_active: true
      };

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/storage/config`,
        configData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }
      );

      alert('✅ Configuração de storage salva e testada com sucesso!');
      loadConfigs();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadConfigs = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'test-user';
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/storage/config/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }
      );
      setConfigs(response.data.configs || []);
    } catch (error) {
      console.error('Erro ao carregar configs:', error);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            Storage <span className="text-elite-accent">Connectors</span> ☁️
          </h1>
          <p className="text-elite-metal">
            Configure seu armazenamento externo (AWS S3, Google Drive, OneDrive)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <CipherGlassCard className="p-6">
            <h2 className="text-2xl font-title text-elite-text mb-6">Nova Configuração</h2>
            
            {/* Provider Selection */}
            <div className="mb-6">
              <label className="block text-elite-text text-sm font-semibold mb-3">
                Provider
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['s3', 'google_drive', 'onedrive'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                      provider === p
                        ? 'border-elite-accent bg-surface-02 text-elite-accent'
                        : 'border-white/20 text-elite-metal hover:border-white/40'
                    }`}
                  >
                    {p === 's3' && 'AWS S3'}
                    {p === 'google_drive' && 'Google Drive'}
                    {p === 'onedrive' && 'OneDrive'}
                  </button>
                ))}
              </div>
            </div>

            {/* S3 Configuration */}
            {provider === 's3' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    AWS Access Key ID
                  </label>
                  <input
                    type="password"
                    className="input-elite"
                    value={s3Config.aws_access_key_id}
                    onChange={(e) => setS3Config({...s3Config, aws_access_key_id: e.target.value})}
                    placeholder="AKIA..."
                  />
                </div>

                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    AWS Secret Access Key
                  </label>
                  <input
                    type="password"
                    className="input-elite"
                    value={s3Config.aws_secret_access_key}
                    onChange={(e) => setS3Config({...s3Config, aws_secret_access_key: e.target.value})}
                    placeholder="******"
                  />
                </div>

                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    Região
                  </label>
                  <select
                    className="input-elite"
                    value={s3Config.region}
                    onChange={(e) => setS3Config({...s3Config, region: e.target.value})}
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="sa-east-1">South America (São Paulo)</option>
                    <option value="eu-west-1">Europe (Ireland)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    Bucket Name
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={s3Config.bucket_name}
                    onChange={(e) => setS3Config({...s3Config, bucket_name: e.target.value})}
                    placeholder="my-evidence-bucket"
                  />
                </div>
              </div>
            )}

            {provider !== 's3' && (
              <div className="p-8 text-center text-elite-metal">
                <div className="text-4xl mb-4">🚧</div>
                <p>Configuração de {provider} em desenvolvimento</p>
              </div>
            )}

            <button
              onClick={saveConfig}
              disabled={loading || provider !== 's3'}
              className="btn-elite btn-elite-primary w-full mt-6"
            >
              {loading ? 'Testando conexão...' : '💾 Salvar e Testar'}
            </button>
          </CipherGlassCard>

          {/* Active Configs */}
          <CipherGlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-title text-elite-text">Configurações Ativas</h3>
              <button onClick={loadConfigs} className="btn-elite btn-elite-secondary text-sm py-1 px-3">
                🔄 Atualizar
              </button>
            </div>

            {configs.length === 0 ? (
              <div className="text-center py-12 text-elite-metal">
                <div className="text-4xl mb-4">💭</div>
                <p>Nenhuma configuração ativa</p>
              </div>
            ) : (
              <div className="space-y-3">
                {configs.map((config, idx) => (
                  <div key={idx} className="p-4 bg-surface-01 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="category-badge badge-admin text-xs">
                        {config.provider.toUpperCase()}
                      </div>
                      <div className="text-xs text-green-400">✅ Ativo</div>
                    </div>
                    <div className="text-elite-text font-semibold mb-1">
                      {config.bucket_name || config.folder_path || 'N/A'}
                    </div>
                    <div className="text-xs text-elite-metal">
                      Credenciais: {Object.keys(config.credentials || {}).length} chaves configuradas
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-elite-accent/10 border border-elite-accent/30 rounded-lg">
              <div className="text-elite-accent font-semibold text-sm mb-2">🔒 Zero-Retention</div>
              <p className="text-elite-metal text-xs">
                Seus dados são armazenados no SEU storage. A Elite mantém apenas hashes e metadados para auditoria.
              </p>
            </div>
          </CipherGlassCard>
        </div>
      </div>
    </div>
  );
};

export default StorageConfig;
