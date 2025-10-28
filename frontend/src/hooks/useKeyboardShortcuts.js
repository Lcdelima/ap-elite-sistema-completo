import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const shortcuts = {
  // Navigation
  'ctrl+h': '/admin',
  'ctrl+d': '/athena/unified-dashboard',
  'ctrl+u': '/athena/user-management',
  'ctrl+p': '/athena/processes',
  'ctrl+c': '/athena/clients-enhanced',
  'ctrl+f': '/athena/financial',
  
  // Actions
  'ctrl+k': 'search',
  'ctrl+n': 'new',
  '?': 'help'
};

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Build shortcut string
      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('ctrl');
      if (e.shiftKey) keys.push('shift');
      if (e.altKey) keys.push('alt');
      if (e.key && e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
        keys.push(e.key.toLowerCase());
      }
      
      const shortcut = keys.join('+');
      
      // Check if shortcut exists
      if (shortcuts[shortcut]) {
        e.preventDefault();
        
        const action = shortcuts[shortcut];
        
        // Handle navigation
        if (action.startsWith('/')) {
          navigate(action);
        }
        
        // Handle actions
        else if (action === 'search') {
          const searchInput = document.querySelector('[data-search-input]');
          if (searchInput) searchInput.focus();
        }
        else if (action === 'new') {
          const newButton = document.querySelector('[data-new-button]');
          if (newButton) newButton.click();
        }
        else if (action === 'help') {
          // Show keyboard shortcuts modal
          const event = new CustomEvent('show-shortcuts');
          window.dispatchEvent(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return { shortcuts };
};