import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, PieChart, FileText, Calendar, Filter, Download } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const FinancialManagement = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, transactions, invoices
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: 'honorarios',
    date: new Date().toISOString().split('T')[0],
    case_id: '',
    client_id: ''
  });

  const categories = {
    honorarios: 'Honorários',
    custas: 'Custas Processuais',
    despesas: 'Despesas Operacionais',
    impostos: 'Impostos',
    salarios: 'Salários',
    infraestrutura: 'Infraestrutura',
    marketing: 'Marketing',
    outros: 'Outros'
  };

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
    fetchInvoices();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/financial/summary`, {
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
      const token = localStorage.getItem('token');
      // Vou buscar do banco diretamente já que não há endpoint específico
      const response = await fetch(`${BACKEND_URL}/api/athena/financial/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Por enquanto vazio, mas estrutura pronta
      setTransactions([]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/financial/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(`${BACKEND_URL}/api/athena/financial/transaction`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (response.ok) {
        alert('Transação criada com sucesso!');
        setShowModal(false);
        setFormData({
          type: 'income',
          amount: '',
          description: '',
          category: 'honorarios',
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

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Receitas</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary?.income || 0)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Despesas</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary?.expenses || 0)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Saldo Líquido</p>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className={`text-2xl font-bold ${(summary?.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary?.net || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Margem de Lucro</p>
            <PieChart className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{summary?.profit_margin || 0}%</p>
        </div>
      </div>

      {/* Por Categoria */}
      {summary?.by_category && summary.by_category.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Análise por Categoria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.by_category.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cat._id.category}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                    cat._id.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {cat._id.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(cat.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Período */}
      {summary?.period && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              Período: {new Date(summary.period.start).toLocaleDateString('pt-BR')} até {new Date(summary.period.end).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderTransactions = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Histórico de Transações</h3>
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>Nenhuma transação registrada</p>
          <p className="text-sm mt-2">Crie sua primeira transação para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInvoices = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Faturas e Notas Fiscais</h3>
      {invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>Nenhuma fatura registrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Fatura #{invoice.number || invoice.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">{new Date(invoice.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm rounded ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {invoice.status === 'paid' ? 'Paga' : invoice.status === 'pending' ? 'Pendente' : 'Vencida'}
                </span>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestão Financeira</h1>
          <p className="text-green-100">Controle completo das finanças do escritório</p>
        </div>

        {/* Tabs and Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 rounded ${activeTab === 'transactions' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
              >
                Transações
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-2 rounded ${activeTab === 'invoices' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
              >
                Faturas
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Nova Transação
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'invoices' && renderInvoices()}
          </>
        )}

        {/* Modal Nova Transação */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Nova Transação</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo*</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                    <option value="fee">Honorário</option>
                    <option value="cost">Custo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Valor*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição*</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria*</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    {Object.entries(categories).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data*</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Criar
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

export default FinancialManagement;
