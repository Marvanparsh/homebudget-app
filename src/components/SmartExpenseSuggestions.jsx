import React, { useState, useMemo } from 'react';
import { SparklesIcon, ClockIcon, ArrowTrendingUpIcon, SunIcon, FireIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { fetchUserData } from '../helpers';

const SmartExpenseSuggestions = ({ onSuggestionSelect }) => {
  const [expenses] = useState(() => fetchUserData('expenses') || []);
  const [budgets] = useState(() => fetchUserData('budgets') || []);
  
  const aiSuggestions = useMemo(() => {
    const expensePatterns = {};
    const dayOfWeekPatterns = {};
    const timePatterns = {};
    const categorySpending = {};
    
    // Advanced pattern analysis
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      const key = expense.name.toLowerCase();
      
      // Basic patterns
      if (!expensePatterns[key]) {
        expensePatterns[key] = {
          name: expense.name,
          amounts: [],
          frequency: 0,
          lastUsed: expense.createdAt,
          dayPatterns: {},
          timePatterns: {}
        };
      }
      
      expensePatterns[key].amounts.push(expense.amount);
      expensePatterns[key].frequency++;
      expensePatterns[key].lastUsed = Math.max(expensePatterns[key].lastUsed, expense.createdAt);
      expensePatterns[key].dayPatterns[dayOfWeek] = (expensePatterns[key].dayPatterns[dayOfWeek] || 0) + 1;
      expensePatterns[key].timePatterns[Math.floor(hour/4)] = (expensePatterns[key].timePatterns[Math.floor(hour/4)] || 0) + 1;
      
      // Category analysis
      const budget = budgets.find(b => b.id === expense.budgetId);
      if (budget) {
        categorySpending[budget.name] = (categorySpending[budget.name] || 0) + expense.amount;
      }
    });
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeSlot = Math.floor(now.getHours()/4);
    
    // AI-powered predictions
    const predictions = Object.values(expensePatterns)
      .filter(pattern => pattern.frequency >= 2)
      .map(pattern => {
        const avgAmount = Math.round(pattern.amounts.reduce((a, b) => a + b, 0) / pattern.amounts.length);
        const dayScore = pattern.dayPatterns[currentDay] || 0;
        const timeScore = pattern.timePatterns[currentTimeSlot] || 0;
        const recencyScore = Math.max(0, 7 - Math.floor((Date.now() - pattern.lastUsed) / (24 * 60 * 60 * 1000)));
        
        // AI confidence score
        const confidence = (pattern.frequency * 0.4 + dayScore * 0.3 + timeScore * 0.2 + recencyScore * 0.1) / pattern.frequency;
        
        return {
          ...pattern,
          avgAmount,
          confidence,
          isHighConfidence: confidence > 0.6,
          isPredicted: dayScore > 0 || timeScore > 0,
          suggestion: confidence > 0.8 ? 'Highly likely' : confidence > 0.5 ? 'Likely' : 'Possible'
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
      
    return predictions;
  }, [expenses, budgets]);

  const contextualSuggestions = useMemo(() => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const suggestions = [];
    
    // Time-based AI suggestions
    if (hour >= 7 && hour <= 10) {
      suggestions.push({ name: 'Morning Coffee', amount: 5, context: 'Morning routine', icon: <SunIcon width={16} /> });
    }
    if (hour >= 12 && hour <= 14) {
      suggestions.push({ name: 'Lunch', amount: 15, context: 'Lunch time', icon: <FireIcon width={16} /> });
    }
    if (hour >= 18 && hour <= 21) {
      suggestions.push({ name: 'Dinner', amount: 25, context: 'Dinner time', icon: <FireIcon width={16} /> });
    }
    
    // Weekend suggestions
    if (day === 0 || day === 6) {
      suggestions.push({ name: 'Weekend Activity', amount: 30, context: 'Weekend', icon: <SparklesIcon width={16} /> });
    }
    
    // Weekday suggestions
    if (day >= 1 && day <= 5 && hour >= 8 && hour <= 18) {
      suggestions.push({ name: 'Work Snack', amount: 8, context: 'Work hours', icon: <BoltIcon width={16} /> });
    }
    
    return suggestions;
  }, []);
  
  const smartAmounts = useMemo(() => {
    const recentAmounts = expenses.slice(-10).map(e => e.amount);
    const avgRecent = recentAmounts.length ? Math.round(recentAmounts.reduce((a, b) => a + b, 0) / recentAmounts.length) : 20;
    return [5, 10, avgRecent, 25, 50, 100].filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => a - b);
  }, [expenses]);

  return (
    <div className="smart-suggestions">
      <div className="suggestions-section">
        <h3><BoltIcon width={16} /> AI Predictions</h3>
        <div className="suggestion-grid">
          {aiSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`suggestion-card ${suggestion.isHighConfidence ? 'high-confidence' : ''} ${suggestion.isPredicted ? 'predicted' : ''}`}
              onClick={() => onSuggestionSelect(suggestion.name, suggestion.avgAmount)}
            >
              <div className="suggestion-header">
                <span className="suggestion-name">{suggestion.name}</span>
                <div className="confidence-indicator">
                  {suggestion.isHighConfidence && <ChartBarIcon width={12} />}
                </div>
              </div>
              <div className="suggestion-amount">₹{suggestion.avgAmount}</div>
              <div className="suggestion-meta">
                {suggestion.suggestion} • {suggestion.frequency}x used
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="suggestions-section">
        <h3><ClockIcon width={16} /> Contextual</h3>
        <div className="contextual-suggestions">
          {contextualSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="context-suggestion"
              onClick={() => onSuggestionSelect(suggestion.name, suggestion.amount)}
            >
              <span className="suggestion-icon">{suggestion.icon}</span>
              <div className="suggestion-content">
                <span className="suggestion-text">{suggestion.name}</span>
                <span className="suggestion-context">{suggestion.context}</span>
              </div>
              <span className="suggestion-amount">₹{suggestion.amount}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="suggestions-section">
        <h3>Smart Amounts</h3>
        <div className="quick-amounts">
          {smartAmounts.map(amount => (
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