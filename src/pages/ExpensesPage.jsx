// rrd imports
import { useLoaderData } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";

// library import
import { toast } from "react-toastify";
import { BoltIcon } from "@heroicons/react/24/outline";

// component imports
import Table from "../components/Table";
import SearchFilter from "../components/SearchFilter";
import SimpleAchievementBar from "../components/SimpleAchievementBar";

// helpers
import { deleteItem, fetchUserData, searchExpenses, filterExpenses } from "../helpers";

// loader
export async function expensesLoader() {
  try {
    const expenses = fetchUserData("expenses") || [];
    const budgets = fetchUserData("budgets") || [];
    return { expenses, budgets };
  } catch (error) {
    console.error('Error loading expenses:', error);
    return { expenses: [], budgets: [] };
  }
}

// action
export async function expensesAction({ request }) {
  const data = await request.formData();
  const { _action, ...values } = Object.fromEntries(data);

  if (_action === "deleteExpense") {
    try {
      deleteItem({
        key: "expenses",
        id: values.expenseId,
      });
      return toast.success("Expense deleted!");
    } catch (e) {
      throw new Error("There was a problem deleting your expense.");
    }
  }
}

const ExpensesPage = () => {
  const { expenses, budgets } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ budget: "", date: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredExpenses = useMemo(() => {
    if (!expenses || !Array.isArray(expenses)) return [];
    
    return expenses
      .filter(expense => {
        // Validate expense object
        if (!expense || !expense.id) return false;
        
        // Search filter
        if (searchTerm?.trim()) {
          const name = expense.name?.toLowerCase() || '';
          const term = searchTerm.trim().toLowerCase();
          if (!name.includes(term)) return false;
        }
        
        // Budget filter - strict matching
        if (filters.budget?.trim()) {
          if (expense.budgetId !== filters.budget.trim()) return false;
        }
        
        // Date filter
        if (filters.date?.trim()) {
          const days = parseInt(filters.date.trim());
          if (days > 0) {
            const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
            if (!expense.createdAt || expense.createdAt < cutoff) return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [expenses, searchTerm, filters]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  return (
    <div className="grid-lg">
      <h1>All Expenses</h1>
      
      <SearchFilter 
        onSearch={setSearchTerm}
        onFilter={setFilters}
        budgets={budgets}
      />
      
      {filteredExpenses && filteredExpenses.length > 0 ? (
        <div className="grid-md">
          <h2>
            {searchTerm || filters.budget || filters.date ? 'Filtered' : 'All'} Expenses 
            <small>({filteredExpenses.length} of {expenses.length} total)</small>
          </h2>
          <Table 
            key={`${searchTerm}-${filters.budget}-${filters.date}-${currentPage}`}
            expenses={paginatedExpenses} 
          />
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn prev" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              
              <div className="pagination-info">
                <span>Page {currentPage} of {totalPages}</span>
                <small>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length}</small>
              </div>
              
              <button 
                className="pagination-btn next" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>{searchTerm || filters.budget || filters.date ? 'No matching expenses found' : 'No Expenses to show'}</p>
      )}
      
      <div className="encouragement-section">
        <div className="encouragement-card">
          <div className="encouragement-icon"><BoltIcon width={32} /></div>
          <h3>Financial Warrior!</h3>
          <p>You're actively managing your money - that's awesome! Every expense you track brings you closer to financial freedom.</p>
        </div>
      </div>
      
      <SimpleAchievementBar expenses={expenses || []} budgets={budgets || []} />
      
      <div className="acknowledgment">
        <p className="muted">
          Built with React Router • Personal Finance Manager
        </p>
      </div>
    </div>
  );
};

export default ExpensesPage;
