import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const RequestAccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: 'advogado',
    area_of_interest: '',
    plan_desired: 'pro',
    justification: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/request-access`,
        formData
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-elite flex items-center justify-center px-6">
        <CipherGlassCard className="max-w-2xl w-full p-10 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-title text-elite-text mb-4">
            Solicitação Enviada!
          </h2>
          <p className="text-elite-metal mb-6">
            Recebemos sua solicitação de acesso. A equipe Elite entrará em contato em até 48 horas para validação e definição do plano.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="btn-elite btn-elite-primary"
          >
            Voltar ao Início
          </button>
        </CipherGlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elite py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-title text-elite-text mb-4">
            Solicitar <span className="text-elite-accent">Acesso</span>
          </h1>
          <p className="text-elite-metal">
            Preencha o formulário abaixo. Sua solicitação será analisada pela equipe Elite.
          </p>
        </div>

        <CipherGlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome Completo */}
            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                required
                className="input-elite"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dra. Maria Silva"
              />
            </div>

            {/* Email e Telefone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-elite-text text-sm font-semibold mb-2">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-elite"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="maria@escritorio.com"
                />
              </div>
              
              <div>
                <label className="block text-elite-text text-sm font-semibold mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="input-elite"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Escritório/Empresa *
              </label>
              <input
                type="text"
                name="company"
                required
                className="input-elite"
                value={formData.company}
                onChange={handleChange}
                placeholder="Silva & Associados Advocacia"
              />
            </div>

            {/* Função e Área */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-elite-text text-sm font-semibold mb-2">
                  Função *
                </label>
                <select
                  name="role"
                  required
                  className="input-elite"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="advogado">Advogado(a)</option>
                  <option value="perito">Perito(a)</option>
                  <option value="gestor">Gestor(a)</option>
                  <option value="estudante">Estudante</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-elite-text text-sm font-semibold mb-2">
                  Área de Atuação *
                </label>
                <input
                  type="text"
                  name="area_of_interest"
                  required
                  className="input-elite"
                  value={formData.area_of_interest}
                  onChange={handleChange}
                  placeholder="Criminal, Cível, Trabalhista..."
                />
              </div>
            </div>

            {/* Plano Desejado */}
            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Plano Desejado *
              </label>
              <div className="grid md:grid-cols-4 gap-4">
                {['basic', 'pro', 'elite', 'corporate'].map((plan) => (
                  <label
                    key={plan}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      formData.plan_desired === plan
                        ? 'border-elite-accent bg-surface-02'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan_desired"
                      value={plan}
                      checked={formData.plan_desired === plan}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="text-elite-text font-semibold capitalize">{plan}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Justificativa */}
            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Justificativa de Uso * (mínimo 20 caracteres)
              </label>
              <textarea
                name="justification"
                required
                rows={4}
                minLength={20}
                maxLength={1000}
                className="input-elite"
                value={formData.justification}
                onChange={handleChange}
                placeholder="Descreva brevemente como pretende utilizar a plataforma Elite Athena..."
              />
              <div className="text-right text-sm text-elite-metal mt-1">
                {formData.justification.length}/1000
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {/* Botões */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-elite btn-elite-secondary"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-elite btn-elite-primary"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </div>
          </form>
        </CipherGlassCard>
      </div>
    </div>
  );
};

export default RequestAccess;
