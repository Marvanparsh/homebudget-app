import { SparklesIcon } from '@heroicons/react/24/outline';
import { createBudget, createExpense, fetchUserData } from '../helpers';
import { toast } from 'react-toastify';

const SampleDataButton = () => {
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
        { name: 'Coffee', amount: 150, budgetId: createdBudgets.find(b => b.category === 'food')?.id },
        { name: 'Lunch', amount: 300, budgetId: createdBudgets.find(b => b.category === 'food')?.id },
        { name: 'Petrol', amount: 1200, budgetId: createdBudgets.find(b => b.category === 'transport')?.id },
        { name: 'Movie Tickets', amount: 800, budgetId: createdBudgets.find(b => b.category === 'entertainment')?.id },
        { name: 'Groceries', amount: 2500, budgetId: createdBudgets.find(b => b.category === 'food')?.id },
        { name: 'Auto Rickshaw', amount: 200, budgetId: createdBudgets.find(b => b.category === 'transport')?.id },
        { name: 'New Shirt', amount: 1500, budgetId: createdBudgets.find(b => b.category === 'shopping')?.id }
      ];
      
      expenses.forEach(expense => {
        if (expense.budgetId) createExpense(expense);
      });
      
      toast.success('Sample data added! Page will refresh to show analytics.');
      
      // Refresh the page to show the new data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to add sample data');
    }
  };
  
  return (
    <button 
      className="btn btn--outline sample-data-btn"
      onClick={addSampleData}
      title="Add sample data to see analytics"
    >
      <SparklesIcon width={16} />
      Add Sample Data
    </button>
  );
};

export default SampleDataButton;