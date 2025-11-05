import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const InboxHibrida = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInbox();
  }, [filter]);

  const loadInbox = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('user_id') || 'test-user';
      const filterType = filter === 'all' ? null : filter;
      
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/inbox/unified`,
        { 
          params: { user_id: userId, filter_type: filterType },
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } 
        }
      );
      
      setItems(response.data.items || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (itemId, itemType) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/inbox/mark-read/${itemId}`,
        { item_type: itemType },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      loadInbox();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'publicacao': '📰',
      'tarefa': '✅',
      'mensagem': '💬',
      'alerta': '⚠️'
    };
    return icons[type] || '📊';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'alta': '#E74C3C',
      'media': '#E67E22',
      'baixa': '#00A3C4'
    };
    return colors[priority] || '#B3B8C2';
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Inbox <span style={{ color: '#00A3C4' }}>Híbrida</span> 📥
          </h1>
          <p className="subtitle text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Central unificada de publicações, tarefas, mensagens e alertas
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="cipher-glass p-4 text-center">
              <div className="text-3xl font-title font-bold" style={{ color: '#00A3C4' }}>
                {stats.total}
              </div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Total</div>
            </div>
            <div className="cipher-glass p-4 text-center">
              <div className="text-3xl font-title font-bold" style={{ color: '#E67E22' }}>
                {stats.unread}
              </div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Não Lidas</div>
            </div>
            <div className="cipher-glass p-4 text-center">
              <div className="text-3xl font-title font-bold" style={{ color: '#E74C3C' }}>
                {stats.action_required}
              </div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Ação Necessária</div>
            </div>
            <div className="cipher-glass p-4 text-center">
              <div className="text-3xl font-title font-bold" style={{ color: '#27AE60' }}>
                {Object.keys(stats.by_type || {}).length}
              </div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Tipos</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['all', 'publicacao', 'tarefa', 'mensagem', 'alerta'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg capitalize transition-all"
              style={{
                background: filter === f ? '#00A3C4' : 'rgba(255,255,255,0.06)',
                color: filter === f ? '#000' : '#E4E6EB',
                fontWeight: filter === f ? 700 : 500
              }}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <div className="cipher-glass p-20 text-center" style={{ color: 'rgba(228,230,235,0.6)' }}>
              Carregando...
            </div>
          ) : items.length === 0 ? (
            <div className="cipher-glass p-20 text-center" style={{ color: 'rgba(228,230,235,0.6)' }}>
              <div className="text-6xl mb-4">📥</div>
              <p>Inbox vazia</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cipher-glass p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{getTypeIcon(item.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: '#E4E6EB' }}>
                          {item.title}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'rgba(228,230,235,0.7)' }}>
                          {item.content}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        <div 
                          className="px-2 py-1 rounded text-xs font-bold"
                          style={{ background: getPriorityColor(item.priority), color: '#fff' }}
                        >
                          {item.priority.toUpperCase()}
                        </div>
                        {item.action_required && (
                          <div className="text-xs" style={{ color: '#E74C3C' }}>
                            ⚠️ Ação Necessária
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs" style={{ color: 'rgba(228,230,235,0.5)' }}>
                        {new Date(item.timestamp).toLocaleString('pt-BR')} • {item.source}
                      </div>
                      
                      <div className="flex gap-2">
                        {item.status === 'unread' && (
                          <button
                            onClick={() => markAsRead(item.id, item.type)}
                            className="text-xs px-3 py-1 rounded"
                            style={{ background: 'rgba(0,163,196,0.2)', color: '#00A3C4' }}
                          >
                            Marcar como Lido
                          </button>
                        )}
                        <button className="text-xs px-3 py-1 rounded" style={{ border: '1px solid rgba(0,163,196,0.3)', color: '#00A3C4' }}>
                          Abrir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxHibrida;
