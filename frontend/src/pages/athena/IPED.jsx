import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSearch, FolderOpen, Play } from 'lucide-react';
import { toast } from 'sonner';

const IPED = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/iped/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProjects(res.data.projects);
    } catch (error) {
      console.error('Error:', error);
      setProjects([]);
    }
  };

  return (
    <AthenaLayout title="IPED" subtitle="Indexação e Processamento Forense">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-lime-500 to-green-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FileSearch className="h-12 w-12 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">IPED v4.1.4</h3>
                  <p className="text-white text-opacity-90">Indexador forense de evidências</p>
                </div>
              </div>
              <Button className="bg-white text-green-600 hover:bg-gray-100">
                <FolderOpen className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </CardContent>
        </Card>

        {projects.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <FileSearch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">Nenhum projeto IPED criado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{project.project_name}</h3>
                  <Badge className="mb-4">
                    {project.status === 'created' && 'Criado'}
                    {project.status === 'processing' && 'Processando'}
                    {project.status === 'indexed' && 'Indexado'}
                  </Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Versão:</span>
                      <span className="text-white">{project.iped_version}</span>
                    </div>
                    {project.total_items && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Itens:</span>
                        <span className="text-white">{project.total_items.toLocaleString()}</span>
                      </div>
                    )}
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

export default IPED;