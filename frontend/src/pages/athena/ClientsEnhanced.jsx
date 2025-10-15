import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Plus, Phone, Mail, Building, MapPin, Calendar, User,
  FileText, Folder, Upload, Download, Eye, Trash2, X, Search,
  IdCard, Briefcase, Heart, Home, DollarSign, FileAudio, Image,
  Video, File, ChevronRight, ChevronLeft, Edit
} from 'lucide-react';
import { toast } from 'sonner';

const ClientsEnhanced = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'documents', 'processes', 'media'
  
  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: '',
    cpf: '',
    rg: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
    profession: '',
    
    // Contato
    email: '',
    phone: '',
    alternativePhone: '',
    whatsapp: '',
    
    // Endereço
    address: '',
    addressNumber: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Empresa (se aplicável)
    company: '',
    cnpj: '',
    companyPosition: '',
    companyAddress: '',
    
    // Financeiro
    monthlyIncome: '',
    bankAccount: '',
    paymentMethod: '',
    
    // Observações
    notes: '',
    emergencyContact: '',
    emergencyPhone: '',
    healthInfo: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/clients/enhanced`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setClients(res.data.clients || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(`${BACKEND_URL}/api/athena/clients/enhanced`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Cliente criado com sucesso!');
      setShowModal(false);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar cliente');
    }
  };

  const handleFileUpload = async (clientId, category, files) => {
    setUploadingFiles(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', category);
    formData.append('clientId', clientId);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(`${BACKEND_URL}/api/athena/clients/${clientId}/files`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Arquivos enviados com sucesso!');
      fetchClientDetails(clientId);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao enviar arquivos');
    } finally {
      setUploadingFiles(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedClient(res.data);
      setViewMode('detail');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar detalhes do cliente');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', cpf: '', rg: '', dateOfBirth: '', gender: '', maritalStatus: '',
      nationality: '', profession: '', email: '', phone: '', alternativePhone: '',
      whatsapp: '', address: '', addressNumber: '', complement: '', neighborhood: '',
      city: '', state: '', zipCode: '', company: '', cnpj: '', companyPosition: '',
      companyAddress: '', monthlyIncome: '', bankAccount: '', paymentMethod: '',
      notes: '', emergencyContact: '', emergencyPhone: '', healthInfo: ''
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <Image className="h-5 w-5 text-blue-400" />;
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return <FileAudio className="h-5 w-5 text-green-400" />;
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) return <Video className="h-5 w-5 text-purple-400" />;
    if (['pdf', 'doc', 'docx'].includes(ext)) return <FileText className="h-5 w-5 text-red-400" />;
    return <File className="h-5 w-5 text-slate-400" />;
  };

  if (viewMode === 'detail' && selectedClient) {
    return (
      <AthenaLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setViewMode('list')}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">{selectedClient.name}</h1>
                <p className="text-slate-400">Pasta Completa do Cliente</p>
              </div>
            </div>
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              <Edit className="h-5 w-5 mr-2" />
              Editar
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 ${activeTab === 'info' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Informações
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 ${activeTab === 'documents' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Documentos
            </button>
            <button
              onClick={() => setActiveTab('processes')}
              className={`px-4 py-2 ${activeTab === 'processes' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Processos
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 ${activeTab === 'media' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
            >
              <Folder className="h-4 w-4 inline mr-2" />
              Mídia
            </button>
          </div>

          {/* Content */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dados Pessoais */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <IdCard className="h-5 w-5 mr-2 text-cyan-400" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">CPF:</span>
                    <span className="text-white font-medium">{selectedClient.cpf || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RG:</span>
                    <span className="text-white font-medium">{selectedClient.rg || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data de Nascimento:</span>
                    <span className="text-white font-medium">{selectedClient.dateOfBirth || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gênero:</span>
                    <span className="text-white font-medium">{selectedClient.gender || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado Civil:</span>
                    <span className="text-white font-medium">{selectedClient.maritalStatus || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profissão:</span>
                    <span className="text-white font-medium">{selectedClient.profession || 'Não informado'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-cyan-400" />
                    Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white font-medium">{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Telefone:</span>
                    <span className="text-white font-medium">{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">WhatsApp:</span>
                    <span className="text-white font-medium">{selectedClient.whatsapp || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tel. Alternativo:</span>
                    <span className="text-white font-medium">{selectedClient.alternativePhone || 'Não informado'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Home className="h-5 w-5 mr-2 text-cyan-400" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-white">{selectedClient.address}, {selectedClient.addressNumber}</p>
                  <p className="text-slate-400">{selectedClient.neighborhood}</p>
                  <p className="text-slate-400">{selectedClient.city} - {selectedClient.state}</p>
                  <p className="text-slate-400">CEP: {selectedClient.zipCode}</p>
                </CardContent>
              </Card>

              {/* Empresa */}
              {selectedClient.company && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Building className="h-5 w-5 mr-2 text-cyan-400" />
                      Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nome:</span>
                      <span className="text-white font-medium">{selectedClient.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CNPJ:</span>
                      <span className="text-white font-medium">{selectedClient.cnpj || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cargo:</span>
                      <span className="text-white font-medium">{selectedClient.companyPosition || 'Não informado'}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {/* Upload Area */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(selectedClient.id, 'documents', e.target.files)}
                      className="hidden"
                      id="documents-upload"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <label htmlFor="documents-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-cyan-500 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">Upload de Documentos</p>
                      <p className="text-slate-400 text-sm">PDF, DOC, DOCX, TXT</p>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Files List */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Documentos Armazenados</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClient.files?.documents?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedClient.files.documents.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-650">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.name)}
                            <div>
                              <p className="text-white text-sm font-medium">{file.name}</p>
                              <p className="text-slate-400 text-xs">{file.size} • {file.uploadDate}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-slate-600 hover:bg-slate-500">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-slate-600 hover:bg-slate-500">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Nenhum documento anexado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'processes' && (
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(selectedClient.id, 'processes', e.target.files)}
                      className="hidden"
                      id="processes-upload"
                    />
                    <label htmlFor="processes-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-cyan-500 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">Upload de Processos</p>
                      <p className="text-slate-400 text-sm">Todos os formatos aceitos</p>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Processos Vinculados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Nenhum processo vinculado</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(selectedClient.id, 'media', e.target.files)}
                      className="hidden"
                      id="media-upload"
                      accept="audio/*,video/*,image/*"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-cyan-500 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">Upload de Mídia</p>
                      <p className="text-slate-400 text-sm">Áudios, Vídeos e Imagens</p>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                {/* Audio Files */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center">
                      <FileAudio className="h-4 w-4 mr-2 text-green-400" />
                      Áudios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-center py-4 text-sm">0 arquivos</p>
                  </CardContent>
                </Card>

                {/* Video Files */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center">
                      <Video className="h-4 w-4 mr-2 text-purple-400" />
                      Vídeos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-center py-4 text-sm">0 arquivos</p>
                  </CardContent>
                </Card>

                {/* Image Files */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center">
                      <Image className="h-4 w-4 mr-2 text-blue-400" />
                      Imagens
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-center py-4 text-sm">0 arquivos</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </AthenaLayout>
    );
  }

  return (
    <AthenaLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestão de Clientes</h1>
            <p className="text-slate-400">CRM Completo com Sistema de Arquivos</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-600">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente por nome, CPF, email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        {loading ? (
          <div className="text-white text-center py-12">Carregando...</div>
        ) : clients.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-4">Nenhum cliente cadastrado</p>
              <Button onClick={() => setShowModal(true)} className="bg-cyan-500 hover:bg-cyan-600">
                Adicionar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card
                key={client.id}
                onClick={() => fetchClientDetails(client.id)}
                className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">{client.name?.charAt(0)}</span>
                      </div>
                      <span>{client.name}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-slate-300 text-sm">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {client.email}
                  </div>
                  <div className="flex items-center text-slate-300 text-sm">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    {client.phone}
                  </div>
                  {client.company && (
                    <div className="flex items-center text-slate-300 text-sm">
                      <Building className="h-4 w-4 mr-2 text-slate-400" />
                      {client.company}
                    </div>
                  )}
                  <div className="pt-2 flex space-x-2">
                    <Badge className="bg-cyan-500">CPF: {client.cpf}</Badge>
                    <Badge className="bg-slate-600">{client.filesCount || 0} arquivos</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal - Cadastro Completo */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-4xl my-8">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-2xl">Cadastro Completo de Cliente</CardTitle>
                  <Button
                    onClick={() => setShowModal(false)}
                    className="bg-slate-700 hover:bg-slate-600"
                    size="sm"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Pessoais */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <IdCard className="h-5 w-5 mr-2 text-cyan-400" />
                      Dados Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Ex: João Silva Santos"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">CPF *</label>
                        <input
                          type="text"
                          required
                          value={formData.cpf}
                          onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                          placeholder="000.000.000-00"
                          maxLength="14"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">RG</label>
                        <input
                          type="text"
                          value={formData.rg}
                          onChange={(e) => setFormData({...formData, rg: e.target.value})}
                          placeholder="00.000.000-0"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Data de Nascimento</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Gênero</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">Selecione</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Estado Civil</label>
                        <select
                          value={formData.maritalStatus}
                          onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">Selecione</option>
                          <option value="Solteiro(a)">Solteiro(a)</option>
                          <option value="Casado(a)">Casado(a)</option>
                          <option value="Divorciado(a)">Divorciado(a)</option>
                          <option value="Viúvo(a)">Viúvo(a)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nacionalidade</label>
                        <input
                          type="text"
                          value={formData.nationality}
                          onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                          placeholder="Ex: Brasileira"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Profissão</label>
                        <input
                          type="text"
                          value={formData.profession}
                          onChange={(e) => setFormData({...formData, profession: e.target.value})}
                          placeholder="Ex: Empresário, Advogado, Médico..."
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-cyan-400" />
                      Contato
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="cliente@email.com"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Telefone *</label>
                        <input
                          type="text"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp</label>
                        <input
                          type="text"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Telefone Alternativo</label>
                        <input
                          type="text"
                          value={formData.alternativePhone}
                          onChange={(e) => setFormData({...formData, alternativePhone: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Home className="h-5 w-5 mr-2 text-cyan-400" />
                      Endereço
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">CEP</label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Endereço</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Número</label>
                        <input
                          type="text"
                          value={formData.addressNumber}
                          onChange={(e) => setFormData({...formData, addressNumber: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Complemento</label>
                        <input
                          type="text"
                          value={formData.complement}
                          onChange={(e) => setFormData({...formData, complement: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Bairro</label>
                        <input
                          type="text"
                          value={formData.neighborhood}
                          onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Empresa */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-cyan-400" />
                      Empresa (Opcional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nome da Empresa</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">CNPJ</label>
                        <input
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Cargo</label>
                        <input
                          type="text"
                          value={formData.companyPosition}
                          onChange={(e) => setFormData({...formData, companyPosition: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-cyan-400" />
                      Observações e Contatos de Emergência
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Observações Gerais</label>
                        <textarea
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Contato de Emergência</label>
                          <input
                            type="text"
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Telefone de Emergência</label>
                          <input
                            type="text"
                            value={formData.emergencyPhone}
                            onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
                    <Button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-slate-700 hover:bg-slate-600"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Cliente
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default ClientsEnhanced;
