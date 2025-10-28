import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  FileText, Download, Users, DollarSign, Calendar, CheckCircle,
  AlertCircle, Loader, FileCheck, ArrowRight, Search, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const ContractGenerator = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  const [contractData, setContractData] = useState({
    // Valores e Pagamento
    valorTotal: '30000.00',
    valorEntrada: '15000.00',
    numeroParcelas: '3',
    valorParcela: '5000.00',
    formaPagamento: 'PIX/Transferência Bancária',
    
    // Serviços
    servicos: [
      'Análise processual e pericial técnica das provas digitais',
      'Elaboração de parecer técnico pericial',
      'Assistência técnica em audiências',
      'Formulação de quesitos técnicos',
      'Produção de relatório final detalhado',
      'Consultoria e apoio técnico'
    ],
    
    // Datas
    dataAssinatura: new Date().toISOString().split('T')[0],
    dataVencimento1: '',
    dataVencimento2: '',
    dataVencimento3: '',
    
    // Observações
    observacoes: '',
    prazoEstimado: '60 dias',
    
    // Cliente (será preenchido ao selecionar)
    clienteNome: '',
    clienteCPF: '',
    clienteRG: '',
    clienteNacionalidade: 'brasileiro(a)',
    clienteEstadoCivil: '',
    clienteProfissao: '',
    clienteEndereco: '',
    clienteEmail: '',
    clienteTelefone: ''
  });

  useEffect(() => {
    fetchClients();
    calculateDates();
  }, []);

  useEffect(() => {
    calculateDates();
  }, [contractData.dataAssinatura]);

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
      toast.error('Erro ao carregar clientes');
    }
  };

  const calculateDates = () => {
    const dataBase = new Date(contractData.dataAssinatura);
    
    const data1 = new Date(dataBase);
    data1.setDate(data1.getDate() + 30);
    
    const data2 = new Date(data1);
    data2.setDate(data2.getDate() + 30);
    
    const data3 = new Date(data2);
    data3.setDate(data3.getDate() + 30);
    
    setContractData(prev => ({
      ...prev,
      dataVencimento1: data1.toISOString().split('T')[0],
      dataVencimento2: data2.toISOString().split('T')[0],
      dataVencimento3: data3.toISOString().split('T')[0]
    }));
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setContractData(prev => ({
      ...prev,
      clienteNome: client.name || '',
      clienteCPF: client.cpf || '',
      clienteRG: client.rg || '',
      clienteNacionalidade: client.nationality || 'brasileiro(a)',
      clienteEstadoCivil: client.maritalStatus || '',
      clienteProfissao: client.profession || '',
      clienteEndereco: `${client.address || ''}, ${client.addressNumber || ''}, ${client.neighborhood || ''}, ${client.city || ''}/${client.state || ''}, CEP: ${client.zipCode || ''}`,
      clienteEmail: client.email || '',
      clienteTelefone: client.phone || ''
    }));
    toast.success(`Cliente ${client.name} selecionado`);
  };

  const handleGenerateContract = async () => {
    if (!selectedClient) {
      toast.error('Por favor, selecione um cliente');
      return;
    }

    if (!contractData.clienteNome || !contractData.clienteCPF) {
      toast.error('Preencha todos os dados obrigatórios');
      return;
    }

    setGeneratingPDF(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/athena/contracts/generate`,
        {
          clientId: selectedClient.id,
          contractData: contractData
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contrato_${selectedClient.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Contrato gerado com sucesso!');
      
      // Save contract record
      await saveContractRecord();

    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Erro ao gerar contrato');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const saveContractRecord = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(
        `${BACKEND_URL}/api/athena/contracts/save-record`,
        {
          clientId: selectedClient.id,
          contractData: contractData,
          generatedAt: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving contract record:', error);
    }
  };

  const handlePreview = () => {
    toast.info('Funcionalidade de preview em desenvolvimento');
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <UniversalModuleLayout
      title="Contract Generator"
      subtitle="Sistema integrado"
      icon={FileText}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerador de Contratos</h1>
            <p className="text-slate-400">Gere contratos automaticamente com base em dados do cliente</p>
          </div>
          <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
            <FileText className="h-5 w-5 mr-2" />
            Template Elite
          </Badge>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 border-0">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileCheck className="h-6 w-6 text-white" />
              <div>
                <p className="text-white font-semibold">Contrato de Prestação de Serviços - Perícia Forense Digital</p>
                <p className="text-cyan-100 text-sm">Template baseado no modelo Elite Estratégias - Totalmente personalizável</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          {/* Client Selection */}
          <div className="col-span-4">
            <Card className="bg-slate-800 border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-cyan-400" />
                  Selecionar Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
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

                {/* Selected Client */}
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

                {/* Client List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => selectClient(client)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedClient?.id === client.id
                            ? 'bg-cyan-600 border-2 border-cyan-400'
                            : 'bg-slate-700 hover:bg-slate-650 border-2 border-transparent'
                        }`}
                      >
                        <p className="text-white font-medium">{client.name}</p>
                        <p className="text-slate-300 text-xs">CPF: {client.cpf}</p>
                        <p className="text-slate-400 text-xs">{client.email}</p>
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

          {/* Contract Form */}
          <div className="col-span-8 space-y-6">
            {/* Valores e Pagamento */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                  Valores e Condições de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valor Total (R$)</label>
                    <input
                      type="number"
                      value={contractData.valorTotal}
                      onChange={(e) => setContractData({...contractData, valorTotal: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valor Entrada (R$)</label>
                    <input
                      type="number"
                      value={contractData.valorEntrada}
                      onChange={(e) => setContractData({...contractData, valorEntrada: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Número de Parcelas</label>
                    <input
                      type="number"
                      value={contractData.numeroParcelas}
                      onChange={(e) => setContractData({...contractData, numeroParcelas: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valor por Parcela (R$)</label>
                    <input
                      type="number"
                      value={contractData.valorParcela}
                      onChange={(e) => setContractData({...contractData, valorParcela: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Forma de Pagamento</label>
                  <select
                    value={contractData.formaPagamento}
                    onChange={(e) => setContractData({...contractData, formaPagamento: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PIX/Transferência Bancária">PIX/Transferência Bancária</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Datas */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  Datas e Prazos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Data de Assinatura</label>
                    <input
                      type="date"
                      value={contractData.dataAssinatura}
                      onChange={(e) => setContractData({...contractData, dataAssinatura: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Prazo Estimado</label>
                    <input
                      type="text"
                      value={contractData.prazoEstimado}
                      onChange={(e) => setContractData({...contractData, prazoEstimado: e.target.value})}
                      placeholder="Ex: 60 dias"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-white font-medium mb-3">Datas de Vencimento (calculadas automaticamente):</p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">1ª Parcela:</p>
                      <p className="text-cyan-400 font-medium">{new Date(contractData.dataVencimento1).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">2ª Parcela:</p>
                      <p className="text-cyan-400 font-medium">{new Date(contractData.dataVencimento2).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">3ª Parcela:</p>
                      <p className="text-cyan-400 font-medium">{new Date(contractData.dataVencimento3).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-400" />
                  Observações Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  rows={4}
                  value={contractData.observacoes}
                  onChange={(e) => setContractData({...contractData, observacoes: e.target.value})}
                  placeholder="Adicione observações específicas para este contrato..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handlePreview}
                disabled={!selectedClient}
                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Preview
              </Button>
              
              <Button
                onClick={handleGenerateContract}
                disabled={!selectedClient || generatingPDF}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50"
              >
                {generatingPDF ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Contrato PDF
                  </>
                )}
              </Button>
            </div>

            {/* Warning */}
            {!selectedClient && (
              <Card className="bg-yellow-900 bg-opacity-30 border-yellow-600">
                <CardContent className="p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <p className="text-yellow-200 text-sm">Selecione um cliente para habilitar a geração do contrato</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </UniversalModuleLayout>
  );
};

export default ContractGenerator;
