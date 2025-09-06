import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../helpers';

const ExpenseComparison = ({ expenses }) => {
  const [timeFilter, setTimeFilter] = useState('month');
  const comparisonData = useMemo(() => {
    const now = new Date();
    
    if (timeFilter === 'week') {
      // Get current week (Sunday to Saturday)
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);
      
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
      currentWeekEnd.setHours(23, 59, 59, 999);
      
      // Get last week
      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(currentWeekStart.getDate() - 7);
      
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      lastWeekEnd.setHours(23, 59, 59, 999);
      
      const thisWeek = expenses.filter(e => {
        if (!e.createdAt) return false;
        const date = new Date(e.createdAt);
        return date >= currentWeekStart && date <= currentWeekEnd;
      });
      
      const lastWeek = expenses.filter(e => {
        if (!e.createdAt) return false;
        const date = new Date(e.createdAt);
        return date >= lastWeekStart && date <= lastWeekEnd;
      });
      
      const thisWeekTotal = thisWeek.reduce((sum, e) => sum + e.amount, 0);
      const lastWeekTotal = lastWeek.reduce((sum, e) => sum + e.amount, 0);
      const change = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
      
      return {
        current: thisWeekTotal,
        previous: lastWeekTotal,
        change,
        currentCount: thisWeek.length,
        previousCount: lastWeek.length,
        currentLabel: 'This Week',
        previousLabel: 'Last Week'
      };
    } else if (timeFilter === 'year') {
      const currentYear = now.getFullYear();
      const lastYear = currentYear - 1;
      
      const thisYear = expenses.filter(e => {
        if (!e.createdAt) return false;
        const date = new Date(e.createdAt);
        return date.getFullYear() === currentYear;
      });
      
      const lastYearExpenses = expenses.filter(e => {
        if (!e.createdAt) return false;
        const date = new Date(e.createdAt);
        return date.getFullYear() === lastYear;
      });
      
      const thisYearTotal = thisYear.reduce((sum, e) => sum + e.amount, 0);
      const lastYearTotal = lastYearExpenses.reduce((sum, e) => sum + e.amount, 0);
      const change = lastYearTotal > 0 ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100 : 0;
      
      return {
        current: thisYearTotal,
        previous: lastYearTotal,
        change,
        currentCount: thisYear.length,
        previousCount: lastYearExpenses.length,
        currentLabel: 'This Year',
        previousLabel: 'Last Year'
      };
    } else {
      // Month comparison (default)
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
        current: thisMonthTotal,
        previous: lastMonthTotal,
        change,
        currentCount: thisMonth.length,
        previousCount: lastMonth.length,
        currentLabel: 'This Month',
        previousLabel: 'Last Month'
      };
    }
  }, [expenses, timeFilter]);
  
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
            <span className="card-title">{comparisonData.currentLabel}</span>
          </div>
          <div className="card-amount">{formatCurrency(comparisonData.current)}</div>
          <div className="card-subtitle">{comparisonData.currentCount} expenses</div>
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
            <span className="card-title">{comparisonData.previousLabel}</span>
          </div>
          <div className="card-amount">{formatCurrency(comparisonData.previous)}</div>
          <div className="card-subtitle">{comparisonData.previousCount} expenses</div>
        </div>
      </div>
      
      <div className="comparison-insight">
        {comparisonData.change > 10 ? (
          <p className="insight warning">⚠️ Spending increased significantly this {timeFilter}</p>
        ) : comparisonData.change < -10 ? (
          <p className="insight success">✅ Great job reducing spending this {timeFilter}!</p>
        ) : (
          <p className="insight neutral">📊 Spending is relatively stable</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseComparison;