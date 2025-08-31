// rrd import
import { redirect } from "react-router-dom";

// library
import { toast } from "react-toastify";

// helpers
import { deleteItem, fetchUserData, setUserData } from "../helpers";

export function deleteBudget({ params }) {
  try {
    deleteItem({
      key: "budgets",
      id: params.id,
    });

    const allExpenses = fetchUserData("expenses") || [];
    const associatedExpenses = allExpenses.filter(expense => expense.budgetId === params.id);

    associatedExpenses.forEach((expense) => {
      deleteItem({
        key: "expenses",
        id: expense.id,
      });
    });

    toast.success("Budget deleted successfully!");
  } catch (e) {
    console.error('Error deleting budget:', e);
    throw new Error(`There was a problem deleting your budget: ${e.message}`);
  }
  return redirect("/");
}
