import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Download, Users, Calendar, CheckCircle, Loader,
  FileCheck, Zap, Search, Edit, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const DocumentGenerator = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    // Procuração
    nacionalidade: 'brasileiro(a)',
    estadoCivil: '',
    profissao: '',
    rg: '',
    cpf: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: '',
    
    // Roteiro AIJ
    autosNumero: '',
    processo: '',
    dataAudiencia: '',
    juizo: '',
    comarca: '',
    defesaTecnica: 'Dra. Laura Cunha de Lima',
    assistenteTecnica: 'Elite Estratégias',
    ministerioPublico: '',
    defensores: '',
    reus: '',
    vitimas: '',
    testemunhas: '',
    peritos: '',
    
    // Termos de Confidencialidade
    compromitenteCPF: '',
    compromitenteNome: '',
    localData: '',
    dataAssinatura: new Date().toISOString().split('T')[0],
    
    // Atas de Reunião
    dataReuniao: new Date().toISOString().split('T')[0],
    horarioReuniao: '14:00',
    localReuniao: '',
    modalidade: 'presencial',
    projetoCaso: '',
    participantes: '',
    objetivoReuniao: '',
    assuntosDiscutidos: '',
    decisao1: '',
    responsavel1: '',
    prazo1: '',
    decisao2: '',
    responsavel2: '',
    prazo2: '',
    decisao3: '',
    responsavel3: '',
    prazo3: '',
    evidenciasDocumentos: '',
    documentosAnexos: ''
  });

  const documentTypes = [
    {
      id: 'procuracao',
      title: 'Procuração',
      subtitle: 'Poderes técnicos jurídicos',
      color: 'from-blue-500 to-cyan-600',
      icon: FileText
    },
    {
      id: 'roteiro_aij',
      title: 'Roteiro AIJ',
      subtitle: 'Audiência Instrução Julgamento',
      color: 'from-purple-500 to-pink-600',
      icon: FileCheck
    },
    {
      id: 'termo_elite',
      title: 'Termo Elite',
      subtitle: 'Confidencialidade Elite',
      color: 'from-green-500 to-emerald-600',
      icon: FileText
    },
    {
      id: 'termo_advocacia',
      title: 'Termo Advocacia',
      subtitle: 'Confidencialidade Advocacia',
      color: 'from-orange-500 to-red-600',
      icon: FileCheck
    },
    {
      id: 'ata_elite',
      title: 'Ata Elite',
      subtitle: 'Reunião Técnico-Pericial',
      color: 'from-teal-500 to-cyan-600',
      icon: FileText
    },
    {
      id: 'ata_advocacia',
      title: 'Ata Advocacia',
      subtitle: 'Reunião Jurídica',
      color: 'from-indigo-500 to-purple-600',
      icon: FileCheck
    }
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        cpf: selectedClient.cpf || '',
        rg: selectedClient.rg || '',
        nacionalidade: selectedClient.nationality || 'brasileiro(a)',
        estadoCivil: selectedClient.maritalStatus || '',
        profissao: selectedClient.profession || '',
        endereco: selectedClient.address || '',
        numero: selectedClient.addressNumber || '',
        bairro: selectedClient.neighborhood || '',
        cidade: selectedClient.city || '',
        cep: selectedClient.zipCode || '',
        compromitenteCPF: selectedClient.cpf || '',
        compromitenteNome: selectedClient.name || ''
      }));
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/clients/enhanced`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setClients(res.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente');
      return;
    }

    if (!selectedDocType) {
      toast.error('Selecione um tipo de documento');
      return;
    }

    setGenerating(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/athena/documents/generate`,
        {
          clientId: selectedClient.id,
          documentType: selectedDocType,
          formData: formData
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const docName = documentTypes.find(d => d.id === selectedDocType)?.title || 'Documento';
      link.setAttribute('download', `${docName}_${selectedClient.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Documento gerado com sucesso!');
      
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Erro ao gerar documento');
    } finally {
      setGenerating(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AthenaLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerador de Documentos Jurídicos</h1>
            <p className="text-slate-400">Procurações, Termos e Roteiros Automatizados</p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-4 py-2">
            <Sparkles className="h-5 w-5 mr-2" />
            5 Modelos
          </Badge>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 border-0">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileCheck className="h-6 w-6 text-white" />
              <div>
                <p className="text-white font-semibold">Documentos Profissionais Instantâneos</p>
                <p className="text-cyan-100 text-sm">Templates Elite Estratégias - Conformidade Total</p>
              </div>
            </div>
            <Badge className="bg-white text-cyan-600 font-bold">Pronto para Assinatura</Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          {/* Client Selection */}
          <div className="col-span-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-cyan-400" />
                  Selecionar Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {selectedClient && (
                  <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-white" />
                        <p className="text-white font-semibold text-sm">Cliente Selecionado</p>
                      </div>
                      <p className="text-white font-bold">{selectedClient.name}</p>
                      <p className="text-green-100 text-sm">CPF: {selectedClient.cpf}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedClient?.id === client.id
                            ? 'bg-cyan-600 border-2 border-cyan-400'
                            : 'bg-slate-700 hover:bg-slate-650 border-2 border-transparent'
                        }`}
                      >
                        <p className="text-white font-medium">{client.name}</p>
                        <p className="text-slate-300 text-xs">CPF: {client.cpf}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Nenhum cliente encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Types & Form */}
          <div className="col-span-8 space-y-6">
            {/* Document Type Selection */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Selecione o Tipo de Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {documentTypes.map((docType) => {
                    const Icon = docType.icon;
                    return (
                      <div
                        key={docType.id}
                        onClick={() => setSelectedDocType(docType.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedDocType === docType.id
                            ? 'ring-4 ring-cyan-500 ring-opacity-50'
                            : ''
                        }`}
                      >
                        <div className={`bg-gradient-to-r ${docType.color} p-4 rounded-lg`}>
                          <Icon className="h-8 w-8 text-white mb-2" />
                          <h3 className="text-white font-bold text-lg">{docType.title}</h3>
                          <p className="text-white text-opacity-80 text-sm">{docType.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Form Fields Based on Document Type */}
            {selectedDocType && (
              <>
                {selectedDocType === 'procuracao' && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Dados da Procuração</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Nacionalidade</label>
                          <input
                            type="text"
                            value={formData.nacionalidade}
                            onChange={(e) => setFormData({...formData, nacionalidade: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Estado Civil</label>
                          <select
                            value={formData.estadoCivil}
                            onChange={(e) => setFormData({...formData, estadoCivil: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">Selecione</option>
                            <option value="solteiro(a)">Solteiro(a)</option>
                            <option value="casado(a)">Casado(a)</option>
                            <option value="divorciado(a)">Divorciado(a)</option>
                            <option value="viúvo(a)">Viúvo(a)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Profissão</label>
                          <input
                            type="text"
                            value={formData.profissao}
                            onChange={(e) => setFormData({...formData, profissao: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">RG</label>
                          <input
                            type="text"
                            value={formData.rg}
                            onChange={(e) => setFormData({...formData, rg: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedDocType === 'roteiro_aij' && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Dados da Audiência</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Nº dos Autos</label>
                          <input
                            type="text"
                            value={formData.autosNumero}
                            onChange={(e) => setFormData({...formData, autosNumero: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Processo</label>
                          <input
                            type="text"
                            value={formData.processo}
                            onChange={(e) => setFormData({...formData, processo: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Data da Audiência</label>
                          <input
                            type="date"
                            value={formData.dataAudiencia}
                            onChange={(e) => setFormData({...formData, dataAudiencia: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Juízo</label>
                          <input
                            type="text"
                            value={formData.juizo}
                            onChange={(e) => setFormData({...formData, juizo: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Comarca</label>
                          <input
                            type="text"
                            value={formData.comarca}
                            onChange={(e) => setFormData({...formData, comarca: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Ministério Público</label>
                          <input
                            type="text"
                            value={formData.ministerioPublico}
                            onChange={(e) => setFormData({...formData, ministerioPublico: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(selectedDocType === 'ata_elite' || selectedDocType === 'ata_advocacia') && (
                  <>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-cyan-400" />
                          Informações da Reunião
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Data da Reunião</label>
                            <input
                              type="date"
                              value={formData.dataReuniao}
                              onChange={(e) => setFormData({...formData, dataReuniao: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Horário</label>
                            <input
                              type="time"
                              value={formData.horarioReuniao}
                              onChange={(e) => setFormData({...formData, horarioReuniao: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Local</label>
                            <input
                              type="text"
                              value={formData.localReuniao}
                              onChange={(e) => setFormData({...formData, localReuniao: e.target.value})}
                              placeholder="Ex: Escritório Elite - Sala 1"
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Modalidade</label>
                            <select
                              value={formData.modalidade}
                              onChange={(e) => setFormData({...formData, modalidade: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            >
                              <option value="presencial">Presencial</option>
                              <option value="remoto">Remoto/Videoconferência</option>
                              <option value="hibrido">Híbrido</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Projeto/Caso/Processo</label>
                          <input
                            type="text"
                            value={formData.projetoCaso}
                            onChange={(e) => setFormData({...formData, projetoCaso: e.target.value})}
                            placeholder="Ex: Processo 0001234-56.2024.8.13.0123"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Participantes</label>
                          <textarea
                            rows={2}
                            value={formData.participantes}
                            onChange={(e) => setFormData({...formData, participantes: e.target.value})}
                            placeholder="Liste todos os participantes da reunião"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Edit className="h-5 w-5 mr-2 text-purple-400" />
                          Conteúdo da Reunião
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Objetivo da Reunião</label>
                          <textarea
                            rows={3}
                            value={formData.objetivoReuniao}
                            onChange={(e) => setFormData({...formData, objetivoReuniao: e.target.value})}
                            placeholder="Descreva o propósito principal da reunião..."
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            {selectedDocType === 'ata_elite' ? 'Assuntos Discutidos' : 'Temas Tratados'}
                          </label>
                          <textarea
                            rows={4}
                            value={formData.assuntosDiscutidos}
                            onChange={(e) => setFormData({...formData, assuntosDiscutidos: e.target.value})}
                            placeholder="Registre os tópicos abordados durante a reunião..."
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                          {selectedDocType === 'ata_elite' ? 'Decisões Técnicas e Encaminhamentos' : 'Orientações e Encaminhamentos'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Decisão 1 */}
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <p className="text-white font-medium mb-3">Encaminhamento 1</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-3">
                              <label className="block text-sm font-medium text-slate-300 mb-2">Decisão/Providência</label>
                              <input
                                type="text"
                                value={formData.decisao1}
                                onChange={(e) => setFormData({...formData, decisao1: e.target.value})}
                                placeholder="Descreva a decisão ou providência"
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Responsável</label>
                              <input
                                type="text"
                                value={formData.responsavel1}
                                onChange={(e) => setFormData({...formData, responsavel1: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Prazo</label>
                              <input
                                type="date"
                                value={formData.prazo1}
                                onChange={(e) => setFormData({...formData, prazo1: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Decisão 2 */}
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <p className="text-white font-medium mb-3">Encaminhamento 2</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-3">
                              <label className="block text-sm font-medium text-slate-300 mb-2">Decisão/Providência</label>
                              <input
                                type="text"
                                value={formData.decisao2}
                                onChange={(e) => setFormData({...formData, decisao2: e.target.value})}
                                placeholder="Descreva a decisão ou providência (opcional)"
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Responsável</label>
                              <input
                                type="text"
                                value={formData.responsavel2}
                                onChange={(e) => setFormData({...formData, responsavel2: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Prazo</label>
                              <input
                                type="date"
                                value={formData.prazo2}
                                onChange={(e) => setFormData({...formData, prazo2: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Decisão 3 */}
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <p className="text-white font-medium mb-3">Encaminhamento 3</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-3">
                              <label className="block text-sm font-medium text-slate-300 mb-2">Decisão/Providência</label>
                              <input
                                type="text"
                                value={formData.decisao3}
                                onChange={(e) => setFormData({...formData, decisao3: e.target.value})}
                                placeholder="Descreva a decisão ou providência (opcional)"
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Responsável</label>
                              <input
                                type="text"
                                value={formData.responsavel3}
                                onChange={(e) => setFormData({...formData, responsavel3: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Prazo</label>
                              <input
                                type="date"
                                value={formData.prazo3}
                                onChange={(e) => setFormData({...formData, prazo3: e.target.value})}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-orange-400" />
                          {selectedDocType === 'ata_elite' ? 'Evidências e Documentos' : 'Documentos e Anexos'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            {selectedDocType === 'ata_elite' 
                              ? 'Registro de Evidências/Documentos Anexados' 
                              : 'Documentos e Anexos'}
                          </label>
                          <textarea
                            rows={3}
                            value={selectedDocType === 'ata_elite' ? formData.evidenciasDocumentos : formData.documentosAnexos}
                            onChange={(e) => setFormData({
                              ...formData, 
                              [selectedDocType === 'ata_elite' ? 'evidenciasDocumentos' : 'documentosAnexos']: e.target.value
                            })}
                            placeholder="Liste os documentos, mídias, prints, logs, relatórios apresentados..."
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {(selectedDocType === 'termo_elite' || selectedDocType === 'termo_advocacia') && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Dados do Termo de Confidencialidade</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Compromitente</label>
                          <input
                            type="text"
                            value={formData.compromitenteNome}
                            onChange={(e) => setFormData({...formData, compromitenteNome: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">CPF do Compromitente</label>
                          <input
                            type="text"
                            value={formData.compromitenteCPF}
                            onChange={(e) => setFormData({...formData, compromitenteCPF: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Local</label>
                          <input
                            type="text"
                            value={formData.localData}
                            onChange={(e) => setFormData({...formData, localData: e.target.value})}
                            placeholder="Ex: Belo Horizonte/MG"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
                          <input
                            type="date"
                            value={formData.dataAssinatura}
                            onChange={(e) => setFormData({...formData, dataAssinatura: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Generate Button */}
                <div className="flex space-x-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedClient || !selectedDocType || generating}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Gerando Documento...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Gerar Documento PDF
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AthenaLayout>
  );
};

export default DocumentGenerator;
