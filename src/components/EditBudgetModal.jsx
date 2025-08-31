import React, { useState, useEffect } from 'react';
import { useFetcher } from 'react-router-dom';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const EditBudgetModal = ({ budget, isOpen, onClose }) => {
  const fetcher = useFetcher();
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    amount: budget?.amount || ''
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount
      });
    }
  }, [budget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetcher.submit({
      _action: 'updateBudget',
      budgetId: budget.id,
      budgetName: formData.name,
      budgetAmount: formData.amount
    }, { method: 'post' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>✏️ Edit Budget</h3>
          <button className="edit-modal-close" onClick={onClose}>
            <XMarkIcon width={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="edit-form-group">
            <label htmlFor="budgetName">Budget Name</label>
            <input
              type="text"
              id="budgetName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              required
              autoFocus
            />
          </div>
          
          <div className="edit-form-group">
            <label htmlFor="budgetAmount">Budget Amount</label>
            <input
              type="number"
              id="budgetAmount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="edit-modal-actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--dark">
              <CheckIcon width={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBudgetModal;