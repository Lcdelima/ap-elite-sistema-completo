import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const ContratoEditor = () => {
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('prestacao_servicos');
  const [variaveis, setVariaveis] = useState({
    contratante_nome: '',
    contratante_cpf: '',
    contratado_nome: '',
    contratado_oab: '',
    valor: '',
    data: new Date().toISOString().split('T')[0]
  });

  const templates = {
    prestacao_servicos: {
      nome: 'Contrato de Prestação de Serviços Jurídicos',
      conteudo: `<h2 style="text-align: center;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS</h2>

<p><strong>CONTRATANTE:</strong> {{contratante_nome}}, CPF {{contratante_cpf}}</p>
<p><strong>CONTRATADO:</strong> {{contratado_nome}}, OAB {{contratado_oab}}</p>

<h3>CLÁUSULA PRIMEIRA - DO OBJETO</h3>
<p>O CONTRATADO prestará serviços jurídicos de advocacia ao CONTRATANTE.</p>

<h3>CLÁUSULA SEGUNDA - DOS HONORÁRIOS</h3>
<p>O CONTRATANTE pagará ao CONTRATADO o valor de R$ {{valor}}.</p>

<h3>CLÁUSULA TERCEIRA - DO PRAZO</h3>
<p>O presente contrato terá vigência a partir de {{data}}.</p>

<p style="margin-top: 50px;">____________________________<br/>CONTRATANTE</p>
<p>____________________________<br/>CONTRATADO</p>`
    },
    trabalhista: {
      nome: 'Contrato de Trabalho',
      conteudo: `<h2 style="text-align: center;">CONTRATO DE TRABALHO</h2>

<p><strong>EMPREGADOR:</strong> {{contratante_nome}}</p>
<p><strong>EMPREGADO:</strong> {{contratado_nome}}</p>

<h3>CLÁUSULA PRIMEIRA - FUNÇÃO</h3>
<p>O EMPREGADO exercerá a função de advogado.</p>

<h3>CLÁUSULA SEGUNDA - SALÁRIO</h3>
<p>O salário mensal será de R$ {{valor}}.</p>`
    }
  };

  const loadTemplate = () => {
    let conteudo = templates[template].conteudo;
    
    // Substituir variáveis
    Object.keys(variaveis).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      conteudo = conteudo.replace(regex, variaveis[key] || `[${key}]`);
    });
    
    setContent(conteudo);
  };

  const exportPDF = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/contracts/generate-pdf`,
        { content },
        { 
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato_${Date.now()}.pdf`);
      link.click();
    } catch (error) {
      alert('Erro ao gerar PDF: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Editor de <span style={{ color: '#00A3C4' }}>Contratos</span> 📝
          </h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Templates e Variáveis */}
          <div>
            <div className="cipher-glass p-6 mb-6">
              <h3 className="text-lg font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
                Template
              </h3>
              
              <select
                className="input-elite mb-4"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <option value="prestacao_servicos">Prestação de Serviços</option>
                <option value="trabalhista">Contrato de Trabalho</option>
              </select>

              <button onClick={loadTemplate} className="btn-elite btn-elite-primary w-full">
                Carregar Template
              </button>
            </div>

            <div className="cipher-glass p-6">
              <h3 className="text-lg font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
                Variáveis
              </h3>
              
              <div className="space-y-3">
                {Object.keys(variaveis).map((key) => (
                  <div key={key}>
                    <label className="block text-xs mb-1" style={{ color: 'rgba(228,230,235,0.7)' }}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </label>
                    <input
                      type="text"
                      className="input-elite text-sm"
                      value={variaveis[key]}
                      onChange={(e) => setVariaveis({...variaveis, [key]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor WYSIWYG */}
          <div className="lg:col-span-3">
            <div className="cipher-glass p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-title font-bold" style={{ color: '#E4E6EB' }}>
                  Editor
                </h3>
                <button onClick={exportPDF} className="btn-elite btn-elite-primary text-sm">
                  📥 Gerar PDF
                </button>
              </div>

              <div style={{ background: '#fff', borderRadius: '8px', minHeight: '600px' }}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  style={{ height: '550px' }}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'align': [] }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContratoEditor;
