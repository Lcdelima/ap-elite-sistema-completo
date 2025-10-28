import React, { useState, useEffect } from 'react';
import { FileText, Search, TrendingUp, BarChart3, Brain, Filter } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ProcessAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Simulated data for now - replace with actual API calls
      setStats({
        total_analyses: 0,
        in_progress: 0,
        completed: 0,
        success_rate: 0
      });
      setAnalyses([]);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <Brain className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold mb-1">Análise Processual Inteligente</h1>
              <p className="text-indigo-100">Análise avançada de processos jurídicos com IA</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total de Análises</p>
              <BarChart3 className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_analyses || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Em Andamento</p>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.in_progress || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Concluídas</p>
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.success_rate || 0}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Análises Recentes</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma análise processual realizada</p>
              <p className="text-sm text-gray-500 mt-2">As análises aparecerão aqui quando forem criadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{analysis.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{analysis.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm ${
                      analysis.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {analysis.status === 'completed' ? 'Concluída' : 'Em Andamento'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AthenaLayout>
  );
};

export default ProcessAnalysis;