import React, { useState, useMemo } from 'react';
import { SparklesIcon, ClockIcon, ArrowTrendingUpIcon, SunIcon, FireIcon } from '@heroicons/react/24/outline';
import { fetchUserData } from '../helpers';

const SmartExpenseSuggestions = ({ onSuggestionSelect }) => {
  const [expenses] = useState(() => fetchUserData('expenses') || []);
  
  const suggestions = useMemo(() => {
    const expensePatterns = {};
    const recentExpenses = expenses.slice(-20);
    
    // Analyze patterns
    recentExpenses.forEach(expense => {
      const key = expense.name.toLowerCase();
      if (!expensePatterns[key]) {
        expensePatterns[key] = {
          name: expense.name,
          amounts: [],
          frequency: 0,
          lastUsed: expense.createdAt
        };
      }
      expensePatterns[key].amounts.push(expense.amount);
      expensePatterns[key].frequency++;
      expensePatterns[key].lastUsed = Math.max(expensePatterns[key].lastUsed, expense.createdAt);
    });

    // Generate smart suggestions
    return Object.values(expensePatterns)
      .filter(pattern => pattern.frequency >= 2)
      .map(pattern => ({
        ...pattern,
        avgAmount: Math.round(pattern.amounts.reduce((a, b) => a + b, 0) / pattern.amounts.length),
        isFrequent: pattern.frequency >= 3,
        isRecent: Date.now() - pattern.lastUsed < 7 * 24 * 60 * 60 * 1000
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 6);
  }, [expenses]);

  const quickAmounts = [5, 10, 15, 25, 50, 100];
  const timeBasedSuggestions = [
    { name: 'Morning Coffee', amount: 5, time: 'morning', icon: <SunIcon width={16} /> },
    { name: 'Lunch', amount: 12, time: 'afternoon', icon: <FireIcon width={16} /> },
    { name: 'Dinner', amount: 20, time: 'evening', icon: <FireIcon width={16} /> }
  ];

  const getCurrentTimeSuggestion = () => {
    const hour = new Date().getHours();
    if (hour < 11) return timeBasedSuggestions[0];
    if (hour < 16) return timeBasedSuggestions[1];
    return timeBasedSuggestions[2];
  };

  return (
    <div className="smart-suggestions">
      <div className="suggestions-section">
        <h3><SparklesIcon width={16} /> Smart Suggestions</h3>
        <div className="suggestion-grid">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`suggestion-card ${suggestion.isFrequent ? 'frequent' : ''}`}
              onClick={() => onSuggestionSelect(suggestion.name, suggestion.avgAmount)}
            >
              <div className="suggestion-header">
                <span className="suggestion-name">{suggestion.name}</span>
                {suggestion.isFrequent && <ArrowTrendingUpIcon width={12} />}
              </div>
              <div className="suggestion-amount">₹{suggestion.avgAmount}</div>
              <div className="suggestion-meta">
                Used {suggestion.frequency} times
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="suggestions-section">
        <h3><ClockIcon width={16} /> Right Now</h3>
        <button
          className="time-suggestion"
          onClick={() => {
            const suggestion = getCurrentTimeSuggestion();
            onSuggestionSelect(suggestion.name, suggestion.amount);
          }}
        >
          <span className="suggestion-icon">{getCurrentTimeSuggestion().icon}</span>
          <span className="suggestion-text">{getCurrentTimeSuggestion().name}</span>
          <span className="suggestion-amount">₹{getCurrentTimeSuggestion().amount}</span>
        </button>
      </div>

      <div className="suggestions-section">
        <h3>Quick Amounts</h3>
        <div className="quick-amounts">
          {quickAmounts.map(amount => (
            <button
              key={amount}
              className="quick-amount-btn"
              onClick={() => onSuggestionSelect('', amount)}
            >
              ₹{amount}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartExpenseSuggestions;