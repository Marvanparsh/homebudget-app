import React, { useState } from 'react';
import { useFetcher } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/outline';
import SmartInput from './SmartInput';

const QuickExpenseForm = ({ budgets, onClose }) => {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="quick-expense-form">
        <h3>Quick Add Expense</h3>
        <p>No budgets available. Please create a budget first.</p>
        <button onClick={onClose} className="btn btn--dark">Close</button>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    budgetId: budgets[0]?.id || ''
  });
  
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formDataObj = new FormData();
    formDataObj.append('_action', 'createExpense');
    formDataObj.append('newExpense', formData.name);
    formDataObj.append('newExpenseAmount', formData.amount);
    formDataObj.append('newExpenseBudget', formData.budgetId);
    
    fetcher.submit(formDataObj, { method: 'post' });
    
    // Reset form and close
    setFormData({ name: '', amount: '', budgetId: budgets[0]?.id || '' });
    setTimeout(() => onClose(), 1000);
  };
  
  // Quick expense templates
  const quickTemplates = [
    { name: 'Coffee', amount: 5, icon: '☕' },
    { name: 'Lunch', amount: 12, icon: '🍽️' },
    { name: 'Gas', amount: 40, icon: '⛽' },
    { name: 'Groceries', amount: 50, icon: '🛒' }
  ];
  
  const useTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      amount: template.amount.toString()
    }));
  };
  
  return (
    <div className="quick-expense-form">
      <h3>Quick Add Expense</h3>
      
      <div className="quick-templates">
        {quickTemplates.map((template, index) => (
          <button
            key={index}
            type="button"
            className="template-btn"
            onClick={() => useTemplate(template)}
          >
            <span className="template-icon">{template.icon}</span>
            <span className="template-name">{template.name}</span>
            <span className="template-amount">${template.amount}</span>
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="quick-form">
        <SmartInput
          name="name"
          placeholder="Expense name"
          value={formData.name}
          onChange={handleChange}
          enableVoice={true}
          enableAutoComplete={true}
          required
        />
        
        <SmartInput
          type="number"
          step="0.01"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          showQuickAmounts={true}
          required
        />
        
        <select
          name="budgetId"
          value={formData.budgetId}
          onChange={handleChange}
          required
        >
          {budgets.map(budget => (
            <option key={budget.id} value={budget.id}>
              {budget.name}
            </option>
          ))}
        </select>
        
        <button 
          type="submit" 
          className={`btn btn--dark ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          <CheckIcon width={16} />
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default QuickExpenseForm;