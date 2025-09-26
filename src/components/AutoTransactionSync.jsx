import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const AutoTransactionSync = ({ budgets, onNewTransactions }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSync, setLastSync] = useState(null);
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30); // minutes
  const [newTransactionsCount, setNewTransactionsCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);
  const [nextSyncTime, setNextSyncTime] = useState(null);
  const [isToggling, setIsToggling] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Load saved settings
    const savedAutoSync = localStorage.getItem('autoSync') === 'true';
    const savedInterval = parseInt(localStorage.getItem('syncInterval')) || 30;
    const savedLastSync = localStorage.getItem('lastSync');
    
    setAutoSync(savedAutoSync);
    setSyncInterval(savedInterval);
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }
  }, []);

  // Auto sync effect with cleanup
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (autoSync && syncInterval > 0) {
      const nextSync = new Date(Date.now() + (syncInterval * 60 * 1000));
      setNextSyncTime(nextSync);
      localStorage.setItem('nextSyncTime', nextSync.toISOString());
      
      intervalRef.current = setInterval(() => {
        performSync();
      }, syncInterval * 60 * 1000);
    } else {
      setNextSyncTime(null);
      localStorage.removeItem('nextSyncTime');
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSync, syncInterval]);
  
  // Countdown timer for next sync
  useEffect(() => {
    if (!nextSyncTime || !autoSync) return;
    
    const updateCountdown = () => {
      const now = new Date();
      if (now >= nextSyncTime) {
        setNextSyncTime(null);
      }
    };
    
    const countdownInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownInterval);
  }, [nextSyncTime, autoSync]);

  const performSync = useCallback(async () => {
    if (syncStatus === 'syncing') return; // Prevent multiple simultaneous syncs
    
    setSyncStatus('syncing');
    setNewTransactionsCount(0);
    setSyncProgress(0);
    
    try {
      // Progress simulation for better UX
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 15, 90));
      }, 300);
      
      const mockTransactions = await simulateBankAPICall();
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      if (mockTransactions.length > 0) {
        setNewTransactionsCount(mockTransactions.length);
        
        if (onNewTransactions) {
          onNewTransactions(mockTransactions);
        }
        
        await processNewTransactions(mockTransactions);
        toast.success(`✅ Found ${mockTransactions.length} new transactions!`);
      } else {
        toast.info('✨ All transactions are up to date');
      }
      
      setSyncStatus('success');
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('lastSync', now.toISOString());
      
      // Update next sync time
      if (autoSync) {
        const nextSync = new Date(Date.now() + (syncInterval * 60 * 1000));
        setNextSyncTime(nextSync);
        localStorage.setItem('nextSyncTime', nextSync.toISOString());
      }
      
      // Reset progress after delay
      setTimeout(() => setSyncProgress(0), 2000);
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setSyncProgress(0);
      toast.error('❌ Sync failed - please try again');
    }
  }, [syncStatus, onNewTransactions, autoSync, syncInterval]);

  const simulateBankAPICall = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock transactions (in real app, this would be actual API data)
    const mockTransactions = [
      {
        id: `mock_${Date.now()}_1`,
        date: Date.now(),
        description: 'SWIGGY BANGALORE',
        amount: 450,
        type: 'expense',
        category: 'Food & Dining',
        createdAt: Date.now()
      },
      {
        id: `mock_${Date.now()}_2`,
        date: Date.now() - 86400000, // Yesterday
        description: 'UBER TRIP',
        amount: 280,
        type: 'expense',
        category: 'Transportation',
        createdAt: Date.now()
      }
    ];
    
    // Only return transactions if it's been more than 5 minutes since last sync
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const shouldReturnTransactions = !lastSync || lastSync.getTime() < fiveMinutesAgo;
    
    return shouldReturnTransactions ? mockTransactions : [];
  };

  const processNewTransactions = async (transactions) => {
    // Auto-categorize transactions and create expenses
    for (const transaction of transactions) {
      if (transaction.type === 'expense') {
        const budgetId = findBestBudgetMatch(transaction.category);
        
        // Create expense entry
        const expenseData = {
          id: transaction.id,
          name: transaction.description,
          amount: transaction.amount,
          budgetId: budgetId,
          createdAt: transaction.date,
          isAutoImported: true
        };
        
        // Store in localStorage (in real app, this would be sent to backend)
        const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        // Check if transaction already exists
        const exists = existingExpenses.some(expense => 
          expense.name === transaction.description && 
          expense.amount === transaction.amount &&
          Math.abs(expense.createdAt - transaction.date) < 86400000 // Within 24 hours
        );
        
        if (!exists) {
          existingExpenses.push(expenseData);
          localStorage.setItem('expenses', JSON.stringify(existingExpenses));
        }
      }
    }
  };

  const findBestBudgetMatch = (category) => {
    if (!budgets || budgets.length === 0) return null;
    
    // Try to match transaction category with existing budget names
    const matchingBudget = budgets.find(budget => 
      budget.name.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(budget.name.toLowerCase())
    );
    
    return matchingBudget ? matchingBudget.id : budgets[0].id;
  };

  const toggleAutoSync = async () => {
    setIsToggling(true);
    
    // Add smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newAutoSync = !autoSync;
    setAutoSync(newAutoSync);
    localStorage.setItem('autoSync', newAutoSync.toString());
    
    if (newAutoSync) {
      toast.success('✅ Auto sync enabled!');
    } else {
      toast.info('⏸️ Auto sync disabled');
    }
    
    setIsToggling(false);
  };

  const handleIntervalChange = useCallback((e) => {
    const newInterval = parseInt(e.target.value);
    setSyncInterval(newInterval);
    localStorage.setItem('syncInterval', newInterval.toString());
    
    // Show user-friendly feedback
    const intervalText = newInterval < 60 ? `${newInterval} minutes` : 
                        newInterval === 60 ? '1 hour' : 
                        newInterval === 180 ? '3 hours' :
                        newInterval === 360 ? '6 hours' :
                        newInterval === 720 ? '12 hours' : '24 hours';
    
    toast.success(`⏱️ Sync interval updated to ${intervalText}`);
  }, []);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ArrowPathIcon width={20} className="sync-icon spinning" />;
      case 'success':
        return <CheckCircleIcon width={20} className="success-icon" />;
      case 'error':
        return <ExclamationTriangleIcon width={20} className="error-icon" />;
      default:
        return <ArrowPathIcon width={20} className="sync-icon" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing transactions...';
      case 'success':
        return newTransactionsCount > 0 
          ? `Found ${newTransactionsCount} new transactions`
          : 'No new transactions';
      case 'error':
        return 'Sync failed - please try again';
      default:
        return 'Ready to sync';
    }
  };

  return (
    <div className="auto-transaction-sync">
      <div className="form-wrapper">
        <h2 className="h3">Auto Transaction Sync</h2>
        <p className="text-xs">Automatically import new transactions from your bank</p>
        
        <div className={`sync-controls ${syncStatus}`}>
          <div className="sync-status">
            {getStatusIcon()}
            <div className="status-info">
              <span className="status-text">{getStatusText()}</span>
              <div className="sync-details">
                {lastSync && (
                  <span className="last-sync">
                    ✅ Last sync: {lastSync.toLocaleString()}
                  </span>
                )}
                {nextSyncTime && autoSync && (
                  <span className="next-sync">
                    <ClockIcon width={12} />
                    Next in {Math.ceil((nextSyncTime - new Date()) / (1000 * 60))} min
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={performSync}
            disabled={syncStatus === 'syncing'}
            className={`btn btn--outline sync-now-btn ${syncStatus === 'syncing' ? 'syncing' : ''}`}
          >
            {syncStatus === 'syncing' ? (
              <>
                <ArrowPathIcon width={16} className="spinning" />
                Syncing...
              </>
            ) : (
              'Sync Now'
            )}
          </button>
        </div>
        
        {syncStatus === 'syncing' && (
          <div className="sync-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${syncProgress}%` }}
              ></div>
            </div>
            <small>Syncing transactions... {syncProgress}%</small>
          </div>
        )}

        <div className="auto-sync-settings">
          <div className="setting-item">
            <label className={`toggle-label ${isToggling ? 'toggling' : ''}`}>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={toggleAutoSync}
                className="toggle-input"
                disabled={isToggling}
              />
              <span className="toggle-slider">
                <span className="toggle-thumb"></span>
              </span>
              <div className="toggle-text-wrapper">
                <span className="toggle-text">Enable Auto Sync</span>
                <small className="toggle-desc">
                  {autoSync ? '✅ Automatically sync in background' : '⏸️ Manual sync only'}
                </small>
              </div>
            </label>
          </div>
          
          {autoSync && (
            <div className="setting-item">
              <label htmlFor="syncInterval">Sync Interval</label>
              <select
                id="syncInterval"
                value={syncInterval}
                onChange={handleIntervalChange}
                className="interval-select"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every hour</option>
                <option value={180}>Every 3 hours</option>
                <option value={360}>Every 6 hours</option>
                <option value={720}>Every 12 hours</option>
                <option value={1440}>Daily</option>
              </select>
            </div>
          )}
        </div>

        <div className="sync-info">
          <h4>How it works:</h4>
          <ul className="info-list">
            <li>Connect to your bank's secure API</li>
            <li>Automatically categorize transactions</li>
            <li>Match expenses to existing budgets</li>
            <li>Skip duplicate transactions</li>
            <li>Run in the background when enabled</li>
          </ul>
          
          <div className="security-note">
            <ExclamationTriangleIcon width={16} />
            <span>Your banking credentials are never stored. We use secure, read-only access.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoTransactionSync;