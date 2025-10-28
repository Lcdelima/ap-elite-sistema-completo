import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, Bell } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '60',
    location: '',
    attendees: '',
    reminder: '15'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      setEvents([]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEvent = {
      ...formData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    setEvents([...events, newEvent]);
    alert('Evento criado com sucesso!');
    setShowModal(false);
    setFormData({
      title: '', description: '', date: new Date().toISOString().split('T')[0],
      time: '', duration: '60', location: '', attendees: '', reminder: '15'
    });
  };

  const eventsForDate = events.filter(e => e.date === selectedDate);

  return (
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">Calendário e Agenda</h1>
                <p className="text-pink-100">Gestão de eventos e compromissos</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Evento
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Eventos - {new Date(selectedDate).toLocaleDateString('pt-BR')}</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              
              {eventsForDate.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum evento para esta data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventsForDate.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time} ({event.duration} min)</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.attendees && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees.split(',').length} participantes</span>
                          </div>
                        )}
                        {event.reminder && (
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            <span>Lembrete: {event.reminder} min antes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total de Eventos</p>
                  <p className="text-2xl font-bold text-pink-600">{events.length}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Eventos Hoje</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {events.filter(e => e.date === new Date().toISOString().split('T')[0]).length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Próximos 7 dias</p>
                  <p className="text-2xl font-bold text-green-600">
                    {events.filter(e => {
                      const eventDate = new Date(e.date);
                      const today = new Date();
                      const diff = (eventDate - today) / (1000 * 60 * 60 * 24);
                      return diff >= 0 && diff <= 7;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Novo Evento</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
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
                  <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Local</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Participantes (emails separados por vírgula)</label>
                  <input
                    type="text"
                    value={formData.attendees}
                    onChange={(e) => setFormData({...formData, attendees: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lembrete (minutos antes)</label>
                  <select
                    value={formData.reminder}
                    onChange={(e) => setFormData({...formData, reminder: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="5">5 minutos</option>
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="1440">1 dia</option>
                  </select>
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
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    Criar Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default Calendar;