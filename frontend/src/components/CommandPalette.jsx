"""Command Palette - Busca Rápida Global - Elite Athena"""
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/elite-gravitas.css';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const commands = [
    { id: 'evidence', name: 'Evidence Vault', path: '/athena/evidence-vault', icon: '🔐', category: 'Perícia' },
    { id: 'seal', name: 'Elite Seal', path: '/athena/elite-seal', icon: '🔒', category: 'Perícia' },
    { id: 'transcription', name: 'Transcrição VFT', path: '/athena/transcription-vft', icon: '🎤', category: 'Diversos' },
    { id: 'calc', name: 'Calculadoras', path: '/athena/calculadoras', icon: '🧮', category: 'Diversos' },
    { id: 'processes', name: 'Processos', path: '/athena/processes', icon: '⚖️', category: 'Advocacia' },
    { id: 'clients', name: 'Clientes', path: '/athena/clients', icon: '👥', category: 'Advocacia' },
    { id: 'storage', name: 'Storage Config', path: '/athena/storage-config', icon: '☁️', category: 'Admin' },
    { id: 'portal', name: 'Portal Cliente', path: '/athena/portal-cliente', icon: '👤', category: 'Admin' },
    { id: 'analytics', name: 'Analytics', path: '/athena/analytics', icon: '📊', category: 'Admin' },
    { id: 'marketplace', name: 'Marketplace', path: '/athena/marketplace', icon: '🔌', category: 'Admin' },
    { id: 'chat', name: 'Chat EliteLex', path: '/athena/chat-elitelex', icon: '🧠', category: 'IA' }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCommands = search
    ? commands.filter(cmd => 
        cmd.name.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center pt-20 z-50 p-6">
      <div className="cipher-glass-strong max-w-2xl w-full p-6">
        <div className="mb-4">
          <input
            type="text"
            className="input-elite text-lg"
            placeholder="🔍 Buscar módulos, ferramentas, processos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-[500px] overflow-y-auto space-y-2">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12 text-elite-metal">
              Nenhum resultado encontrado
            </div>
          ) : (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleSelect(cmd.path)}
                className="w-full p-4 bg-surface-01 hover:bg-surface-02 rounded-lg transition-all text-left border border-transparent hover:border-elite-accent"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{cmd.icon}</div>
                  <div className="flex-1">
                    <div className="text-elite-text font-semibold">{cmd.name}</div>
                    <div className="text-elite-metal text-xs">{cmd.category}</div>
                  </div>
                  <div className="text-elite-accent text-xl">→</div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-elite-metal">
          Pressione <kbd className="px-2 py-1 bg-surface-02 rounded text-elite-accent">ESC</kbd> para fechar
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
