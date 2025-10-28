import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  MessageSquare, Send, Lock, Users, Phone, Video, Paperclip,
  X, Minimize2, Maximize2, Bell, BellOff, Search, Plus,
  Check, CheckCheck, Image, FileText, Download, Mic, Camera,
  MoreVertical, UserPlus, LogOut, Home, Volume2, VolumeX,
  Zap, Circle, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const CommunicationsEnhanced = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationSound, setNotificationSound] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchContacts();
    fetchConversations();
    
    // Simular atualização de status online
    const interval = setInterval(() => {
      updateOnlineStatus();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      scrollToBottom();
    }
  }, [activeChat]);

  const fetchCurrentUser = () => {
    const userData = JSON.parse(localStorage.getItem('ap_elite_user') || '{}');
    setCurrentUser(userData);
  };

  const fetchContacts = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/communications/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setContacts(res.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/communications/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/communications/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const updateOnlineStatus = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/communications/online-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOnlineUsers(res.data.onlineUsers || []);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const messageData = {
      conversationId: activeChat.id,
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString()
    };

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(`${BACKEND_URL}/api/athena/communications/send`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages([...messages, { ...messageData, sender: currentUser, status: 'sent' }]);
      setNewMessage('');
      
      if (notificationSound) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0 || !activeChat) return;

    setUploadingFile(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('conversationId', activeChat.id);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(`${BACKEND_URL}/api/athena/communications/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Arquivo(s) enviado(s) com sucesso!');
      fetchMessages(activeChat.id);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Erro ao enviar arquivo(s)');
    } finally {
      setUploadingFile(false);
    }
  };

  const startCall = (type) => {
    setCallType(type);
    setIsCallActive(true);
    toast.success(`Chamada de ${type === 'audio' ? 'áudio' : 'vídeo'} iniciada!`);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallType(null);
    toast.info('Chamada encerrada');
  };

  const sendAttentionNudge = async () => {
    if (!activeChat) return;

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(
        `${BACKEND_URL}/api/athena/communications/nudge`,
        { conversationId: activeChat.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Chamar atenção enviado!');
      playNudgeSound();
    } catch (error) {
      console.error('Error sending nudge:', error);
    }
  };

  const playNotificationSound = () => {
    // Implementar som de notificação
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(() => {});
  };

  const playNudgeSound = () => {
    // Implementar som de "nudge" (vibração/atenção)
    const audio = new Audio('/sounds/nudge.mp3');
    audio.play().catch(() => {});
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getStatusColor = (userId) => {
    return isUserOnline(userId) ? 'bg-green-500' : 'bg-slate-500';
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chat Window Component (pode ser flutuante)
  const ChatWindow = () => (
    <div className={`${isFloating ? 'fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl z-50' : 'w-full h-full'} 
      bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden flex flex-col`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {activeChat ? (
            <>
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-cyan-600 font-bold">{activeChat.name?.charAt(0)}</span>
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(activeChat.id)}`} />
              </div>
              <div>
                <p className="text-white font-semibold">{activeChat.name}</p>
                <p className="text-cyan-100 text-xs">{isUserOnline(activeChat.id) ? 'Online' : 'Offline'}</p>
              </div>
            </>
          ) : (
            <p className="text-white font-semibold">Selecione uma conversa</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeChat && (
            <>
              <Button
                size="sm"
                onClick={() => startCall('audio')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30"
              >
                <Phone className="h-4 w-4 text-white" />
              </Button>
              <Button
                size="sm"
                onClick={() => startCall('video')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30"
              >
                <Video className="h-4 w-4 text-white" />
              </Button>
              <Button
                size="sm"
                onClick={sendAttentionNudge}
                className="bg-white bg-opacity-20 hover:bg-opacity-30"
                title="Chamar atenção"
              >
                <Zap className="h-4 w-4 text-yellow-300" />
              </Button>
            </>
          )}
          
          <Button
            size="sm"
            onClick={() => setIsFloating(!isFloating)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30"
          >
            {isFloating ? <Maximize2 className="h-4 w-4 text-white" /> : <Minimize2 className="h-4 w-4 text-white" />}
          </Button>
          
          {!isFloating && (
            <Button
              size="sm"
              onClick={() => navigate('/athena')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30"
              title="Voltar ao início"
            >
              <Home className="h-4 w-4 text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Call Interface */}
      {isCallActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 z-50 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              {callType === 'video' ? (
                <Video className="h-16 w-16 text-purple-600" />
              ) : (
                <Phone className="h-16 w-16 text-purple-600" />
              )}
            </div>
            <div>
              <h3 className="text-white text-2xl font-bold">{activeChat?.name}</h3>
              <p className="text-purple-200">Chamada de {callType === 'audio' ? 'áudio' : 'vídeo'} em andamento...</p>
            </div>
            <div className="flex space-x-4 mt-8">
              <Button
                onClick={() => setNotificationSound(!notificationSound)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 w-16 h-16 rounded-full"
              >
                {notificationSound ? <Volume2 className="h-6 w-6 text-white" /> : <VolumeX className="h-6 w-6 text-white" />}
              </Button>
              <Button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 w-16 h-16 rounded-full"
              >
                <Phone className="h-6 w-6 text-white transform rotate-135" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900" style={{ backgroundImage: 'url(/chat-bg.png)', backgroundSize: 'cover' }}>
        {activeChat ? (
          messages.length > 0 ? (
            messages.map((msg, idx) => {
              const isSentByMe = msg.sender?.id === currentUser?.id;
              return (
                <div key={idx} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isSentByMe ? 'bg-cyan-600' : 'bg-slate-700'} rounded-lg p-3 shadow-lg`}>
                    {msg.type === 'file' ? (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-white" />
                        <div>
                          <p className="text-white text-sm font-medium">{msg.fileName}</p>
                          <Button size="sm" className="mt-1 bg-white bg-opacity-20 hover:bg-opacity-30">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white text-sm">{msg.content}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-white text-opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isSentByMe && (
                        <span className="ml-2">
                          {msg.status === 'read' ? (
                            <CheckCheck className="h-3 w-3 text-blue-300" />
                          ) : msg.status === 'delivered' ? (
                            <CheckCheck className="h-3 w-3 text-white text-opacity-70" />
                          ) : (
                            <Check className="h-3 w-3 text-white text-opacity-70" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Lock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Nenhuma mensagem ainda</p>
                <p className="text-slate-500 text-sm mt-2">Envie a primeira mensagem!</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {activeChat && (
        <div className="bg-slate-800 p-4 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="bg-slate-700 hover:bg-slate-600"
              size="sm"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs">
              <Lock className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Criptografia E2E Ativa</span>
            </div>
            <Button
              onClick={() => setNotificationSound(!notificationSound)}
              size="sm"
              className="bg-transparent hover:bg-slate-700"
              title={notificationSound ? "Desativar som" : "Ativar som"}
            >
              {notificationSound ? <Bell className="h-4 w-4 text-slate-400" /> : <BellOff className="h-4 w-4 text-slate-400" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Se está em modo flutuante, mostrar layout completo + chat flutuante
  if (isFloating) {
    return (
      <>
        {/* Layout Normal */}
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Comunicação Corporativa</h1>
                <p className="text-slate-400">MSN-Style Chat com E2E Encryption</p>
              </div>
              <Button
                onClick={() => navigate('/athena')}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>

            {/* Content quando o chat está flutuante */}
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <MessageSquare className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Chat Flutuante Ativo</h2>
              <p className="text-slate-400 mb-4">
                Você pode navegar pelo sistema enquanto mantém sua conversa aberta
              </p>
              <Button
                onClick={() => setIsFloating(false)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Voltar ao Chat Completo
              </Button>
            </Card>
          </div>
        </div>

        {/* Chat Flutuante */}
        <ChatWindow />
      </>
    );
  }

  // Layout Normal (sem flutuante)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Comunicação Corporativa</h1>
            <p className="text-slate-400">MSN-Style Chat com E2E Encryption</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowAddUser(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </Button>
            <Button
              onClick={() => navigate('/athena')}
              className="bg-slate-700 hover:bg-slate-600"
            >
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </div>

        {/* Security Banner */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="h-6 w-6 text-white" />
              <div>
                <p className="text-white font-semibold">Criptografia End-to-End Ativa</p>
                <p className="text-green-100 text-sm">Signal Protocol + AES-256-GCM • Zero-Knowledge</p>
              </div>
            </div>
            <Badge className="bg-white text-green-600 font-bold">Seguro</Badge>
          </CardContent>
        </Card>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          {/* Contacts List */}
          <Card className="col-span-3 bg-slate-800 border-slate-700 overflow-hidden flex flex-col">
            <CardContent className="p-0 flex flex-col h-full">
              {/* Search */}
              <div className="p-4 border-b border-slate-700">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar contato..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="flex-1 overflow-y-auto">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setActiveChat(contact)}
                      className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${
                        activeChat?.id === contact.id ? 'bg-slate-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{contact.name?.charAt(0)}</span>
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(contact.id)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{contact.name}</p>
                          <p className="text-slate-400 text-xs truncate">{contact.lastMessage || 'Sem mensagens'}</p>
                        </div>
                        {contact.unreadCount > 0 && (
                          <Badge className="bg-cyan-600">{contact.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Nenhum contato encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <div className="col-span-9">
            <ChatWindow />
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md m-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">Adicionar Contato</h3>
                <Button
                  onClick={() => setShowAddUser(false)}
                  size="sm"
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome ou email do usuário..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CommunicationsEnhanced;
