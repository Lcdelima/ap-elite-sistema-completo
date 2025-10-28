import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardModuleLayout, { StandardCard, StandardEmptyState, ActionButton } from '../../components/StandardModuleLayout';
import { FormInput, FormTextarea, FormSelect, FormGrid, FormSection, FormActions } from '../../components/FormComponents';
import { Badge } from '../../components/ui/badge';
import {
  FileText, Plus, Search, Eye, Download, Trash2, Copy, Edit,
  FileCheck, BookOpen, FileSignature, Scale, Building, User,
  Calendar, DollarSign, Briefcase, AlertCircle, CheckCircle,
  Filter, ArrowLeft, Save, X, List, Grid3x3
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const GeradorDocumentosJuridicos = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('templates'); // templates, criar, visualizar, documentos
  const [templates, setTemplates] = useState([]);
  const [templatesPorCategoria, setTemplatesPorCategoria] = useState({});
  const [templateSelecionado, setTemplateSelecionado] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [documentoVisualizado, setDocumentoVisualizado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTemplates();
    fetchDocumentos();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/documentos/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplates(res.data.templates || []);
      setTemplatesPorCategoria(res.data.por_categoria || {});
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentos = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/documentos/documentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDocumentos(res.data.documentos || []);
    } catch (error) {
      console.error('Error fetching documentos:', error);
    }
  };

  const handleSelecionarTemplate = async (templateId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/documentos/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplateSelecionado(res.data);
      
      // Inicializar formData com campos vazios
      const initialData = {};
      res.data.campos.forEach(campo => {
        initialData[campo.nome] = '';
      });
      setFormData(initialData);
      
      setView('criar');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar template');
    }
  };

  const handleGerarDocumento = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.post(
        `${BACKEND_URL}/api/documentos/gerar`,
        {
          template_id: templateSelecionado.id,
          campos: formData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Documento gerado com sucesso!');
      setDocumentoVisualizado(res.data);
      setView('visualizar');
      fetchDocumentos();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Erro ao gerar documento');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluirDocumento = async (docId) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.delete(`${BACKEND_URL}/api/documentos/documentos/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Documento excluído com sucesso!');
      fetchDocumentos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const renderCampo = (campo) => {
    const value = formData[campo.nome] || '';
    
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [campo.nome]: e.target.value
      });
    };

    switch (campo.tipo) {
      case 'textarea':
        return (
          <FormTextarea
            key={campo.nome}
            label={campo.label}
            value={value}
            onChange={handleChange}
            required={campo.obrigatorio}
            rows={6}
            placeholder={`Digite ${campo.label.toLowerCase()}...`}
          />
        );
      
      case 'number':
        return (
          <FormInput
            key={campo.nome}
            label={campo.label}
            type="number"
            value={value}
            onChange={handleChange}
            required={campo.obrigatorio}
            placeholder="0.00"
            icon={DollarSign}
          />
        );
      
      case 'date':
        return (
          <FormInput
            key={campo.nome}
            label={campo.label}
            type="date"
            value={value}
            onChange={handleChange}
            required={campo.obrigatorio}
            icon={Calendar}
          />
        );
      
      default:
        return (
          <FormInput
            key={campo.nome}
            label={campo.label}
            value={value}
            onChange={handleChange}
            required={campo.obrigatorio}
            placeholder={`Digite ${campo.label.toLowerCase()}...`}
            icon={FileText}
          />
        );
    }
  };

  // Template Gallery View
  const TemplatesView = () => {
    const categorias = Object.keys(templatesPorCategoria);
    const categoriaFiltrada = categoriaSelecionada || categorias[0];
    const templatesExibir = categoriaSelecionada 
      ? templatesPorCategoria[categoriaSelecionada] || []
      : templates;

    const getCategoriaIcon = (categoria) => {
      const icons = {
        'Petições': Scale,
        'Recursos': FileCheck,
        'Contratos': FileSignature,
        'Procurações': User,
        'Declarações': FileText,
        'Documentos Corporativos': Building,
        'Notificações': AlertCircle,
        'Acordos': CheckCircle,
        'Administrativo': Briefcase
      };
      return icons[categoria] || FileText;
    };

    const getCategoriaColor = (categoria) => {
      const colors = {
        'Petições': 'blue',
        'Recursos': 'purple',
        'Contratos': 'green',
        'Procurações': 'orange',
        'Declarações': 'cyan',
        'Documentos Corporativos': 'indigo',
        'Notificações': 'yellow',
        'Acordos': 'pink',
        'Administrativo': 'red'
      };
      return colors[categoria] || 'gray';
    };

    return (
      <div className="space-y-6">
        {/* Categorias */}
        <StandardCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Categorias de Documentos</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoriaSelecionada('')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !categoriaSelecionada
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Todos ({templates.length})
              </button>
              
              {categorias.map((categoria) => {
                const Icon = getCategoriaIcon(categoria);
                const color = getCategoriaColor(categoria);
                const count = templatesPorCategoria[categoria]?.length || 0;
                
                return (
                  <button
                    key={categoria}
                    onClick={() => setCategoriaSelecionada(categoria)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      categoriaSelecionada === categoria
                        ? `bg-${color}-600 text-white`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {categoria} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </StandardCard>

        {/* Templates Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesExibir.map((template) => {
              const color = getCategoriaColor(template.categoria);
              const Icon = getCategoriaIcon(template.categoria);
              
              return (
                <StandardCard
                  key={template.id}
                  className="hover:border-cyan-500 transition-all cursor-pointer group"
                  onClick={() => handleSelecionarTemplate(template.id)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-xl bg-${color}-500/20 group-hover:bg-${color}-500/30 transition-all`}>
                        <Icon className={`w-8 h-8 text-${color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                          {template.nome}
                        </h3>
                        <Badge className={`bg-${color}-500/20 text-${color}-400 border-${color}-500/30`}>
                          {template.categoria}
                        </Badge>
                      </div>
                    </div>
                    
                    <button className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      Criar Documento
                    </button>
                  </div>
                </StandardCard>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {templatesExibir.map((template) => {
              const color = getCategoriaColor(template.categoria);
              const Icon = getCategoriaIcon(template.categoria);
              
              return (
                <StandardCard
                  key={template.id}
                  className="hover:border-cyan-500 transition-all cursor-pointer"
                  onClick={() => handleSelecionarTemplate(template.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
                        <Icon className={`w-6 h-6 text-${color}-400`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{template.nome}</h3>
                        <Badge className={`bg-${color}-500/20 text-${color}-400 border-${color}-500/30 mt-1`}>
                          {template.categoria}
                        </Badge>
                      </div>
                    </div>
                    
                    <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Criar
                    </button>
                  </div>
                </StandardCard>
              );
            })}
          </div>
        )}

        {templatesExibir.length === 0 && (
          <StandardEmptyState
            icon={FileText}
            title="Nenhum template encontrado"
            description="Selecione outra categoria ou tente novamente"
          />
        )}
      </div>
    );
  };

  // Create Document View
  const CriarDocumentoView = () => {
    if (!templateSelecionado) return null;

    return (
      <form onSubmit={handleGerarDocumento}>
        <StandardCard
          title={`Criar ${templateSelecionado.nome}`}
          subtitle={`Preencha os campos para gerar o documento`}
          icon={FileText}
          headerColor="blue"
        >
          <div className="space-y-6">
            {/* Informações do Template */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-semibold">{templateSelecionado.nome}</p>
                  <p className="text-gray-400 text-sm">Categoria: {templateSelecionado.categoria}</p>
                </div>
              </div>
            </div>

            {/* Campos do Formulário */}
            <FormSection title="Dados do Documento" icon={Edit}>
              <FormGrid columns={1}>
                {templateSelecionado.campos.map(campo => renderCampo(campo))}
              </FormGrid>
            </FormSection>

            {/* Actions */}
            <FormActions
              onSubmit={handleGerarDocumento}
              onCancel={() => setView('templates')}
              submitLabel="Gerar Documento"
              loading={saving}
            />
          </div>
        </StandardCard>
      </form>
    );
  };

  // View Document
  const VisualizarDocumentoView = () => {
    if (!documentoVisualizado) return null;

    return (
      <div className="space-y-6">
        {/* Actions Bar */}
        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Documento Gerado</h3>
              <p className="text-gray-400 text-sm">Visualize, copie ou faça download</p>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton
                label="Copiar"
                icon={Copy}
                onClick={() => {
                  navigator.clipboard.writeText(documentoVisualizado.conteudo);
                  toast.success('Documento copiado!');
                }}
                variant="default"
              />
              <ActionButton
                label="Download"
                icon={Download}
                onClick={() => {
                  const blob = new Blob([documentoVisualizado.conteudo], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'documento.txt';
                  a.click();
                  toast.success('Download iniciado!');
                }}
                variant="primary"
              />
              <ActionButton
                label="Nova"
                icon={Plus}
                onClick={() => setView('templates')}
                variant="success"
              />
            </div>
          </div>
        </StandardCard>

        {/* Document Content */}
        <StandardCard title="Conteúdo" icon={FileText}>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {documentoVisualizado.conteudo}
            </pre>
          </div>
        </StandardCard>
      </div>
    );
  };

  // Documents List View
  const DocumentosView = () => {
    const filteredDocs = documentos.filter(doc =>
      doc.template_nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Search */}
        <StandardCard>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </StandardCard>

        {/* Documents List */}
        {filteredDocs.length === 0 ? (
          <StandardEmptyState
            icon={FileText}
            title="Nenhum documento gerado"
            description="Crie seu primeiro documento a partir de um template"
            action={{
              label: 'Criar Documento',
              icon: Plus,
              onClick: () => setView('templates'),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <StandardCard key={doc.id} className="hover:border-cyan-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{doc.template_nome}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(doc.criado_em).toLocaleString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {doc.criado_por}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ActionButton
                      icon={Eye}
                      onClick={async () => {
                        try {
                          const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
                          const token = localStorage.getItem('ap_elite_token');
                          const res = await axios.get(
                            `${BACKEND_URL}/api/documentos/documentos/${doc.id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setDocumentoVisualizado(res.data);
                          setView('visualizar');
                        } catch (error) {
                          toast.error('Erro ao carregar documento');
                        }
                      }}
                      variant="default"
                      tooltip="Visualizar"
                    />
                    <ActionButton
                      icon={Download}
                      onClick={() => {
                        const blob = new Blob([doc.conteudo], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${doc.template_nome}.txt`;
                        a.click();
                      }}
                      variant="primary"
                      tooltip="Download"
                    />
                    <ActionButton
                      icon={Trash2}
                      onClick={() => handleExcluirDocumento(doc.id)}
                      variant="danger"
                      tooltip="Excluir"
                    />
                  </div>
                </div>
              </StandardCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <StandardModuleLayout
      title="Gerador de Documentos Jurídicos"
      subtitle="Crie documentos profissionais a partir de templates"
      icon={FileText}
      color="blue"
      category="Jurídico"
      loading={loading}
      actions={[
        {
          label: view === 'templates' ? 'Meus Documentos' : 'Templates',
          icon: view === 'templates' ? BookOpen : FileText,
          onClick: () => setView(view === 'templates' ? 'documentos' : 'templates'),
          variant: 'default'
        }
      ]}
    >
      {view === 'templates' && <TemplatesView />}
      {view === 'criar' && <CriarDocumentoView />}
      {view === 'visualizar' && <VisualizarDocumentoView />}
      {view === 'documentos' && <DocumentosView />}
    </StandardModuleLayout>
  );
};

export default GeradorDocumentosJuridicos;
