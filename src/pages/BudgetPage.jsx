// rrd imports
import { useLoaderData } from "react-router-dom";
import { useState } from "react";

// library
import { toast } from "react-toastify";
import { StarIcon, FlagIcon } from "@heroicons/react/24/outline";

// components
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetItem from "../components/BudgetItem";
import Table from "../components/Table";

// helpers
import { createExpense, deleteItem, getAllMatchingItems, fetchUserData } from "../helpers";

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
            <span className="accent">{budget.name}</span> Expenses
          </h2>
          <Table expenses={expenses} showBudget={false} />
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
