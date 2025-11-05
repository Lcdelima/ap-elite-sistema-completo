import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const NFEManager = () => {
  const [nfes, setNfes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_cpf_cnpj: '',
    cliente_endereco: '',
    itens: [{ descricao: '', quantidade: 1, valor_unitario: 0, ncm: '99' }]
  });

  useEffect(() => {
    loadNFes();
  }, []);

  const loadNFes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/nfe/lista`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setNfes(response.data.notas || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { descricao: '', quantidade: 1, valor_unitario: 0, ncm: '99' }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItens = [...formData.itens];
    newItens[index][field] = value;
    setFormData({ ...formData, itens: newItens });
  };

  const gerarNFE = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/nfe/gerar`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );

      alert(`✅ NF-e ${response.data.numero_nfe} gerada!`);
      setShowForm(false);
      loadNFes();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    }
  };

  const calcularTotal = () => {
    return formData.itens.reduce((sum, item) => sum + (item.quantidade * item.valor_unitario), 0);
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
              Notas Fiscais <span style={{ color: '#00A3C4' }}>Eletrônicas</span> 🧾
            </h1>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn-elite btn-elite-primary"
          >
            {showForm ? '✕ Cancelar' : '+ Emitir NF-e'}
          </button>
        </div>

        {showForm ? (
          <div className="cipher-glass p-8 mb-6">
            <h2 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
              Nova NF-e
            </h2>

            <div className="space-y-4">
              {/* Dados do Cliente */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Nome/Razão Social
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.cliente_nome}
                    onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.cliente_cpf_cnpj}
                    onChange={(e) => setFormData({...formData, cliente_cpf_cnpj: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Endereço
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.cliente_endereco}
                    onChange={(e) => setFormData({...formData, cliente_endereco: e.target.value})}
                  />
                </div>
              </div>

              {/* Itens */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold" style={{ color: '#00A3C4' }}>Itens/Serviços</h3>
                  <button onClick={addItem} className="text-sm" style={{ color: '#00A3C4' }}>
                    + Adicionar Item
                  </button>
                </div>

                {formData.itens.map((item, idx) => (
                  <div key={idx} className="grid md:grid-cols-4 gap-3 mb-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <input
                      type="text"
                      placeholder="Descrição"
                      className="input-elite text-sm"
                      value={item.descricao}
                      onChange={(e) => updateItem(idx, 'descricao', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      className="input-elite text-sm"
                      value={item.quantidade}
                      onChange={(e) => updateItem(idx, 'quantidade', parseFloat(e.target.value))}
                    />
                    <input
                      type="number"
                      placeholder="Valor Unit."
                      className="input-elite text-sm"
                      value={item.valor_unitario}
                      onChange={(e) => updateItem(idx, 'valor_unitario', parseFloat(e.target.value))}
                    />
                    <div className="flex items-center">
                      <span className="text-sm font-bold" style={{ color: '#27AE60' }}>
                        R$ {(item.quantidade * item.valor_unitario).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="text-right mt-4">
                  <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>Total:</div>
                  <div className="text-3xl font-title font-bold" style={{ color: '#27AE60' }}>
                    R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <button onClick={gerarNFE} className="btn-elite btn-elite-primary w-full">
                🧾 Gerar NF-e
              </button>
            </div>
          </div>
        ) : (
          <div className="cipher-glass p-6">
            <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
              NF-es Emitidas
            </h3>

            {nfes.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div className="text-5xl mb-4">🧾</div>
                <p>Nenhuma NF-e emitida ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nfes.map((nfe) => (
                  <div key={nfe.numero} className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold mb-1" style={{ color: '#E4E6EB' }}>
                          NF-e #{nfe.numero.toString().padStart(6, '0')}
                        </div>
                        <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
                          {nfe.cliente.nome}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg" style={{ color: '#27AE60' }}>
                          R$ {nfe.valor_total.toLocaleString('pt-BR')}
                        </div>
                        <div className="badge-elite badge-iso text-xs mt-1">
                          {nfe.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFEManager;
