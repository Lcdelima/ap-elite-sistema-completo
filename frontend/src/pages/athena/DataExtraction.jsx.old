import React from 'react';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Smartphone, HardDrive } from 'lucide-react';

const DataExtraction = () => {
  return (
    <AthenaLayout title="Extração de Dados" subtitle="Cellebrite, UFED, Oxygen">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 border-0">
            <CardContent className="p-8 text-center">
              <Smartphone className="h-16 w-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Cellebrite</h3>
              <p className="text-white text-opacity-90">Extração iOS & Android</p>
              <Badge className="mt-4 bg-white text-pink-600">Integrado</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-0">
            <CardContent className="p-8 text-center">
              <Database className="h-16 w-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">UFED</h3>
              <p className="text-white text-opacity-90">Universal Forensic</p>
              <Badge className="mt-4 bg-white text-purple-600">Integrado</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0">
            <CardContent className="p-8 text-center">
              <HardDrive className="h-16 w-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Oxygen</h3>
              <p className="text-white text-opacity-90">Forensic Suite</p>
              <Badge className="mt-4 bg-white text-blue-600">Integrado</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Dados Extraíveis:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Contatos', 'Mensagens', 'Chamadas', 'Localizações', 'Fotos', 'Vídeos', 'Apps', 'Documentos', 'Histórico Web'].map(item => (
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

export default DataExtraction;