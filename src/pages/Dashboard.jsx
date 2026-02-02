// rrd imports
import { Link, useLoaderData } from "react-router-dom";
import React, { useState } from "react";

// library imports
import { toast } from "react-toastify";
import { TrashIcon, SparklesIcon, FireIcon, LightBulbIcon, FlagIcon, ChartBarIcon, TrophyIcon, BoltIcon } from "@heroicons/react/24/outline";



// components
import Intro from "../components/Intro";
import AddBudgetForm from "../components/AddBudgetForm";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetItem from "../components/BudgetItem";
import Table from "../components/Table";
import Analytics from "../components/Analytics";
import ModernAnalytics from "../components/ModernAnalytics";
import DataManager from "../components/DataManager";

import SearchFilter from "../components/SearchFilter";
import RecurringExpenses from "../components/RecurringExpenses";
import BudgetTemplates from "../components/BudgetTemplates";

import NotificationSystem from "../components/NotificationSystem";

import SpendingHeatmap from "../components/SpendingHeatmap";
import BudgetHealthScore from "../components/BudgetHealthScore";
import ExpenseInsights from "../components/ExpenseInsights";
import ExpenseComparison from "../components/ExpenseComparison";
import SampleDataButton from "../components/SampleDataButton";
import EnhancedSampleDataButton from "../components/EnhancedSampleDataButton";
import GoalCelebration from "../components/GoalCelebration";

import ImprovedOnboarding from "../components/ImprovedOnboarding";
import SmartExpenseSuggestions from "../components/SmartExpenseSuggestions";
import FinalAchievements from "../components/FinalAchievements";
import "../monthly-salary-budget.css";
import "../monthly-salary-demo.css";
import "../budget-filter.css";
import "../expense-edit.css";
import SimpleAchievementBar from "../components/SimpleAchievementBar";
import MonthlySalaryBudget from "../components/MonthlySalaryBudget";
import MonthlySalaryDemo from "../components/MonthlySalaryDemo";
import BudgetFilter from "../components/BudgetFilter";



//  helper functions
import {
  createBudget,
  createExpense,
  createRecurringExpense,
  createMonthlySalaryBudget,
  updateBudget,
  deleteItem,
  fetchData,
  fetchUserData,
  reorderBudgets,
  waait,
} from "../helpers";
import { useDragAndDrop } from "../hooks/useInteractions";

// loader
export function dashboardLoader() {
  const currentUser = fetchData("currentUser");
  const budgets = fetchUserData("budgets");
  const expenses = fetchUserData("expenses");
  return { currentUser, budgets, expenses };
}

// action
export async function dashboardAction({ request }) {
  await waait();

  const data = await request.formData();
  const { _action, ...values } = Object.fromEntries(data);

  // This action is no longer needed as user creation is handled by signup page

  if (_action === "createMonthlySalaryBudget") {
    try {
      const allocations = {};
      let customCategories = [];
      
      // Extract allocations from form data
      Object.entries(values).forEach(([key, value]) => {
        if (key.startsWith('allocation_')) {
          const categoryId = key.replace('allocation_', '');
          allocations[categoryId] = value;
        }
      });
      
      // Parse custom categories if provided
      if (values.customCategories) {
        try {
          customCategories = JSON.parse(values.customCategories);
        } catch (e) {
          console.warn('Failed to parse custom categories:', e);
        }
      }
      
      createMonthlySalaryBudget({
        monthYear: values.monthYear,
        totalSalary: values.totalSalary,
        allocations: allocations,
        createSavings: values.createSavings === 'true',
        customCategories: customCategories
      });
      
      const monthName = new Date(values.monthYear + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (+val || 0), 0);
      const remaining = (+values.totalSalary) - totalAllocated;
      
      let message = `Monthly salary budget for ${monthName} created successfully!`;
      if (remaining > 0 && values.createSavings === 'true') {
        message += ` Savings budget of ₹${remaining.toLocaleString()} also created.`;
      }
      
      return toast.success(message);
    } catch (e) {
      return toast.error(e.message);
    }
  }

  if (_action === "deleteBudget") {
    try {
      deleteItem({
        key: "budgets",
        id: values.budgetId,
      });
      return toast.success("Budget deleted successfully!");
    } catch (e) {
      return toast.error(e.message);
    }
  }

  if (_action === "createBudget") {
    try {
      const existingBudgets = fetchUserData("budgets") ?? [];
      const existingBudget = existingBudgets.find(
        budget => budget.name.toLowerCase() === values.newBudget.toLowerCase().trim()
      );
      
      createBudget({
        name: values.newBudget,
        amount: values.newBudgetAmount,
        category: values.newBudgetCategory,
      });
      
      if (existingBudget) {
        return toast.success(`Budget "${values.newBudget}" updated! Amount merged with existing budget.`);
      } else {
        return toast.success(`Budget "${values.newBudget}" created!`);
      }
    } catch (e) {
      return toast.error(e.message);
    }
  }

  if (_action === "createExpense") {
    try {
      createExpense({
        name: values.newExpense,
        amount: values.newExpenseAmount,
        budgetId: values.newExpenseBudget,
      });
      return toast.success(`Expense ${values.newExpense} created!`);
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

  if (_action === "createRecurring") {
    try {
      createRecurringExpense({
        name: values.recurringName,
        amount: values.recurringAmount,
        budgetId: values.recurringBudget,
        frequency: values.recurringFrequency,
      });
      return toast.success(`Recurring expense ${values.recurringName} created!`);
    } catch (e) {
      throw new Error("There was a problem creating your recurring expense.");
    }
  }

  if (_action === "updateBudget") {
    try {
      const existingBudgets = fetchUserData("budgets") ?? [];
      const currentBudget = existingBudgets.find(b => b.id === values.budgetId);
      const duplicateBudget = existingBudgets.find(
        b => b.id !== values.budgetId && b.name.toLowerCase() === values.budgetName.toLowerCase().trim()
      );
      
      updateBudget({
        id: values.budgetId,
        name: values.budgetName,
        amount: values.budgetAmount,
      });
      
      if (duplicateBudget) {
        return toast.success(`Budgets merged! "${values.budgetName}" amounts combined and expenses transferred.`);
      } else if (currentBudget && currentBudget.name !== values.budgetName.trim()) {
        return toast.success(`Budget renamed to "${values.budgetName}" and updated successfully!`);
      } else {
        return toast.success(`Budget "${values.budgetName}" updated successfully!`);
      }
    } catch (e) {
      return toast.error(e.message);
    }
  }
}

const Dashboard = () => {
  const { currentUser, budgets, expenses } = useLoaderData();
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [showQuickBudget, setShowQuickBudget] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboardingCompleted') && (!budgets || budgets.length === 0);
  });
  const [orderedBudgets, setOrderedBudgets] = useState(budgets || []);

  const handleBudgetReorder = (newOrder) => {
    setOrderedBudgets(newOrder);
    reorderBudgets(newOrder);
  };

  const dragHandlers = useDragAndDrop(orderedBudgets, handleBudgetReorder);

  React.useEffect(() => {
    setOrderedBudgets(budgets || []);
  }, [budgets]);




  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
  };

  const handleSmartSuggestion = (name, amount) => {
    // Auto-fill the expense form with suggestion
    setTimeout(() => {
      const nameInput = document.querySelector('#newExpense');
      const amountInput = document.querySelector('#newExpenseAmount');
      
      if (nameInput && name) {
        nameInput.value = name;
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (amountInput && amount) {
        amountInput.value = amount;
        amountInput.dispatchEvent(new Event('input', { bubbles: true }));
        amountInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Focus on the appropriate input
      if (name && nameInput) {
        nameInput.focus();
      } else if (amountInput) {
        amountInput.focus();
      }
    }, 100);
  };



  return (
    <>
        <NotificationSystem budgets={budgets} expenses={expenses} />
        <GoalCelebration budgets={budgets} />
      
      {currentUser ? (
        <div className="dashboard">
          <h1>
            Welcome back, <span className="accent">{currentUser.fullName}</span>
          </h1>
          
          <div className="dashboard-header-section">
            <div className="dashboard-actions">
              {(!expenses || expenses.length === 0) && (!budgets || budgets.length === 0) && (
                <EnhancedSampleDataButton />
              )}
            </div>
            {showOnboarding && (
              <ImprovedOnboarding onComplete={handleOnboardingComplete} />
            )}
          </div>
          
          <div className="grid-sm">
            {budgets && budgets.length > 0 ? (
              <div className="grid-lg">
                <div className="dashboard-suggestions">
                  <SmartExpenseSuggestions onSuggestionSelect={handleSmartSuggestion} />
                </div>
                
                <div className="dashboard-forms">
                  <div className="flex-lg">
                    <AddBudgetForm />
                    <AddExpenseForm budgets={budgets} />
                  </div>
                </div>
                
                <div className="dashboard-salary-tools">
                  <MonthlySalaryDemo />
                  <MonthlySalaryBudget />
                </div>
                
                <div className="dashboard-budgets">
                  <BudgetFilter budgets={orderedBudgets}>
                    {(filteredBudgets) => (
                      <div className="budgets-grid">
                        {filteredBudgets.map((budget, index) => (
                          <BudgetItem 
                            key={budget.id} 
                            budget={budget} 
                            index={index}
                            dragHandlers={dragHandlers}
                            isDragging={dragHandlers.draggedItem?.item.id === budget.id}
                            isDragOver={dragHandlers.dragOverIndex === index}
                          />
                        ))}
                      </div>
                    )}
                  </BudgetFilter>
                </div>
                
                <div className="dashboard-grid">
                                  <ModernAnalytics expenses={expenses || []} budgets={budgets || []} />
                                  
                                  <BudgetHealthScore expenses={expenses || []} budgets={budgets || []} />
                                  
                                  <ExpenseInsights expenses={expenses || []} budgets={budgets || []} />
                                  
                                  <ExpenseComparison expenses={expenses || []} />
                                  
                                  <SpendingHeatmap expenses={expenses || []} />
                 </div>
                
                <div className="recurring-expenses">
                  <RecurringExpenses budgets={budgets} />
                </div>
                <div className="recurring-expenses">
                  <DataManager budgets={budgets} />
                </div>
                  
                
                
                {expenses && expenses.length > 0 && (
                                  <div className="grid-md">
                                    <h2>Recent Expenses</h2>
                                    <Table
                                      expenses={expenses
                                        .sort((a, b) => b.createdAt - a.createdAt)
                                        .slice(0, 8)}
                                    />
                                    {expenses.length > 8 && (
                                      <Link to="/dashboard/expenses" className="btn btn--dark">
                                        View all expenses
                                      </Link>
                                    )}
                                  </div>
                                )}
                
                <div className="encouragement-section">
                  <div className="encouragement-card">
                    <div className="encouragement-icon"><TrophyIcon width={32} /></div>
                    <h3>You're doing great!</h3>
                    <p>Keep tracking your expenses and you'll reach your financial goals. Every small step counts towards building better money habits!</p>
                  </div>
                </div>
                
                <div className="dashboard-achievements">
                  <SimpleAchievementBar expenses={expenses || []} budgets={budgets || []} />
                </div>
              </div>
            ) : (
              <div className="dashboard-empty">
                <div className="empty-state">
                  <div className="empty-icon">
                    <SparklesIcon width={64} />
                  </div>
                  <div className="empty-content">
                    <h2>Start Your Financial Journey!</h2>
                    <p>Personal budgeting is the secret to financial freedom.</p>
                    <p>Create your first budget and take control of your money today!</p>
                  </div>
                </div>
                
                <div className="empty-tools">
                  <BudgetTemplates />
                  <div className="empty-forms">
                    <AddBudgetForm />
                  </div>
                  <MonthlySalaryDemo />
                  <MonthlySalaryBudget />
                  <DataManager showImportOnly={true} />
                </div>
                
                <div className="empty-tips">
                  <div className="tips-card">
                    <h3><LightBulbIcon width={20} className="inline" /> Quick Tips for Success:</h3>
                    <ul className="tips-list">
                      <li><FlagIcon width={16} className="inline" /> Start with one category you spend most on</li>
                      <li><ChartBarIcon width={16} className="inline" /> Track every expense, no matter how small</li>
                      <li><TrophyIcon width={16} className="inline" /> Celebrate small wins along the way</li>
                      <li><BoltIcon width={16} className="inline" /> Stay consistent - you've got this!</li>
                    </ul>
                  </div>
                </div>
                
                <div className="empty-achievements">
                  <SimpleAchievementBar expenses={expenses || []} budgets={budgets || []} />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="auth-redirect">
          <h1>Please log in to access your budget</h1>
          <p>You need to be logged in to view your dashboard.</p>
        </div>
      )}
    </>
  );
};
export default Dashboard;
