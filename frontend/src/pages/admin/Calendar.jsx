import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Edit,
  Trash2,
  Link,
  Copy,
  Settings,
  Bell,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Calendar = ({ currentUser }) => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    all_day: false,
    location: '',
    attendees: [],
    event_type: 'meeting',
    case_id: '',
    recurrence: null
  });

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, [currentDate, viewMode]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      
      // Calculate date range based on view mode
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const response = await axios.get(`${API}/calendar/events`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }
      });
      
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth(), 1);
      case 'week':
        const day = date.getDay();
        return new Date(date.getTime() - day * 24 * 60 * 60 * 1000);
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      default:
        return date;
    }
  };

  const getViewEndDate = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      case 'week':
        const day = date.getDay();
        return new Date(date.getTime() + (6 - day) * 24 * 60 * 60 * 1000);
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      default:
        return date;
    }
  };

  const createEvent = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      
      const eventData = {
        ...newEvent,
        start_time: new Date(newEvent.start_time).toISOString(),
        end_time: new Date(newEvent.end_time).toISOString()
      };
      
      const response = await axios.post(`${API}/calendar/events`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // If it's a video meeting, generate meeting link
      if (newEvent.event_type === 'meeting') {
        const meetingData = {
          title: newEvent.title,
          description: newEvent.description,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          participants: newEvent.attendees,
          meeting_type: 'video',
          platform: 'internal'
        };
        
        await axios.post(`${API}/meetings`, meetingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      toast.success('Evento criado com sucesso');
      setShowCreateModal(false);
      resetNewEvent();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Erro ao criar evento');
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      all_day: false,
      location: '',
      attendees: [],
      event_type: 'meeting',
      case_id: '',
      recurrence: null
    });
  };

  const generateMeetingLink = (eventId) => {
    const meetingLink = `${window.location.origin}/meeting/${eventId}`;
    navigator.clipboard.writeText(meetingLink);
    toast.success('Link da reunião copiado para a área de transferência');
  };

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() + direction);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction * 7));
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() + direction);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      'meeting': Video,
      'deadline': Clock,
      'court': CalendarIcon,
      'appointment': Users
    };
    return icons[type] || CalendarIcon;
  };

  const getEventTypeBadge = (type) => {
    const config = {
      'meeting': { label: 'Reunião', className: 'bg-blue-500' },
      'deadline': { label: 'Prazo', className: 'bg-red-500' },
      'court': { label: 'Audiência', className: 'bg-purple-500' },
      'appointment': { label: 'Compromisso', className: 'bg-green-500' }
    };
    
    const typeConfig = config[type] || config['meeting'];
    
    return (
      <Badge className={`${typeConfig.className} text-white text-xs`}>
        {typeConfig.label}
      </Badge>
    );
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando calendário...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendário Corporativo</h1>
          <p className="text-slate-400">Gerencie reuniões, prazos e compromissos</p>
        </div>
        <div className="flex space-x-2">
          <Button className="btn-secondary flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Button>
          <Button 
            className="btn-primary flex items-center space-x-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Evento</span>
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateCalendar(-1)}
                  className="text-slate-300 border-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateCalendar(1)}
                  className="text-slate-300 border-slate-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <h2 className="text-xl font-semibold text-white capitalize">
                {getMonthName()}
              </h2>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="text-slate-300 border-slate-600"
              >
                Hoje
              </Button>
            </div>
            
            <div className="flex space-x-1 bg-slate-700 p-1 rounded-lg">
              {[
                { id: 'month', label: 'Mês' },
                { id: 'week', label: 'Semana' },
                { id: 'day', label: 'Dia' }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setViewMode(view.id)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === view.id 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid - Month View */}
      {viewMode === 'month' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-slate-400 font-medium text-sm">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = day.toDateString() === selectedDate.toDateString();
                
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-24 p-1 border border-slate-700 cursor-pointer transition-colors
                      ${isCurrentMonth ? 'bg-slate-700' : 'bg-slate-800 opacity-50'}
                      ${isToday ? 'ring-2 ring-cyan-400' : ''}
                      ${isSelected ? 'bg-cyan-500 bg-opacity-20' : ''}
                      hover:bg-slate-600
                    `}
                  >
                    <div className="text-right mb-1">
                      <span className={`text-sm ${
                        isToday ? 'text-cyan-400 font-bold' : 
                        isCurrentMonth ? 'text-white' : 'text-slate-500'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const IconComponent = getEventTypeIcon(event.event_type);
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            className="bg-cyan-500 bg-opacity-80 text-white text-xs p-1 rounded cursor-pointer hover:bg-opacity-100 flex items-center space-x-1"
                          >
                            <IconComponent className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-400 text-center">
                          +{dayEvents.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Events Sidebar */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Eventos de Hoje</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getEventsForDate(new Date()).map((event) => {
              const IconComponent = getEventTypeIcon(event.event_type);
              return (
                <div 
                  key={event.id} 
                  className="bg-slate-700 p-3 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-cyan-500 bg-opacity-20 rounded-lg">
                        <IconComponent className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{event.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-400 text-sm">
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-400 text-sm">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getEventTypeBadge(event.event_type)}
                      {event.event_type === 'meeting' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-slate-300 border-slate-600 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateMeetingLink(event.id);
                          }}
                        >
                          <Link className="h-3 w-3 mr-1" />
                          Link
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {getEventsForDate(new Date()).length === 0 && (
              <div className="text-center py-6 text-slate-400">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum evento para hoje</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Novo Evento</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Título do evento"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Evento</label>
                <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent({...newEvent, event_type: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="meeting" className="text-white">Reunião</SelectItem>
                    <SelectItem value="deadline" className="text-white">Prazo</SelectItem>
                    <SelectItem value="court" className="text-white">Audiência</SelectItem>
                    <SelectItem value="appointment" className="text-white">Compromisso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data/Hora Início</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data/Hora Fim</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Local</label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Local do evento ou link da reunião"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Participantes</label>
                <Select onValueChange={(value) => {
                  if (!newEvent.attendees.includes(value)) {
                    setNewEvent({...newEvent, attendees: [...newEvent.attendees, value]});
                  }
                }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Adicionar participantes" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id} className="text-white">
                        {user.name} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {newEvent.attendees.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newEvent.attendees.map((attendeeId) => {
                      const user = users.find(u => u.id === attendeeId);
                      return (
                        <Badge key={attendeeId} className="bg-cyan-500 text-white">
                          {user?.name || 'Usuário'}
                          <button 
                            onClick={() => {
                              setNewEvent({
                                ...newEvent, 
                                attendees: newEvent.attendees.filter(id => id !== attendeeId)
                              });
                            }}
                            className="ml-2 hover:text-red-300"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                  placeholder="Descrição do evento"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  className="flex-1 btn-primary"
                  onClick={createEvent}
                >
                  Criar Evento
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewEvent();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-300 border-slate-600"
                >
                  Fechar
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                {getEventTypeBadge(selectedEvent.event_type)}
                {selectedEvent.event_type === 'meeting' && (
                  <Button 
                    className="btn-primary flex items-center space-x-2"
                    onClick={() => generateMeetingLink(selectedEvent.id)}
                  >
                    <Video className="h-4 w-4" />
                    <span>Entrar na Reunião</span>
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400">Data/Hora:</span>
                  <p className="text-white">
                    {formatDate(selectedEvent.start_time)} • {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
                  </p>
                </div>
                
                {selectedEvent.location && (
                  <div>
                    <span className="text-slate-400">Local:</span>
                    <p className="text-white">{selectedEvent.location}</p>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div>
                  <span className="text-slate-400">Descrição:</span>
                  <p className="text-white">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div>
                  <span className="text-slate-400">Participantes:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEvent.attendees.map((attendeeId) => {
                      const user = users.find(u => u.id === attendeeId);
                      return (
                        <Badge key={attendeeId} className="bg-slate-600 text-white">
                          {user?.name || 'Usuário'}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2 pt-4">
                <Button className="btn-secondary flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
                
                {selectedEvent.event_type === 'meeting' && (
                  <Button 
                    className="btn-secondary flex items-center space-x-2"
                    onClick={() => generateMeetingLink(selectedEvent.id)}
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copiar Link</span>
                  </Button>
                )}
                
                <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;