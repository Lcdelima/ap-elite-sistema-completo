import React from 'react';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Lock, CheckCircle, Clock } from 'lucide-react';

const EvidenceProcessing = () => {
  return (
    <AthenaLayout title="Processamento de Evidências" subtitle="Chain of Custody Completo">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Lock className="h-12 w-12 text-white" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Chain of Custody</h3>
                <p className="text-white text-opacity-90">Rastreabilidade total e imutável</p>
              </div>
              <Badge className="bg-white text-emerald-600 ml-auto">Blockchain</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Coleta</h3>
              <p className="text-slate-400 text-sm">Registro inicial</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Processamento</h3>
              <p className="text-slate-400 text-sm">Análise forense</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Validação</h3>
              <p className="text-slate-400 text-sm">Verificação hash</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Armazenamento</h3>
              <p className="text-slate-400 text-sm">Preservação</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Garantias do Sistema:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-slate-300">Hash SHA-256 de todas as evidências</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-slate-300">Timestamp imutável em cada etapa</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-slate-300">Auditoria completa de acessos</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-slate-300">Criptografia em repouso e em trânsito</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AthenaLayout>
  );
};

export default EvidenceProcessing;