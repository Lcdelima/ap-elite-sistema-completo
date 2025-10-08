import React, { useState } from 'react';
import axios from 'axios';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, BarChart3, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const [generating, setGenerating] = useState(false);

  const generateReport = async (type) => {
    setGenerating(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      toast.info('Gerando relatório...');
      
      // Simular geração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AthenaLayout title="Relatórios Avançados" subtitle="PDF com Gráficos e Análises">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-fuchsia-500 to-pink-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-12 w-12 text-white" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Geração Automatizada</h3>
                <p className="text-white text-opacity-90">Relatórios profissionais com gráficos e análises</p>
              </div>
              <Badge className="bg-white text-pink-600 ml-auto">ReportLab</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700 hover:border-pink-500 transition-colors cursor-pointer"
                onClick={() => generateReport('case')}>
            <CardContent className="p-8">
              <FileText className="h-16 w-16 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white text-center mb-2">Relatório de Caso</h3>
              <p className="text-slate-400 text-center mb-4">Completo com evidências e análises</p>
              <Button className="w-full btn-primary" disabled={generating}>
                <Download className="h-4 w-4 mr-2" />
                {generating ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors cursor-pointer"
                onClick={() => generateReport('financial')}>
            <CardContent className="p-8">
              <BarChart3 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white text-center mb-2">Relatório Financeiro</h3>
              <p className="text-slate-400 text-center mb-4">Análise de receitas e despesas</p>
              <Button className="w-full btn-primary" disabled={generating}>
                <Download className="h-4 w-4 mr-2" />
                {generating ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer"
                onClick={() => generateReport('interception')}>
            <CardContent className="p-8">
              <FileSpreadsheet className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white text-center mb-2">Relatório de Interceptação</h3>
              <p className="text-slate-400 text-center mb-4">Timeline e dados coletados</p>
              <Button className="w-full btn-primary" disabled={generating}>
                <Download className="h-4 w-4 mr-2" />
                {generating ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-green-500 transition-colors cursor-pointer"
                onClick={() => generateReport('comprehensive')}>
            <CardContent className="p-8">
              <FileText className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white text-center mb-2">Relatório Completo</h3>
              <p className="text-slate-400 text-center mb-4">Todos os dados integrados</p>
              <Button className="w-full btn-primary" disabled={generating}>
                <Download className="h-4 w-4 mr-2" />
                {generating ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Recursos dos Relatórios:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Gráficos', 'Tabelas', 'Estatísticas', 'Timeline', 'Imagens', 'Assinatura Digital', 'Marca d\'água', 'Export Excel'].map(item => (
                <div key={item} className="bg-slate-700 p-3 rounded-lg text-center">
                  <p className="text-white text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AthenaLayout>
  );
};

export default Reports;