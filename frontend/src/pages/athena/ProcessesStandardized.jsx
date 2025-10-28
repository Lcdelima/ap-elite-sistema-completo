import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardModuleLayout, { ActionButton, StandardCard, StandardTable, StandardEmptyState } from '../../components/StandardModuleLayout';
import { FormInput, FormTextarea, FormSelect, FormGrid, FormSection, FormActions, FormAlert } from '../../components/FormComponents';
import { Badge } from '../../components/ui/badge';
import {
  Scale, Plus, Search, Filter, Eye, Edit, Trash2, Download,
  FileText, Calendar, User, Building, MapPin, Phone, Mail,
  DollarSign, AlertCircle, CheckCircle, Clock, Gavel, Hash, Users
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ProcessesStandardized = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // list, create, edit, detail
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    processNumber: '',
    processTitle: '',
    client: '',
    court: '',
    subject: '',
    type: '',
    value: '',
    status: 'active',
    priority: 'normal',
    startDate: '',
    description: '',
    attorney: '',
    defendant: '',
    judge: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (view === 'list') {
      fetchProcesses();
    }
  }, [view]);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/processes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProcesses(res.data.processes || []);
    } catch (error) {
      console.error('Error fetching processes:', error);
      toast.error('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    const newErrors = {};
    if (!formData.processNumber) newErrors.processNumber = 'Número do processo é obrigatório';
    if (!formData.processTitle) newErrors.processTitle = 'Título é obrigatório';
    if (!formData.client) newErrors.client = 'Cliente é obrigatório';
    if (!formData.court) newErrors.court = 'Vara/Tribunal é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setSaving(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      if (view === 'edit' && selectedProcess) {
        await axios.put(
          `${BACKEND_URL}/api/athena/processes/${selectedProcess.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Processo atualizado com sucesso!');
      } else {
        await axios.post(
          `${BACKEND_URL}/api/athena/processes`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Processo criado com sucesso!');
      }
      
      setView('list');
      resetForm();
    } catch (error) {
      console.error('Error saving process:', error);
      toast.error('Erro ao salvar processo');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (process) => {
    setSelectedProcess(process);
    setFormData({
      processNumber: process.processNumber || '',
      processTitle: process.processTitle || '',
      client: process.client || '',
      court: process.court || '',
      subject: process.subject || '',
      type: process.type || '',
      value: process.value || '',
      status: process.status || 'active',
      priority: process.priority || 'normal',
      startDate: process.startDate || '',
      description: process.description || '',
      attorney: process.attorney || '',
      defendant: process.defendant || '',
      judge: process.judge || '',
      notes: process.notes || ''
    });
    setView('edit');
  };

  const handleDelete = async (processId) => {
    if (!window.confirm('Tem certeza que deseja excluir este processo?')) return;
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.delete(`${BACKEND_URL}/api/athena/processes/${processId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Processo excluído com sucesso!');
      fetchProcesses();
    } catch (error) {
      console.error('Error deleting process:', error);
      toast.error('Erro ao excluir processo');
    }
  };

  const resetForm = () => {
    setFormData({
      processNumber: '',
      processTitle: '',
      client: '',
      court: '',
      subject: '',
      type: '',
      value: '',
      status: 'active',
      priority: 'normal',
      startDate: '',
      description: '',
      attorney: '',
      defendant: '',
      judge: '',
      notes: ''
    });
    setErrors({});
    setSelectedProcess(null);
  };

  const handleCancel = () => {
    resetForm();
    setView('list');
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: { label: 'Ativo', color: 'green' },
      pending: { label: 'Pendente', color: 'yellow' },
      closed: { label: 'Encerrado', color: 'gray' },
      suspended: { label: 'Suspenso', color: 'orange' }
    };
    const config = statuses[status] || statuses.active;
    return (
      <Badge className={`bg-${config.color}-500/20 text-${config.color}-400 border-${config.color}-500/30`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      low: { label: 'Baixa', color: 'gray' },
      normal: { label: 'Normal', color: 'blue' },
      high: { label: 'Alta', color: 'orange' },
      urgent: { label: 'Urgente', color: 'red' }
    };
    const config = priorities[priority] || priorities.normal;
    return (
      <Badge className={`bg-${config.color}-500/20 text-${config.color}-400 border-${config.color}-500/30`}>
        {config.label}
      </Badge>
    );
  };

  // ListView
  const ListView = () => {
    const filteredProcesses = processes.filter(process =>
      process.processNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.processTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.client?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <StandardCard>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número, título ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => setView('create')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Processo
            </button>
          </div>
        </StandardCard>

        {/* Processes List */}
        {filteredProcesses.length === 0 ? (
          <StandardEmptyState
            icon={Scale}
            title="Nenhum processo encontrado"
            description="Comece criando seu primeiro processo jurídico"
            action={{
              label: 'Criar Processo',
              icon: Plus,
              onClick: () => setView('create'),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredProcesses.map((process) => (
              <StandardCard key={process.id} className="hover:border-cyan-600 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => handleEdit(process)}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-blue-500/20">
                        <Scale className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {process.processTitle || 'Sem título'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Hash className="w-4 h-4" />
                            {process.processNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {process.client}
                          </span>
                          {process.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(process.startDate).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusBadge(process.status)}
                      {getPriorityBadge(process.priority)}
                      {process.type && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {process.type}
                        </Badge>
                      )}
                    </div>
                    
                    {process.description && (
                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                        {process.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-400">
                      {process.court && (
                        <span className="flex items-center gap-2">
                          <Gavel className="w-4 h-4" />
                          {process.court}
                        </span>
                      )}
                      {process.attorney && (
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {process.attorney}
                        </span>
                      )}
                      {process.value && (
                        <span className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          R$ {parseFloat(process.value).toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <ActionButton
                      icon={Eye}
                      onClick={() => handleEdit(process)}
                      variant="default"
                      tooltip="Ver detalhes"
                    />
                    <ActionButton
                      icon={Edit}
                      onClick={() => handleEdit(process)}
                      variant="default"
                      tooltip="Editar"
                    />
                    <ActionButton
                      icon={Trash2}
                      onClick={() => handleDelete(process.id)}
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

  // FormView
  const FormView = () => (
    <form onSubmit={handleSubmit}>
      <StandardCard
        title={view === 'edit' ? 'Editar Processo' : 'Novo Processo'}
        subtitle="Preencha os dados do processo judicial"
        icon={Scale}
        headerColor="blue"
      >
        <div className="space-y-8">
          {/* Identificação */}
          <FormSection title="Identificação do Processo" icon={Hash}>
            <FormGrid columns={2}>
              <FormInput
                label="Número do Processo"
                value={formData.processNumber}
                onChange={(e) => setFormData({ ...formData, processNumber: e.target.value })}
                placeholder="0000000-00.0000.0.00.0000"
                icon={Hash}
                required
                error={errors.processNumber}
                hint="Ex: 0001234-56.2025.8.26.0100"
              />
              
              <FormInput
                label="Título do Processo"
                value={formData.processTitle}
                onChange={(e) => setFormData({ ...formData, processTitle: e.target.value })}
                placeholder="Ex: Ação de Cobrança, Investigação Criminal..."
                icon={FileText}
                required
                error={errors.processTitle}
              />
            </FormGrid>
            
            <FormInput
              label="Assunto"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Descrição breve do assunto do processo"
              icon={FileText}
            />
          </FormSection>

          {/* Partes */}
          <FormSection title="Partes Envolvidas" icon={Users}>
            <FormGrid columns={2}>
              <FormInput
                label="Cliente / Autor"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Nome do cliente"
                icon={User}
                required
                error={errors.client}
              />
              
              <FormInput
                label="Réu / Investigado"
                value={formData.defendant}
                onChange={(e) => setFormData({ ...formData, defendant: e.target.value })}
                placeholder="Nome do réu ou investigado"
                icon={User}
              />
              
              <FormInput
                label="Advogado Responsável"
                value={formData.attorney}
                onChange={(e) => setFormData({ ...formData, attorney: e.target.value })}
                placeholder="Nome do advogado"
                icon={User}
              />
              
              <FormInput
                label="Juiz(a)"
                value={formData.judge}
                onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
                placeholder="Nome do juiz"
                icon={Gavel}
              />
            </FormGrid>
          </FormSection>

          {/* Informações Judiciais */}
          <FormSection title="Informações Judiciais" icon={Gavel}>
            <FormGrid columns={2}>
              <FormInput
                label="Vara / Tribunal"
                value={formData.court}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                placeholder="Ex: 1ª Vara Cível de São Paulo"
                icon={Building}
                required
                error={errors.court}
              />
              
              <FormSelect
                label="Tipo de Processo"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'civel', label: 'Cível' },
                  { value: 'criminal', label: 'Criminal' },
                  { value: 'trabalhista', label: 'Trabalhista' },
                  { value: 'tributario', label: 'Tributário' },
                  { value: 'administrativo', label: 'Administrativo' },
                  { value: 'outros', label: 'Outros' }
                ]}
                placeholder="Selecione o tipo"
                icon={FileText}
              />
            </FormGrid>
            
            <FormGrid columns={3}>
              <FormSelect
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Ativo' },
                  { value: 'pending', label: 'Pendente' },
                  { value: 'suspended', label: 'Suspenso' },
                  { value: 'closed', label: 'Encerrado' }
                ]}
                icon={CheckCircle}
              />
              
              <FormSelect
                label="Prioridade"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: 'low', label: 'Baixa' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'Alta' },
                  { value: 'urgent', label: 'Urgente' }
                ]}
                icon={AlertCircle}
              />
              
              <FormInput
                label="Data de Início"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                icon={Calendar}
              />
            </FormGrid>
            
            <FormInput
              label="Valor da Causa"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="0.00"
              icon={DollarSign}
              hint="Valor monetário da causa"
            />
          </FormSection>

          {/* Descrição e Observações */}
          <FormSection title="Detalhes e Observações" icon={FileText}>
            <FormTextarea
              label="Descrição do Processo"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes do processo, partes envolvidas, pedidos principais..."
              rows={4}
              hint="Resumo geral do processo"
            />
            
            <FormTextarea
              label="Observações Internas"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Anotações internas, estratégias, prazos importantes..."
              rows={3}
              hint="Notas visíveis apenas internamente"
            />
          </FormSection>

          {/* Actions */}
          <FormActions
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel={view === 'edit' ? 'Atualizar Processo' : 'Criar Processo'}
            loading={saving}
          />
        </div>
      </StandardCard>
    </form>
  );

  return (
    <StandardModuleLayout
      title="Gestão de Processos"
      subtitle="Controle completo de processos judiciais"
      icon={Scale}
      color="blue"
      category="Jurídico"
      loading={loading}
      actions={
        view === 'list' ? [
          {
            label: 'Novo Processo',
            icon: Plus,
            onClick: () => setView('create'),
            variant: 'primary'
          }
        ] : []
      }
    >
      {view === 'list' ? <ListView /> : <FormView />}
    </StandardModuleLayout>
  );
};

export default ProcessesStandardized;
