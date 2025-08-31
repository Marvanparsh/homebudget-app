// rrd imports
import { useLoaderData } from "react-router-dom";
import { useState, useMemo } from "react";

// library import
import { toast } from "react-toastify";

// component imports
import Table from "../components/Table";
import SearchFilter from "../components/SearchFilter";

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

  const filteredExpenses = useMemo(() => {
    let result = searchExpenses(expenses, searchTerm);
    result = filterExpenses(result, filters);
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [expenses, searchTerm, filters]);

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
          <Table expenses={filteredExpenses} />
        </div>
      ) : (
        <p>{searchTerm || filters.budget || filters.date ? 'No matching expenses found' : 'No Expenses to show'}</p>
      )}
    </div>
  );
};

export default ExpensesPage;
