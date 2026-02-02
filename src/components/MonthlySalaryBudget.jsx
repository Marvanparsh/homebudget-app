import { useState, useRef, useEffect } from "react";
import { useFetcher } from "react-router-dom";
import { BUDGET_CATEGORIES } from "../helpers";
import SmartInput from "./SmartInput";

const MonthlySalaryBudget = () => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const formRef = useRef();
  
  const [salaryAmount, setSalaryAmount] = useState('');
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [allocations, setAllocations] = useState(
    BUDGET_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {})
  );
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [createSavingsBudget, setCreateSavingsBudget] = useState(true);
  const [errors, setErrors] = useState({});

  const allCategories = [...BUDGET_CATEGORIES, ...customCategories];
  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + Number(val || 0), 0);
  const remaining = Number(salaryAmount || 0) - totalAllocated;

  const validateForm = () => {
    const newErrors = {};
    
    if (!salaryAmount || Number(salaryAmount) <= 0) {
      newErrors.salary = "Salary amount must be greater than 0";
    }
    
    if (remaining < 0) {
      newErrors.allocation = `Over-allocated by ₹${Math.abs(remaining)}. Please reduce allocations.`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAllocationChange = (categoryId, value) => {
    const numValue = Number(value || 0);
    setAllocations(prev => ({ ...prev, [categoryId]: numValue }));
    
    if (errors.allocation) {
      setErrors(prev => ({ ...prev, allocation: '' }));
    }
  };

  const smartAutoAllocate = () => {
    if (remaining <= 0) return;
    
    // Get categories that user hasn't allocated to (value is 0 or empty)
    const unallocatedCategories = Object.entries(allocations)
      .filter(([_, value]) => !value || Number(value) === 0)
      .map(([categoryId]) => categoryId);
    
    if (unallocatedCategories.length === 0) return;
    
    const perCategory = Math.floor(remaining / unallocatedCategories.length);
    const remainder = remaining % unallocatedCategories.length;
    
    const newAllocations = { ...allocations };
    
    unallocatedCategories.forEach((catId, index) => {
      newAllocations[catId] = perCategory + (index === 0 ? remainder : 0);
    });
    
    setAllocations(newAllocations);
  };

  const addCustomCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const categoryId = newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newCategory = {
      id: categoryId,
      name: newCategoryName.trim(),
      icon: "📝",
      isCustom: true
    };
    
    setCustomCategories(prev => [...prev, newCategory]);
    setAllocations(prev => ({ ...prev, [categoryId]: 0 }));
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const removeCustomCategory = (categoryId) => {
    setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setAllocations(prev => {
      const newAllocations = { ...prev };
      delete newAllocations[categoryId];
      return newAllocations;
    });
  };

  const handleSubmit = (e) => {
    if (!validateForm()) {
      e.preventDefault();
      return;
    }
  };

  useEffect(() => {
    if (!isSubmitting) {
      setSalaryAmount('');
      setAllocations(BUDGET_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {}));
      setCustomCategories([]);
      setErrors({});
      try {
        formRef.current?.reset();
      } catch (error) {
        console.warn('Form reset failed:', error);
      }
    }
  }, [isSubmitting]);

  return (
    <div className="form-wrapper monthly-salary-budget">
      <h2 className="h3">Create Monthly Salary Budget</h2>
      <p className="form-description">
        Allocate your monthly salary across different spending categories
      </p>
      
      <fetcher.Form
        method="post"
        className="grid-sm"
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <div className="salary-inputs">
          <div className="grid-xs">
            <label htmlFor="monthYear">Month & Year</label>
            <input
              type="month"
              name="monthYear"
              id="monthYear"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              required
            />
          </div>
          
          <div className="grid-xs">
            <label htmlFor="salaryAmount">Monthly Salary</label>
            <SmartInput
              type="number"
              step="0.01"
              name="salaryAmount"
              id="salaryAmount"
              placeholder="e.g., ₹50,000"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              showQuickAmounts={true}
              required
              className={errors.salary ? 'error' : ''}
            />
            {errors.salary && (
              <span className="error-message">⚠️ {errors.salary}</span>
            )}
          </div>
        </div>

        {salaryAmount && Number(salaryAmount) > 0 && (
          <div className="allocation-section">
            <div className="allocation-header">
              <h3>Allocate to Categories</h3>
              <div className="allocation-summary">
                <span className="total">Total: ₹{Number(salaryAmount).toLocaleString()}</span>
                <span className="allocated">Allocated: ₹{totalAllocated.toLocaleString()}</span>
                <span className={`remaining ${remaining < 0 ? 'over' : remaining > 0 ? 'under' : 'exact'}`}>
                  {remaining > 0 ? `Remaining: ₹${remaining.toLocaleString()}` : 
                   remaining < 0 ? `Over: ₹${Math.abs(remaining).toLocaleString()}` : 
                   'Perfect! ✅'}
                </span>
              </div>
              <div className="allocation-actions">
                {remaining > 0 && (
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={smartAutoAllocate}
                  >
                    Smart Auto-allocate
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                >
                  + Add Category
                </button>
              </div>
            </div>
            
            {showAddCategory && (
              <div className="add-category-form">
                <div className="add-category-inputs">
                  <SmartInput
                    type="text"
                    placeholder="Category name (e.g., Investment)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                  />
                  <button type="button" className="btn btn--dark" onClick={addCustomCategory}>
                    Add
                  </button>
                  <button type="button" className="btn btn--outline" onClick={() => setShowAddCategory(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="category-allocations">
              {allCategories.map(category => (
                <div key={category.id} className="allocation-item">
                  <label htmlFor={`allocation-${category.id}`}>
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                    {category.isCustom && (
                      <button
                        type="button"
                        className="remove-category"
                        onClick={() => removeCustomCategory(category.id)}
                        title="Remove category"
                      >
                        ✕
                      </button>
                    )}
                  </label>
                  <SmartInput
                    type="number"
                    step="0.01"
                    name={`allocation-${category.id}`}
                    id={`allocation-${category.id}`}
                    placeholder="₹0"
                    value={allocations[category.id] || ''}
                    onChange={(e) => handleAllocationChange(category.id, e.target.value)}
                    showQuickAmounts={true}
                  />
                  <input type="hidden" name={`allocation_${category.id}`} value={allocations[category.id] || 0} />
                </div>
              ))}
            </div>
            
            {remaining > 0 && (
              <div className="savings-option">
                <label className="savings-checkbox">
                  <input
                    type="checkbox"
                    checked={createSavingsBudget}
                    onChange={(e) => setCreateSavingsBudget(e.target.checked)}
                  />
                  <span>Create "Savings" budget for remaining ₹{remaining.toLocaleString()}</span>
                </label>
              </div>
            )}
            
            {errors.allocation && (
              <span className="error-message allocation-error">⚠️ {errors.allocation}</span>
            )}
          </div>
        )}

        <input type="hidden" name="_action" value="createMonthlySalaryBudget" />
        <input type="hidden" name="monthYear" value={monthYear} />
        <input type="hidden" name="totalSalary" value={salaryAmount} />
        <input type="hidden" name="createSavings" value={createSavingsBudget} />
        <input type="hidden" name="customCategories" value={JSON.stringify(customCategories)} />
        
        <button
          type="submit"
          className={`btn btn--dark ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting || !salaryAmount || remaining < 0}
        >
          {isSubmitting ? (
            <>
              <span>Creating Budget...</span>
              <div className="spinner"></div>
            </>
          ) : (
            <>
              <span>Create Monthly Budget</span>
              <span>💰</span>
            </>
          )}
        </button>
      </fetcher.Form>
    </div>
  );
};

export default MonthlySalaryBudget;