// react imports
import { useEffect, useRef, useState } from "react"

// rrd imports
import { useFetcher } from "react-router-dom"

// library imports
import { PlusCircleIcon } from "@heroicons/react/24/solid"

// components
import SmartInput from "./SmartInput"

// styles
import "../quick-templates.css"

const AddExpenseForm = ({ budgets }) => {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state === "submitting";
  const [formData, setFormData] = useState({ name: '', amount: '' });

  const formRef = useRef()
  const focusRef = useRef()
  
  const quickTemplates = [
    { name: 'Coffee', amount: 150, icon: '☕' },
    { name: 'Lunch', amount: 300, icon: '🍽️' },
    { name: 'Petrol', amount: 1000, icon: '⛽' },
    { name: 'Groceries', amount: 2000, icon: '🛒' }
  ];
  
  const useTemplate = (template) => {
    setFormData({ name: template.name, amount: template.amount.toString() });
  };
  
  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  useEffect(() => {
    if (!isSubmitting) {
      // clear form
      setFormData({ name: '', amount: '' });
      formRef.current?.reset()
      // reset focus
      focusRef.current?.focus()
    }
  }, [isSubmitting])

  return (
    <div className="form-wrapper" data-tutorial="expense-form">
      <h2 className="h3">Add New{" "}<span className="accent">
        {budgets.length === 1 && budgets[0]?.name}
      </span>{" "}
        Expense
      </h2>
      
      <div className="quick-templates">
        {quickTemplates.map((template, index) => (
          <button
            key={index}
            type="button"
            className="template-btn"
            onClick={() => useTemplate(template)}
          >
            <div className="template-content">
              <span className="template-icon">{template.icon}</span>
              <span className="template-name">{template.name}</span>
              <small className="template-amount">₹{template.amount}</small>
            </div>
          </button>
        ))}
      </div>
      <fetcher.Form
        method="post"
        className="grid-sm"
        ref={formRef}
      >
        <div className="expense-inputs">
          <div className="grid-xs">
            <label htmlFor="newExpense">Expense Name</label>
            <SmartInput
              name="name"
              id="newExpense"
              placeholder="e.g., Coffee"
              value={formData.name}
              onChange={handleInputChange}
              enableVoice={true}
              enableAutoComplete={true}
              required
            />
            <input type="hidden" name="newExpense" value={formData.name} />
          </div>
          <div className="grid-xs">
            <label htmlFor="newExpenseAmount">Amount</label>
            <SmartInput
              type="number"
              step="0.01"
              inputMode="decimal"
              name="amount"
              id="newExpenseAmount"
              placeholder="e.g., ₹150"
              value={formData.amount}
              onChange={handleInputChange}
              showQuickAmounts={true}
              required
            />
            <input type="hidden" name="newExpenseAmount" value={formData.amount} />
          </div>
        </div>
        <div className="grid-xs" hidden={budgets.length === 1}>
          <label htmlFor="newExpenseBudget">Budget Category</label>
          <select name="newExpenseBudget" id="newExpenseBudget" required>
            {
              budgets
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((budget) => {
                  return (
                    <option key={budget.id} value={budget.id}>
                      {budget.name}
                    </option>
                  )
                })
            }
          </select>
        </div>
        <input type="hidden" name="_action" value="createExpense" />
        <button type="submit" className="btn btn--dark" disabled={isSubmitting}>
          {
            isSubmitting ? <span>Submitting…</span> : (
              <>
                <span>Add Expense</span>
                <PlusCircleIcon width={20} />
              </>
            )
          }
        </button>
      </fetcher.Form>
    </div>
  )
}
export default AddExpenseForm