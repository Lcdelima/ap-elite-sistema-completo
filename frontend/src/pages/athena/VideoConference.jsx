import React, { useState, useEffect } from 'react';
import { Video, Plus, Calendar, Users, Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const VideoConference = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    participants: ''
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      setMeetings([]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Generate Jitsi link
    const roomName = `APElite_${Date.now()}`;
    const jitsiLink = `https://meet.jit.si/${roomName}`;
    
    const meeting = {
      ...formData,
      link: jitsiLink,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    setMeetings([meeting, ...meetings]);
    alert(`Reunião criada! Link: ${jitsiLink}`);
    setShowModal(false);
    setFormData({
      title: '', description: '', date: '', time: '',
      duration: '60', participants: ''
    });
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado para área de transferência!");
  };

  return (
    <UniversalModuleLayout
      title="Video Conference"
      subtitle="Sistema integrado"
      icon={FileText}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Video className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">Videoconferência</h1>
                <p className="text-blue-100">Reuniões virtuais com Jitsi Meet</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Reunião
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total de Reuniões</p>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{meetings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Hoje</p>
              <Video className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {meetings.filter(m => m.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Participantes</p>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {meetings.reduce((acc, m) => acc + (m.participants?.split(',').length || 0), 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Reuniões Agendadas</h2>
          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma reunião agendada</p>
              <p className="text-sm text-gray-500 mt-2">Crie uma nova reunião para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{meeting.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {meeting.date ? new Date(meeting.date).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                        <span>{meeting.time || 'N/A'}</span>
                        <span>{meeting.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <LinkIcon className="w-4 h-4 text-blue-600" />
                    <code className="flex-1 text-sm text-blue-800 truncate">{meeting.link}</code>
                    <button
                      onClick={() => copyLink(meeting.link)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={meeting.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Nova Reunião Virtual</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título da Reunião*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Reunião de Planejamento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data*</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Horário*</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duração (minutos)*</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Participantes (emails separados por vírgula)</label>
                  <input
                    type="text"
                    value={formData.participants}
                    onChange={(e) => setFormData({...formData, participants: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="email1@example.com, email2@example.com"
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Criar Reunião
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

export default VideoConference;