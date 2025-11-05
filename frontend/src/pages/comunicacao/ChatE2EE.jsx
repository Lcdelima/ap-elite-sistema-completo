import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const ChatE2EE = () => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom.id);
      connectWebSocket(activeRoom.id);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRooms = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'test-user';
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/rooms/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/messages/${roomId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const connectWebSocket = (roomId) => {
    const wsUrl = `wss://legaltech-forensics.preview.emergentagent.com/api/chat/ws/${roomId}`;
    const socket = new WebSocket(wsUrl);
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    setWs(socket);
    
    return () => socket.close();
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeRoom) return;

    const userId = localStorage.getItem('user_id') || 'test-user';
    const timestamp = new Date().toISOString();
    
    // Simular criptografia E2EE (cliente deve implementar)
    const encryptedContent = btoa(messageInput);  // Base64 (substitua por cripto real)
    
    // Hash forense
    const hashData = `${encryptedContent}${timestamp}${userId}`;
    const messageHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashData));
    const hashHex = Array.from(new Uint8Array(messageHash)).map(b => b.toString(16).padStart(2, '0')).join('');

    const message = {
      room_id: activeRoom.id,
      sender_id: userId,
      encrypted_content: encryptedContent,
      timestamp,
      message_hash: hashHex
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/messages`,
        message,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      setMessageInput('');
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-elite">
      <div className="flex h-screen">
        {/* Sidebar - Salas */}
        <div className="w-80 border-r" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <h2 className="text-xl font-title font-bold" style={{ color: '#E4E6EB' }}>
              Chat <span style={{ color: '#00A3C4' }}>E2EE</span>
            </h2>
            <div className="text-xs mt-1" style={{ color: '#27AE60' }}>
              🔒 Criptografia Ponta a Ponta
            </div>
          </div>

          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className="p-4 border-b cursor-pointer transition-all"
                style={{
                  borderColor: 'rgba(255,255,255,0.05)',
                  background: activeRoom?.id === room.id ? 'rgba(0,163,196,0.1)' : 'transparent'
                }}
              >
                <div className="font-semibold" style={{ color: '#E4E6EB' }}>
                  {room.name}
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(228,230,235,0.6)' }}>
                  {room.participants.length} participantes
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeRoom ? (
            <>
              {/* Header */}
              <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                <div className="font-title font-bold text-lg" style={{ color: '#E4E6EB' }}>
                  {activeRoom.name}
                </div>
                {activeRoom.case_id && (
                  <div className="text-xs" style={{ color: '#00A3C4' }}>
                    📁 Caso: {activeRoom.case_id}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.1)' }}>
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === (localStorage.getItem('user_id') || 'test-user');
                  const decrypted = atob(msg.encrypted_content);  // Decodificar
                  
                  return (
                    <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-md px-4 py-2 rounded-lg"
                        style={{
                          background: isOwn ? '#00A3C4' : 'rgba(255,255,255,0.1)',
                          color: isOwn ? '#000' : '#E4E6EB'
                        }}
                      >
                        <div className="text-sm">{decrypted}</div>
                        <div className="text-xs mt-1" style={{ opacity: 0.7 }}>
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="input-elite flex-1"
                    placeholder="Digite sua mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} className="btn-elite btn-elite-primary">
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full" style={{ color: 'rgba(228,230,235,0.6)' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p>Selecione uma sala para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatE2EE;
