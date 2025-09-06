import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import QuickExpenseForm from './QuickExpenseForm';

const FloatingActionButton = ({ budgets }) => {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && event.target === overlayRef.current) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <>
      <button 
        className="fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick add expense"
      >
        {isOpen ? <XMarkIcon width={24} /> : <PlusIcon width={24} />}
      </button>
      
      {isOpen && (
        <div className="fab-overlay" ref={overlayRef}>
          <div className="fab-content">
            <QuickExpenseForm 
              budgets={budgets} 
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingActionButton;