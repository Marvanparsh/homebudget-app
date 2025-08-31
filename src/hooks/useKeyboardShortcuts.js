import React, { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;
      
      const shortcutKey = `${ctrl ? 'ctrl+' : ''}${shift ? 'shift+' : ''}${alt ? 'alt+' : ''}${key}`;
      
      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Common shortcuts
export const SHORTCUTS = {
  'ctrl+n': 'New Expense',
  'ctrl+b': 'New Budget', 
  'ctrl+e': 'Export Data',
  'ctrl+i': 'Import Data',
  'ctrl+/': 'Show Shortcuts',
  'escape': 'Close Modal'
};