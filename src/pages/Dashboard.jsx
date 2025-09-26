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
import FloatingActionButton from "../components/FloatingActionButton";
import NotificationSystem from "../components/NotificationSystem";

import SpendingHeatmap from "../components/SpendingHeatmap";
import BudgetHealthScore from "../components/BudgetHealthScore";
import ExpenseInsights from "../components/ExpenseInsights";
import ExpenseComparison from "../components/ExpenseComparison";
import SampleDataButton from "../components/SampleDataButton";
import EnhancedSampleDataButton from "../components/EnhancedSampleDataButton";
import GoalCelebration from "../components/GoalCelebration";
import MobileOptimizations from "../components/MobileOptimizations";

import ImprovedOnboarding from "../components/ImprovedOnboarding";
import SmartExpenseSuggestions from "../components/SmartExpenseSuggestions";
import FinalAchievements from "../components/FinalAchievements";
import SimpleAchievementBar from "../components/SimpleAchievementBar";



//  helper functions
import {
  createBudget,
  createExpense,
  createRecurringExpense,
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

  
  // Show floating action button only when user has budgets
  const showFAB = budgets && budgets.length > 0;
  


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
    <MobileOptimizations>
        <NotificationSystem budgets={budgets} expenses={expenses} />
        <GoalCelebration budgets={budgets} />
      
      {showFAB && <FloatingActionButton budgets={budgets} />}
      
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
                <SmartExpenseSuggestions onSuggestionSelect={handleSmartSuggestion} />
                
                <div className="flex-lg">
                  <AddBudgetForm />
                  <AddExpenseForm budgets={budgets} />
                </div>
                <h2>Existing Budgets</h2>
                <div className="budgets draggable-budgets">
                  {orderedBudgets.map((budget, index) => (
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
                <div className="dashboard-grid">
                  <ModernAnalytics expenses={expenses || []} budgets={budgets || []} />
                  
                  <BudgetHealthScore expenses={expenses || []} budgets={budgets || []} />
                  
                  <ExpenseInsights expenses={expenses || []} budgets={budgets || []} />
                  
                  <ExpenseComparison expenses={expenses || []} />
                  
                  <SpendingHeatmap expenses={expenses || []} />
                </div>
                
                <RecurringExpenses budgets={budgets} />
                
                <DataManager budgets={budgets} />
                
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
                
                <SimpleAchievementBar expenses={expenses || []} budgets={budgets || []} />
              </div>
            ) : (
              <div className="grid-sm">
                <div className="first-budget-encouragement">
                  <div className="encouragement-icon"><SparklesIcon width={48} /></div>
                  <h2>Start Your Financial Journey!</h2>
                  <p>Personal budgeting is the secret to financial freedom.</p>
                  <p>Create your first budget and take control of your money today!</p>
                </div>
                <BudgetTemplates />
                <AddBudgetForm />
                <DataManager showImportOnly={true} />
                
                <div className="motivation-tips">
                  <h3><LightBulbIcon width={20} className="inline" /> Quick Tips for Success:</h3>
                  <ul>
                    <li><FlagIcon width={16} className="inline" /> Start with one category you spend most on</li>
                    <li><ChartBarIcon width={16} className="inline" /> Track every expense, no matter how small</li>
                    <li><TrophyIcon width={16} className="inline" /> Celebrate small wins along the way</li>
                    <li><BoltIcon width={16} className="inline" /> Stay consistent - you've got this!</li>
                  </ul>
                </div>
                
                <SimpleAchievementBar expenses={expenses || []} budgets={budgets || []} />
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
    </MobileOptimizations>
  );
};
export default Dashboard;
