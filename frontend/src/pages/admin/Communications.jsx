import React, { useState, useEffect } from 'react';
import { 
  MessageSquare,
  Send,
  Paperclip,
  Search,
  Filter,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Phone,
  Video,
  Mail,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Communications = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient_ids: [],
    subject: '',
    content: '',
    message_type: 'internal',
    priority: 'normal'
  });

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data || []);
      
      // Group messages into conversations
      const groupedConversations = groupMessagesByConversation(response.data || []);
      setConversations(groupedConversations);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      setConversations([]);
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

  const groupMessagesByConversation = (messageList) => {
    const conversationMap = new Map();
    
    messageList.forEach(message => {
      const threadId = message.thread_id || message.id;
      if (!conversationMap.has(threadId)) {
        conversationMap.set(threadId, {
          id: threadId,
          participants: [...new Set([message.sender_id, ...message.recipient_ids])],
          lastMessage: message,
          messages: [],
          unreadCount: 0
        });
      }
      
      conversationMap.get(threadId).messages.push(message);
      
      // Update last message if this is newer
      const conversation = conversationMap.get(threadId);
      if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
        conversation.lastMessage = message;
      }
      
      // Count unread messages
      if (!message.read_by[currentUser.id]) {
        conversation.unreadCount++;
      }
    });
    
    return Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));
  };

  const sendMessage = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      await axios.post(`${API}/messages`, newMessage, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Mensagem enviada com sucesso');
      setShowCompose(false);
      setNewMessage({
        recipient_ids: [],
        subject: '',
        content: '',
        message_type: 'internal',
        priority: 'normal'
      });
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      await axios.put(`${API}/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user.id === userId) || { name: 'Usuário Desconhecido', email: '' };
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hoje ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
      return 'Ontem ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getPriorityBadge = (priority) => {
    const config = {
      'low': { label: 'Baixa', className: 'bg-gray-500' },
      'normal': { label: 'Normal', className: 'bg-blue-500' },
      'high': { label: 'Alta', className: 'bg-orange-500' },
      'urgent': { label: 'Urgente', className: 'bg-red-500' }
    };
    
    const badgeConfig = config[priority] || config['normal'];
    
    if (priority === 'normal') return null;
    
    return (
      <Badge className={`${badgeConfig.className} text-white text-xs`}>
        {badgeConfig.label}
      </Badge>
    );
  };

  const getMessageTypeIcon = (type) => {
    const icons = {
      'internal': MessageSquare,
      'email': Mail,
      'sms': Smartphone,
      'whatsapp': Phone
    };
    return icons[type] || MessageSquare;
  };

  const startVideoCall = (userId) => {
    // Integration point for video calling system
    toast.info('Iniciando chamada de vídeo...');
    // window.open(`/video-call/${userId}`, '_blank');
  };

  const startAudioCall = (userId) => {
    // Integration point for audio calling system
    toast.info('Iniciando chamada de áudio...');
    // window.open(`/audio-call/${userId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando sistema de comunicação...</div>
      </div>
    );
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Comunicação Corporativa</h1>
          <p className="text-slate-400">Sistema integrado de mensagens e comunicação</p>
        </div>
        <div className="flex space-x-2">
          <Button className="btn-secondary flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Telefone</span>
          </Button>
          <Button 
            className="btn-primary flex items-center space-x-2"
            onClick={() => setShowCompose(true)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Nova Mensagem</span>
          </Button>
        </div>
      </div>

      {/* Main Communication Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Sidebar - Conversations List */}
        <div className="lg:col-span-1 flex flex-col">
          {/* Search */}
          <Card className="bg-slate-800 border-slate-700 mb-4">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-4">
            {[
              { id: 'inbox', label: 'Recebidas', icon: MessageSquare },
              { id: 'sent', label: 'Enviadas', icon: Send },
              { id: 'starred', label: 'Favoritas', icon: Star }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-md transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <IconComponent className="h-3 w-3" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.map((conversation) => {
              const lastSender = getUserById(conversation.lastMessage.sender_id);
              const isSelected = selectedConversation?.id === conversation.id;
              
              return (
                <Card 
                  key={conversation.id} 
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-cyan-500 bg-opacity-20 border-cyan-400' 
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 bg-cyan-500 flex-shrink-0">
                        <AvatarFallback className="bg-cyan-500 text-white text-xs">
                          {getInitials(lastSender.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium text-sm truncate">
                            {lastSender.name}
                          </p>
                          <div className="flex items-center space-x-1">
                            {getPriorityBadge(conversation.lastMessage.priority)}
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs truncate mt-1">
                          {conversation.lastMessage.subject || 'Sem assunto'}
                        </p>
                        <p className="text-slate-500 text-xs truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {formatDate(conversation.lastMessage.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content - Messages */}
        <div className="lg:col-span-3 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <Card className="bg-slate-800 border-slate-700 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 bg-cyan-500">
                        <AvatarFallback className="bg-cyan-500 text-white">
                          {getInitials(getUserById(selectedConversation.lastMessage.sender_id).name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-semibold">
                          {getUserById(selectedConversation.lastMessage.sender_id).name}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {selectedConversation.participants.length} participantes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-slate-300 border-slate-600"
                        onClick={() => startAudioCall(selectedConversation.lastMessage.sender_id)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-slate-300 border-slate-600"
                        onClick={() => startVideoCall(selectedConversation.lastMessage.sender_id)}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-slate-300 border-slate-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {selectedConversation.messages.map((message) => {
                  const sender = getUserById(message.sender_id);
                  const isOwnMessage = message.sender_id === currentUser.id;
                  const MessageTypeIcon = getMessageTypeIcon(message.message_type);
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        isOwnMessage ? 'order-1' : 'order-2'
                      }`}>
                        <Card className={`${
                          isOwnMessage 
                            ? 'bg-cyan-500 border-cyan-400' 
                            : 'bg-slate-700 border-slate-600'
                        }`}>
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-2">
                              {!isOwnMessage && (
                                <Avatar className="h-6 w-6 bg-slate-600 flex-shrink-0">
                                  <AvatarFallback className="bg-slate-600 text-white text-xs">
                                    {getInitials(sender.name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex-1">
                                {!isOwnMessage && (
                                  <p className="text-slate-300 text-xs font-medium mb-1">
                                    {sender.name}
                                  </p>
                                )}
                                {message.subject && (
                                  <p className={`font-medium text-sm mb-1 ${
                                    isOwnMessage ? 'text-white' : 'text-slate-200'
                                  }`}>
                                    {message.subject}
                                  </p>
                                )}
                                <p className={`text-sm ${
                                  isOwnMessage ? 'text-white' : 'text-slate-300'
                                }`}>
                                  {message.content}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-1">
                                    <MessageTypeIcon className={`h-3 w-3 ${
                                      isOwnMessage ? 'text-cyan-200' : 'text-slate-400'
                                    }`} />
                                    {getPriorityBadge(message.priority)}
                                  </div>
                                  <p className={`text-xs ${
                                    isOwnMessage ? 'text-cyan-200' : 'text-slate-500'
                                  }`}>
                                    {formatDate(message.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex space-x-3">
                    <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Digite sua mensagem..."
                        className="bg-slate-700 border-slate-600 text-white resize-none"
                        rows={2}
                      />
                    </div>
                    <Button className="btn-primary">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-slate-800 border-slate-700 flex-1 flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-400 text-lg">Selecione uma conversa para começar</p>
                <p className="text-slate-500 text-sm">Ou crie uma nova mensagem</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Nova Mensagem</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Destinatários</label>
                <Select onValueChange={(value) => setNewMessage({...newMessage, recipient_ids: [value]})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione os destinatários" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id} className="text-white">
                        {user.name} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                  <Select value={newMessage.message_type} onValueChange={(value) => setNewMessage({...newMessage, message_type: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="internal" className="text-white">Interno</SelectItem>
                      <SelectItem value="email" className="text-white">E-mail</SelectItem>
                      <SelectItem value="sms" className="text-white">SMS</SelectItem>
                      <SelectItem value="whatsapp" className="text-white">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Prioridade</label>
                  <Select value={newMessage.priority} onValueChange={(value) => setNewMessage({...newMessage, priority: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="low" className="text-white">Baixa</SelectItem>
                      <SelectItem value="normal" className="text-white">Normal</SelectItem>
                      <SelectItem value="high" className="text-white">Alta</SelectItem>
                      <SelectItem value="urgent" className="text-white">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Assunto</label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Assunto da mensagem"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mensagem</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={6}
                  placeholder="Digite sua mensagem..."
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  className="flex-1 btn-primary"
                  onClick={sendMessage}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-secondary"
                  onClick={() => setShowCompose(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communications;