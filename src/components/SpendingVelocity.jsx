import React, { useMemo } from 'react';
import { formatCurrency } from '../helpers';

const SpendingVelocity = ({ expenses }) => {
  const velocityData = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;
    
    const now = new Date();
    const today = expenses.filter(e => {
      const date = new Date(e.createdAt);
      return date.toDateString() === now.toDateString();
    });
    
    const thisWeek = expenses.filter(e => {
      const date = new Date(e.createdAt);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    });
    
    const thisMonth = expenses.filter(e => {
      const date = new Date(e.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    
    const todayAmount = today.reduce((sum, e) => sum + e.amount, 0);
    const weekAmount = thisWeek.reduce((sum, e) => sum + e.amount, 0);
    const monthAmount = thisMonth.reduce((sum, e) => sum + e.amount, 0);
    
    const dailyAverage = weekAmount / 7;
    const weeklyAverage = monthAmount / 4;
    const monthlyProjection = dailyAverage * 30;
    
    return {
      today: todayAmount,
      week: weekAmount,
      month: monthAmount,
      dailyAverage,
      weeklyAverage,
      monthlyProjection,
      velocity: dailyAverage > 0 ? 'active' : 'low'
    };
  }, [expenses]);
  
  if (!velocityData) return null;
  
  return (
    <div className="spending-velocity">
      <h3>⚡ Spending Velocity</h3>
      <div className="velocity-grid">
        <div className="velocity-card today">
          <div className="velocity-header">
            <span className="velocity-icon">📅</span>
            <span className="velocity-label">Today</span>
          </div>
          <div className="velocity-amount">{formatCurrency(velocityData.today)}</div>
        </div>
        
        <div className="velocity-card week">
          <div className="velocity-header">
            <span className="velocity-icon">📊</span>
            <span className="velocity-label">This Week</span>
          </div>
          <div className="velocity-amount">{formatCurrency(velocityData.week)}</div>
          <div className="velocity-sub">Avg: {formatCurrency(velocityData.dailyAverage)}/day</div>
        </div>
        
        <div className="velocity-card month">
          <div className="velocity-header">
            <span className="velocity-icon">📈</span>
            <span className="velocity-label">This Month</span>
          </div>
          <div className="velocity-amount">{formatCurrency(velocityData.month)}</div>
          <div className="velocity-sub">Projected: {formatCurrency(velocityData.monthlyProjection)}</div>
        </div>
      </div>
      
      <div className="velocity-insights">
        <div className={`velocity-status ${velocityData.velocity}`}>
          {velocityData.velocity === 'active' ? (
            <span>🔥 Active spending pattern detected</span>
          ) : (
            <span>😌 Low spending activity</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendingVelocity;