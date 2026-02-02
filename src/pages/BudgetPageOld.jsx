// rrd imports
import { useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import React from "react";

// library
import { toast } from "react-toastify";
import { StarIcon, FlagIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// components
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetItem from "../components/BudgetItem";
import Table from "../components/Table";

// helpers
import { createExpense, deleteItem, getAllMatchingItems, fetchUserData, fetchData } from "../helpers";

// loader
export async function budgetLoader({ params }) {
  if (!params?.id) {
    throw new Error("Budget ID is required");
  }
  
  const allBudgets = fetchUserData("budgets") || [];
  const budget = allBudgets.find(b => b.id === params.id);

  const allExpenses = fetchUserData("expenses") || [];
  const expenses = allExpenses.filter(e => e.budgetId === params.id);

  if (!budget) {
    throw new Error("The budget you’re trying to find doesn’t exist");
  }

  return { budget, expenses };
}

// action
export async function budgetAction({ request }) {
  const data = await request.formData();
  const { _action, ...values } = Object.fromEntries(data);

  if (_action === "createExpense") {
    try {
      createExpense({
        name: values.newExpense,
        amount: values.newExpenseAmount,
        budgetId: values.newExpenseBudget,
      });
      return toast.success(`Expense ${values.newExpense} created!`);
    } catch (e) {
      throw new Error("There was a problem creating your expense.");
    }
  }

  if (_action === "deleteBudget") {
    try {
      // Delete all expenses first, then delete the budget
      const expenses = fetchUserData("expenses") ?? [];
      const budgetExpenses = expenses.filter(expense => expense.budgetId === values.budgetId);
      
      // Delete associated expenses
      if (budgetExpenses.length > 0) {
        const remainingExpenses = expenses.filter(expense => expense.budgetId !== values.budgetId);
        const currentUser = fetchData('currentUser');
        if (currentUser) {
          const userKey = `expenses_${currentUser.id}`;
          localStorage.setItem(userKey, JSON.stringify(remainingExpenses));
        }
      }
      
      // Delete the budget directly from localStorage to bypass validation
      const budgets = fetchUserData("budgets") ?? [];
      const remainingBudgets = budgets.filter(budget => budget.id !== values.budgetId);
      const currentUser = fetchData('currentUser');
      if (currentUser) {
        const userKey = `budgets_${currentUser.id}`;
        localStorage.setItem(userKey, JSON.stringify(remainingBudgets));
      }
      
      // Don't redirect immediately, let the component detect the deletion
      return toast.success("Budget and associated expenses deleted successfully!");
    } catch (e) {
      return toast.error(e.message);
    }
  }

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

const BudgetPage = () => {
  const { budget, expenses } = useLoaderData();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleted, setIsDeleted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = expenses.slice(startIndex, startIndex + itemsPerPage);

  // Check if budget was deleted (from localStorage)
  React.useEffect(() => {
    const checkBudgetExists = () => {
      const allBudgets = fetchUserData("budgets") || [];
      const budgetExists = allBudgets.find(b => b.id === budget.id);
      
      if (!budgetExists) {
        setIsDeleted(true);
        
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              navigate('/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(countdownInterval);
      }
    };
    
    // Check immediately and then every 500ms
    checkBudgetExists();
    const interval = setInterval(checkBudgetExists, 500);
    
    return () => clearInterval(interval);
  }, [budget.id, navigate]);

  if (isDeleted) {
    return (
      <div className="grid-lg" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
        <div className="deletion-success">
          <h1 className="h2">✅ Budget Deleted Successfully</h1>
          <p>This budget doesn't exist anymore - it has been permanently removed.</p>
          <p>Redirecting to dashboard in <strong>{countdown}</strong> seconds...</p>
          <button 
            className="btn btn--dark" 
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: 'var(--space-md)' }}
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid-lg"
      style={{
        "--accent": budget.color,
      }}
    >
      <h1 className="h2">
        <span className="accent">{budget.name}</span> Overview
      </h1>
      <div className="flex-lg">
        <BudgetItem budget={budget} showDelete={true} />
        <AddExpenseForm budgets={[budget]} />
      </div>
      {expenses && expenses.length > 0 ? (
        <div className="grid-md">
          <h2>
            <span className="accent">{budget.name}</span> Expenses ({expenses.length} total)
          </h2>
          <Table expenses={paginatedExpenses} showBudget={false} />
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn btn--outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon width={16} />
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="btn btn--outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon width={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="no-expenses-encouragement">
          <div className="encouragement-icon"><StarIcon width={32} /></div>
          <p>No expenses yet - you're off to a great start!</p>
          <p className="muted">Add your first expense to start tracking your budget progress.</p>
        </div>
      )}
      
      <div className="encouragement-section">
        <div className="encouragement-card budget-specific">
          <div className="encouragement-icon"><FlagIcon width={32} /></div>
          <h3>Budget Champion!</h3>
          <p>You're taking control of your <span className="accent">{budget?.name}</span> spending. Smart budgeting leads to financial success!</p>
        </div>
      </div>
    </div>
  );
};
export default BudgetPage;
