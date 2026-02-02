import { useState } from "react";
import { filterBudgetsByMonth, filterOverBudgetBudgets, filterMostActiveBudgets } from "../helpers";

const BudgetFilter = ({ budgets, children }) => {
  const [showFilter, setShowFilter] = useState('all');
  
  if (!budgets || budgets.length === 0) {
    return children([]);
  }
  
  const getFilteredBudgets = () => {
    switch (showFilter) {
      case 'current':
        return filterBudgetsByMonth(budgets, 0);
      case 'previous':
        return filterBudgetsByMonth(budgets, -1);
      case 'next':
        return filterBudgetsByMonth(budgets, 1);
      case 'overbudget':
        return filterOverBudgetBudgets(budgets);
      case 'active':
        return filterMostActiveBudgets(budgets);
      case 'all':
      default:
        return budgets;
    }
  };

  const filteredBudgets = getFilteredBudgets();
  const overBudgetCount = filterOverBudgetBudgets(budgets).length;
  const currentMonthCount = filterBudgetsByMonth(budgets, 0).length;
  const previousMonthCount = filterBudgetsByMonth(budgets, -1).length;
  const nextMonthCount = filterBudgetsByMonth(budgets, 1).length;

  return (
    <div className="budget-filter-container">
      <div className="budget-filter-header">
        <h2>Existing Budgets</h2>
        <select 
          value={showFilter} 
          onChange={(e) => setShowFilter(e.target.value)}
          className="budget-filter-dropdown"
        >
          <option value="all">All ({budgets.length})</option>
          <option value="current">Current Month ({currentMonthCount})</option>
          <option value="previous">Previous Month ({previousMonthCount})</option>
          <option value="next">Next Month ({nextMonthCount})</option>
          <option value="overbudget">Over Budget ({overBudgetCount})</option>
          <option value="active">Most Active</option>
        </select>
      </div>
      
      {filteredBudgets.length > 0 ? (
        children(filteredBudgets)
      ) : (
        <div className="no-budgets-message">
          <p>No {showFilter === 'all' ? '' : showFilter} budgets found.</p>
          {showFilter !== 'all' && (
            <button 
              className="btn btn--outline"
              onClick={() => setShowFilter('all')}
            >
              View All Budgets
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetFilter;