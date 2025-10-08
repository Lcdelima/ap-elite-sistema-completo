import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, Plus } from 'lucide-react';
import { toast } from 'sonner';

const Processes = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/processes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProcesses(res.data.processes);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar processos');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <AthenaLayout title="Gestão de Processos" subtitle="Processos Jurídicos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Processos Cadastrados</h2>
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>

        {loading ? (
          <div className="text-white text-center py-12">Carregando...</div>
        ) : processes.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <Scale className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">Nenhum processo cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {processes.map((process) => (
              <Card key={process.id} className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{process.title}</h3>
                        <Badge className={getStatusColor(process.status)}>{process.status}</Badge>
                        <Badge className="bg-purple-500">{process.priority}</Badge>
                      </div>
                      <p className="text-slate-400 mb-2">{process.process_number}</p>
                      <p className="text-slate-300">{process.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Tribunal:</p>
                          <p className="text-white">{process.court}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Data de Início:</p>
                          <p className="text-white">{new Date(process.start_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default Processes;