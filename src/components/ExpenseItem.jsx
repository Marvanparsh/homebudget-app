// rrd imports
import { Link, useFetcher } from "react-router-dom";
import { useState } from "react";

// library import
import { TrashIcon, DocumentDuplicateIcon } from "@heroicons/react/24/solid";

// helper imports
import {
  formatCurrency,
  formatDateToLocaleString,
  getAllMatchingItems,
} from "../helpers";

// hooks
import { useSwipeGesture } from "../hooks/useInteractions";

const ExpenseItem = ({ expense, showBudget }) => {
  const fetcher = useFetcher();
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const budgets = getAllMatchingItems({
    category: "budgets",
    key: "id",
    value: expense.budgetId,
  });
  const budget = budgets?.[0];
  
  const { handleTouchStart, handleTouchEnd } = useSwipeGesture(
    () => setIsSwipeOpen(true),
    () => setIsSwipeOpen(false)
  );
  
  const handleDelete = () => {
    if (showConfirm) {
      const formData = new FormData();
      formData.append('_action', 'deleteExpense');
      formData.append('expenseId', expense.id);
      fetcher.submit(formData, { method: 'post' });
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };
  
  const handleDuplicate = () => {
    const formData = new FormData();
    formData.append('_action', 'createExpense');
    formData.append('newExpense', expense.name);
    formData.append('newExpenseAmount', expense.amount);
    formData.append('newExpenseBudget', expense.budgetId);
    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <>
      <td 
        className={`swipe-item ${isSwipeOpen ? 'swiped' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="expense-content">
          {expense.name}
        </div>
        <div className="swipe-actions">
          <button
            className="swipe-action duplicate"
            onClick={handleDuplicate}
            title="Duplicate expense"
          >
            <DocumentDuplicateIcon width={16} />
          </button>
          <button
            className="swipe-action delete"
            onClick={handleDelete}
            title={showConfirm ? 'Confirm delete' : 'Delete expense'}
          >
            <TrashIcon width={16} />
            {showConfirm && <span>Confirm?</span>}
          </button>
        </div>
      </td>
      <td className="amount-cell">
        <span className="amount-value">{formatCurrency(expense.amount)}</span>
      </td>
      <td>{formatDateToLocaleString(expense.createdAt)}</td>
      {showBudget && (
        <td>
          {budget ? (
            <Link
              to={`/dashboard/budget/${budget.id}`}
              className="budget-link"
              style={{
                "--accent": budget.color,
              }}
            >
              {budget.name}
            </Link>
          ) : (
            <span>Unknown Budget</span>
          )}
        </td>
      )}
      <td>
        <div className="expense-actions">
          <button
            className="btn btn--outline btn-sm"
            onClick={handleDuplicate}
            title="Duplicate expense"
          >
            <DocumentDuplicateIcon width={16} />
          </button>
          <button
            className={`btn btn--warning btn-sm ${showConfirm ? 'confirm' : ''}`}
            onClick={handleDelete}
            aria-label={`Delete ${expense.name} expense`}
          >
            <TrashIcon width={16} />
            {showConfirm && <span>Sure?</span>}
          </button>
        </div>
      </td>
    </>
  );
};
export default ExpenseItem;
