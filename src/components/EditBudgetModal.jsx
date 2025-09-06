import React, { useState, useEffect } from 'react';
import { useFetcher } from 'react-router-dom';
import { XMarkIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { fetchUserData } from '../helpers';

const EditBudgetModal = ({ budget, isOpen, onClose }) => {
  const fetcher = useFetcher();
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    amount: budget?.amount || ''
  });
  const [errors, setErrors] = useState({});
  const [showMergeWarning, setShowMergeWarning] = useState(false);

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount
      });
    }
  }, [budget]);

  useEffect(() => {
    // Check if changing name would cause a merge
    if (budget && formData.name.trim() && formData.name.trim() !== budget.name) {
      const existingBudgets = fetchUserData("budgets") ?? [];
      const duplicateBudget = existingBudgets.find(
        b => b.id !== budget.id && b.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
      setShowMergeWarning(!!duplicateBudget);
    } else {
      setShowMergeWarning(false);
    }
  }, [formData.name, budget]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Budget name is required";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Budget name must be 50 characters or less";
    }
    
    if (!formData.amount || +formData.amount <= 0) {
      newErrors.amount = "Budget amount must be greater than 0";
    } else if (+formData.amount > 10000000) {
      newErrors.amount = "Budget amount cannot exceed ₹1,00,00,000";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    fetcher.submit({
      _action: 'updateBudget',
      budgetId: budget.id,
      budgetName: formData.name.trim(),
      budgetAmount: formData.amount
    }, { method: 'post' });
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
              onChange={(e) => handleInputChange('name', e.target.value)}
              maxLength={50}
              required
              autoFocus
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <span className="error-message" role="alert">
                ⚠️ {errors.name}
              </span>
            )}
            {showMergeWarning && (
              <div className="merge-warning">
                <InformationCircleIcon width={16} />
                <span>This will merge with an existing budget of the same name</span>
              </div>
            )}
          </div>
          
          <div className="edit-form-group">
            <label htmlFor="budgetAmount">Budget Amount</label>
            <input
              type="number"
              id="budgetAmount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              step="0.01"
              min="0.01"
              max="10000000"
              required
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && (
              <span className="error-message" role="alert">
                ⚠️ {errors.amount}
              </span>
            )}
          </div>
          
          <div className="edit-modal-actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--dark">
              <CheckIcon width={16} />
              {showMergeWarning ? 'Merge Budgets' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBudgetModal;