import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Globe, Wifi, MapPin, Phone, Mail, 
  User, Building2, CreditCard, Link as LinkIcon,
  AlertCircle, CheckCircle, TrendingUp, Database,
  Network, Eye, Target, Zap, Lock, Unlock
} from 'lucide-react';
import { 
  AthenaNavigationBar, 
  AthenaEmptyState, 
  AthenaLoadingSkeleton 
} from '../../components/AthenaComponents';

/**
 * 🕸️ CYBERINTEL FUSION - NCIS CYBER
 * OSINT + Enrichment + Correlação
 * Inspirado em: NCIS Cyber Division
 */

const CyberIntelFusion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('pessoa');
  const [searchValue, setSearchValue] = useState('');
  const [enrichmentResult, setEnrichmentResult] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const searchTypes = [
    { value: 'pessoa', label: 'Pessoa', icon: <User size={20} /> },
    { value: 'empresa', label: 'Empresa', icon: <Building2 size={20} /> },
    { value: 'telefone', label: 'Telefone', icon: <Phone size={20} /> },
    { value: 'email', label: 'E-mail', icon: <Mail size={20} /> },
    { value: 'cpf', label: 'CPF', icon: <CreditCard size={20} /> },
    { value: 'cnpj', label: 'CNPJ', icon: <Building2 size={20} /> }
  ];

  const handleEnrich = async () => {
    if (!searchValue) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cisai/cyberintel/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: searchType,
          valor: searchValue,
          sources: ['web', 'social', 'public_records']
        })
      });
      const data = await response.json();
      setEnrichmentResult(data.data);
      
      // Buscar grafo de relacionamentos
      if (data.data.enrichment_id) {
        const graphResponse = await fetch(
          `${BACKEND_URL}/api/cisai/cyberintel/graph/${data.data.enrichment_id}`
        );
        const graphData = await graphResponse.json();
        setGraphData(graphData.data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <AthenaNavigationBar 
        title="CyberIntel Fusion"
        subtitle="OSINT + Enrichment + Correlation - NCIS Cyber"
        backDestination="/admin/athena"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Search Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-cyan-400" size={32} />
            <div>
              <h2 className="text-3xl font-bold text-white">
                Intelligence Fusion Center
              </h2>
              <p className="text-neutral-400 mt-1">
                Sistema de enriquecimento e correlação de dados OSINT
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Type Selector */}
              <div className="md:col-span-3">
                <label className="text-sm text-neutral-400 mb-2 block">
                  Tipo de Busca
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700
                    text-white focus:outline-none focus:border-cyan-500"
                >
                  {searchTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="md:col-span-7">
                <label className="text-sm text-neutral-400 mb-2 block">
                  Valor para Enriquecer
                </label>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnrich()}
                  placeholder={`Digite ${searchTypes.find(t => t.value === searchType)?.label.toLowerCase()}...`}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700
                    text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Search Button */}
              <div className="md:col-span-2 flex items-end">
                <motion.button
                  onClick={handleEnrich}
                  disabled={loading || !searchValue}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white font-medium shadow-lg hover:shadow-cyan-500/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Enriquecer
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Sources Chips */}
            <div className="flex gap-2 mt-4">
              <span className="text-xs text-neutral-400">Fontes ativas:</span>
              <div className="flex gap-2">
                {['Web Search', 'Redes Sociais', 'Registros Públicos', 'Vazamentos'].map(source => (
                  <span key={source} className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Database className="text-cyan-400" />}
            label="Buscas Hoje"
            value="47"
            trend="+23%"
          />
          <StatCard
            icon={<Network className="text-blue-400" />}
            label="Entidades Mapeadas"
            value="1,234"
            trend="+12%"
          />
          <StatCard
            icon={<Eye className="text-purple-400" />}
            label="Fontes Ativas"
            value="18"
            trend="100%"
          />
          <StatCard
            icon={<TrendingUp className="text-green-400" />}
            label="Taxa de Sucesso"
            value="94%"
            trend="+5%"
          />
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <AthenaLoadingSkeleton lines={5} />
          ) : enrichmentResult ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Main Info */}
              <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="text-cyan-400" />
                  Dados Públicos Encontrados
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(enrichmentResult.public_data || {}).map(([key, value]) => (
                    <InfoCard key={key} label={key} value={value} />
                  ))}
                </div>

                {/* Risk Score */}
                <div className="mt-6 pt-6 border-t border-neutral-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-400">Score de Risco</span>
                    <span className="text-3xl font-bold text-cyan-400">
                      {enrichmentResult.risk_score}/10
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        enrichmentResult.risk_score > 7 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        enrichmentResult.risk_score > 4 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${enrichmentResult.risk_score * 10}%` }}
                    />
                  </div>
                  <p className="text-sm text-neutral-400 mt-2">
                    {enrichmentResult.classificacao}
                  </p>
                </div>
              </div>

              {/* Cadastros */}
              {enrichmentResult.cadastros && enrichmentResult.cadastros.length > 0 && (
                <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Building2 className="text-blue-400" />
                    Cadastros e Registros
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {enrichmentResult.cadastros.map((cadastro, idx) => (
                      <CadastroCard key={idx} cadastro={cadastro} />
                    ))}
                  </div>
                </div>
              )}

              {/* Redes Sociais */}
              {enrichmentResult.redes_sociais && enrichmentResult.redes_sociais.length > 0 && (
                <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wifi className="text-purple-400" />
                    Redes Sociais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrichmentResult.redes_sociais.map((rede, idx) => (
                      <RedeCard key={idx} rede={rede} />
                    ))}
                  </div>
                </div>
              )}

              {/* Relacionamentos */}
              {enrichmentResult.relacionamentos && enrichmentResult.relacionamentos.length > 0 && (
                <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Network className="text-cyan-400" />
                    Relacionamentos Detectados
                  </h3>
                  <div className="space-y-3">
                    {enrichmentResult.relacionamentos.map((rel, idx) => (
                      <RelacionamentoCard key={idx} relacionamento={rel} />
                    ))}
                  </div>
                </div>
              )}

              {/* Vazamentos */}
              {enrichmentResult.vazamentos && enrichmentResult.vazamentos.length > 0 && (
                <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="text-red-400" />
                    ⚠️ Vazamentos de Dados Detectados
                  </h3>
                  <div className="space-y-3">
                    {enrichmentResult.vazamentos.map((vaz, idx) => (
                      <VazamentoCard key={idx} vazamento={vaz} />
                    ))}
                  </div>
                </div>
              )}

              {/* Network Graph */}
              {graphData && (
                <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Network className="text-cyan-400" />
                    Grafo de Relacionamentos
                  </h3>
                  <NetworkGraph data={graphData} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  onClick={() => console.log('Gerar relatório')}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white font-medium shadow-lg hover:shadow-cyan-500/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  📄 Gerar Relatório Forense
                </motion.button>
                <motion.button
                  onClick={() => console.log('Exportar dados')}
                  className="flex-1 px-6 py-3 rounded-xl bg-neutral-800 border border-neutral-700
                    text-white font-medium hover:border-cyan-500/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  💾 Exportar Dados (JSON)
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <AthenaEmptyState
              icon="🔍"
              title="Nenhuma busca realizada"
              subtitle="Digite um valor acima e clique em Enriquecer para começar"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <motion.div
    className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700
      hover:border-cyan-500/50 transition-all duration-300"
    whileHover={{ scale: 1.02, y: -2 }}
  >
    <div className="flex items-center justify-between mb-2">
      {icon}
      <span className="text-green-400 text-sm font-medium">{trend}</span>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-neutral-400">{label}</div>
  </motion.div>
);

const InfoCard = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-700">
    <div className="text-xs text-neutral-500 mb-1 uppercase">{label}</div>
    <div className="text-white font-medium">{value || 'N/A'}</div>
  </div>
);

const CadastroCard = ({ cadastro }) => (
  <motion.div
    className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-700
      hover:border-blue-500/50 cursor-pointer"
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-white font-medium">{cadastro.tipo}</span>
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        cadastro.status === 'Regular' ? 'bg-green-500/20 text-green-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {cadastro.status}
      </span>
    </div>
    <p className="text-sm text-neutral-400">{cadastro.situacao}</p>
  </motion.div>
);

const RedeCard = ({ rede }) => (
  <motion.div
    className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-700
      hover:border-purple-500/50 cursor-pointer"
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center gap-3 mb-2">
      <Wifi className="text-purple-400" size={20} />
      <span className="text-white font-medium">{rede.plataforma}</span>
    </div>
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-neutral-400">Perfil:</span>
        <span className="text-cyan-400">{rede.perfil || rede.handle}</span>
      </div>
      {rede.seguidores && (
        <div className="flex justify-between">
          <span className="text-neutral-400">Seguidores:</span>
          <span className="text-white">{rede.seguidores.toLocaleString()}</span>
        </div>
      )}
      {rede.conexoes && (
        <div className="flex justify-between">
          <span className="text-neutral-400">Conexões:</span>
          <span className="text-white">{rede.conexoes.toLocaleString()}</span>
        </div>
      )}
    </div>
  </motion.div>
);

const RelacionamentoCard = ({ relacionamento }) => (
  <motion.div
    className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-700
      hover:border-cyan-500/50"
    whileHover={{ scale: 1.01 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <User className="text-cyan-400" size={20} />
        <div>
          <div className="text-white font-medium">{relacionamento.nome}</div>
          <div className="text-xs text-neutral-400">{relacionamento.tipo}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-sm text-neutral-400">Confiança</div>
          <div className="text-lg font-bold text-cyan-400">
            {(relacionamento.confianca * 100).toFixed(0)}%
          </div>
        </div>
        <div className="w-16 bg-neutral-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
            style={{ width: `${relacionamento.confianca * 100}%` }}
          />
        </div>
      </div>
    </div>
  </motion.div>
);

const VazamentoCard = ({ vazamento }) => (
  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/30">
    <div className="flex items-start gap-3">
      <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-white font-medium">{vazamento.fonte}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            vazamento.severidade === 'alta' ? 'bg-red-500/20 text-red-400' :
            vazamento.severidade === 'média' ? 'bg-orange-500/20 text-orange-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {vazamento.severidade.toUpperCase()}
          </span>
        </div>
        <div className="text-sm text-neutral-300">
          Dados expostos: {vazamento.dados_expostos.join(', ')}
        </div>
      </div>
    </div>
  </div>
);

const NetworkGraph = ({ data }) => (
  <div className="relative h-96 bg-neutral-900/50 rounded-lg border border-neutral-700 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Network className="text-cyan-400 mx-auto mb-4" size={48} />
        <p className="text-white font-medium mb-2">Visualização de Grafo 3D</p>
        <p className="text-sm text-neutral-400">
          {data.nodes?.length || 0} nós | {data.edges?.length || 0} conexões
        </p>
        <motion.button
          className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600
            text-white font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🌐 Abrir Visualização Interativa
        </motion.button>
      </div>
    </div>
  </div>
);

export default CyberIntelFusion;
