import React, { useState, useEffect } from 'react';
import { FileSearch, FolderOpen, Play, Pause, CheckCircle, Clock, Upload } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const IPEDIntegration = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    case_id: '',
    evidence_path: '',
    description: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/iped/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/iped/create-project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Projeto IPED criado com sucesso!");
        setShowModal(false);
        setFormData({ name: '', case_id: '', evidence_path: '', description: '' });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Play className="w-5 h-5 text-blue-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Pause className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <UniversalModuleLayout
      title="I P E D"
      subtitle="Sistema integrado"
      icon={FileText}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-lime-500 to-green-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileSearch className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">IPED v4.1.4</h1>
                <p className="text-green-100">Indexador e Processador de Evidências Digitais</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              Novo Projeto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Total de Projetos</p>
            <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Em Processamento</p>
            <p className="text-3xl font-bold text-blue-600">
              {projects.filter(p => p.status === 'processing').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Concluídos</p>
            <p className="text-3xl font-bold text-green-600">
              {projects.filter(p => p.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Projetos IPED</h2>
          </div>
          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FileSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum projeto criado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(project.status)}
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Caso: {project.case_id || 'N/A'}</span>
                          <span>Criado: {new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700' :
                        project.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {project.status === 'completed' ? 'Concluído' :
                         project.status === 'processing' ? 'Processando' : 'Pendente'}
                      </span>
                    </div>
                    {project.progress !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Novo Projeto IPED</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Projeto*</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID do Caso</label>
                  <input
                    type="text"
                    value={formData.case_id}
                    onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Caminho da Evidência*</label>
                  <input
                    type="text"
                    required
                    value={formData.evidence_path}
                    onChange={(e) => setFormData({...formData, evidence_path: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="/mnt/evidencias/caso123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
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
                    Criar Projeto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </UniversalModuleLayout>
  );
};

export default IPEDIntegration;