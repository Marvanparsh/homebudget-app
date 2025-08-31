// reacts
import { useEffect, useRef, useState } from "react";

// rrd imports
import { Form, useFetcher } from "react-router-dom"

// library imports

// helpers
import { BUDGET_CATEGORIES, fetchUserData } from "../helpers"

// components
import SmartInput from "./SmartInput"

const AddBudgetForm = () => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting"
  const [formData, setFormData] = useState({ name: '', amount: '' });
  const [errors, setErrors] = useState({});

  const formRef = useRef();
  const focusRef = useRef();
  
  const validateForm = () => {
    const newErrors = {};
    const existingBudgets = fetchUserData("budgets") ?? [];
    
    // Name validation
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Budget name is required";
    } else if (existingBudgets.find(budget => 
      budget.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    )) {
      newErrors.name = "A budget with this name already exists";
    }
    
    // Amount validation
    if (!formData.amount || +formData.amount <= 0) {
      newErrors.amount = "Budget amount must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    if (!validateForm()) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!isSubmitting) {
      setFormData({ name: '', amount: '' });
      setErrors({});
      formRef.current?.reset()
      focusRef.current?.focus()
    }
  }, [isSubmitting])

  return (
    <div className="form-wrapper" data-tutorial="budget-form">
      <h2 className="h3">
        Create budget
      </h2>
      <fetcher.Form
        method="post"
        className="grid-sm"
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <div className="grid-xs">
          <label htmlFor="newBudget">Budget Name</label>
          <SmartInput
            name="name"
            id="newBudget"
            placeholder="e.g., Groceries"
            value={formData.name}
            onChange={handleInputChange}
            enableVoice={true}
            required
            ref={focusRef}
            className={errors.name ? 'error' : ''}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <span className="error-message" id="name-error" role="alert">
              ⚠️ {errors.name}
            </span>
          )}
          <input type="hidden" name="newBudget" value={formData.name} />
        </div>
        <div className="grid-xs">
          <label htmlFor="newBudgetAmount">Amount</label>
          <SmartInput
            type="number"
            step="0.01"
            name="amount"
            id="newBudgetAmount"
            placeholder="e.g., ₹350"
            value={formData.amount}
            onChange={handleInputChange}
            showQuickAmounts={true}
            inputMode="decimal"
            required
            className={errors.amount ? 'error' : ''}
            aria-invalid={errors.amount ? 'true' : 'false'}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
          />
          {errors.amount && (
            <span className="error-message" id="amount-error" role="alert">
              ⚠️ {errors.amount}
            </span>
          )}
          <input type="hidden" name="newBudgetAmount" value={formData.amount} />
        </div>
        <div className="grid-xs">
          <label htmlFor="newBudgetCategory">Category</label>
          <select name="newBudgetCategory" id="newBudgetCategory" required>
            {BUDGET_CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
        <input type="hidden" name="_action" value="createBudget" />
        <button 
          type="submit" 
          className={`btn btn--dark ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
          style={{
            width: '100%',
            minHeight: '48px',
            fontSize: 'var(--fs-300)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-xs)',
            touchAction: 'manipulation'
          }}
        >
          {
            isSubmitting ? (
              <>
                <span>Creating Budget…</span>
                <div className="spinner" style={{width: '16px', height: '16px', borderWidth: '2px'}}></div>
              </>
            ) : (
              <>
                <span>Create Budget</span>
                <span style={{
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}>₹</span>
              </>
            )
          }
        </button>
      </fetcher.Form>
    </div>
  )
}
export default AddBudgetForm