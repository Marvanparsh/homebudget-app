export const waait = () =>
  new Promise((res) => setTimeout(res, Math.random() * 800));

// colors
const generateRandomColor = () => {
  const existingBudgetLength = fetchUserData("budgets")?.length ?? 0;
  return `${existingBudgetLength * 34} 65% 50%`;
};

// Local storage
export const fetchData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error parsing data for key "${key}":`, error);
    return null;
  }
};

// Get user-specific data
export const fetchUserData = (key) => {
  try {
    const currentUser = fetchData('currentUser');
    if (!currentUser) return null;
    
    const userKey = `${key}_${currentUser.id}`;
    const data = localStorage.getItem(userKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error parsing user data for key "${encodeURIComponent(key)}":`, error);
    return null;
  }
};

// Set user-specific data
export const setUserData = (key, data) => {
  try {
    const currentUser = fetchData('currentUser');
    if (!currentUser) return false;
    
    const userKey = `${key}_${currentUser.id}`;
    localStorage.setItem(userKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error setting user data for key "${encodeURIComponent(key)}":`, error);
    return false;
  }
};

// Get all items from local storage
export const getAllMatchingItems = ({ category, key, value }) => {
  const data = fetchUserData(category) ?? [];
  return data.filter((item) => item[key] === value);
};

// delete item from local storage
export const deleteItem = ({ key, id }) => {
  try {
    const existingData = fetchUserData(key);
    if (id && existingData) {
      // Additional validation for budget deletion
      if (key === "budgets") {
        const expenses = fetchUserData("expenses") ?? [];
        const budgetExpenses = expenses.filter(expense => expense.budgetId === id);
        if (budgetExpenses.length > 0) {
          throw new Error("Cannot delete budget with existing expenses. Please delete all expenses first.");
        }
      }
      
      const newData = existingData.filter((item) => item.id !== id);
      return setUserData(key, newData);
    }
    return setUserData(key, null);
  } catch (error) {
    console.error(`Error deleting item:`, error);
    throw new Error(`Failed to delete item: ${error.message}`);
  }
};

// create budget
export const createBudget = ({ name, amount, category = "other" }) => {
  // Validation
  if (!name || name.trim().length === 0) {
    throw new Error("Budget name is required");
  }
  
  if (!amount || +amount <= 0) {
    throw new Error("Budget amount must be greater than 0");
  }
  
  const existingBudgets = fetchUserData("budgets") ?? [];
  const trimmedName = name.trim();
  
  // Check if budget with same name exists (case-insensitive)
  const existingBudget = existingBudgets.find(
    budget => budget.name.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (existingBudget) {
    // Merge with existing budget by adding amounts
    const updatedBudgets = existingBudgets.map(budget => 
      budget.id === existingBudget.id 
        ? { ...budget, amount: budget.amount + (+amount) }
        : budget
    );
    return setUserData("budgets", updatedBudgets);
  }
  
  // Create new budget if no duplicate found
  const newItem = {
    id: crypto.randomUUID(),
    name: trimmedName,
    createdAt: Date.now(),
    amount: +amount,
    category,
    color: generateRandomColor(),
  };
  
  return setUserData("budgets", [...existingBudgets, newItem]);
};

// update budget
export const updateBudget = ({ id, name, amount }) => {
  // Validation
  if (!name || name.trim().length === 0) {
    throw new Error("Budget name is required");
  }
  
  if (!amount || +amount <= 0) {
    throw new Error("Budget amount must be greater than 0");
  }
  
  const existingBudgets = fetchUserData("budgets") ?? [];
  const trimmedName = name.trim();
  const currentBudget = existingBudgets.find(budget => budget.id === id);
  
  if (!currentBudget) {
    throw new Error("Budget not found");
  }
  
  // Check if another budget with same name exists (excluding current budget)
  const duplicateBudget = existingBudgets.find(
    budget => budget.id !== id && budget.name.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (duplicateBudget) {
    // Merge budgets: add current budget's amount to duplicate, then remove current
    const expenses = fetchUserData("expenses") ?? [];
    
    // Update expenses to point to the duplicate budget
    const updatedExpenses = expenses.map(expense => 
      expense.budgetId === id ? { ...expense, budgetId: duplicateBudget.id } : expense
    );
    setUserData("expenses", updatedExpenses);
    
    // Merge amounts and remove current budget
    const updatedBudgets = existingBudgets
      .map(budget => 
        budget.id === duplicateBudget.id 
          ? { ...budget, amount: budget.amount + (+amount) }
          : budget
      )
      .filter(budget => budget.id !== id);
    
    return setUserData("budgets", updatedBudgets);
  }
  
  // No duplicate found, just update the current budget
  const updatedBudgets = existingBudgets.map(budget => 
    budget.id === id ? { ...budget, name: trimmedName, amount: +amount } : budget
  );
  return setUserData("budgets", updatedBudgets);
};

// create expense
export const createExpense = ({ name, amount, budgetId }) => {
  // Validation
  if (!name || name.trim().length === 0) {
    throw new Error("Expense name is required");
  }
  
  if (!amount || +amount <= 0) {
    throw new Error("Expense amount must be greater than 0");
  }
  
  if (!budgetId) {
    throw new Error("Please select a budget for this expense");
  }
  
  // Verify budget exists
  const budgets = fetchUserData("budgets") ?? [];
  const budget = budgets.find(b => b.id === budgetId);
  if (!budget) {
    throw new Error("Selected budget does not exist");
  }
  
  const newItem = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
    amount: +amount,
    budgetId: budgetId,
  };
  const existingExpenses = fetchUserData("expenses") ?? [];
  return setUserData("expenses", [...existingExpenses, newItem]);
};

// total spent by budget
export const calculateSpentByBudget = (budgetId) => {
  const expenses = fetchUserData("expenses") ?? [];
  const budgetSpent = expenses.reduce((acc, expense) => {
    // check if expense.id === budgetId I passed in
    if (expense.budgetId !== budgetId) return acc;

    // add the current amount to my total
    return (acc += expense.amount);
  }, 0);
  return budgetSpent;
};

// FORMATTING
export const formatDateToLocaleString = (epoch) =>
  new Date(epoch).toLocaleDateString();

// Formating percentages
export const formatPercentage = (amt) => {
  if (amt === null || amt === undefined || isNaN(amt)) return "0%";
  return amt.toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: 0,
  });
};

// Format currency
export const formatCurrency = (amt) => {
  if (amt === null || amt === undefined || isNaN(amt)) return "₹0.00";
  return amt.toLocaleString('en-IN', {
    style: "currency",
    currency: "INR",
  });
};

// Budget categories
export const BUDGET_CATEGORIES = [
  { id: "food", name: "Food & Dining", icon: "🍽️" },
  { id: "transport", name: "Transportation", icon: "🚗" },
  { id: "entertainment", name: "Entertainment", icon: "🎬" },
  { id: "shopping", name: "Shopping", icon: "🛍️" },
  { id: "bills", name: "Bills & Utilities", icon: "💡" },
  { id: "health", name: "Health & Fitness", icon: "🏥" },
  { id: "other", name: "Other", icon: "📦" }
];

// Create recurring expense
export const createRecurringExpense = ({ name, amount, budgetId, frequency }) => {
  // Validation
  if (!name || name.trim().length === 0) {
    throw new Error("Recurring expense name is required");
  }
  
  if (!amount || +amount <= 0) {
    throw new Error("Recurring expense amount must be greater than 0");
  }
  
  if (!budgetId) {
    throw new Error("Please select a budget for this recurring expense");
  }
  
  if (!frequency) {
    throw new Error("Please select a frequency for this recurring expense");
  }
  
  // Verify budget exists
  const budgets = fetchUserData("budgets") ?? [];
  const budget = budgets.find(b => b.id === budgetId);
  if (!budget) {
    throw new Error("Selected budget does not exist");
  }
  
  const newItem = {
    id: crypto.randomUUID(),
    name: name.trim(),
    amount: +amount,
    budgetId,
    frequency, // daily, weekly, monthly
    isRecurring: true,
    nextDue: getNextDueDate(frequency),
    createdAt: Date.now()
  };
  const existing = fetchUserData("recurringExpenses") ?? [];
  setUserData("recurringExpenses", [...existing, newItem]);
};

// Get next due date for recurring expense
const getNextDueDate = (frequency) => {
  const now = new Date();
  switch (frequency) {
    case "daily": return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly": return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    default: return now;
  }
};

// Analytics functions
export const getSpendingByCategory = (expenses, budgets) => {
  if (!expenses || !budgets) {
    expenses = fetchUserData("expenses") ?? [];
    budgets = fetchUserData("budgets") ?? [];
  }
  
  const categorySpending = {};
  expenses.forEach(expense => {
    const budget = budgets.find(b => b.id === expense.budgetId);
    const category = budget?.category || "other";
    categorySpending[category] = (categorySpending[category] || 0) + expense.amount;
  });
  
  return categorySpending;
};

export const getMonthlyTrends = (expenses) => {
  if (!expenses) {
    expenses = fetchUserData("expenses") ?? [];
  }
  
  const monthlyData = {};
  expenses.forEach(expense => {
    const date = new Date(expense.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
  });
  
  return monthlyData;
};

// Search and filter expenses
export const searchExpenses = (expenses, searchTerm) => {
  if (!expenses || !Array.isArray(expenses)) return [];
  if (!searchTerm || !searchTerm.trim()) return expenses;
  const term = searchTerm.trim().toLowerCase();
  return expenses.filter(expense => 
    expense.name && expense.name.toLowerCase().includes(term)
  );
};

export const filterExpenses = (expenses, { budget, date }) => {
  if (!expenses || !Array.isArray(expenses)) return [];
  
  let filtered = [...expenses];
  
  if (budget && budget.trim()) {
    filtered = filtered.filter(expense => expense.budgetId === budget.trim());
  }
  
  if (date && date.trim()) {
    const days = parseInt(date.trim());
    if (!isNaN(days) && days > 0) {
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(expense => 
        expense.createdAt && expense.createdAt >= cutoff
      );
    }
  }
  
  return filtered;
};

// Reorder budgets
export const reorderBudgets = (newBudgetOrder) => {
  try {
    // Validate that all budgets in the new order exist
    const existingBudgets = fetchUserData("budgets") ?? [];
    if (newBudgetOrder.length !== existingBudgets.length) {
      throw new Error("Invalid budget order: count mismatch");
    }
    
    // Validate all budget IDs exist
    const existingIds = new Set(existingBudgets.map(b => b.id));
    const newOrderIds = new Set(newBudgetOrder.map(b => b.id));
    
    for (const id of newOrderIds) {
      if (!existingIds.has(id)) {
        throw new Error(`Invalid budget order: budget ${id} not found`);
      }
    }
    
    return setUserData("budgets", newBudgetOrder);
  } catch (error) {
    console.error("Error reordering budgets:", error);
    throw new Error(`Failed to reorder budgets: ${error.message}`);
  }
};
