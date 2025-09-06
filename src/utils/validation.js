// Validation utilities for budget app

export const validateBudgetName = (name) => {
  const errors = [];
  
  if (!name || name.trim().length === 0) {
    errors.push("Budget name is required");
  } else if (name.trim().length > 50) {
    errors.push("Budget name must be 50 characters or less");
  } else if (name.trim().length < 2) {
    errors.push("Budget name must be at least 2 characters");
  }
  
  return errors;
};

export const validateBudgetAmount = (amount) => {
  const errors = [];
  const numAmount = +amount;
  
  if (!amount || amount.toString().trim().length === 0) {
    errors.push("Budget amount is required");
  } else if (isNaN(numAmount) || numAmount <= 0) {
    errors.push("Budget amount must be a positive number");
  } else if (numAmount > 10000000) {
    errors.push("Budget amount cannot exceed ₹1,00,00,000");
  } else if (numAmount < 0.01) {
    errors.push("Budget amount must be at least ₹0.01");
  }
  
  return errors;
};

export const validateExpenseName = (name) => {
  const errors = [];
  
  if (!name || name.trim().length === 0) {
    errors.push("Expense name is required");
  } else if (name.trim().length > 100) {
    errors.push("Expense name must be 100 characters or less");
  } else if (name.trim().length < 2) {
    errors.push("Expense name must be at least 2 characters");
  }
  
  return errors;
};

export const validateExpenseAmount = (amount) => {
  const errors = [];
  const numAmount = +amount;
  
  if (!amount || amount.toString().trim().length === 0) {
    errors.push("Expense amount is required");
  } else if (isNaN(numAmount) || numAmount <= 0) {
    errors.push("Expense amount must be a positive number");
  } else if (numAmount > 1000000) {
    errors.push("Expense amount cannot exceed ₹10,00,000");
  } else if (numAmount < 0.01) {
    errors.push("Expense amount must be at least ₹0.01");
  }
  
  return errors;
};

export const validateBudgetId = (budgetId, budgets = []) => {
  const errors = [];
  
  if (!budgetId) {
    errors.push("Please select a budget");
  } else if (!budgets.find(b => b.id === budgetId)) {
    errors.push("Selected budget does not exist");
  }
  
  return errors;
};

// Comprehensive form validation
export const validateBudgetForm = (formData, existingBudgets = []) => {
  const errors = {};
  
  const nameErrors = validateBudgetName(formData.name);
  if (nameErrors.length > 0) {
    errors.name = nameErrors[0];
  }
  
  const amountErrors = validateBudgetAmount(formData.amount);
  if (amountErrors.length > 0) {
    errors.amount = amountErrors[0];
  }
  
  return errors;
};

export const validateExpenseForm = (formData, budgets = []) => {
  const errors = {};
  
  const nameErrors = validateExpenseName(formData.name);
  if (nameErrors.length > 0) {
    errors.name = nameErrors[0];
  }
  
  const amountErrors = validateExpenseAmount(formData.amount);
  if (amountErrors.length > 0) {
    errors.amount = amountErrors[0];
  }
  
  const budgetErrors = validateBudgetId(formData.budgetId, budgets);
  if (budgetErrors.length > 0) {
    errors.budgetId = budgetErrors[0];
  }
  
  return errors;
};

// Check if budget names would merge
export const checkBudgetMerge = (name, existingBudgets = [], excludeId = null) => {
  if (!name || !name.trim()) return null;
  
  const trimmedName = name.trim().toLowerCase();
  const existingBudget = existingBudgets.find(
    budget => budget.id !== excludeId && budget.name.toLowerCase() === trimmedName
  );
  
  return existingBudget || null;
};

// Sanitize input strings
export const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Format validation errors for display
export const formatValidationError = (error) => {
  return `⚠️ ${error}`;
};

// Check if form has any errors
export const hasValidationErrors = (errors) => {
  return Object.keys(errors).some(key => errors[key] && errors[key].length > 0);
};