import React, { useState } from 'react';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Wifi, Activity } from 'lucide-react';

const Interceptions = () => {
  return (
    <AthenaLayout title="Interceptções" subtitle="Telefônicas e Telemáticas com IA">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-8 text-center">
              <Radio className="h-16 w-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Interceptções Telefônicas</h3>
              <p className="text-white text-opacity-90 mb-4">Análise de chamadas com IA</p>
              <Badge className="bg-white text-orange-600">IA Powered</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-green-600 border-0 cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-8 text-center">
              <Wifi className="h-16 w-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Interceptções Telemáticas</h3>
              <p className="text-white text-opacity-90 mb-4">Análise de dados</p>
              <Badge className="bg-white text-teal-600">IA Powered</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="h-6 w-6 text-purple-400" />
              <div>
                <p className="text-white font-semibold">Status do Sistema</p>
                <p className="text-slate-400 text-sm">Todas as interceptções são autorizadas judicialmente</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-slate-400 text-sm">Ativas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-slate-400 text-sm">Processando</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-slate-400 text-sm">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AthenaLayout>
  );
};

export default Interceptions;