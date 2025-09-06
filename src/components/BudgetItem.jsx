// rrd imports
import { Form, Link, useFetcher } from "react-router-dom";
import React, { useState } from "react";

// library imports
import { BanknotesIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

// helper functions
import {
  calculateSpentByBudget,
  formatCurrency,
  formatPercentage,
  BUDGET_CATEGORIES,
} from "../helpers";

const BudgetItem = ({ budget, showDelete = false, dragHandlers, index, isDragging, isDragOver }) => {
  const { id, name, amount, color, category } = budget;
  const spent = calculateSpentByBudget(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editAmount, setEditAmount] = useState(amount);
  const fetcher = useFetcher();
  
  const categoryInfo = BUDGET_CATEGORIES.find(c => c.id === category) || BUDGET_CATEGORIES[6];
  const spentPercentage = amount > 0 ? spent / amount : 0;
  const isOverBudget = spentPercentage > 1;
  const isNearLimit = spentPercentage > 0.8;

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(name);
    setEditAmount(amount);
  };

  const handleSave = () => {
    fetcher.submit({
      _action: 'updateBudget',
      budgetId: id,
      budgetName: editName,
      budgetAmount: editAmount
    }, { method: 'post' });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(name);
    setEditAmount(amount);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      className={`budget ${isOverBudget ? 'over-budget' : ''} ${isNearLimit ? 'near-limit' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
      style={{
        "--accent": color,
      }}
      draggable
      data-drop-index={index}
      onDragStart={(e) => dragHandlers?.handleDragStart(e, budget, index)}
      onDragEnd={dragHandlers?.handleDragEnd}
      onDragOver={(e) => dragHandlers?.handleDragOver(e, index)}
      onDrop={(e) => dragHandlers?.handleDrop(e, index)}
      onTouchStart={(e) => dragHandlers?.handleTouchStart(e, budget, index)}
      onTouchMove={dragHandlers?.handleTouchMove}
      onTouchEnd={dragHandlers?.handleTouchEnd}
    >
      <div className="progress-text">
        <div className="budget-header">
          <span className="category-icon">{categoryInfo.icon}</span>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="budget-name-input"
              autoFocus
            />
          ) : (
            <h3 onClick={handleEdit} className="budget-name-editable">{name}</h3>
          )}
          {isEditing ? (
            <div className="edit-actions">
              <button onClick={handleSave} className="save-btn" title="Save">
                <CheckIcon width={16} />
              </button>
              <button onClick={handleCancel} className="cancel-btn" title="Cancel">
                <XMarkIcon width={16} />
              </button>
            </div>
          ) : (
            <button 
              className="budget-edit-btn"
              onClick={handleEdit}
              title="Edit budget"
              type="button"
            >
              <PencilIcon width={16} />
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="budget-amount-edit">
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              onKeyDown={handleKeyPress}
              className="budget-amount-input"
              step="0.01"
              min="0"
            />
            <span> Budgeted</span>
          </div>
        ) : (
          <p onClick={handleEdit} className="budget-amount-editable">{formatCurrency(amount)} Budgeted</p>
        )}
        {isOverBudget && (
          <p className="over-budget-warning">⚠️ Over budget by {formatCurrency(spent - amount)}</p>
        )}
      </div>
      <div className="progress-container">
        <progress 
          max={amount} 
          value={Math.min(spent, amount)}
          className={isOverBudget ? 'over-budget' : isNearLimit ? 'near-limit' : ''}
        >
          {formatPercentage(amount > 0 ? spent / amount : 0)}
        </progress>
        {isOverBudget && (
          <div className="over-budget-bar" style={{ width: `${Math.min(((spent - amount) / amount) * 50, 25)}%` }}></div>
        )}
        <div className="progress-percentage">
          {formatPercentage(spentPercentage)}
        </div>
      </div>
      <div className="progress-text">
        <small className="spent-amount">{formatCurrency(spent)} spent</small>
        <small className={`remaining-amount ${isOverBudget ? 'negative' : ''}`}>
          {isOverBudget ? 
            `${formatCurrency(Math.abs(amount - spent))} over` : 
            `${formatCurrency(amount - spent)} remaining`
          }
        </small>
      </div>

      {showDelete ? (
        <div className="flex-sm">
          <Form
            method="post"
            action="delete"
            onSubmit={(event) => {
              if (
                !window.confirm(
                  "Are you sure you want to permanently delete this budget?"
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit" className="btn">
              <span>Delete Budget</span>
              <TrashIcon width={20} />
            </button>
          </Form>
        </div>
      ) : (
        <div className="flex-sm">
          <Link to={`/dashboard/budget/${id}`} className="btn">
            <span>View Details</span>
            <BanknotesIcon width={20} />
          </Link>
        </div>
      )}

    </div>
  );
};
export default BudgetItem;
