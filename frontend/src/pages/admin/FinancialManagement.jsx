import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  CreditCard, 
  Receipt,
  Calculator,
  PieChart,
  BarChart3,
  Calendar,
  FileText,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FinancialManagement = ({ currentUser }) => {
  const [financialRecords, setFinancialRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [newRecord, setNewRecord] = useState({
    type: 'income',
    category: '',
    description: '',
    amount: '',
    client_id: '',
    case_id: '',
    payment_method: 'pix',
    notes: ''
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      
      // Fetch financial records
      const recordsResponse = await axios.get(`${API}/financial`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFinancialRecords(recordsResponse.data || []);
      
      // Fetch summary
      const summaryResponse = await axios.get(`${API}/financial/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(summaryResponse.data || {});
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Erro ao carregar dados financeiros');
      setFinancialRecords([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const createFinancialRecord = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      await axios.post(`${API}/financial`, {
        ...newRecord,
        amount: parseFloat(newRecord.amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Registro financeiro criado com sucesso');
      setShowCreateModal(false);
      setNewRecord({
        type: 'income',
        category: '',
        description: '',
        amount: '',
        client_id: '',
        case_id: '',
        payment_method: 'pix',
        notes: ''
      });
      fetchFinancialData();
    } catch (error) {
      console.error('Error creating financial record:', error);
      toast.error('Erro ao criar registro financeiro');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'Pendente', className: 'bg-yellow-500', icon: AlertTriangle },
      'approved': { label: 'Aprovado', className: 'bg-blue-500', icon: CheckCircle },
      'paid': { label: 'Pago', className: 'bg-green-500', icon: CheckCircle },
      'cancelled': { label: 'Cancelado', className: 'bg-red-500', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} text-white flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      'income': TrendingUp,
      'expense': TrendingDown,
      'fee': DollarSign,
      'cost': Receipt
    };
    return icons[type] || DollarSign;
  };

  const getTypeColor = (type) => {
    const colors = {
      'income': 'text-green-400',
      'fee': 'text-green-400',
      'expense': 'text-red-400',
      'cost': 'text-red-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const calculateMonthlyTrends = () => {
    const monthlyData = {};
    
    financialRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (['income', 'fee'].includes(record.type)) {
        monthlyData[monthKey].income += record.amount;
      } else {
        monthlyData[monthKey].expenses += record.amount;
      }
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  const monthlyTrends = calculateMonthlyTrends();

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando dados financeiros...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão Financeira</h1>
          <p className="text-slate-400">Controle de receitas, despesas e faturamento</p>
        </div>
        <div className="flex space-x-2">
          <Button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button 
            className="btn-primary flex items-center space-x-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Receitas do Mês</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(summary?.income || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
            <div className="mt-2">
              <span className="text-green-200 text-sm">+12.5% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-600 to-red-700 border-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Despesas do Mês</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(summary?.expenses || 0)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-200" />
            </div>
            <div className="mt-2">
              <span className="text-red-200 text-sm">+2.1% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Lucro Líquido</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(summary?.net || 0)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-blue-200" />
            </div>
            <div className="mt-2">
              <span className="text-blue-200 text-sm">
                Margem: {summary?.net && summary?.income ? 
                  ((summary.net / summary.income) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Transações</p>
                <p className="text-2xl font-bold text-white">{financialRecords.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-purple-200" />
            </div>
            <div className="mt-2">
              <span className="text-purple-200 text-sm">Este mês: {summary?.month || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
          { id: 'transactions', label: 'Transações', icon: Receipt },
          { id: 'reports', label: 'Relatórios', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: PieChart }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Tendência Mensal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map(([monthKey, data], index) => {
                  const [year, month] = monthKey.split('-');
                  const monthName = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                  const net = data.income - data.expenses;
                  
                  return (
                    <div key={monthKey} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 capitalize">{monthName}</span>
                        <span className={`font-semibold ${
                          net >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(net)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 rounded-full h-2 transition-all"
                            style={{ width: `${Math.min(100, (data.income / 50000) * 100)}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 rounded-full h-2 transition-all"
                            style={{ width: `${Math.min(100, (data.expenses / 50000) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-400">Receitas: {formatCurrency(data.income)}</span>
                        <span className="text-red-400">Despesas: {formatCurrency(data.expenses)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Transações Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialRecords.slice(0, 8).map((record) => {
                  const IconComponent = getTypeIcon(record.type);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-slate-600`}>
                          <IconComponent className={`h-4 w-4 ${getTypeColor(record.type)}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{record.description}</p>
                          <p className="text-slate-400 text-sm">{record.category}</p>
                          <p className="text-slate-500 text-xs">{formatDate(record.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getTypeColor(record.type)}`}>
                          {['income', 'fee'].includes(record.type) ? '+' : '-'}
                          {formatCurrency(record.amount)}
                        </p>
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Todas as Transações</CardTitle>
              <div className="flex space-x-2">
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="week" className="text-white">Esta Semana</SelectItem>
                    <SelectItem value="month" className="text-white">Este Mês</SelectItem>
                    <SelectItem value="quarter" className="text-white">Este Trimestre</SelectItem>
                    <SelectItem value="year" className="text-white">Este Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {financialRecords.map((record) => {
                const IconComponent = getTypeIcon(record.type);
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full bg-slate-600`}>
                        <IconComponent className={`h-5 w-5 ${getTypeColor(record.type)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <p className="text-white font-medium">{record.description}</p>
                          <Badge className="bg-slate-600 text-slate-300">{record.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm">
                          <span className="text-slate-400">{formatDate(record.date)}</span>
                          {record.payment_method && (
                            <span className="text-slate-400 capitalize">{record.payment_method}</span>
                          )}
                          {record.invoice_number && (
                            <span className="text-slate-400">NF: {record.invoice_number}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${getTypeColor(record.type)}`}>
                        {['income', 'fee'].includes(record.type) ? '+' : '-'}
                        {formatCurrency(record.amount)}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700 card-hover">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Relatório Mensal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">Resumo financeiro detalhado do mês</p>
              <Button className="btn-primary w-full">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 card-hover">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Demonstrativo IR</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">Relatório para declaração de imposto de renda</p>
              <Button className="btn-primary w-full">
                <Download className="h-4 w-4 mr-2" />
                Gerar DRE
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 card-hover">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Análise de Fluxo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">Análise detalhada do fluxo de caixa</p>
              <Button className="btn-primary w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Análise
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue by Category */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Perícia Digital', 'Advocacia Criminal', 'Consultoria', 'Treinamento'].map((category, index) => {
                    const percentage = [45, 30, 15, 10][index];
                    const amount = (summary?.income || 0) * (percentage / 100);
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300">{category}</span>
                          <span className="text-white">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-xs">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Expenses by Category */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Equipamentos', 'Software', 'Administração', 'Marketing'].map((category, index) => {
                    const percentage = [40, 25, 25, 10][index];
                    const amount = (summary?.expenses || 0) * (percentage / 100);
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300">{category}</span>
                          <span className="text-white">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-xs">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Nova Transação Financeira</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                  <Select value={newRecord.type} onValueChange={(value) => setNewRecord({...newRecord, type: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="income" className="text-white">Receita</SelectItem>
                      <SelectItem value="expense" className="text-white">Despesa</SelectItem>
                      <SelectItem value="fee" className="text-white">Honorário</SelectItem>
                      <SelectItem value="cost" className="text-white">Custo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
                  <Input
                    value={newRecord.category}
                    onChange={(e) => setNewRecord({...newRecord, category: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Ex: Perícia Digital, Equipamentos..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                  <Input
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Descrição da transação"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Valor (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newRecord.amount}
                    onChange={(e) => setNewRecord({...newRecord, amount: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Método de Pagamento</label>
                  <Select value={newRecord.payment_method} onValueChange={(value) => setNewRecord({...newRecord, payment_method: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="pix" className="text-white">PIX</SelectItem>
                      <SelectItem value="transfer" className="text-white">Transferência</SelectItem>
                      <SelectItem value="credit_card" className="text-white">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit_card" className="text-white">Cartão de Débito</SelectItem>
                      <SelectItem value="cash" className="text-white">Dinheiro</SelectItem>
                      <SelectItem value="check" className="text-white">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                  <textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    className="w-full bg-slate-700 border-slate-600 text-white rounded-md p-3"
                    rows={3}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  className="flex-1 btn-primary"
                  onClick={createFinancialRecord}
                >
                  Criar Transação
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;