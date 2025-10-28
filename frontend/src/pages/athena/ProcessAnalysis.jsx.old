import React from 'react';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, AlertCircle, Brain } from 'lucide-react';

const ProcessAnalysis = () => {
  return (
    <AthenaLayout title="Análise Processual" subtitle="IA Preditiva para Processos">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-violet-500 to-purple-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Brain className="h-12 w-12 text-white" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Análise com IA</h3>
                <p className="text-white text-opacity-90">Predição de resultados baseada em Machine Learning</p>
              </div>
              <Badge className="bg-white text-purple-600 ml-auto">IA Powered</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <TrendingUp className="h-10 w-10 text-green-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Taxa de Sucesso</h3>
              <p className="text-3xl font-bold text-white mb-2">85.5%</p>
              <p className="text-slate-400 text-sm">Baseado em 1.200 casos similares</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <FileText className="h-10 w-10 text-blue-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Duração Média</h3>
              <p className="text-3xl font-bold text-white mb-2">180 dias</p>
              <p className="text-slate-400 text-sm">Para processos similares</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <AlertCircle className="h-10 w-10 text-yellow-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">Fatores de Risco</h3>
              <p className="text-3xl font-bold text-white mb-2">3</p>
              <p className="text-slate-400 text-sm">Identificados pela IA</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Recomendações da IA:</h3>
            <div className="space-y-3">
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Adicionar documentação complementar</p>
                    <p className="text-slate-400 text-sm mt-1">Casos similares com mais documentos tiveram 15% mais sucesso</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Solicitar audiência preliminar</p>
                    <p className="text-slate-400 text-sm mt-1">Pode acelerar o processo em 30 dias</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AthenaLayout>
  );
};

export default ProcessAnalysis;