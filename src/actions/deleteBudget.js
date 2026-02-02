// rrd import
import { redirect } from "react-router-dom";

// library
import { toast } from "react-toastify";

// helpers
import { fetchUserData, setUserData } from "../helpers";

export function deleteBudget({ params }) {
  try {
    const budgetId = params.id;
    
    // Batch read all data once
    const [budgets, expenses] = [
      fetchUserData("budgets") || [],
      fetchUserData("expenses") || []
    ];
    
    // Verify budget exists
    const budgetExists = budgets.some(budget => budget.id === budgetId);
    if (!budgetExists) {
      toast.error("Budget not found");
      return redirect("/");
    }
    
    // Batch operations: filter out budget and associated expenses in one pass
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
    const updatedExpenses = expenses.filter(expense => expense.budgetId !== budgetId);
    
    // Batch write operations
    setUserData("budgets", updatedBudgets);
    setUserData("expenses", updatedExpenses);
    
    toast.success("Budget deleted successfully!");
    return redirect("/");
  } catch (e) {
    console.error('Error deleting budget:', e);
    toast.error(`Failed to delete budget: ${e.message || 'Unknown error'}`);
    return redirect("/");
  }
}
