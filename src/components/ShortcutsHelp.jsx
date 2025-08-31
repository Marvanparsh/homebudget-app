import React, { useState } from 'react';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';

const ShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        className="shortcuts-trigger"
        onClick={() => setIsOpen(true)}
        title="Keyboard shortcuts (Ctrl+/)"
      >
        <QuestionMarkCircleIcon width={20} />
      </button>
      
      {isOpen && (
        <div className="shortcuts-modal">
          <div className="shortcuts-content">
            <div className="shortcuts-header">
              <h3>Keyboard Shortcuts</h3>
              <button onClick={() => setIsOpen(false)}>
                <XMarkIcon width={20} />
              </button>
            </div>
            
            <div className="shortcuts-list">
              {Object.entries(SHORTCUTS).map(([key, description]) => (
                <div key={key} className="shortcut-item">
                  <kbd className="shortcut-key">{key}</kbd>
                  <span className="shortcut-desc">{description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShortcutsHelp;