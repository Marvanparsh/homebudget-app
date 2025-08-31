import { useState } from "react";
import { useFetcher } from "react-router-dom";
import { PlusCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "../helpers";

const RecurringExpenses = ({ budgets }) => {
  const [showForm, setShowForm] = useState(false);
  const fetcher = useFetcher();

  const recurringExpenses = JSON.parse(localStorage.getItem("recurringExpenses") || "[]");

  return (
    <div className="recurring-expenses">
      <div className="section-header">
        <h3><ClockIcon width={20} /> Recurring Expenses</h3>
        <button 
          className="btn btn--outline"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircleIcon width={16} />
          Add Recurring
        </button>
      </div>

      {showForm && (
        <fetcher.Form method="post" className="recurring-form">
          <div className="form-row">
            <input
              type="text"
              name="recurringName"
              placeholder="e.g., Netflix Subscription"
              required
            />
            <input
              type="number"
              step="0.01"
              name="recurringAmount"
              placeholder="Amount"
              required
            />
            <select name="recurringBudget" required>
              <option value="">Select Budget</option>
              {budgets.map(budget => (
                <option key={budget.id} value={budget.id}>{budget.name}</option>
              ))}
            </select>
            <select name="recurringFrequency" required>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
            <button type="submit" className="btn btn--dark">Add</button>
          </div>
          <input type="hidden" name="_action" value="createRecurring" />
        </fetcher.Form>
      )}

      {recurringExpenses.length > 0 && (
        <div className="recurring-list">
          {recurringExpenses.map(expense => (
            <div key={expense.id} className="recurring-item">
              <div>
                <strong>{expense.name}</strong>
                <small>{expense.frequency}</small>
              </div>
              <span>{formatCurrency(expense.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringExpenses;