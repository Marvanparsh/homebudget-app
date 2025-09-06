import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline'
import ExpenseItem from './ExpenseItem'

const ResponsiveTable = ({ 
  expenses, 
  showBudget = true, 
  itemsPerPage = 10,
  enablePagination = true,
  enableFiltering = true,
  className = ""
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredExpenses, setFilteredExpenses] = useState(expenses)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [filterConfig, setFilterConfig] = useState({
    search: '',
    budget: '',
    dateRange: 'all'
  })
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Filter and sort expenses
  useEffect(() => {
    let filtered = [...expenses]
    
    // Apply search filter
    if (filterConfig.search) {
      filtered = filtered.filter(expense =>
        expense.name.toLowerCase().includes(filterConfig.search.toLowerCase())
      )
    }
    
    // Apply budget filter
    if (filterConfig.budget) {
      filtered = filtered.filter(expense => expense.budgetId === filterConfig.budget)
    }
    
    // Apply date range filter
    if (filterConfig.dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filterConfig.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3)
          break
        default:
          filterDate.setFullYear(1970)
      }
      
      filtered = filtered.filter(expense => 
        new Date(expense.createdAt) >= filterDate
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]
      
      if (sortConfig.key === 'amount') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      } else if (sortConfig.key === 'date') {
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
    
    setFilteredExpenses(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [expenses, filterConfig, sortConfig])
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentExpenses = enablePagination 
    ? filteredExpenses.slice(startIndex, endIndex)
    : filteredExpenses
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }
  
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }
  
  // Get unique budgets for filter
  const uniqueBudgets = [...new Set(expenses.map(e => e.budgetId))]
    .map(budgetId => {
      const expense = expenses.find(e => e.budgetId === budgetId)
      return { id: budgetId, name: expense?.budget || 'Unknown' }
    })
  
  if (expenses.length === 0) {
    return (
      <div className="no-data-message">
        <h3>No expenses found</h3>
        <p>Start by adding your first expense to see it here.</p>
      </div>
    )
  }
  
  return (
    <div className={`responsive-table-container ${className}`}>
      {/* Filters */}
      {enableFiltering && (
        <div className="table-filters">
          <div className="filter-row">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search expenses..."
                value={filterConfig.search}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, search: e.target.value }))}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              {showBudget && (
                <select
                  value={filterConfig.budget}
                  onChange={(e) => setFilterConfig(prev => ({ ...prev, budget: e.target.value }))}
                  className="filter-select"
                >
                  <option value="">All Budgets</option>
                  {uniqueBudgets.map(budget => (
                    <option key={budget.id} value={budget.id}>
                      {budget.name}
                    </option>
                  ))}
                </select>
              )}
              
              <select
                value={filterConfig.dateRange}
                onChange={(e) => setFilterConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>
          </div>
          
          <div className="filter-summary">
            <span className="results-count">
              {filteredExpenses.length} of {expenses.length} expenses
            </span>
            {(filterConfig.search || filterConfig.budget || filterConfig.dateRange !== 'all') && (
              <button
                onClick={() => setFilterConfig({ search: '', budget: '', dateRange: 'all' })}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="table-container">
        {isMobile ? (
          // Mobile Card Layout
          <div className="mobile-expense-list">
            {currentExpenses.map((expense) => (
              <div key={expense.id} className="mobile-expense-card">
                <ExpenseItem expense={expense} showBudget={showBudget} isMobile={true} />
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table Layout
          <table className="responsive-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="sortable-header"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('name')}
                >
                  Name {getSortIcon('name')}
                </th>
                <th 
                  onClick={() => handleSort('amount')}
                  className="sortable-header"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('amount')}
                >
                  Amount {getSortIcon('amount')}
                </th>
                <th 
                  onClick={() => handleSort('date')}
                  className="sortable-header"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSort('date')}
                >
                  Date {getSortIcon('date')}
                </th>
                {showBudget && (
                  <th 
                    onClick={() => handleSort('budget')}
                    className="sortable-header"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSort('budget')}
                  >
                    Budget {getSortIcon('budget')}
                  </th>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map((expense) => (
                <tr key={expense.id} className="expense-row">
                  <ExpenseItem expense={expense} showBudget={showBudget} />
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="Previous page"
          >
            <ChevronLeftIcon width={20} />
          </button>
          
          <div className="pagination-info">
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <small className="items-info">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length}
            </small>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
            aria-label="Next page"
          >
            <ChevronRightIcon width={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ResponsiveTable