import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import QuickExpenseForm from './QuickExpenseForm';

const FloatingActionButton = ({ budgets }) => {
  const [isOpen, setIsOpen] = useState(false);
  
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
        <div className="fab-overlay">
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