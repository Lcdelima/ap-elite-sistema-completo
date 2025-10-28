import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, Cloud, CheckCircle, AlertTriangle, X } from 'lucide-react';

const HybridNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Detectar mudanças de conectividade
    const handleOnline = () => {
      setIsOnline(true);
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Conectado!',
        message: 'Sistema online - sincronização automática ativada',
        icon: Wifi,
        duration: 3000
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Modo Offline',
        message: 'Sem conexão - funcionando com dados locais',
        icon: WifiOff,
        duration: 5000
      });
    };

    // Listeners de conectividade
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);

    // Remover automaticamente após duração especificada
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const Icon = notification.icon || Database;
        
        return (
          <div
            key={notification.id}
            className={`
              ${getNotificationStyle(notification.type)}
              border rounded-lg p-4 shadow-lg backdrop-blur-sm
              transform transition-all duration-300 ease-in-out
              animate-slide-in-right
            `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {notification.title}
                </p>
                <p className="text-sm opacity-90">
                  {notification.message}
                </p>
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status indicator bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs opacity-75">
                {isOnline ? 'Online' : 'Offline'} • AP Elite Híbrido
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Função utilitária para adicionar notificações de fora do componente
export const showHybridNotification = (notification) => {
  // Dispatch custom event para componentes externos
  window.dispatchEvent(new CustomEvent('hybridNotification', {
    detail: {
      ...notification,
      id: notification.id || Date.now()
    }
  }));
};

// Hook personalizado para usar notificações
export const useHybridNotifications = () => {
  return {
    showSuccess: (title, message) => showHybridNotification({
      type: 'success',
      title,
      message,
      icon: CheckCircle,
      duration: 3000
    }),
    
    showWarning: (title, message) => showHybridNotification({
      type: 'warning',
      title,
      message,
      icon: AlertTriangle,
      duration: 5000
    }),
    
    showError: (title, message) => showHybridNotification({
      type: 'error',
      title,
      message,
      icon: AlertTriangle,
      duration: 8000
    }),
    
    showInfo: (title, message) => showHybridNotification({
      type: 'info',
      title,
      message,
      icon: Database,
      duration: 4000
    })
  };
};

export default HybridNotifications;