import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Scale, Shield, 
  Building2, MessageSquare, Calendar, Download, FileText, 
  Filter, Eye, Edit, Trash2, ChevronDown
} from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const FinancialManagementEnhanced = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all'); // all, juridico, pericia, administrativo, comunicacao
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, transactions, reports
  const [showModal, setShowModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: 'juridico',
    subcategory: 'honorarios_juridico',
    date: new Date().toISOString().split('T')[0],
    case_id: '',
    client_id: ''
  });

  // Categorias organizadas por área
  const categoryStructure = {
    juridico: {
      name: 'Jurídico',
      icon: Scale,
      color: 'from-blue-500 to-blue-700',
      subcategories: {
        honorarios_juridico: 'Honorários Advocatícios',
        custas_processuais: 'Custas Processuais',
        taxas_tribunal: 'Taxas de Tribunal',
        certidoes: 'Certidões',
        publicacoes: 'Publicações',
        diligencias: 'Diligências',
        recursos: 'Recursos e Apelações'
      }
    },
    pericia: {
      name: 'Perícia',
      icon: Shield,
      color: 'from-purple-500 to-purple-700',
      subcategories: {
        honorarios_pericia: 'Honorários Periciais',
        analise_forense: 'Análise Forense Digital',
        extracao_dados: 'Extração de Dados',
        laudos_tecnicos: 'Laudos Técnicos',
        equipamentos_pericia: 'Equipamentos de Perícia',
        softwares_especializados: 'Softwares Especializados',
        treinamento_pericia: 'Treinamento Técnico'
      }
    },
    administrativo: {
      name: 'Gestão Administrativa e Financeira',
      icon: Building2,
      color: 'from-green-500 to-green-700',
      subcategories: {
        salarios: 'Salários e Encargos',
        impostos: 'Impostos e Tributos',
        aluguel: 'Aluguel',
        infraestrutura: 'Infraestrutura TI',
        material_escritorio: 'Material de Escritório',
        servicos_contabeis: 'Serviços Contábeis',
        seguros: 'Seguros',
        manutencao: 'Manutenção',
        marketing: 'Marketing e Publicidade',
        capacitacao: 'Capacitação'
      }
    },
    comunicacao: {
      name: 'Comunicação e Calendário',
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-700',
      subcategories: {
        reunioes_clientes: 'Reuniões com Clientes',
        videoconferencias: 'Videoconferências',
        correio_protocolo: 'Correio e Protocolos',
        comunicacao_digital: 'Comunicação Digital',
        agenda_compromissos: 'Agenda de Compromissos',
        eventos: 'Eventos e Workshops'
      }
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, [selectedPeriod]);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await fetch(`${BACKEND_URL}/api/athena/financial/summary?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSummary(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await fetch(`${BACKEND_URL}/api/athena/financial/transactions?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await fetch(`${BACKEND_URL}/api/athena/financial/transaction`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Transação criada com sucesso!');
        setShowModal(false);
        setFormData({
          type: 'income',
          amount: '',
          description: '',
          category: 'juridico',
          subcategory: 'honorarios_juridico',
          date: new Date().toISOString().split('T')[0],
          case_id: '',
          client_id: ''
        });
        fetchSummary();
        fetchTransactions();
      } else {
        alert('Erro ao criar transação');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Erro ao criar transação');
    }
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryStats = (category) => {
    if (!summary?.by_category) return { income: 0, expenses: 0 };
    
    const categoryData = summary.by_category[category] || { income: 0, expenses: 0 };
    return categoryData;
  };

  const filteredTransactions = activeCategory === 'all' 
    ? transactions 
    : transactions.filter(t => t.category === activeCategory);

  const renderCategoryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Object.entries(categoryStructure).map(([key, category]) => {
        const stats = getCategoryStats(key);
        const Icon = category.icon;
        const net = stats.income - stats.expenses;
        
        return (
          <Card 
            key={key}
            className={`bg-gradient-to-br ${category.color} text-white cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 ${activeCategory === key ? 'ring-4 ring-white ring-offset-2' : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-10 w-10 opacity-80" />
                <Badge className="bg-white text-gray-800">
                  {Object.keys(category.subcategories).length} itens
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">Receitas</span>
                  <span className="font-semibold">{formatCurrency(stats.income)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-90">Despesas</span>
                  <span className="font-semibold">{formatCurrency(stats.expenses)}</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Saldo</span>
                    <span className={`text-lg font-bold ${net >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                      {formatCurrency(net)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Receitas Totais</span>
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(summary?.income || 0)}</p>
          <p className="text-sm mt-2 opacity-80">Período: {selectedPeriod}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Despesas Totais</span>
            <TrendingDown className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(summary?.expenses || 0)}</p>
          <p className="text-sm mt-2 opacity-80">Período: {selectedPeriod}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Saldo Líquido</span>
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(summary?.net || 0)}</p>
          <p className="text-sm mt-2 opacity-80">Margem: {summary?.profit_margin || 0}%</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Transações</span>
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold">{transactions.length}</p>
          <p className="text-sm mt-2 opacity-80">Registradas no período</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSubcategoryTable = () => {
    if (activeCategory === 'all') return null;

    const category = categoryStructure[activeCategory];
    const stats = getCategoryStats(activeCategory);

    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              {React.createElement(category.icon, { className: "h-6 w-6 mr-3 text-gray-600" })}
              Detalhamento - {category.name}
            </h3>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Ver todas categorias
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Subcategoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Receitas</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Despesas</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(category.subcategories).map(([key, name]) => {
                  const subStats = summary?.by_subcategory?.[key] || { income: 0, expenses: 0 };
                  const net = subStats.income - subStats.expenses;
                  
                  return (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{name}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                        {formatCurrency(subStats.income)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                        {formatCurrency(subStats.expenses)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTransactionsList = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Transações Recentes</h3>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="current_month">Mês Atual</option>
              <option value="last_month">Mês Anterior</option>
              <option value="current_quarter">Trimestre Atual</option>
              <option value="current_year">Ano Atual</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Nova Transação</span>
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Descrição</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Categoria</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Subcategoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Valor</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{transaction.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={`bg-gradient-to-r ${categoryStructure[transaction.category]?.color}`}>
                        {categoryStructure[transaction.category]?.name || transaction.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {categoryStructure[transaction.category]?.subcategories[transaction.subcategory] || transaction.subcategory}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AthenaLayout title="Gestão Financeira" subtitle="Controle financeiro organizado por áreas">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Overview Cards */}
        {renderOverview()}

        {/* Category Cards */}
        {renderCategoryCards()}

        {/* Subcategory Table (if category selected) */}
        {renderSubcategoryTable()}

        {/* Transactions List */}
        {renderTransactionsList()}

        {/* Modal para Nova Transação */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Nova Transação</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="income">Receita</option>
                      <option value="expense">Despesa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Object.entries(categoryStructure).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategoria
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione...</option>
                      {formData.category && Object.entries(categoryStructure[formData.category].subcategories).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Criar Transação
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default FinancialManagementEnhanced;
