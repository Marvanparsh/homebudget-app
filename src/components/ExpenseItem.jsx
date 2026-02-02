// rrd imports
import { Link, useFetcher } from "react-router-dom";
import { useState } from "react";

// library import
import { TrashIcon, DocumentDuplicateIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

// helper imports
import {
  formatCurrency,
  formatDateToLocaleString,
  getAllMatchingItems,
  fetchUserData,
  updateExpense,
} from "../helpers";

// hooks
import { useSwipeGesture } from "../hooks/useInteractions";

const ExpenseItem = ({ expense, showBudget }) => {
  const fetcher = useFetcher();
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: expense.name,
    amount: expense.amount,
    budgetId: expense.budgetId,
    createdAt: expense.createdAt
  });

  const budgets = getAllMatchingItems({
    category: "budgets",
    key: "id",
    value: expense.budgetId,
  });
  const budget = budgets?.[0];
  const allBudgets = fetchUserData("budgets") ?? [];
  
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: expense.name,
      amount: expense.amount,
      budgetId: expense.budgetId,
      createdAt: expense.createdAt
    });
  };

  const handleSave = () => {
    try {
      updateExpense({
        id: expense.id,
        name: editData.name,
        amount: editData.amount,
        budgetId: editData.budgetId,
        createdAt: editData.createdAt
      });
      setIsEditing(false);
      toast.success(`Expense "${editData.name}" updated successfully!`);
      window.location.reload(); // Simple refresh to show updated data
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: expense.name,
      amount: expense.amount,
      budgetId: expense.budgetId,
      createdAt: expense.createdAt
    });
  };

  const handleDateChange = (e) => {
    const dateValue = new Date(e.target.value).getTime();
    setEditData(prev => ({ ...prev, createdAt: dateValue }));
  };

  return (
    <>
      <td 
        className={`swipe-item ${isSwipeOpen ? 'swiped' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="expense-content">
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              className="edit-input"
            />
          ) : (
            expense.name
          )}
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
        {isEditing ? (
          <input
            type="number"
            step="0.01"
            value={editData.amount}
            onChange={(e) => setEditData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            className="edit-input amount-input"
          />
        ) : (
          <span className="amount-value">{formatCurrency(expense.amount)}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="date"
            value={new Date(editData.createdAt).toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="edit-input date-input"
          />
        ) : (
          formatDateToLocaleString(expense.createdAt)
        )}
      </td>
      {showBudget && (
        <td>
          {isEditing ? (
            <select
              value={editData.budgetId}
              onChange={(e) => setEditData(prev => ({ ...prev, budgetId: e.target.value }))}
              className="edit-input budget-select"
            >
              {allBudgets.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          ) : (
            budget ? (
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
            )
          )}
        </td>
      )}
      <td>
        <div className="expense-actions">
          {isEditing ? (
            <>
              <button
                className="btn btn--dark btn-sm"
                onClick={handleSave}
                title="Save changes"
              >
                <CheckIcon width={16} />
              </button>
              <button
                className="btn btn--outline btn-sm"
                onClick={handleCancel}
                title="Cancel editing"
              >
                <XMarkIcon width={16} />
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn--outline btn-sm"
                onClick={handleEdit}
                title="Edit expense"
              >
                <PencilIcon width={16} />
              </button>
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
            </>
          )}
        </div>
      </td>
    </>
  );
};
export default ExpenseItem;
