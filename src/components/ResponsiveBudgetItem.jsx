import { Form, Link, useFetcher } from "react-router-dom"
import React, { useState, useRef, useEffect } from "react"
import { 
  BanknotesIcon, 
  TrashIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  EllipsisVerticalIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

import {
  calculateSpentByBudget,
  formatCurrency,
  formatPercentage,
  BUDGET_CATEGORIES,
} from "../helpers"

const ResponsiveBudgetItem = ({ 
  budget, 
  showDelete = false, 
  dragHandlers, 
  index, 
  isDragging, 
  isDragOver,
  isMobile = false 
}) => {
  const { id, name, amount, color, category } = budget
  const spent = calculateSpentByBudget(id)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editAmount, setEditAmount] = useState(amount)
  const [showActions, setShowActions] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isPressed, setIsPressed] = useState(false)
  
  const fetcher = useFetcher()
  const actionsRef = useRef(null)
  const cardRef = useRef(null)
  
  const categoryInfo = BUDGET_CATEGORIES.find(c => c.id === category) || BUDGET_CATEGORIES[6]
  const spentPercentage = amount > 0 ? spent / amount : 0
  const isOverBudget = spentPercentage > 1
  const isNearLimit = spentPercentage > 0.8 && spentPercentage <= 1
  const remaining = amount - spent
  
  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Handle touch interactions
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEnd(null)
    setIsPressed(true)
  }
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    setIsPressed(false)
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe) {
      setShowActions(true)
    } else if (isRightSwipe) {
      setShowActions(false)
    }
  }
  
  const handleEdit = () => {
    setIsEditing(true)
    setEditName(name)
    setEditAmount(amount)
    setShowActions(false)
  }
  
  const handleSave = () => {
    if (editName.trim() && editAmount > 0) {
      fetcher.submit({
        _action: 'updateBudget',
        budgetId: id,
        budgetName: editName.trim(),
        budgetAmount: editAmount
      }, { method: 'post' })
      setIsEditing(false)
    }
  }
  
  const handleCancel = () => {
    setIsEditing(false)
    setEditName(name)
    setEditAmount(amount)
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  const getStatusColor = () => {
    if (isOverBudget) return 'var(--warning)'
    if (isNearLimit) return 'hsl(45, 70%, 60%)'
    return 'var(--accent)'
  }
  
  const getStatusMessage = () => {
    if (isOverBudget) {
      return {
        icon: ExclamationTriangleIcon,
        message: `Over budget by ${formatCurrency(Math.abs(remaining))}`,
        type: 'error'
      }
    }
    if (isNearLimit) {
      return {
        icon: ExclamationTriangleIcon,
        message: `${formatCurrency(remaining)} remaining`,
        type: 'warning'
      }
    }
    return {
      icon: ChartBarIcon,
      message: `${formatCurrency(remaining)} remaining`,
      type: 'success'
    }
  }
  
  const status = getStatusMessage()
  
  return (
    <div
      ref={cardRef}
      className={`
        budget-item 
        ${isOverBudget ? 'budget-item--over' : ''} 
        ${isNearLimit ? 'budget-item--warning' : ''} 
        ${isDragging ? 'budget-item--dragging' : ''} 
        ${isDragOver ? 'budget-item--drag-over' : ''}
        ${isPressed ? 'budget-item--pressed' : ''}
        ${isMobile ? 'budget-item--mobile' : ''}
      `}
      style={{
        "--budget-color": color,
        "--status-color": getStatusColor()
      }}
      draggable={!isMobile}
      data-drop-index={index}
      onDragStart={(e) => !isMobile && dragHandlers?.handleDragStart(e, budget, index)}
      onDragEnd={dragHandlers?.handleDragEnd}
      onDragOver={(e) => !isMobile && dragHandlers?.handleDragOver(e, index)}
      onDrop={(e) => !isMobile && dragHandlers?.handleDrop(e, index)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Budget Header */}
      <div className="budget-header">
        <div className="budget-info">
          <div className="budget-category">
            <span className="category-icon" role="img" aria-label={categoryInfo.name}>
              {categoryInfo.icon}
            </span>
            <span className="category-name">{categoryInfo.name}</span>
          </div>
          
          {isEditing ? (
            <div className="budget-edit-form">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="budget-name-input"
                placeholder="Budget name"
                autoFocus
              />
              <div className="budget-amount-edit">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                  onKeyDown={handleKeyPress}
                  className="budget-amount-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="edit-actions">
                <button 
                  onClick={handleSave} 
                  className="btn btn--small btn--success"
                  disabled={!editName.trim() || editAmount <= 0}
                >
                  <CheckIcon width={16} />
                  <span className="hide-mobile">Save</span>
                </button>
                <button 
                  onClick={handleCancel} 
                  className="btn btn--small btn--outline"
                >
                  <XMarkIcon width={16} />
                  <span className="hide-mobile">Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="budget-details">
              <h3 className="budget-name">{name}</h3>
              <p className="budget-amount">{formatCurrency(amount)} budgeted</p>
            </div>
          )}
        </div>
        
        {!isEditing && (
          <div className="budget-actions" ref={actionsRef}>
            <button
              className="actions-trigger"
              onClick={() => setShowActions(!showActions)}
              aria-label="Budget actions"
              aria-expanded={showActions}
            >
              <EllipsisVerticalIcon width={20} />
            </button>
            
            {showActions && (
              <div className="actions-menu">
                <button onClick={handleEdit} className="action-item">
                  <PencilIcon width={16} />
                  <span>Edit</span>
                </button>
                <Link to={`/dashboard/budget/${id}`} className="action-item">
                  <BanknotesIcon width={16} />
                  <span>View Details</span>
                </Link>
                {showDelete && (
                  <Form
                    method="post"
                    action="delete"
                    onSubmit={(event) => {
                      if (!window.confirm("Delete this budget and all its expenses?")) {
                        event.preventDefault()
                      }
                    }}
                  >
                    <button type="submit" className="action-item action-item--danger">
                      <TrashIcon width={16} />
                      <span>Delete</span>
                    </button>
                  </Form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Progress Section */}
      <div className="budget-progress">
        <div className="progress-info">
          <div className="spent-info">
            <span className="spent-amount">{formatCurrency(spent)}</span>
            <span className="spent-label">spent</span>
          </div>
          <div className="percentage-info">
            <span className="percentage">{formatPercentage(spentPercentage)}</span>
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(spentPercentage * 100, 100)}%`,
                backgroundColor: getStatusColor()
              }}
            />
            {isOverBudget && (
              <div 
                className="progress-overflow"
                style={{ 
                  width: `${Math.min((spentPercentage - 1) * 100, 50)}%` 
                }}
              />
            )}
          </div>
        </div>
        
        <div className="status-info">
          <div className={`status-message status-message--${status.type}`}>
            <status.icon width={16} />
            <span>{status.message}</span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      {!isEditing && (
        <div className="budget-quick-actions">
          <Link 
            to={`/dashboard/budget/${id}`} 
            className="btn btn--outline btn--small"
          >
            <ChartBarIcon width={16} />
            <span>View Details</span>
          </Link>
          
          <Link 
            to={`/dashboard/expenses/add?budgetId=${id}`}
            className="btn btn--small"
          >
            <span>Add Expense</span>
          </Link>
        </div>
      )}
      
      {/* Swipe Indicator for Mobile */}
      {isMobile && (
        <div className="swipe-indicator">
          <div className="swipe-hint">
            <span>← Swipe for actions</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResponsiveBudgetItem