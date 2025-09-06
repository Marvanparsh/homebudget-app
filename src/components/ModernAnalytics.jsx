import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../helpers';
import ModernChart from './ModernChart';
import PieChart from './PieChart';

const ModernAnalytics = ({ expenses, budgets }) => {
  const [viewMode, setViewMode] = useState('overview');
  const [timeRange, setTimeRange] = useState('6months');
  const [weekRange, setWeekRange] = useState('8weeks');
  
  // Process real expense data for monthly trends
  const monthlyData = useMemo(() => {
    if (!expenses?.length) return [];
    
    const monthlyTotals = {};
    const now = new Date();
    
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });
    
    // Get months based on selected range
    const monthCount = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    const months = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      months.push({
        label: monthName,
        value: monthlyTotals[monthKey] || 0,
        date: date
      });
    }
    
    return months;
  }, [expenses, timeRange]);
  
  // Process real expense data for weekly trends
  const weeklyData = useMemo(() => {
    if (!expenses?.length) return [];
    
    const weeklyTotals = {};
    const now = new Date();
    
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      // Get start of week (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyTotals[weekKey] = (weeklyTotals[weekKey] || 0) + expense.amount;
    });
    
    // Get weeks based on selected range
    const weekCount = weekRange === '4weeks' ? 4 : weekRange === '6weeks' ? 6 : weekRange === '8weeks' ? 8 : 12;
    const weeks = [];
    for (let i = weekCount - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - (i * 7) - now.getDay());
      date.setHours(0, 0, 0, 0);
      
      const weekKey = date.toISOString().split('T')[0];
      const weekLabel = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      weeks.push({
        label: weekLabel,
        value: weeklyTotals[weekKey] || 0,
        date: date
      });
    }
    
    return weeks;
  }, [expenses, weekRange]);
  
  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalSpent = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
    const avgMonthly = monthlyData.length > 0 ? 
      monthlyData.reduce((sum, month) => sum + month.value, 0) / monthlyData.length : 0;
    const avgWeekly = weeklyData.length > 0 ? 
      weeklyData.reduce((sum, week) => sum + week.value, 0) / weeklyData.length : 0;
    
    return {
      totalSpent,
      totalBudget,
      avgMonthly,
      avgWeekly,
      savingsRate: totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget) * 100 : 0
    };
  }, [expenses, budgets, monthlyData, weeklyData]);
  
  // Calculate synchronized Y-axis maximum
  const yAxisMax = useMemo(() => {
    const monthlyMax = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.value)) : 0;
    const weeklyMax = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.value)) : 0;
    const maxValue = Math.max(monthlyMax, weeklyMax);
    return maxValue > 0 ? Math.ceil(maxValue * 1.1 / 1000) * 1000 : 10000;
  }, [monthlyData, weeklyData]);
  
  // Category spending data for pie chart
  const categoryData = useMemo(() => {
    if (!expenses?.length || !budgets?.length) return [];
    
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      const budget = budgets.find(b => b.id === expense.budgetId);
      if (budget) {
        categoryTotals[budget.name] = (categoryTotals[budget.name] || 0) + expense.amount;
      }
    });
    
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      label: name,
      value,
      color: `hsl(${index * 45 + 180}, 70%, 60%)`
    })).sort((a, b) => b.value - a.value);
  }, [expenses, budgets]);
  
  // Trend analysis
  const trends = useMemo(() => {
    const monthlyTrend = monthlyData.length >= 2 ? 
      monthlyData[monthlyData.length - 1].value - monthlyData[monthlyData.length - 2].value : 0;
    
    const weeklyTrend = weeklyData.length >= 2 ? 
      weeklyData[weeklyData.length - 1].value - weeklyData[weeklyData.length - 2].value : 0;
    
    return {
      monthly: {
        change: monthlyTrend,
        direction: monthlyTrend > 0 ? 'up' : monthlyTrend < 0 ? 'down' : 'stable',
        percentage: monthlyData.length >= 2 && monthlyData[monthlyData.length - 2].value > 0 ? 
          (monthlyTrend / monthlyData[monthlyData.length - 2].value) * 100 : 0
      },
      weekly: {
        change: weeklyTrend,
        direction: weeklyTrend > 0 ? 'up' : weeklyTrend < 0 ? 'down' : 'stable',
        percentage: weeklyData.length >= 2 && weeklyData[weeklyData.length - 2].value > 0 ? 
          (weeklyTrend / weeklyData[weeklyData.length - 2].value) * 100 : 0
      }
    };
  }, [monthlyData, weeklyData]);
  
  if (!expenses?.length) {
    return (
      <div className="modern-analytics">
        <div className="analytics-header">
          <h2>📊 Spending Analytics</h2>
        </div>
        <div className="no-data-state">
          <div className="no-data-icon">📈</div>
          <h3>No Data Yet</h3>
          <p>Start adding expenses to see beautiful analytics and trends!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="modern-analytics">
      <div className="analytics-header">
        <h2>📊 Spending Analytics</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            Overview
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'trends' ? 'active' : ''}`}
            onClick={() => setViewMode('trends')}
          >
            Trends
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'categories' ? 'active' : ''}`}
            onClick={() => setViewMode('categories')}
          >
            Categories
          </button>
        </div>
      </div>

      
      {/* Summary Stats */}
      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Spent</h3>
            <p className="stat-value">{formatCurrency(stats.totalSpent)}</p>
          </div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Monthly Avg</h3>
            <p className="stat-value">{formatCurrency(stats.avgMonthly)}</p>
          </div>
        </div>
        <div className="stat-card tertiary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Weekly Avg</h3>
            <p className="stat-value">{formatCurrency(stats.avgWeekly)}</p>
          </div>
        </div>
      </div>
      
      {viewMode === 'overview' && (
        <div className="charts-section">
          <div className="charts-grid">
            {/* Pie Chart Container - 50% width */}
            {categoryData.length > 0 && (
              <div className="piechart-container">
                <PieChart 
                  data={categoryData}
                  title="🍰 Spending by Category"
                />
              </div>
            )}
            
            {/* Monthly Chart Container - 25% width */}
            {monthlyData.length > 0 && (
              <div className="monthly-chart-container">
                <div className="chart-header">
                  <h4>📈 Monthly Trends</h4>
                  <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="chart-filter">
                    <option value="3months">3 Months</option>
                    <option value="6months">6 Months</option>
                    <option value="12months">12 Months</option>
                  </select>
                </div>
                <ModernChart 
                  data={monthlyData}
                  color="hsl(183, 74%, 54%)"
                  type="monthly"
                  yAxisMax={yAxisMax}
                />
                {trends.monthly.direction !== 'stable' && (
                  <div className={`trend-indicator ${trends.monthly.direction}`}>
                    <span className="trend-icon">
                      {trends.monthly.direction === 'up' ? '📈' : '📉'}
                    </span>
                    <span className="trend-text">
                      {Math.abs(trends.monthly.percentage).toFixed(1)}% 
                      {trends.monthly.direction === 'up' ? ' increase' : ' decrease'} from last month
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Weekly Chart Container - 25% width */}
            {weeklyData.length > 0 && (
              <div className="weekly-chart-container">
                <div className="chart-header">
                  <h4>📅 Weekly Pattern</h4>
                  <select value={weekRange} onChange={(e) => setWeekRange(e.target.value)} className="chart-filter">
                    <option value="4weeks">4 Weeks</option>
                    <option value="6weeks">6 Weeks</option>
                    <option value="8weeks">8 Weeks</option>
                    <option value="12weeks">12 Weeks</option>
                  </select>
                </div>
                <ModernChart 
                  data={weeklyData}
                  color="hsl(280, 70%, 60%)"
                  type="weekly"
                  yAxisMax={yAxisMax}
                />
                {trends.weekly.direction !== 'stable' && (
                  <div className={`trend-indicator ${trends.weekly.direction}`}>
                    <span className="trend-icon">
                      {trends.weekly.direction === 'up' ? '📈' : '📉'}
                    </span>
                    <span className="trend-text">
                      {Math.abs(trends.weekly.percentage).toFixed(1)}% 
                      {trends.weekly.direction === 'up' ? ' increase' : ' decrease'} from last week
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
      
      {viewMode === 'trends' && (
        <div className="trends-analysis">
          <div className="charts-section">
            <div className="charts-grid">
              {/* Monthly Chart Container */}
              {monthlyData.length > 0 && (
                <div className="monthly-chart-container">
                  <div className="chart-header">
                    <h4>📈 Monthly Trends</h4>
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="chart-filter">
                      <option value="3months">3 Months</option>
                      <option value="6months">6 Months</option>
                      <option value="12months">12 Months</option>
                    </select>
                  </div>
                  <ModernChart 
                    data={monthlyData}
                    color="hsl(183, 74%, 54%)"
                    type="monthly"
                    yAxisMax={yAxisMax}
                  />
                </div>
              )}
              
              {/* Weekly Chart Container */}
              {weeklyData.length > 0 && (
                <div className="weekly-chart-container">
                  <div className="chart-header">
                    <h4>📅 Weekly Pattern</h4>
                    <select value={weekRange} onChange={(e) => setWeekRange(e.target.value)} className="chart-filter">
                      <option value="4weeks">4 Weeks</option>
                      <option value="6weeks">6 Weeks</option>
                      <option value="8weeks">8 Weeks</option>
                      <option value="12weeks">12 Weeks</option>
                    </select>
                  </div>
                  <ModernChart 
                    data={weeklyData}
                    color="hsl(280, 70%, 60%)"
                    type="weekly"
                    yAxisMax={yAxisMax}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="trend-cards">
            <div className="trend-card monthly">
              <h3>📊 Monthly Analysis</h3>
              <div className="trend-stats">
                <div className="trend-stat">
                  <span>Current Month:</span>
                  <strong>{formatCurrency(monthlyData[monthlyData.length - 1]?.value || 0)}</strong>
                </div>
                <div className="trend-stat">
                  <span>Average:</span>
                  <strong>{formatCurrency(stats.avgMonthly)}</strong>
                </div>
                <div className="trend-stat">
                  <span>Peak Month:</span>
                  <strong>{formatCurrency(Math.max(...monthlyData.map(d => d.value)))}</strong>
                </div>
              </div>
            </div>
            
            <div className="trend-card weekly">
              <h3>📅 Weekly Analysis</h3>
              <div className="trend-stats">
                <div className="trend-stat">
                  <span>Current Week:</span>
                  <strong>{formatCurrency(weeklyData[weeklyData.length - 1]?.value || 0)}</strong>
                </div>
                <div className="trend-stat">
                  <span>Average:</span>
                  <strong>{formatCurrency(stats.avgWeekly)}</strong>
                </div>
                <div className="trend-stat">
                  <span>Peak Week:</span>
                  <strong>{formatCurrency(Math.max(...weeklyData.map(d => d.value)))}</strong>
                </div>
              </div>
            </div>
          </div>
          
          <div className="insights-section">
            <h3>💡 Smart Insights</h3>
            <div className="insights-grid">
              {trends.monthly.direction === 'up' && (
                <div className="insight-card warning">
                  <span className="insight-icon">⚠️</span>
                  <div>
                    <h4>Monthly Spending Increased</h4>
                    <p>Your spending is up {Math.abs(trends.monthly.percentage).toFixed(1)}% from last month. Consider reviewing your budget.</p>
                  </div>
                </div>
              )}
              
              {trends.monthly.direction === 'down' && (
                <div className="insight-card success">
                  <span className="insight-icon">✅</span>
                  <div>
                    <h4>Great Progress!</h4>
                    <p>You've reduced spending by {Math.abs(trends.monthly.percentage).toFixed(1)}% this month. Keep it up!</p>
                  </div>
                </div>
              )}
              
              {stats.savingsRate > 20 && (
                <div className="insight-card success">
                  <span className="insight-icon">🎯</span>
                  <div>
                    <h4>Excellent Savings Rate</h4>
                    <p>You're saving {stats.savingsRate.toFixed(1)}% of your budget. You're on track for financial success!</p>
                  </div>
                </div>
              )}
              
              {stats.savingsRate < 0 && (
                <div className="insight-card warning">
                  <span className="insight-icon">🚨</span>
                  <div>
                    <h4>Over Budget</h4>
                    <p>You're spending {Math.abs(stats.savingsRate).toFixed(1)}% more than your budget. Time to review your expenses.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {viewMode === 'categories' && (
        <div className="categories-section">
          {categoryData.length > 0 ? (
            <>
              {/* Summary Stats */}
              <div className="category-stats">
                <div className="stat-card secondary">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <h3>Total Budget</h3>
                    <p className="stat-value">{formatCurrency(stats.totalBudget)}</p>
                  </div>
                </div>
                <div className="stat-card tertiary">
                  <div className="stat-icon">💵</div>
                  <div className="stat-content">
                    <h3>Amount Left</h3>
                    <p className={`stat-value ${stats.totalBudget - stats.totalSpent < 0 ? 'negative' : ''}`}>
                      {formatCurrency(stats.totalBudget - stats.totalSpent)}
                    </p>
                  </div>
                </div>
                <div className="stat-card quaternary">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <h3>Savings Rate</h3>
                    <p className={`stat-value ${stats.savingsRate < 0 ? 'negative' : ''}`}>
                      {stats.savingsRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="piechart-container">
                <PieChart 
                  data={categoryData}
                  title="🍰 Spending Distribution"
                />
              </div>
              

              
              {/* Category Insights */}
              <div className="category-insights">
                <h4>💡 Category Insights</h4>
                <div className="insights-grid">
                  {categoryData.map((category, index) => {
                    const budget = budgets.find(b => b.name === category.label);
                    const percentage = budget ? (category.value / budget.amount) * 100 : 0;
                    
                    if (percentage > 100) {
                      return (
                        <div key={index} className="insight-card warning">
                          <span className="insight-icon">⚠️</span>
                          <div>
                            <h5>{category.label} Over Budget</h5>
                            <p>Exceeded by {formatCurrency(category.value - budget.amount)} ({(percentage - 100).toFixed(1)}%)</p>
                          </div>
                        </div>
                      );
                    } else if (percentage > 80) {
                      return (
                        <div key={index} className="insight-card info">
                          <span className="insight-icon">🟡</span>
                          <div>
                            <h5>{category.label} Near Limit</h5>
                            <p>Used {percentage.toFixed(1)}% of budget. {formatCurrency(budget.amount - category.value)} remaining.</p>
                          </div>
                        </div>
                      );
                    } else if (percentage < 50 && category.value > 0) {
                      return (
                        <div key={index} className="insight-card success">
                          <span className="insight-icon">✅</span>
                          <div>
                            <h5>{category.label} On Track</h5>
                            <p>Great control! Only {percentage.toFixed(1)}% used.</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                </div>
              </div>
            </>
          ) : (
            <div className="no-data-state">
              <div className="no-data-icon">📊</div>
              <h3>No Category Data</h3>
              <p>Add some expenses to see category breakdown!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModernAnalytics;