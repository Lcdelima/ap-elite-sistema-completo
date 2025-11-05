import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader';
import '../../styles/elite-forensic.css';

const ClienteDossie = () => {
  const { clienteId } = useParams();
  const [cliente, setCliente] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    tipo_codigo: '',
    metadados: {},
    file: null
  });

  useEffect(() => {
    loadCliente();
    loadDocumentos();
    loadDocumentTypes();
  }, [clienteId]);

  const loadCliente = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/clientes/${clienteId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setCliente(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadDocumentos = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/clientes/${clienteId}/documentos`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setDocumentos(response.data.documentos || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/clientes/document-types`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setDocumentTypes(response.data.types || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.tipo_codigo) {
      alert('Selecione o tipo e o arquivo');
      return;
    }

    const formData = new FormData();
    formData.append('tipo_codigo', uploadForm.tipo_codigo);
    formData.append('metadados', JSON.stringify(uploadForm.metadados));
    formData.append('file', uploadForm.file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/clientes/${clienteId}/documentos/upload`,
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('elite_token')}` 
          } 
        }
      );

      if (response.data.status === 'duplicate') {
        alert('⚠️ ' + response.data.message);
      } else {
        alert('✅ Documento enviado! Hash: ' + response.data.hashes.sha256.substring(0, 16) + '...');
      }

      setShowUpload(false);
      setUploadForm({ tipo_codigo: '', metadados: {}, file: null });
      loadDocumentos();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'valido': { bg: '#27AE60', text: 'Válido' },
      'vencido': { bg: '#E74C3C', text: 'Vencido' },
      'vencendo_30d': { bg: '#E67E22', text: 'Vence em 30d' }
    };
    return styles[status] || styles['valido'];
  };

  const exportDossie = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/clientes/${clienteId}/dossie/export`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      alert('✅ Dossiê exportado!');
      console.log('Manifesto:', response.data.manifesto);
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <SectionHeader
          title={cliente ? `Dossiê de ${cliente.nome}` : 'Dossiê do Cliente'}
          subtitle="Documentos com cadeia de custódia forense"
          breadcrumbs={['Advocacia', 'Clientes', 'Dossiê']}
          actions={
            <>
              <button onClick={exportDossie} className="btn-elite btn-elite-secondary text-sm">
                📦 Export Dossiê
              </button>
              <button onClick={() => setShowUpload(!showUpload)} className="btn-elite btn-elite-primary text-sm">
                {showUpload ? '✕ Cancelar' : '📄 Adicionar Documento'}
              </button>
            </>
          }
        />

        {/* Info do Cliente */}
        {cliente && (
          <div className="cipher-glass p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Nome</div>
                <div style={{ color: '#E4E6EB' }}>{cliente.nome}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>CPF/CNPJ</div>
                <div className="font-mono" style={{ color: '#E4E6EB' }}>{cliente.cpf_cnpj}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Email</div>
                <div style={{ color: '#E4E6EB' }}>{cliente.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Documentos</div>
                <div className="text-2xl font-title font-bold" style={{ color: '#00A3C4' }}>
                  {documentos.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        {showUpload && (
          <div className="cipher-glass p-6 mb-6">
            <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
              Adicionar Documento
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Tipo de Documento
                </label>
                <select
                  className="input-elite"
                  value={uploadForm.tipo_codigo}
                  onChange={(e) => setUploadForm({ ...uploadForm, tipo_codigo: e.target.value, metadados: {} })}
                >
                  <option value="">Selecione...</option>
                  {documentTypes.map((type) => (
                    <option key={type.codigo} value={type.codigo}>
                      {type.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos dinâmicos baseados no tipo */}
              {uploadForm.tipo_codigo && (
                <div className="p-4 rounded-lg" style={{ background: 'rgba(0,163,196,0.05)', border: '1px solid rgba(0,163,196,0.2)' }}>
                  <div className="text-sm font-semibold mb-3" style={{ color: '#00A3C4' }}>
                    Campos Obrigatórios
                  </div>
                  
                  {/* Exemplo de campos - adaptar dinamicamente pelo schema */}
                  {uploadForm.tipo_codigo === 'RG' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Número do RG"
                        className="input-elite text-sm"
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          metadados: { ...uploadForm.metadados, numero: e.target.value }
                        })}
                      />
                      <input
                        type="text"
                        placeholder="Órgão Emissor"
                        className="input-elite text-sm"
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          metadados: { ...uploadForm.metadados, orgao_emissor: e.target.value }
                        })}
                      />
                      <input
                        type="text"
                        placeholder="UF"
                        maxLength={2}
                        className="input-elite text-sm"
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          metadados: { ...uploadForm.metadados, uf: e.target.value }
                        })}
                      />
                      <input
                        type="date"
                        placeholder="Data Emissão"
                        className="input-elite text-sm"
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          metadados: { ...uploadForm.metadados, data_emissao: e.target.value }
                        })}
                      />
                    </div>
                  )}

                  {uploadForm.tipo_codigo === 'PROCURACAO' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <input type="text" placeholder="Outorgante" className="input-elite text-sm" onChange={(e) => setUploadForm({ ...uploadForm, metadados: { ...uploadForm.metadados, outorgante: e.target.value } })} />
                      <input type="text" placeholder="Outorgado" className="input-elite text-sm" onChange={(e) => setUploadForm({ ...uploadForm, metadados: { ...uploadForm.metadados, outorgado: e.target.value } })} />
                      <input type="text" placeholder="Poderes" className="input-elite text-sm" onChange={(e) => setUploadForm({ ...uploadForm, metadados: { ...uploadForm.metadados, poderes: e.target.value } })} />
                      <input type="date" placeholder="Data Assinatura" className="input-elite text-sm" onChange={(e) => setUploadForm({ ...uploadForm, metadados: { ...uploadForm.metadados, data_assinatura: e.target.value } })} />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Arquivo
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="input-elite"
                />
              </div>

              <button onClick={handleUpload} className="btn-elite btn-elite-primary w-full">
                📤 Enviar Documento
              </button>
            </div>
          </div>
        )}

        {/* Lista de Documentos */}
        <div className="cipher-glass p-6">
          <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
            Documentos Anexados
          </h3>

          {documentos.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'rgba(228,230,235,0.6)' }}>
              <div className="text-5xl mb-4">📁</div>
              <p>Nenhum documento anexado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documentos.map((doc) => {
                const badge = getStatusBadge(doc.status);
                return (
                  <div key={doc.id} className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">📄</div>
                          <div>
                            <div className="font-bold" style={{ color: '#E4E6EB' }}>
                              {doc.tipo_nome}
                            </div>
                            <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>
                              {doc.filename}
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span style={{ color: '#00A3C4' }}>Hash: </span>
                            <span className="font-mono" style={{ color: '#E4E6EB' }}>
                              {doc.sha256.substring(0, 16)}...
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#00A3C4' }}>Tamanho: </span>
                            <span style={{ color: '#E4E6EB' }}>
                              {(doc.size_bytes / 1024).toFixed(2)} KB
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#00A3C4' }}>Upload: </span>
                            <span style={{ color: '#E4E6EB' }}>
                              {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Metadados */}
                        {doc.metadados && Object.keys(doc.metadados).length > 0 && (
                          <div className="mt-3 p-3 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <div className="text-xs font-semibold mb-2" style={{ color: '#00A3C4' }}>
                              Metadados:
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(doc.metadados).map(([key, value]) => (
                                <div key={key}>
                                  <span style={{ color: 'rgba(228,230,235,0.5)' }}>{key}: </span>
                                  <span style={{ color: '#E4E6EB' }}>{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <div 
                          className="px-3 py-1 rounded text-xs font-bold"
                          style={{ background: badge.bg, color: '#fff' }}
                        >
                          {badge.text}
                        </div>
                        <button className="text-xs px-3 py-1 rounded" style={{ border: '1px solid rgba(0,163,196,0.3)', color: '#00A3C4' }}>
                          Verificar Hash
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteDossie;
