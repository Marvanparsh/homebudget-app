import React, { useMemo } from 'react';
import { formatCurrency, formatDateToLocaleString } from '../helpers';

const ExpenseInsights = ({ expenses, budgets }) => {
  const insights = useMemo(() => {
    if (!expenses?.length) return [];
    
    const now = new Date();
    const thisWeek = expenses.filter(e => {
      const expenseDate = new Date(e.createdAt);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return expenseDate >= weekAgo;
    });
    
    const lastWeek = expenses.filter(e => {
      const expenseDate = new Date(e.createdAt);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return expenseDate >= twoWeeksAgo && expenseDate < weekAgo;
    });
    
    const insights = [];
    
    // Weekly comparison
    const thisWeekTotal = thisWeek.reduce((sum, e) => sum + e.amount, 0);
    const lastWeekTotal = lastWeek.reduce((sum, e) => sum + e.amount, 0);
    
    if (lastWeekTotal > 0) {
      const change = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      if (Math.abs(change) > 10) {
        insights.push({
          type: change > 0 ? 'warning' : 'success',
          icon: change > 0 ? '📈' : '📉',
          title: `${Math.abs(change).toFixed(1)}% ${change > 0 ? 'increase' : 'decrease'} this week`,
          description: `You spent ${formatCurrency(thisWeekTotal)} vs ${formatCurrency(lastWeekTotal)} last week`
        });
      }
    }
    
    // Most expensive day
    const dailySpending = {};
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt).toDateString();
      dailySpending[date] = (dailySpending[date] || 0) + expense.amount;
    });
    
    const maxDay = Object.entries(dailySpending).reduce((max, [date, amount]) => 
      amount > max.amount ? { date, amount } : max, { date: '', amount: 0 });
    
    if (maxDay.amount > 0) {
      insights.push({
        type: 'info',
        icon: '💸',
        title: 'Highest spending day',
        description: `${formatCurrency(maxDay.amount)} on ${formatDateToLocaleString(new Date(maxDay.date).getTime())}`
      });
    }
    
    // Frequent expenses
    const expenseNames = {};
    expenses.forEach(expense => {
      expenseNames[expense.name.toLowerCase()] = (expenseNames[expense.name.toLowerCase()] || 0) + 1;
    });
    
    const mostFrequent = Object.entries(expenseNames).reduce((max, [name, count]) => 
      count > max.count ? { name, count } : max, { name: '', count: 0 });
    
    if (mostFrequent.count > 2) {
      insights.push({
        type: 'info',
        icon: '🔄',
        title: 'Most frequent expense',
        description: `"${mostFrequent.name}" appears ${mostFrequent.count} times`
      });
    }
    
    // Average expense
    const avgExpense = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
    const recentAvg = thisWeek.reduce((sum, e) => sum + e.amount, 0) / (thisWeek.length || 1);
    
    if (thisWeek.length > 0 && Math.abs(recentAvg - avgExpense) > avgExpense * 0.2) {
      insights.push({
        type: recentAvg > avgExpense ? 'warning' : 'success',
        icon: recentAvg > avgExpense ? '⬆️' : '⬇️',
        title: `${recentAvg > avgExpense ? 'Higher' : 'Lower'} than usual expenses`,
        description: `Recent average: ${formatCurrency(recentAvg)} vs overall: ${formatCurrency(avgExpense)}`
      });
    }
    
    // Weekend vs weekday spending
    const weekendSpending = expenses.filter(e => {
      const day = new Date(e.createdAt).getDay();
      return day === 0 || day === 6;
    }).reduce((sum, e) => sum + e.amount, 0);
    
    const weekdaySpending = expenses.filter(e => {
      const day = new Date(e.createdAt).getDay();
      return day > 0 && day < 6;
    }).reduce((sum, e) => sum + e.amount, 0);
    
    if (weekendSpending > 0 && weekdaySpending > 0) {
      const weekendAvg = weekendSpending / (expenses.filter(e => {
        const day = new Date(e.createdAt).getDay();
        return day === 0 || day === 6;
      }).length || 1);
      
      const weekdayAvg = weekdaySpending / (expenses.filter(e => {
        const day = new Date(e.createdAt).getDay();
        return day > 0 && day < 6;
      }).length || 1);
      
      if (weekendAvg > weekdayAvg * 1.5) {
        insights.push({
          type: 'info',
          icon: '🎉',
          title: 'Weekend spender',
          description: `You spend ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% more on weekends`
        });
      }
    }
    
    return insights.slice(0, 4);
  }, [expenses, budgets]);
  
  const getInsightClass = (type) => {
    switch (type) {
      case 'success': return 'insight-success';
      case 'warning': return 'insight-warning';
      case 'info': return 'insight-info';
      default: return 'insight-default';
    }
  };
  
  return (
    <div className="expense-insights">
      <h3>🔍 Smart Insights</h3>
      <p className="insights-subtitle">AI-powered analysis of your spending patterns</p>
      
      {insights.length > 0 ? (
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className={`insight-card ${getInsightClass(insight.type)}`}>
              <div className="insight-header">
                <span className="insight-icon">{insight.icon}</span>
                <h4 className="insight-title">{insight.title}</h4>
              </div>
              <p className="insight-description">{insight.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-insights">
          <span className="no-insights-icon">📊</span>
          <p>Add more expenses to unlock personalized insights!</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseInsights;