import { useState, useRef } from 'react';
import { useFetcher } from 'react-router-dom';
import { DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import TransactionParser from '../utils/transactionParser';

const BankStatementUploader = ({ budgets, onTransactionsParsed }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parseResults, setParseResults] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const fileInputRef = useRef();
  const fetcher = useFetcher();
  const parser = new TransactionParser();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    const allowedExtensions = ['csv', 'json', 'txt'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Please upload a CSV, JSON, or TXT file');
      return;
    }

    setUploading(true);
    
    try {
      const transactions = await parser.parseFile(file);
      
      if (transactions.length === 0) {
        alert('No valid transactions found in the file');
        setUploading(false);
        return;
      }

      setParseResults({
        fileName: file.name,
        totalTransactions: transactions.length,
        transactions: transactions,
        summary: generateSummary(transactions)
      });
      
      // Pre-select all expense transactions
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      setSelectedTransactions(expenseTransactions.map(t => t.id));
      
      if (onTransactionsParsed) {
        onTransactionsParsed(transactions);
      }
      
    } catch (error) {
      console.error('Error parsing file:', error);
      alert(`Error parsing file: ${error.message}`);
    }
    
    setUploading(false);
  };

  const generateSummary = (transactions) => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    const categories = {};
    expenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    return {
      totalExpenses,
      totalIncome,
      expenseCount: expenses.length,
      incomeCount: income.length,
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1])
    };
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const selectAllTransactions = () => {
    const allIds = parseResults.transactions.map(t => t.id);
    setSelectedTransactions(allIds);
  };

  const deselectAllTransactions = () => {
    setSelectedTransactions([]);
  };

  const importSelectedTransactions = () => {
    if (selectedTransactions.length === 0) {
      alert('Please select at least one transaction to import');
      return;
    }

    const transactionsToImport = parseResults.transactions.filter(t => 
      selectedTransactions.includes(t.id)
    );

    // Create expenses for selected transactions
    transactionsToImport.forEach(transaction => {
      const budgetId = budgets.length === 1 ? budgets[0].id : findBestBudgetMatch(transaction.category);
      
      fetcher.submit({
        _action: 'createExpense',
        newExpense: transaction.description,
        newExpenseAmount: transaction.amount.toString(),
        newExpenseBudget: budgetId,
        importedTransaction: 'true',
        transactionDate: transaction.date.toString()
      }, { method: 'post' });
    });

    // Reset state
    setParseResults(null);
    setSelectedTransactions([]);
    fileInputRef.current.value = '';
  };

  const findBestBudgetMatch = (category) => {
    // Try to match transaction category with existing budget names
    const matchingBudget = budgets.find(budget => 
      budget.name.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(budget.name.toLowerCase())
    );
    
    return matchingBudget ? matchingBudget.id : budgets[0]?.id;
  };

  return (
    <div className="bank-statement-uploader">
      <div className="form-wrapper">
        <h2 className="h3">Import Bank Statement</h2>
        <p className="text-xs">Upload your bank statement to automatically import transactions</p>
        
        {!parseResults ? (
          <div
            className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.txt"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            
            <div className="upload-content">
              <DocumentArrowUpIcon width={48} className="upload-icon" />
              <div className="upload-text">
                {uploading ? (
                  <p>Processing your bank statement...</p>
                ) : (
                  <>
                    <p><strong>Click to upload</strong> or drag and drop</p>
                    <p className="text-xs">CSV, JSON, or TXT files only</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="parse-results">
            <div className="results-header">
              <CheckCircleIcon width={24} className="success-icon" />
              <div>
                <h3>File Parsed Successfully</h3>
                <p className="text-xs">Found {parseResults.totalTransactions} transactions in {parseResults.fileName}</p>
              </div>
            </div>

            <div className="summary-stats">
              <div className="stat">
                <span className="stat-label">Total Expenses</span>
                <span className="stat-value expense">₹{parseResults.summary.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Income</span>
                <span className="stat-value income">₹{parseResults.summary.totalIncome.toLocaleString()}</span>
              </div>
            </div>

            <div className="transaction-selection">
              <div className="selection-controls">
                <h4>Select Transactions to Import ({selectedTransactions.length} selected)</h4>
                <div className="selection-buttons">
                  <button type="button" onClick={selectAllTransactions} className="btn btn--outline">
                    Select All
                  </button>
                  <button type="button" onClick={deselectAllTransactions} className="btn btn--outline">
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="transaction-list">
                {parseResults.transactions.slice(0, 10).map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => toggleTransactionSelection(transaction.id)}
                    />
                    <div className="transaction-details">
                      <div className="transaction-desc">{transaction.description}</div>
                      <div className="transaction-meta">
                        <span className="transaction-date">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                        <span className="transaction-category">{transaction.category}</span>
                      </div>
                    </div>
                    <div className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
                
                {parseResults.transactions.length > 10 && (
                  <p className="text-xs">... and {parseResults.transactions.length - 10} more transactions</p>
                )}
              </div>

              <div className="import-actions">
                <button
                  type="button"
                  onClick={importSelectedTransactions}
                  className="btn btn--dark"
                  disabled={selectedTransactions.length === 0}
                >
                  Import {selectedTransactions.length} Transactions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setParseResults(null);
                    setSelectedTransactions([]);
                    fileInputRef.current.value = '';
                  }}
                  className="btn btn--outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankStatementUploader;