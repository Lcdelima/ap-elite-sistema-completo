import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const Publicacoes = () => {
  const [dashboard, setDashboard] = useState(null);
  const [publicacoes, setPublicacoes] = useState([]);
  const [filter, setFilter] = useState('nao_tratada');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadPublicacoes();
  }, [filter]);

  const loadDashboard = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/publicacoes/dashboard`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setDashboard(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadPublicacoes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/publicacoes/?status=${filter}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setPublicacoes(response.data.publicacoes || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarTratada = async (id) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/publicacoes/${id}/tratar`,
        { 
          responsavel: localStorage.getItem('user_name') || 'Unknown',
          observacoes: 'Tratada via dashboard'
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      alert('✅ Publicação marcada como tratada');
      loadDashboard();
      loadPublicacoes();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const descartar = async (id) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/publicacoes/${id}/descartar`,
        { motivo: 'Descartada via dashboard' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      alert('🗑️ Publicação descartada');
      loadDashboard();
      loadPublicacoes();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            <span style={{ color: '#00A3C4' }}>Publicações</span> Judiciais 📰
          </h1>
          <p className="subtitle mt-2" style={{ color: 'rgba(228,230,235,0.7)' }}>
            Triagem diária e gestão de publicações dos tribunais
          </p>
        </div>

        {/* Dashboard de Triagem */}
        {dashboard && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="cipher-glass p-6 text-center">
              <div className="text-4xl font-title font-bold mb-2" style={{ color: '#E67E22' }}>
                {dashboard.totais.nao_tratadas}
              </div>
              <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>Não Tratadas</div>
            </div>
            
            <div className="cipher-glass p-6 text-center">
              <div className="text-4xl font-title font-bold mb-2" style={{ color: '#27AE60' }}>
                {dashboard.totais.tratadas}
              </div>
              <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>Tratadas</div>
            </div>
            
            <div className="cipher-glass p-6 text-center">
              <div className="text-4xl font-title font-bold mb-2" style={{ color: '#B3B8C2' }}>
                {dashboard.totais.descartadas}
              </div>
              <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>Descartadas</div>
            </div>
            
            <div className="cipher-glass p-6 text-center">
              <div className="text-4xl font-title font-bold mb-2" style={{ color: '#E74C3C' }}>
                {dashboard.totais.alta_prioridade}
              </div>
              <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>Alta Prioridade</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { value: 'nao_tratada', label: 'Não Tratadas', color: '#E67E22' },
            { value: 'tratada', label: 'Tratadas', color: '#27AE60' },
            { value: 'descartada', label: 'Descartadas', color: '#B3B8C2' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                background: filter === f.value ? f.color : 'rgba(255,255,255,0.06)',
                color: filter === f.value ? '#000' : '#E4E6EB',
                border: `1px solid ${filter === f.value ? 'transparent' : 'rgba(199,190,183,0.2)'}`,
                fontWeight: filter === f.value ? 700 : 500
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Publicações */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12" style={{ color: 'rgba(228,230,235,0.6)' }}>
              Carregando...
            </div>
          ) : publicacoes.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'rgba(228,230,235,0.6)' }}>
              Nenhuma publicação {filter === 'nao_tratada' ? 'pendente' : filter}
            </div>
          ) : (
            publicacoes.map((pub) => (
              <div key={pub.id} className="cipher-glass p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="badge-elite badge-iso text-xs">{pub.tipo.toUpperCase()}</div>
                      <div className="badge-elite" style={{
                        background: pub.prioridade === 'alta' ? '#E74C3C' : pub.prioridade === 'media' ? '#E67E22' : '#B3B8C2',
                        fontSize: '0.6875rem'
                      }}>
                        {pub.prioridade.toUpperCase()}
                      </div>
                      {pub.prazo_fatal && (
                        <div className="text-xs" style={{ color: '#E67E22' }}>
                          ⏰ Prazo: {new Date(pub.prazo_fatal).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#E4E6EB' }}>
                      {pub.tribunal}
                    </h3>
                    
                    <p className="text-sm mb-3" style={{ color: 'rgba(228,230,235,0.8)' }}>
                      {pub.conteudo}
                    </p>
                    
                    <div className="flex gap-2 text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>
                      <span>📅 {new Date(pub.data_publicacao).toLocaleDateString('pt-BR')}</span>
                      {pub.responsavel && <span>• 👤 {pub.responsavel}</span>}
                    </div>
                  </div>

                  {filter === 'nao_tratada' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => marcarTratada(pub.id)}
                        className="btn-elite btn-elite-primary text-xs px-3 py-2"
                      >
                        ✅ Tratar
                      </button>
                      <button
                        onClick={() => descartar(pub.id)}
                        className="btn-elite btn-elite-secondary text-xs px-3 py-2"
                      >
                        🗑️ Descartar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Publicacoes;
