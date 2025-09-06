import React from 'react';
import { toast } from 'react-toastify';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { fetchData, setUserData } from '../helpers';

const EnhancedSampleDataButton = () => {
  const generateRealisticSampleData = () => {
    const currentUser = fetchData('currentUser');
    if (!currentUser) {
      toast.error('Please log in first');
      return;
    }

    // Create sample budgets
    const sampleBudgets = [
      {
        id: crypto.randomUUID(),
        name: 'Food & Dining',
        amount: 15000,
        category: 'food',
        color: '25 70% 60%',
        createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        id: crypto.randomUUID(),
        name: 'Transportation',
        amount: 8000,
        category: 'transport',
        color: '200 70% 60%',
        createdAt: Date.now() - (25 * 24 * 60 * 60 * 1000)
      },
      {
        id: crypto.randomUUID(),
        name: 'Entertainment',
        amount: 5000,
        category: 'entertainment',
        color: '280 70% 60%',
        createdAt: Date.now() - (20 * 24 * 60 * 60 * 1000)
      },
      {
        id: crypto.randomUUID(),
        name: 'Shopping',
        amount: 10000,
        category: 'shopping',
        color: '320 70% 60%',
        createdAt: Date.now() - (15 * 24 * 60 * 60 * 1000)
      },
      {
        id: crypto.randomUUID(),
        name: 'Bills & Utilities',
        amount: 12000,
        category: 'bills',
        color: '45 70% 60%',
        createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000)
      }
    ];

    // Generate realistic expenses over the last 3 months
    const sampleExpenses = [];
    const now = new Date();
    
    // Generate expenses for each budget over the last 90 days
    sampleBudgets.forEach(budget => {
      const expenseCount = Math.floor(Math.random() * 15) + 10; // 10-25 expenses per budget
      
      for (let i = 0; i < expenseCount; i++) {
        // Random date within last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const expenseDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        
        // Generate realistic expense amounts based on category
        let baseAmount;
        let expenseName;
        
        switch (budget.category) {
          case 'food':
            baseAmount = Math.floor(Math.random() * 800) + 200; // ₹200-1000
            expenseName = ['Grocery Shopping', 'Restaurant', 'Coffee Shop', 'Food Delivery', 'Lunch', 'Dinner'][Math.floor(Math.random() * 6)];
            break;
          case 'transport':
            baseAmount = Math.floor(Math.random() * 500) + 100; // ₹100-600
            expenseName = ['Fuel', 'Bus Ticket', 'Taxi', 'Metro', 'Auto Rickshaw', 'Parking'][Math.floor(Math.random() * 6)];
            break;
          case 'entertainment':
            baseAmount = Math.floor(Math.random() * 1000) + 300; // ₹300-1300
            expenseName = ['Movie Tickets', 'Concert', 'Gaming', 'Streaming Service', 'Books', 'Sports'][Math.floor(Math.random() * 6)];
            break;
          case 'shopping':
            baseAmount = Math.floor(Math.random() * 2000) + 500; // ₹500-2500
            expenseName = ['Clothes', 'Electronics', 'Home Decor', 'Gadgets', 'Shoes', 'Accessories'][Math.floor(Math.random() * 6)];
            break;
          case 'bills':
            baseAmount = Math.floor(Math.random() * 3000) + 1000; // ₹1000-4000
            expenseName = ['Electricity Bill', 'Internet Bill', 'Phone Bill', 'Water Bill', 'Gas Bill', 'Insurance'][Math.floor(Math.random() * 6)];
            break;
          default:
            baseAmount = Math.floor(Math.random() * 500) + 100;
            expenseName = 'Miscellaneous';
        }
        
        // Add some variation based on day of week (weekends might have higher entertainment/food expenses)
        const dayOfWeek = expenseDate.getDay();
        if ((dayOfWeek === 0 || dayOfWeek === 6) && (budget.category === 'food' || budget.category === 'entertainment')) {
          baseAmount *= 1.3; // 30% higher on weekends
        }
        
        sampleExpenses.push({
          id: crypto.randomUUID(),
          name: expenseName,
          amount: Math.round(baseAmount),
          budgetId: budget.id,
          createdAt: expenseDate.getTime()
        });
      }
    });

    // Sort expenses by date (newest first)
    sampleExpenses.sort((a, b) => b.createdAt - a.createdAt);

    // Save to localStorage
    setUserData('budgets', sampleBudgets);
    setUserData('expenses', sampleExpenses);

    toast.success(`🎉 Generated ${sampleBudgets.length} budgets and ${sampleExpenses.length} realistic expenses!`);
    
    // Refresh the page to show new data
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="sample-data-section">
      <div className="sample-data-card">
        <div className="sample-data-header">
          <SparklesIcon width={32} className="sample-icon" />
          <h3>Try with Sample Data</h3>
        </div>
        <p>
          Want to see how the analytics look with real data? 
          Generate realistic sample budgets and expenses to explore all features!
        </p>
        <div className="sample-features">
          <div className="feature-item">📊 Monthly & Weekly Trends</div>
          <div className="feature-item">💰 Realistic Spending Patterns</div>
          <div className="feature-item">📈 Smart Insights & Analytics</div>
          <div className="feature-item">🎯 Budget Health Scoring</div>
        </div>
        <button 
          className="btn sample-data-btn"
          onClick={generateRealisticSampleData}
        >
          <SparklesIcon width={20} />
          Generate Sample Data
        </button>
      </div>
    </div>
  );
};

export default EnhancedSampleDataButton;