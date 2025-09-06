import { useState, useEffect, useRef } from 'react'
import { Form } from 'react-router-dom'
import { 
  PlusIcon, 
  CameraIcon, 
  MicrophoneIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

// Quick amount buttons for common expenses
const QUICK_AMOUNTS = [5, 10, 15, 20, 25, 50, 100]

// Common expense categories with icons
const EXPENSE_TEMPLATES = [
  { name: 'Coffee', amount: 5, icon: '☕', category: 'food' },
  { name: 'Lunch', amount: 15, icon: '🍽️', category: 'food' },
  { name: 'Gas', amount: 40, icon: '⛽', category: 'transportation' },
  { name: 'Groceries', amount: 80, icon: '🛒', category: 'food' },
  { name: 'Movie', amount: 12, icon: '🎬', category: 'entertainment' },
  { name: 'Parking', amount: 8, icon: '🅿️', category: 'transportation' }
]

export const ResponsiveExpenseForm = ({ 
  budgets = [], 
  onSubmit,
  initialData = {},
  className = ""
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    amount: initialData.amount || '',
    budgetId: initialData.budgetId || '',
    ...initialData
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuickAmounts, setShowQuickAmounts] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  
  const formRef = useRef(null)
  const amountInputRef = useRef(null)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Generate suggestions based on input
  useEffect(() => {
    if (formData.name.length > 2) {
      const filtered = EXPENSE_TEMPLATES.filter(template =>
        template.name.toLowerCase().includes(formData.name.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 3))
    } else {
      setSuggestions([])
    }
  }, [formData.name])
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Expense name is required'
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    
    if (!formData.budgetId) {
      newErrors.budgetId = 'Please select a budget'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  const handleQuickAmount = (amount) => {
    handleInputChange('amount', amount.toString())
    setShowQuickAmounts(false)
    amountInputRef.current?.focus()
  }
  
  const handleTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      amount: template.amount.toString()
    }))
    setShowTemplates(false)
    setSuggestions([])
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`)
      errorElement?.focus()
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit?.(formData)
      // Reset form on success
      setFormData({ name: '', amount: '', budgetId: '' })
      setErrors({})
    } catch (error) {
      setErrors({ submit: 'Failed to add expense. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className={`responsive-form-container ${className}`}>
      <div className="form-wrapper">
        <div className="form-header">
          <h2>Add New Expense</h2>
          <p className="form-subtitle">Track your spending easily</p>
        </div>
        
        {/* Quick Templates */}
        {isMobile && (
          <div className="quick-templates">
            <div className="templates-header">
              <span>Quick Add</span>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="templates-toggle"
              >
                {showTemplates ? 'Hide' : 'Show'} Templates
              </button>
            </div>
            
            {showTemplates && (
              <div className="templates-grid">
                {EXPENSE_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTemplate(template)}
                    className="template-btn"
                  >
                    <span className="template-icon">{template.icon}</span>
                    <span className="template-name">{template.name}</span>
                    <span className="template-amount">${template.amount}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <Form ref={formRef} onSubmit={handleSubmit} className="responsive-form">
          {/* Expense Name */}
          <div className="form-control">
            <label htmlFor="expense-name">
              Expense Name *
            </label>
            <div className="input-wrapper">
              <input
                id="expense-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="What did you spend on?"
                className={errors.name ? 'error' : ''}
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTemplate(suggestion)}
                      className="suggestion-item"
                    >
                      <span className="suggestion-icon">{suggestion.icon}</span>
                      <span className="suggestion-name">{suggestion.name}</span>
                      <span className="suggestion-amount">${suggestion.amount}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.name && (
              <div className="error-message">
                <ExclamationTriangleIcon width={16} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>
          
          {/* Amount */}
          <div className="form-control">
            <label htmlFor="expense-amount">
              Amount *
            </label>
            <div className="amount-input-wrapper">
              <div className="input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  ref={amountInputRef}
                  id="expense-amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={errors.amount ? 'error' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowQuickAmounts(!showQuickAmounts)}
                  className="quick-amounts-toggle"
                  title="Quick amounts"
                >
                  <PlusIcon width={16} />
                </button>
              </div>
              
              {showQuickAmounts && (
                <div className="quick-amounts">
                  {QUICK_AMOUNTS.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmount(amount)}
                      className="quick-amount-btn"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.amount && (
              <div className="error-message">
                <ExclamationTriangleIcon width={16} />
                <span>{errors.amount}</span>
              </div>
            )}
          </div>
          
          {/* Budget Selection */}
          <div className="form-control">
            <label htmlFor="expense-budget">
              Budget Category *
            </label>
            <select
              id="expense-budget"
              name="budgetId"
              value={formData.budgetId}
              onChange={(e) => handleInputChange('budgetId', e.target.value)}
              className={errors.budgetId ? 'error' : ''}
            >
              <option value="">Select a budget</option>
              {budgets.map(budget => (
                <option key={budget.id} value={budget.id}>
                  {budget.name} (${budget.amount - budget.spent} remaining)
                </option>
              ))}
            </select>
            {errors.budgetId && (
              <div className="error-message">
                <ExclamationTriangleIcon width={16} />
                <span>{errors.budgetId}</span>
              </div>
            )}
          </div>
          
          {/* Additional Features for Mobile */}
          {isMobile && (
            <div className="mobile-features">
              <div className="feature-buttons">
                <button
                  type="button"
                  className="feature-btn"
                  onClick={() => alert('Photo capture coming soon!')}
                >
                  <CameraIcon width={20} />
                  <span>Add Photo</span>
                </button>
                
                <button
                  type="button"
                  className="feature-btn"
                  onClick={() => alert('Voice input coming soon!')}
                >
                  <MicrophoneIcon width={20} />
                  <span>Voice Input</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="form-actions">
            {errors.submit && (
              <div className="error-message">
                <ExclamationTriangleIcon width={16} />
                <span>{errors.submit}</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn btn--primary ${isSubmitting ? 'btn--loading' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <CheckIcon width={20} />
                  <span>Add Expense</span>
                </>
              )}
            </button>
          </div>
        </Form>
        
        {/* Form Tips */}
        <div className="form-tips">
          <div className="tip-item">
            <InformationCircleIcon width={16} />
            <span>Tip: Use quick templates for faster entry</span>
          </div>
          {isMobile && (
            <div className="tip-item">
              <InformationCircleIcon width={16} />
              <span>Swipe left on expenses to edit or delete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ResponsiveBudgetForm = ({ 
  onSubmit,
  initialData = {},
  className = ""
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    amount: initialData.amount || '',
    category: initialData.category || '',
    ...initialData
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required'
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      await onSubmit?.(formData)
      setFormData({ name: '', amount: '', category: '' })
      setErrors({})
    } catch (error) {
      setErrors({ submit: 'Failed to create budget. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className={`responsive-form-container ${className}`}>
      <div className="form-wrapper">
        <div className="form-header">
          <h2>Create New Budget</h2>
          <p className="form-subtitle">Set spending limits for your categories</p>
        </div>
        
        <Form onSubmit={handleSubmit} className="responsive-form">
          <div className="form-control">
            <label htmlFor="budget-name">Budget Name *</label>
            <input
              id="budget-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Groceries, Entertainment"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <div className="error-message">
                <ExclamationTriangleIcon width={16} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>
          
          <div className="form-control">
            <label htmlFor="budget-amount">Budget Amount *</label>
            <div className="input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                id="budget-amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.amount ? 'error' : ''}
              />
            </div>
            {errors.amount && (
              <div className="error-message">
                <ExclamationTriangleIcon width={16} />
                <span>{errors.amount}</span>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn btn--primary ${isSubmitting ? 'btn--loading' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckIcon width={20} />
                  <span>Create Budget</span>
                </>
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default ResponsiveExpenseForm