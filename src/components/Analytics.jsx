import { useMemo, useState } from "react";
import { formatCurrency } from "../helpers";
import { getSpendingByCategory, getMonthlyTrends, BUDGET_CATEGORIES } from "../helpers";
import PieChart from "./PieChart";
import LineChart from "./LineChart";
import SpendingVelocity from "./SpendingVelocity";

const Analytics = ({ expenses, budgets }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, category, trends
  
  const categorySpending = useMemo(() => getSpendingByCategory(expenses, budgets), [expenses, budgets]);
  const monthlyTrends = useMemo(() => getMonthlyTrends(expenses), [expenses]);
  
  const totalSpent = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
  const savingsRate = totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget) * 100 : 0;
  
  // Prepare pie chart data
  const pieChartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    
    const categoryTotals = {};
    expenses.forEach(expense => {
      const budget = budgets?.find(b => b.id === expense.budgetId);
      const categoryId = budget?.category || 'other';
      categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + expense.amount;
    });
    
    const colors = {
      food: 'hsl(25, 70%, 60%)',
      transport: 'hsl(200, 70%, 60%)',
      entertainment: 'hsl(280, 70%, 60%)',
      shopping: 'hsl(320, 70%, 60%)',
      bills: 'hsl(45, 70%, 60%)',
      health: 'hsl(120, 70%, 60%)',
      other: 'hsl(0, 70%, 60%)'
    };
    
    return Object.entries(categoryTotals).map(([categoryId, amount]) => {
      const category = BUDGET_CATEGORIES.find(c => c.id === categoryId) || BUDGET_CATEGORIES[6];
      return {
        label: category.name,
        value: amount,
        color: colors[categoryId] || colors.other,
        category: categoryId
      };
    }).filter(item => item.value > 0);
  }, [expenses, budgets]);
  
  // Prepare line chart data
  const lineChartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    
    const trends = getMonthlyTrends(expenses);
    const sortedTrends = Object.entries(trends)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
    
    // Ensure at least 3 data points for better visualization
    if (sortedTrends.length === 1) {
      const [month, amount] = sortedTrends[0];
      const currentDate = new Date(month);
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
      
      return [
        {
          label: (prevMonth.getMonth() + 1) + '/' + prevMonth.getFullYear().toString().slice(-2),
          value: 0
        },
        {
          label: month.split('-')[1] + '/' + month.split('-')[0].slice(-2),
          value: amount
        },
        {
          label: (nextMonth.getMonth() + 1) + '/' + nextMonth.getFullYear().toString().slice(-2),
          value: amount * 0.7
        }
      ];
    }
    
    return sortedTrends.map(([month, amount]) => ({
      label: month.split('-')[1] + '/' + month.split('-')[0].slice(-2),
      value: amount
    }));
  }, [expenses]);
  
  // Weekly spending trends
  const weeklyTrends = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    
    const weeklyData = {};
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      const weekStart = new Date(date.getTime());
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + expense.amount;
    });
    
    const sortedWeeks = Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8);
    
    // Ensure at least 3 data points for better visualization
    if (sortedWeeks.length === 1) {
      const [week, amount] = sortedWeeks[0];
      const currentWeek = new Date(week);
      const prevWeek = new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
      const nextWeek = new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return [
        {
          label: prevWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: 0
        },
        {
          label: currentWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: amount
        },
        {
          label: nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: amount * 0.8
        }
      ];
    }
    
    return sortedWeeks.map(([week, amount]) => ({
      label: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: amount
    }));
  }, [expenses]);
  
  // Category growth analysis
  const categoryGrowth = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    
    const now = new Date();
    const thisMonth = expenses.filter(e => {
      const date = new Date(e.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    
    const lastMonth = expenses.filter(e => {
      const date = new Date(e.createdAt);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });
    
    const thisMonthCategories = {};
    const lastMonthCategories = {};
    
    thisMonth.forEach(expense => {
      const budget = budgets?.find(b => b.id === expense.budgetId);
      const category = budget?.category || 'other';
      thisMonthCategories[category] = (thisMonthCategories[category] || 0) + expense.amount;
    });
    
    lastMonth.forEach(expense => {
      const budget = budgets?.find(b => b.id === expense.budgetId);
      const category = budget?.category || 'other';
      lastMonthCategories[category] = (lastMonthCategories[category] || 0) + expense.amount;
    });
    
    return BUDGET_CATEGORIES.map(cat => {
      const thisAmount = thisMonthCategories[cat.id] || 0;
      const lastAmount = lastMonthCategories[cat.id] || 0;
      const change = lastAmount > 0 ? ((thisAmount - lastAmount) / lastAmount) * 100 : 0;
      
      return {
        category: cat.name,
        icon: cat.icon,
        thisMonth: thisAmount,
        lastMonth: lastAmount,
        change: change,
        trend: change > 10 ? 'up' : change < -10 ? 'down' : 'stable'
      };
    }).filter(item => item.thisMonth > 0 || item.lastMonth > 0);
  }, [expenses, budgets]);
  
  const filteredExpenses = selectedCategory ? 
    expenses.filter(expense => {
      const budget = budgets.find(b => b.id === expense.budgetId);
      return budget?.category === selectedCategory;
    }) : expenses;
  
  const handleCategorySelect = (segment) => {
    setSelectedCategory(selectedCategory === segment.category ? null : segment.category);
  };

  return (
    <div className="analytics" data-tutorial="analytics">
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
            className={`toggle-btn ${viewMode === 'category' ? 'active' : ''}`}
            onClick={() => setViewMode('category')}
          >
            Categories
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'trends' ? 'active' : ''}`}
            onClick={() => setViewMode('trends')}
          >
            Trends
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Spent</h3>
          <p className="stat-value">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Budget</h3>
          <p className="stat-value">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="stat-card">
          <h3>Savings Rate</h3>
          <p className="stat-value">{savingsRate.toFixed(1)}%</p>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="overview-charts">
          {pieChartData.length > 0 || lineChartData.length > 0 ? (
            <>
              <div className="charts-grid">
                {/* Pie Chart Container - 50% width */}
                {pieChartData.length > 0 && (
                  <div className="piechart-container">
                    <PieChart 
                      data={pieChartData}
                      title="Spending by Category"
                      onSegmentClick={handleCategorySelect}
                    />
                  </div>
                )}
                
                {/* Monthly Chart Container - 25% width */}
                {lineChartData.length > 0 && (
                  <div className="monthly-chart-container">
                    <LineChart 
                      data={lineChartData}
                      title="Monthly Spending Trend"
                      color="hsl(183, 74%, 54%)"
                    />
                  </div>
                )}
                
                {/* Weekly Chart Container - 25% width */}
                {weeklyTrends.length > 0 && (
                  <div className="weekly-chart-container">
                    <LineChart 
                      data={weeklyTrends}
                      title="Weekly Spending Pattern"
                      color="hsl(280, 70%, 60%)"
                    />
                  </div>
                )}
              </div>

              
              <SpendingVelocity expenses={expenses} />
              
              {categoryGrowth.length > 0 && (
                <div className="category-growth-section">
                  <h3>📈 Category Growth Analysis</h3>
                  <div className="growth-grid">
                    {categoryGrowth.map((item, index) => (
                      <div key={index} className={`growth-card ${item.trend}`}>
                        <div className="growth-header">
                          <span className="growth-icon">{item.icon}</span>
                          <span className="growth-category">{item.category}</span>
                          <span className={`growth-indicator ${item.trend}`}>
                            {item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️'}
                          </span>
                        </div>
                        <div className="growth-amounts">
                          <div className="amount-row">
                            <span>This Month:</span>
                            <strong>{formatCurrency(item.thisMonth)}</strong>
                          </div>
                          <div className="amount-row">
                            <span>Last Month:</span>
                            <span>{formatCurrency(item.lastMonth)}</span>
                          </div>
                          {Math.abs(item.change) > 5 && (
                            <div className={`change-row ${item.trend}`}>
                              <span>{Math.abs(item.change).toFixed(1)}% {item.change > 0 ? 'increase' : 'decrease'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-data-message">
              <h3>📊 No Data Yet</h3>
              <p>Add some expenses to see beautiful analytics!</p>
            </div>
          )}
          
          {selectedCategory && (
            <div className="category-details">
              <h3>📋 {BUDGET_CATEGORIES.find(c => c.id === selectedCategory)?.name} Expenses</h3>
              <div className="filtered-expenses">
                {filteredExpenses.slice(0, 5).map(expense => (
                  <div key={expense.id} className="expense-preview">
                    <span>{expense.name}</span>
                    <span>{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
                {filteredExpenses.length > 5 && (
                  <p className="more-expenses">+{filteredExpenses.length - 5} more expenses</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {viewMode === 'category' && (
        <div className="category-view">
          {pieChartData.length > 0 ? (
            <PieChart 
              data={pieChartData}
              title="Interactive Category Breakdown"
              onSegmentClick={handleCategorySelect}
            />
          ) : (
            <div className="no-data-message">
              <h3>📊 No Category Data</h3>
              <p>Add expenses to see category breakdown!</p>
            </div>
          )}
          <div className="category-insights">
            <h3>💡 Category Insights</h3>
            {pieChartData.map(item => {
              const percentage = (item.value / totalSpent) * 100;
              return (
                <div key={item.category} className="insight-card">
                  <div className="insight-header">
                    <span>{BUDGET_CATEGORIES.find(c => c.id === item.category)?.icon}</span>
                    <strong>{item.label}</strong>
                  </div>
                  <div className="insight-stats">
                    <span>{formatCurrency(item.value)} ({percentage.toFixed(1)}%)</span>
                    <div className="insight-bar">
                      <div 
                        className="insight-fill" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {viewMode === 'trends' && (
        <div className="trends-view">
          {lineChartData.length > 0 || weeklyTrends.length > 0 ? (
            <>
              {lineChartData.length > 0 && (
                <LineChart 
                  data={lineChartData}
                  title="📊 Monthly Spending Trends"
                  color="hsl(183, 74%, 54%)"
                />
              )}
              
              {weeklyTrends.length > 0 && (
                <LineChart 
                  data={weeklyTrends}
                  title="📅 Weekly Spending Trends"
                  color="hsl(120, 70%, 60%)"
                />
              )}
              
              <div className="trend-insights-advanced">
                <h3>🔍 Advanced Trend Analysis</h3>
                <div className="insights-advanced-grid">
                  {lineChartData.length > 1 && (
                    <div className="insight-advanced-card">
                      <h4>📈 Monthly Trend</h4>
                      <div className="trend-stats">
                        <div className="stat-item">
                          <span>Average:</span>
                          <strong>{formatCurrency(lineChartData.reduce((sum, d) => sum + d.value, 0) / lineChartData.length)}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Peak Month:</span>
                          <strong>{formatCurrency(Math.max(...lineChartData.map(d => d.value)))}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Lowest Month:</span>
                          <strong>{formatCurrency(Math.min(...lineChartData.map(d => d.value)))}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {weeklyTrends.length > 1 && (
                    <div className="insight-advanced-card">
                      <h4>📅 Weekly Pattern</h4>
                      <div className="trend-stats">
                        <div className="stat-item">
                          <span>Weekly Average:</span>
                          <strong>{formatCurrency(weeklyTrends.reduce((sum, d) => sum + d.value, 0) / weeklyTrends.length)}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Peak Week:</span>
                          <strong>{formatCurrency(Math.max(...weeklyTrends.map(d => d.value)))}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Trend:</span>
                          <strong className={weeklyTrends[weeklyTrends.length - 1].value > weeklyTrends[0].value ? 'trend-up' : 'trend-down'}>
                            {weeklyTrends[weeklyTrends.length - 1].value > weeklyTrends[0].value ? '📈 Increasing' : '📉 Decreasing'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-data-message">
              <h3>📈 No Trend Data</h3>
              <p>Add expenses over time to see trends!</p>
            </div>
          )}
          <div className="trend-insights">
            <h3>📈 Trend Analysis</h3>
            <div className="trend-stats">
              {lineChartData.length > 1 && (
                <>
                  <div className="trend-stat">
                    <span>Average Monthly</span>
                    <strong>{formatCurrency(lineChartData.reduce((sum, d) => sum + d.value, 0) / lineChartData.length)}</strong>
                  </div>
                  <div className="trend-stat">
                    <span>Highest Month</span>
                    <strong>{formatCurrency(Math.max(...lineChartData.map(d => d.value)))}</strong>
                  </div>
                  <div className="trend-stat">
                    <span>Lowest Month</span>
                    <strong>{formatCurrency(Math.min(...lineChartData.map(d => d.value)))}</strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;