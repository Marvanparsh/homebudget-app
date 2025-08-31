import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../helpers';

const ExpenseComparison = ({ expenses }) => {
  const [timeFilter, setTimeFilter] = useState('month');
  const comparisonData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonth = expenses.filter(e => {
      if (!e.createdAt) return false;
      const date = new Date(e.createdAt);
      if (isNaN(date.getTime())) return false;
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const lastMonth = expenses.filter(e => {
      if (!e.createdAt) return false;
      const date = new Date(e.createdAt);
      if (isNaN(date.getTime())) return false;
      const lastMonthDate = new Date(currentYear, currentMonth - 1);
      return date.getMonth() === lastMonthDate.getMonth() && 
             date.getFullYear() === lastMonthDate.getFullYear();
    });
    
    const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0);
    
    const change = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    
    return {
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      change,
      thisMonthCount: thisMonth.length,
      lastMonthCount: lastMonth.length
    };
  }, [expenses]);
  
  const getChangeColor = (change) => {
    if (change > 10) return 'hsl(0, 70%, 50%)';
    if (change > 0) return 'hsl(30, 70%, 50%)';
    if (change < -10) return 'hsl(120, 70%, 50%)';
    return 'hsl(var(--muted))';
  };
  
  const getChangeIcon = (change) => {
    if (change > 10) return '📈';
    if (change > 0) return '↗️';
    if (change < -10) return '📉';
    if (change < 0) return '↘️';
    return '➡️';
  };
  
  return (
    <div className="expense-comparison">
      <div className="comparison-header">
        <h3>📊 Spending Comparison</h3>
        <div className="time-filters">
          <button 
            className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setTimeFilter('week')}
          >
            Week
          </button>
          <button 
            className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('month')}
          >
            Month
          </button>
          <button 
            className={`filter-btn ${timeFilter === 'year' ? 'active' : ''}`}
            onClick={() => setTimeFilter('year')}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="comparison-cards">
        <div className="comparison-card current">
          <div className="card-header">
            <span className="card-icon">📅</span>
            <span className="card-title">This Month</span>
          </div>
          <div className="card-amount">{formatCurrency(comparisonData.thisMonth)}</div>
          <div className="card-subtitle">{comparisonData.thisMonthCount} expenses</div>
        </div>
        
        <div className="comparison-arrow">
          <span 
            className="change-indicator"
            style={{ color: getChangeColor(comparisonData.change) }}
          >
            {getChangeIcon(comparisonData.change)}
            {Math.abs(comparisonData.change).toFixed(1)}%
          </span>
        </div>
        
        <div className="comparison-card previous">
          <div className="card-header">
            <span className="card-icon">📆</span>
            <span className="card-title">Last Month</span>
          </div>
          <div className="card-amount">{formatCurrency(comparisonData.lastMonth)}</div>
          <div className="card-subtitle">{comparisonData.lastMonthCount} expenses</div>
        </div>
      </div>
      
      <div className="comparison-insight">
        {comparisonData.change > 10 ? (
          <p className="insight warning">⚠️ Spending increased significantly this month</p>
        ) : comparisonData.change < -10 ? (
          <p className="insight success">✅ Great job reducing spending this month!</p>
        ) : (
          <p className="insight neutral">📊 Spending is relatively stable</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseComparison;