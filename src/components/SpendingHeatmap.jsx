import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../helpers';

const SpendingHeatmap = ({ expenses }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [timePeriod, setTimePeriod] = useState('year');
  
  const heatmapData = useMemo(() => {
    const today = new Date();
    const days = [];
    
    // Determine number of days based on time period
    let totalDays;
    switch (timePeriod) {
      case 'week': totalDays = 7; break;
      case 'month': totalDays = 30; break;
      case 'year': totalDays = 365; break;
      default: totalDays = 365;
    }
    
    // Generate days for the selected period
    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        return expenseDate.toDateString() === date.toDateString();
      });
      
      const totalSpent = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      days.push({
        date: date.toISOString().split('T')[0],
        amount: totalSpent,
        count: dayExpenses.length,
        day: date.getDay(),
        week: Math.floor(i / 7)
      });
    }
    
    return days;
  }, [expenses, timePeriod]);
  
  const maxAmount = Math.max(...heatmapData.map(d => d.amount));
  const getIntensity = (amount) => {
    if (amount === 0) return 0;
    return Math.min(Math.ceil((amount / maxAmount) * 4), 4);
  };
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="spending-heatmap">
      <div className="heatmap-header">
        <h3>📅 Spending Activity</h3>
        <div className="heatmap-time-toggle">
          <button 
            className={`toggle-btn ${timePeriod === 'week' ? 'active' : ''}`}
            onClick={() => setTimePeriod('week')}
          >
            Week
          </button>
          <button 
            className={`toggle-btn ${timePeriod === 'month' ? 'active' : ''}`}
            onClick={() => setTimePeriod('month')}
          >
            Month
          </button>
          <button 
            className={`toggle-btn ${timePeriod === 'year' ? 'active' : ''}`}
            onClick={() => setTimePeriod('year')}
          >
            Year
          </button>
        </div>
      </div>
      <p className="heatmap-subtitle">Your spending patterns over the last {timePeriod}</p>
      
      <div className="heatmap-container">
        <div className={`heatmap-grid heatmap-${timePeriod}`}>
          {heatmapData.map((day, index) => (
            <div
              key={day.date}
              className={`heatmap-cell intensity-${getIntensity(day.amount)}`}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              title={`${day.date}: ${formatCurrency(day.amount)} (${day.count} expenses)`}
            />
          ))}
        </div>
        
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-scale">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div key={intensity} className={`legend-cell intensity-${intensity}`} />
            ))}
          </div>
          <span>More</span>
        </div>
        
        {hoveredDay && (
          <div className="heatmap-tooltip">
            <strong>{new Date(hoveredDay.date).toLocaleDateString()}</strong>
            <div>{formatCurrency(hoveredDay.amount)}</div>
            <div>{hoveredDay.count} expense{hoveredDay.count !== 1 ? 's' : ''}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingHeatmap;