import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/elite-forensic.css';

const ProcessFormWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Dados Básicos
    numero: '',
    titulo: '',
    vara: '',
    comarca: '',
    tipo_acao: '',
    valor_causa: '',
    
    // Step 2: Partes
    autor: '',
    reu: '',
    advogado_autor: '',
    advogado_reu: '',
    
    // Step 3: Movimentações
    data_distribuicao: '',
    fase: 'inicial',
    status: 'ativo',
    
    // Step 4: Anexos
    tags: ''
  });
  
  const [autoSaving, setAutoSaving] = useState(false);

  // Auto-save a cada 30 segundos
  React.useEffect(() => {
    const interval = setInterval(() => {
      autoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [formData]);

  const autoSave = async () => {
    setAutoSaving(true);
    try {
      localStorage.setItem('process_draft', JSON.stringify(formData));
      setTimeout(() => setAutoSaving(false), 1000);
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/processes`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      localStorage.removeItem('process_draft');
      alert('✅ Processo criado com sucesso!');
      navigate('/athena/processes');
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Novo <span style={{ color: '#00A3C4' }}>Processo</span>
          </h1>
          {autoSaving && (
            <div className="text-xs mt-2" style={{ color: '#27AE60' }}>
              ✔️ Auto-save ativado
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="cipher-glass p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all"
                  style={{
                    background: step >= s ? '#00A3C4' : 'rgba(255,255,255,0.1)',
                    color: step >= s ? '#000' : '#B3B8C2'
                  }}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div 
                    className="w-20 h-1 mx-2"
                    style={{
                      background: step > s ? '#00A3C4' : 'rgba(255,255,255,0.1)'
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>
            <span>Dados Básicos</span>
            <span>Partes</span>
            <span>Movimentações</span>
            <span>Finalização</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="cipher-glass p-8">
          {/* Step 1: Dados Básicos */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
                Dados Básicos do Processo
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Número do Processo
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    placeholder="0000000-00.0000.0.00.0000"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Tipo de Ação
                  </label>
                  <select
                    className="input-elite"
                    value={formData.tipo_acao}
                    onChange={(e) => setFormData({...formData, tipo_acao: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="penal">Penal</option>
                    <option value="civil">Cível</option>
                    <option value="trabalhista">Trabalhista</option>
                    <option value="tributario">Tributário</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Título do Processo
                </label>
                <input
                  type="text"
                  className="input-elite"
                  placeholder="Ex: Ação de indenização por danos morais"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Vara
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.vara}
                    onChange={(e) => setFormData({...formData, vara: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Comarca
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.comarca}
                    onChange={(e) => setFormData({...formData, comarca: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Valor da Causa
                </label>
                <input
                  type="number"
                  className="input-elite"
                  placeholder="0.00"
                  value={formData.valor_causa}
                  onChange={(e) => setFormData({...formData, valor_causa: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Step 2: Partes */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
                Partes do Processo
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Autor/Requerente
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.autor}
                    onChange={(e) => setFormData({...formData, autor: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Réu/Requerido
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.reu}
                    onChange={(e) => setFormData({...formData, reu: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Advogado do Autor
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.advogado_autor}
                    onChange={(e) => setFormData({...formData, advogado_autor: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Advogado do Réu
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.advogado_reu}
                    onChange={(e) => setFormData({...formData, advogado_reu: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Movimentações */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
                Movimentações e Status
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Data de Distribuição
                  </label>
                  <input
                    type="date"
                    className="input-elite"
                    value={formData.data_distribuicao}
                    onChange={(e) => setFormData({...formData, data_distribuicao: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Fase Processual
                  </label>
                  <select
                    className="input-elite"
                    value={formData.fase}
                    onChange={(e) => setFormData({...formData, fase: e.target.value})}
                  >
                    <option value="inicial">Inicial</option>
                    <option value="instrucao">Instrução</option>
                    <option value="julgamento">Julgamento</option>
                    <option value="recursal">Recursal</option>
                    <option value="transitado">Trânsito em Julgado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Status
                </label>
                <select
                  className="input-elite"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ativo">Ativo</option>
                  <option value="suspenso">Suspenso</option>
                  <option value="arquivado">Arquivado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Tags e Finalização */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
                Tags e Finalização
              </h2>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  className="input-elite"
                  placeholder="urgente, criminal, indenização"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                />
              </div>

              {/* Resumo */}
              <div className="cipher-glass p-6 mt-6" style={{ background: 'rgba(0,163,196,0.05)' }}>
                <h3 className="font-bold mb-4" style={{ color: '#00A3C4' }}>Resumo do Processo</h3>
                <div className="space-y-2 text-sm" style={{ color: '#E4E6EB' }}>
                  <div><strong>Número:</strong> {formData.numero || 'N/A'}</div>
                  <div><strong>Título:</strong> {formData.titulo || 'N/A'}</div>
                  <div><strong>Autor:</strong> {formData.autor || 'N/A'}</div>
                  <div><strong>Réu:</strong> {formData.reu || 'N/A'}</div>
                  <div><strong>Fase:</strong> {formData.fase}</div>
                  <div><strong>Status:</strong> {formData.status}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="btn-elite btn-elite-secondary"
            >
              ← Anterior
            </button>
            
            <div className="text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
              Etapa {step} de 4
            </div>
            
            {step < 4 ? (
              <button onClick={nextStep} className="btn-elite btn-elite-primary">
                Próximo →
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-elite btn-elite-primary">
                ✔️ Criar Processo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessFormWizard;
