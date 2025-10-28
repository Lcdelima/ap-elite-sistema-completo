import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

const KeyboardShortcutsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    window.addEventListener('show-shortcuts', handleShow);
    return () => window.removeEventListener('show-shortcuts', handleShow);
  }, []);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navegação',
      shortcuts: [
        { keys: ['Ctrl', 'H'], description: 'Ir para Home' },
        { keys: ['Ctrl', 'D'], description: 'Dashboard Unificado' },
        { keys: ['Ctrl', 'U'], description: 'Usuários' },
        { keys: ['Ctrl', 'P'], description: 'Processos' },
        { keys: ['Ctrl', 'C'], description: 'Clientes' },
        { keys: ['Ctrl', 'F'], description: 'Financeiro' },
      ]
    },
    {
      title: 'Ações',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Buscar' },
        { keys: ['Ctrl', 'N'], description: 'Novo item' },
        { keys: ['?'], description: 'Ajuda / Atalhos' },
        { keys: ['Esc'], description: 'Fechar modal' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Atalhos de Teclado
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {shortcutGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.shortcuts.map((shortcut, sidx) => (
                  <div key={sidx} className="flex items-center justify-between py-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, kidx) => (
                        <kbd
                          key={kidx}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-gray-900 dark:text-white"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pressione <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">?</kbd> a qualquer momento para ver os atalhos
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;