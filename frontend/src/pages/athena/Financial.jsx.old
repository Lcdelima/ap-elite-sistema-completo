import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Plus, PieChart } from 'lucide-react';
import { toast } from 'sonner';

const Financial = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/financial/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSummary(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <AthenaLayout title="Gestão Financeira" subtitle="Controle Financeiro Completo">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Resumo Financeiro</h2>
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {!loading && summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">Receitas</p>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(summary.income)}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">Despesas</p>
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(summary.expenses)}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">Saldo</p>
                    <DollarSign className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className={`text-3xl font-bold ${summary.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(summary.net)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">Margem</p>
                    <PieChart className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{summary.profit_margin}%</p>
                </CardContent>
              </Card>
            </div>

            {summary.by_category && summary.by_category.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4">Por Categoria</h3>
                  <div className="space-y-3">
                    {summary.by_category.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{cat._id.category}</p>
                          <Badge className={cat._id.type === 'income' ? 'bg-green-500' : 'bg-red-500'}>
                            {cat._id.type}
                          </Badge>
                        </div>
                        <p className="text-white font-bold">{formatCurrency(cat.total)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AthenaLayout>
  );
};

export default Financial;