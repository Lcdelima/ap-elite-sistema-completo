import React from 'react';
import AthenaLayout from '../../components/AthenaLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Zap, CheckCircle } from 'lucide-react';

const Placeholder = ({ title, subtitle, icon: Icon }) => {
  return (
    <AthenaLayout title={title} subtitle={subtitle}>
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-12 text-center">
            {Icon && <Icon className="h-24 w-24 text-cyan-400 mx-auto mb-6" />}
            <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
            <p className="text-slate-300 mb-6">{subtitle}</p>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400">Módulo Backend Implementado</span>
            </div>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400">Interface em desenvolvimento</span>
            </div>
            <div className="mt-8">
              <Badge className="bg-purple-500 text-white">API Pronta</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AthenaLayout>
  );
};

export default Placeholder;