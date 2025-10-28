import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StandardModuleLayout,
  ActionButton,
  StandardCard,
  StandardSearchBar,
  StandardEmptyState,
  StandardAlert
} from '../../components/StandardModuleLayout';
import { Badge } from '../../components/ui/badge';
import {
  FileText, Download, Users, DollarSign, Calendar, CheckCircle,
  AlertCircle, FileCheck, Eye, Sparkles, Search, Plus, Edit
} from 'lucide-react';
import { toast } from 'sonner';

const ContractGeneratorComplete = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  const [contractData, setContractData] = useState({
    valorTotal: '30000.00',
    valorEntrada: '15000.00',
    numeroParcelas: '3',
    valorParcela: '5000.00',
    formaPagamento: 'PIX/Transferência Bancária',
    servicos: [
      'Análise processual e pericial técnica das provas digitais',
      'Elaboração de parecer técnico pericial',
      'Assistência técnica em audiências',
      'Formulação de quesitos técnicos',
      'Produção de relatório final detalhado',
      'Consultoria e apoio técnico'
    ],
    dataAssinatura: new Date().toISOString().split('T')[0],
    dataVencimento1: '',
    dataVencimento2: '',
    dataVencimento3: '',
    observacoes: '',
    prazoEstimado: '60 dias',
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
    setLoading(true);
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
    } finally {
      setLoading(false);
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

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contrato_${selectedClient.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Contrato gerado com sucesso!');

    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Erro ao gerar contrato');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headerActions = [
    {
      label: 'Gerar Contrato',
      icon: Download,
      onClick: handleGenerateContract,
      variant: 'primary',
      disabled: !selectedClient || generatingPDF,
      loading: generatingPDF
    },
    {
      label: 'Preview',
      icon: Eye,
      onClick: () => toast.info('Funcionalidade em desenvolvimento'),
      variant: 'default',
      disabled: !selectedClient
    }
  ];

  return (
    <StandardModuleLayout
      title="Gerador de Contratos Profissional"
      subtitle="Crie contratos de prestação de serviços com dados do cliente automaticamente"
      icon={FileText}
      color="purple"
      category="Jurídico"
      actions={headerActions}
      loading={loading}
    >
      {/* Info Banner */}
      <StandardAlert
        type="info"
        title="Contrato de Prestação de Serviços - Perícia Forense Digital"
        message="Template baseado no modelo Elite Estratégias - Totalmente personalizável e profissional"
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Client Selection */}
        <div className="col-span-4">
          <StandardCard
            title="Selecionar Cliente"
            icon={Users}
          >
            <StandardSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar cliente..."
            />

            {selectedClient && (
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <p className="text-white font-semibold text-sm">Cliente Selecionado</p>
                </div>
                <p className="text-white font-bold">{selectedClient.name}</p>
                <p className="text-green-100 text-sm">CPF: {selectedClient.cpf}</p>
              </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => selectClient(client)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedClient?.id === client.id
                        ? 'bg-cyan-600 border-2 border-cyan-400'
                        : 'bg-gray-700 hover:bg-gray-650 border-2 border-transparent'
                    }`}
                  >
                    <p className="text-white font-medium">{client.name}</p>
                    <p className="text-gray-300 text-xs">CPF: {client.cpf}</p>
                    <p className="text-gray-400 text-xs">{client.email}</p>
                  </div>
                ))
              ) : (
                <StandardEmptyState
                  icon={Users}
                  title="Nenhum cliente encontrado"
                />
              )}
            </div>
          </StandardCard>
        </div>

        {/* Contract Form */}
        <div className="col-span-8 space-y-6">
          {/* Valores e Pagamento */}
          <StandardCard
            title="Valores e Condições de Pagamento"
            icon={DollarSign}
            headerColor="green"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor Total (R$)</label>
                <input
                  type="number"
                  value={contractData.valorTotal}
                  onChange={(e) => setContractData({...contractData, valorTotal: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor Entrada (R$)</label>
                <input
                  type="number"
                  value={contractData.valorEntrada}
                  onChange={(e) => setContractData({...contractData, valorEntrada: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Número de Parcelas</label>
                <input
                  type="number"
                  value={contractData.numeroParcelas}
                  onChange={(e) => setContractData({...contractData, numeroParcelas: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor por Parcela (R$)</label>
                <input
                  type="number"
                  value={contractData.valorParcela}
                  onChange={(e) => setContractData({...contractData, valorParcela: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Forma de Pagamento</label>
                <select
                  value={contractData.formaPagamento}
                  onChange={(e) => setContractData({...contractData, formaPagamento: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="PIX/Transferência Bancária">PIX/Transferência Bancária</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
          </StandardCard>

          {/* Datas */}
          <StandardCard
            title="Datas e Prazos"
            icon={Calendar}
            headerColor="blue"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data de Assinatura</label>
                <input
                  type="date"
                  value={contractData.dataAssinatura}
                  onChange={(e) => setContractData({...contractData, dataAssinatura: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prazo Estimado</label>
                <input
                  type="text"
                  value={contractData.prazoEstimado}
                  onChange={(e) => setContractData({...contractData, prazoEstimado: e.target.value})}
                  placeholder="Ex: 60 dias"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg mt-4">
              <p className="text-white font-medium mb-3">Datas de Vencimento (calculadas automaticamente):</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">1ª Parcela:</p>
                  <p className="text-cyan-400 font-medium">{new Date(contractData.dataVencimento1).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-400">2ª Parcela:</p>
                  <p className="text-cyan-400 font-medium">{new Date(contractData.dataVencimento2).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-400">3ª Parcela:</p>
                  <p className="text-cyan-400 font-medium">{new Date(contractData.dataVencimento3).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </StandardCard>

          {/* Observações */}
          <StandardCard
            title="Observações Adicionais"
            icon={FileText}
            headerColor="purple"
          >
            <textarea
              rows={4}
              value={contractData.observacoes}
              onChange={(e) => setContractData({...contractData, observacoes: e.target.value})}
              placeholder="Adicione observações específicas para este contrato..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </StandardCard>

          {/* Warning */}
          {!selectedClient && (
            <StandardAlert
              type="warning"
              title="Atenção"
              message="Selecione um cliente para habilitar a geração do contrato"
            />
          )}
        </div>
      </div>
    </StandardModuleLayout>
  );
};

export default ContractGeneratorComplete;
