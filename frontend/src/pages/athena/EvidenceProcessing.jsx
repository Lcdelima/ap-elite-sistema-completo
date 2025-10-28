import React, { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, Clock, AlertCircle, Database } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const EvidenceProcessing = () => {
  const [evidences, setEvidences] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      setStats({
        total: 0,
        processing: 0,
        completed: 0,
        pending: 0
      });
      setEvidences([]);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout
      title="Evidence Processing"
      subtitle="Sistema integrado"
      icon={FileText}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">Processamento de Evidências</h1>
                <p className="text-cyan-100">Gestão e processamento de evidências digitais</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Nova Evidência
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total</p>
              <Database className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Processando</p>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.processing || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Concluídas</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pendentes</p>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Evidências em Processamento</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            </div>
          ) : evidences.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma evidência em processamento</p>
              <p className="text-sm text-gray-500 mt-2">Faça upload de evidências para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evidences.map((evidence) => (
                <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{evidence.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{evidence.description}</p>
                      <span className="text-sm text-gray-500">
                        Tipo: {evidence.type} • Tamanho: {evidence.size}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${
                      evidence.status === 'completed' ? 'bg-green-100 text-green-700' :
                      evidence.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {evidence.status === 'completed' ? 'Concluída' :
                       evidence.status === 'processing' ? 'Processando' : 'Pendente'}
                    </span>
                  </div>
                  {evidence.progress !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-cyan-600 h-2 rounded-full transition-all"
                        style={{ width: `${evidence.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Nova Evidência</h3>
              <p className="text-gray-600 mb-4">
                Funcionalidade de upload em desenvolvimento. Em breve você poderá fazer upload de evidências diretamente por aqui.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </UniversalModuleLayout>
  );
};

export default EvidenceProcessing;