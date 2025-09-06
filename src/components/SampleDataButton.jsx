import { SparklesIcon, TrashIcon } from '@heroicons/react/24/outline';
import { createBudget, createExpense, fetchUserData } from '../helpers';
import { clearAllUserData } from '../utils/clearData';
import { toast } from 'react-toastify';

const SampleDataButton = () => {
  const clearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllUserData();
      toast.success('All data cleared! Page will refresh.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };
  
  const addSampleData = () => {
    try {
      // Create sample budgets
      const budgets = [
        { name: 'Food & Dining', amount: 15000, category: 'food' },
        { name: 'Transportation', amount: 8000, category: 'transport' },
        { name: 'Entertainment', amount: 5000, category: 'entertainment' },
        { name: 'Shopping', amount: 7000, category: 'shopping' }
      ];
      
      budgets.forEach(budget => createBudget(budget));
      
      // Get created budgets to get their IDs
      const createdBudgets = fetchUserData('budgets') || [];
      
      // Create sample expenses
      const expenses = [
        // Current month expenses
        { name: 'Coffee', amount: 150, budgetId: createdBudgets.find(b => b.category === 'food')?.id },
        { name: 'Lunch', amount: 300, budgetId: createdBudgets.find(b => b.category === 'food')?.id },
        { name: 'Petrol', amount: 1200, budgetId: createdBudgets.find(b => b.category === 'transport')?.id },
        { name: 'Movie Tickets', amount: 800, budgetId: createdBudgets.find(b => b.category === 'entertainment')?.id },
        { name: 'Groceries', amount: 2500, budgetId: createdBudgets.find(b => b.category === 'food')?.id },
        { name: 'Auto Rickshaw', amount: 200, budgetId: createdBudgets.find(b => b.category === 'transport')?.id },
        { name: 'New Shirt', amount: 1500, budgetId: createdBudgets.find(b => b.category === 'shopping')?.id }
      ];
      
      // Add current month expenses
      expenses.forEach(expense => {
        if (expense.budgetId) createExpense(expense);
      });
      
      // Add previous month expenses for trends
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const oldExpenses = [
        { name: 'Restaurant', amount: 800, budgetId: createdBudgets.find(b => b.category === 'food')?.id },
        { name: 'Bus Pass', amount: 500, budgetId: createdBudgets.find(b => b.category === 'transport')?.id },
        { name: 'Concert', amount: 1200, budgetId: createdBudgets.find(b => b.category === 'entertainment')?.id }
      ];
      
      oldExpenses.forEach(expense => {
        if (expense.budgetId) {
          const expenseWithOldDate = {
            ...expense,
            createdAt: lastMonth.getTime()
          };
          const existingExpenses = fetchUserData('expenses') || [];
          const newExpense = {
            id: crypto.randomUUID(),
            name: expenseWithOldDate.name,
            amount: expenseWithOldDate.amount,
            budgetId: expenseWithOldDate.budgetId,
            createdAt: expenseWithOldDate.createdAt
          };
          const updatedExpenses = [...existingExpenses, newExpense];
          localStorage.setItem(`expenses_${JSON.parse(localStorage.getItem('currentUser')).id}`, JSON.stringify(updatedExpenses));
        }
      });
      
      toast.success('Sample data added! Page will refresh to show analytics.');
      
      // Refresh the page to show the new data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to add sample data');
    }
  };
  
  return (
    <div className="sample-data-actions">
      <button 
        className="btn btn--outline sample-data-btn"
        onClick={addSampleData}
        title="Add sample data to see analytics"
      >
        <SparklesIcon width={16} />
        Add Sample Data
      </button>
      <button 
        className="btn btn--warning"
        onClick={clearData}
        title="Clear all data"
      >
        <TrashIcon width={16} />
        Clear Data
      </button>
    </div>
  );
};

export default SampleDataButton;