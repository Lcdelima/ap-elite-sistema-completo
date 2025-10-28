import React, { useState, useEffect } from 'react';
import { Workflow, Plus, Play, CheckCircle, Clock, TrendingUp, List } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const WorkflowManager = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState({});
  const [stats, setStats] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [caseId, setCaseId] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadTemplates();
    loadStats();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/workflows/templates`);
      const data = await response.json();
      setTemplates(data.templates || {});
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/workflows/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const createWorkflow = async () => {
    if (!selectedTemplate || !caseId) return;

    try {
      const response = await fetch(`${backendUrl}/api/workflows/create-from-template?template_key=${selectedTemplate}&case_id=${caseId}`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success("✅ Workflow criado com sucesso!");
        setCaseId('');
        setSelectedTemplate('');
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao criar workflow:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Workflow className="w-10 h-10" />
            Gerenciador de Workflows
          </h1>
          <p className="text-blue-200">Automação de processos jurídicos e investigativos</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <List className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_workflows}</p>
              <p className="text-gray-300 text-sm">Total de Workflows</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Play className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.active}</p>
              <p className="text-gray-300 text-sm">Ativos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <CheckCircle className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.completed}</p>
              <p className="text-gray-300 text-sm">Concluídos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.templates_available}</p>
              <p className="text-gray-300 text-sm">Templates</p>
            </div>
          </div>
        )}

        {/* Create Workflow */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Criar Novo Workflow
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Template</label>
              <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white">
                <option value="">Selecione um template...</option>
                {Object.entries(templates).map(([key, template]) => (
                  <option key={key} value={key}>{template.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">ID do Caso</label>
              <input type="text" value={caseId} onChange={(e) => setCaseId(e.target.value)}
                placeholder="CASE_12345"
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400" />
            </div>
          </div>

          {selectedTemplate && templates[selectedTemplate] && (
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-4">
              <h3 className="text-white font-semibold mb-2">{templates[selectedTemplate].name}</h3>
              <p className="text-gray-300 text-sm mb-3">Fases do Workflow:</p>
              <div className="space-y-2">
                {templates[selectedTemplate].stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <span className="text-blue-400 font-semibold">{idx + 1}.</span>
                    <span className="text-white">{stage.name}</span>
                    <span className="text-gray-400">({stage.duration_days} dias)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={createWorkflow} disabled={!selectedTemplate || !caseId}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 font-semibold">
            <Plus className="w-5 h-5 inline mr-2" />
            Criar Workflow
          </button>
        </div>

        {/* Templates */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Templates Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(templates).map(([key, template]) => (
              <div key={key} className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 rounded-lg p-6">
                <Workflow className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">{template.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{template.stages.length} fases automáticas</p>
                <ul className="space-y-1">
                  {template.stages.slice(0, 3).map((stage, idx) => (
                    <li key={idx} className="text-gray-400 text-xs">✓ {stage.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager;