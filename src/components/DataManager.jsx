import { useRef, useState } from "react";
import { ArrowDownTrayIcon, DocumentArrowUpIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useFetcher } from "react-router-dom";
import { importData } from "../utils/dataManager";
import TransactionParser from "../utils/transactionParser";
import ExcelExporter from "../utils/excelExporter";
import { toast } from "react-toastify";

const DataManager = ({ budgets, onDataImported, showImportOnly = false }) => {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parseResults, setParseResults] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [autoSync, setAutoSync] = useState(localStorage.getItem('autoSync') === 'true');
  const [syncInterval, setSyncInterval] = useState(parseInt(localStorage.getItem('syncInterval')) || 30);
  const [lastSync, setLastSync] = useState(localStorage.getItem('lastSync') ? new Date(localStorage.getItem('lastSync')) : null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [isToggling, setIsToggling] = useState(false);
  const [nextSyncTime, setNextSyncTime] = useState(null);
  const parser = new TransactionParser();
  const excelExporter = new ExcelExporter();
  const fetcher = useFetcher();

  const exportToExcel = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const userBudgets = JSON.parse(localStorage.getItem(`budgets_${currentUser.id}`)) || [];
      const userExpenses = JSON.parse(localStorage.getItem(`expenses_${currentUser.id}`)) || [];
      
      excelExporter.exportToExcel(userBudgets, userExpenses, 'my-budget-data');
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

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
    setUploading(true);
    
    try {
      // Check if it's a JSON file (budget data)
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        await importData(file);
        toast.success('Budget data imported successfully!');
        onDataImported?.();
        window.location.reload();
      } else {
        // Handle as bank statement
        const allowedExtensions = ['csv', 'txt'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
          toast.error('Please upload a JSON, CSV, or TXT file');
          setUploading(false);
          return;
        }

        const transactions = await parser.parseFile(file);
        
        if (transactions.length === 0) {
          toast.error('No valid transactions found in the file');
          setUploading(false);
          return;
        }

        setParseResults({
          fileName: file.name,
          totalTransactions: transactions.length,
          transactions: transactions,
          summary: generateSummary(transactions)
        });
        
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        setSelectedTransactions(expenseTransactions.map(t => t.id));
      }
    } catch (error) {
      console.error("Import failed:", error);
      toast.error('Import failed: ' + error.message);
    }
    
    setUploading(false);
  };

  const generateSummary = (transactions) => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalExpenses,
      totalIncome,
      expenseCount: expenses.length,
      incomeCount: income.length
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
    setSelectedTransactions(parseResults.transactions.map(t => t.id));
  };

  const deselectAllTransactions = () => {
    setSelectedTransactions([]);
  };

  const importSelectedTransactions = () => {
    if (selectedTransactions.length === 0) {
      toast.error('Please select at least one transaction to import');
      return;
    }

    const transactionsToImport = parseResults.transactions.filter(t => 
      selectedTransactions.includes(t.id)
    );

    transactionsToImport.forEach(transaction => {
      const budgetId = budgets?.length === 1 ? budgets[0].id : findBestBudgetMatch(transaction.category);
      
      if (budgetId) {
        fetcher.submit({
          _action: 'createExpense',
          newExpense: transaction.description,
          newExpenseAmount: transaction.amount.toString(),
          newExpenseBudget: budgetId,
          importedTransaction: 'true',
          transactionDate: transaction.date.toString()
        }, { method: 'post' });
      }
    });

    setParseResults(null);
    setSelectedTransactions([]);
    fileInputRef.current.value = '';
    toast.success(`Imported ${transactionsToImport.length} transactions!`);
  };

  const findBestBudgetMatch = (category) => {
    if (!budgets || budgets.length === 0) return null;
    const matchingBudget = budgets.find(budget => 
      budget.name.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(budget.name.toLowerCase())
    );
    return matchingBudget ? matchingBudget.id : budgets[0]?.id;
  };

  const performSync = async () => {
    setSyncStatus('syncing');
    setSyncProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Check if user has linked bank account
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const consentId = localStorage.getItem(`bankConsent_${currentUser.id}`);
      
      if (!consentId) {
        clearInterval(progressInterval);
        // First time - initiate bank linking
        const bankService = new (await import('../services/bankApiService')).default();
        const consent = await bankService.initiateAccountLinking(currentUser.id);
        
        localStorage.setItem(`bankConsent_${currentUser.id}`, consent.consentId);
        
        // Open bank consent page
        window.open(consent.redirectUrl, '_blank');
        toast.info('Please complete bank account linking in the new tab');
        setSyncStatus('idle');
        setSyncProgress(0);
        return;
      }
      
      // Fetch real transactions
      const bankService = new (await import('../services/bankApiService')).default();
      const transactions = await bankService.fetchTransactions(currentUser.id, consentId);
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      if (transactions.length > 0) {
        transactions.forEach(transaction => {
          const budgetId = findBestBudgetMatch(transaction.category);
          if (budgetId) {
            fetcher.submit({
              _action: 'createExpense',
              newExpense: transaction.description,
              newExpenseAmount: transaction.amount.toString(),
              newExpenseBudget: budgetId,
              importedTransaction: 'true'
            }, { method: 'post' });
          }
        });
        toast.success(`✅ Synced ${transactions.length} new transactions!`);
      } else {
        toast.info('✨ All transactions are up to date');
      }
      
      setSyncStatus('success');
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('lastSync', now.toISOString());
      
      // Update next sync time if auto sync is enabled
      if (autoSync) {
        const nextSync = new Date(Date.now() + (syncInterval * 60 * 1000));
        setNextSyncTime(nextSync);
        localStorage.setItem('nextSyncTime', nextSync.toISOString());
      }
      
      // Reset progress after a delay
      setTimeout(() => setSyncProgress(0), 2000);
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setSyncProgress(0);
      toast.error('❌ Sync failed - please try again');
    }
  };

  const toggleAutoSync = async () => {
    setIsToggling(true);
    
    // Add a small delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newAutoSync = !autoSync;
    setAutoSync(newAutoSync);
    localStorage.setItem('autoSync', newAutoSync.toString());
    
    if (newAutoSync) {
      // Calculate next sync time
      const nextSync = new Date(Date.now() + (syncInterval * 60 * 1000));
      setNextSyncTime(nextSync);
      localStorage.setItem('nextSyncTime', nextSync.toISOString());
      toast.success('Auto sync enabled!');
    } else {
      setNextSyncTime(null);
      localStorage.removeItem('nextSyncTime');
      toast.info('Auto sync disabled');
    }
    
    setIsToggling(false);
  };

  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value);
    setSyncInterval(newInterval);
    localStorage.setItem('syncInterval', newInterval.toString());
    
    // Update next sync time if auto sync is enabled
    if (autoSync) {
      const nextSync = new Date(Date.now() + (newInterval * 60 * 1000));
      setNextSyncTime(nextSync);
      localStorage.setItem('nextSyncTime', nextSync.toISOString());
    }
    
    toast.success(`Sync interval updated to ${newInterval} minutes`);
  };

  return (
    <div className="recurring-expenses">
      <div className="section-header">
        <h3>
          <DocumentArrowUpIcon width={20} />
          {showImportOnly ? "Import Your Data" : "Data Management"}
        </h3>
        {!showImportOnly && (
          <button 
            className="btn btn--outline"
            onClick={exportToExcel}
          >
            <ArrowDownTrayIcon width={16} />
            Export Excel
          </button>
        )}
      </div>

      {!parseResults ? (
        <>
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
              accept="*"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            
            <div className="upload-content">
              <DocumentArrowUpIcon width={48} className="upload-icon" />
              <div className="upload-text">
                {uploading ? (
                  <p>Processing your file...</p>
                ) : (
                  <>
                    <p><strong>Click to upload</strong> or drag and drop</p>
                    <p className="text-xs">Supports all file formats</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {!showImportOnly && (
            <div className="data-controls">
              <div className="sync-section">
                <div className="sync-header">
                  <h4><ArrowPathIcon width={16} /> Auto Sync</h4>
                  <button
                    type="button"
                    onClick={performSync}
                    disabled={syncStatus === 'syncing'}
                    className="btn btn--outline btn-sm"
                  >
                    {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
                
                <div className="sync-controls">
                  <div className="auto-sync-toggle">
                    <label className={`toggle-switch ${isToggling ? 'toggling' : ''}`}>
                      <input
                        type="checkbox"
                        checked={autoSync}
                        onChange={toggleAutoSync}
                        disabled={isToggling}
                      />
                      <span className="toggle-slider">
                        <span className="toggle-thumb"></span>
                      </span>
                    </label>
                    <div className="toggle-info">
                      <span className="toggle-label">Auto Sync</span>
                      <small className="toggle-desc">
                        {autoSync ? (
                          <>
                            🔄 Automatically sync every {syncInterval} minutes
                            {nextSyncTime && (
                              <span className="next-sync">
                                Next: {nextSyncTime.toLocaleTimeString()}
                              </span>
                            )}
                          </>
                        ) : (
                          '⏸️ Manual sync only'
                        )}
                      </small>
                    </div>
                  </div>
                  
                  {autoSync && (
                    <div className="sync-interval-group">
                      <label>⏱️ Sync every:</label>
                      <select
                        value={syncInterval}
                        onChange={handleIntervalChange}
                        className="sync-interval enhanced"
                      >
                        <option value={1}>1 minute (Testing)</option>
                        <option value={5}>5 minutes (Frequent)</option>
                        <option value={15}>15 minutes (Regular)</option>
                        <option value={30}>30 minutes (Balanced)</option>
                        <option value={60}>1 hour (Conservative)</option>
                        <option value={180}>3 hours (Light)</option>
                        <option value={1440}>24 hours (Daily)</option>
                      </select>
                    </div>
                  )}
                  
                  {syncStatus === 'syncing' && (
                    <div className="sync-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${syncProgress}%` }}
                        ></div>
                      </div>
                      <small>Syncing... {syncProgress}%</small>
                    </div>
                  )}
                </div>
                
                <div className="sync-status-info">
                  {lastSync && (
                    <small className="last-sync">
                      ✅ Last sync: {lastSync.toLocaleString()}
                    </small>
                  )}
                  {syncStatus === 'error' && (
                    <small className="sync-error">
                      ❌ Last sync failed - check connection
                    </small>
                  )}
                  {autoSync && nextSyncTime && (
                    <small className="next-sync-info">
                      ⏰ Next sync in {Math.ceil((nextSyncTime - new Date()) / (1000 * 60))} minutes
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="transaction-results">
          <div className="results-header">
            <CheckCircleIcon width={24} className="success-icon" />
            <div>
              <h4>Found {parseResults.totalTransactions} transactions</h4>
              <small>{parseResults.fileName}</small>
            </div>
          </div>

          <div className="summary-stats">
            <div className="stat">
              <span>Expenses: ₹{parseResults.summary.totalExpenses.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span>Income: ₹{parseResults.summary.totalIncome.toLocaleString()}</span>
            </div>
          </div>

          <div className="selection-controls">
            <span>{selectedTransactions.length} selected</span>
            <div>
              <button type="button" onClick={selectAllTransactions} className="btn btn--outline btn-sm">
                All
              </button>
              <button type="button" onClick={deselectAllTransactions} className="btn btn--outline btn-sm">
                None
              </button>
            </div>
          </div>

          <div className="transaction-list">
            {parseResults.transactions.slice(0, 6).map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <input
                  type="checkbox"
                  checked={selectedTransactions.includes(transaction.id)}
                  onChange={() => toggleTransactionSelection(transaction.id)}
                />
                <div>
                  <strong>{transaction.description}</strong>
                  <small>{new Date(transaction.date).toLocaleDateString()} • {transaction.category}</small>
                </div>
                <span className={transaction.type === 'expense' ? 'expense' : 'income'}>
                  ₹{transaction.amount.toLocaleString()}
                </span>
              </div>
            ))}
            
            {parseResults.transactions.length > 6 && (
              <small>... and {parseResults.transactions.length - 6} more</small>
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
      )}
    </div>
  );
};

export default DataManager;