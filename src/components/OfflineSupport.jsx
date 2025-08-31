import React, { useState, useEffect } from 'react';
import { WifiIcon, CloudIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const OfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline queue on mount
    loadOfflineQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineQueue = () => {
    const queue = JSON.parse(localStorage.getItem('offlineExpenses') || '[]');
    setOfflineQueue(queue);
  };

  const addToOfflineQueue = (expense) => {
    const queue = [...offlineQueue, { ...expense, timestamp: Date.now() }];
    setOfflineQueue(queue);
    localStorage.setItem('offlineExpenses', JSON.stringify(queue));
  };

  const syncOfflineData = async () => {
    if (offlineQueue.length === 0) return;

    try {
      // Sync each offline expense
      for (const expense of offlineQueue) {
        // In a real app, this would sync with your backend
        console.log('Syncing offline expense:', expense);
      }

      // Clear offline queue after successful sync
      setOfflineQueue([]);
      localStorage.removeItem('offlineExpenses');
      
      // Show success notification
      if ('serviceWorker' in navigator && 'Notification' in window) {
        new Notification('Budget Tracker', {
          body: `Synced ${offlineQueue.length} offline expenses`,
          icon: '/favicon.svg'
        });
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  if (!isOnline && offlineQueue.length > 0) {
    return (
      <div className="offline-banner">
        <div className="offline-content">
          <ExclamationTriangleIcon width={20} />
          <span>
            You're offline. {offlineQueue.length} expense(s) will sync when you're back online.
          </span>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="offline-banner">
        <div className="offline-content">
          <WifiIcon width={20} />
          <span>You're offline. Your data will be saved locally and synced when you reconnect.</span>
        </div>
      </div>
    );
  }

  return null;
};

// Hook for offline expense handling
export const useOfflineExpense = () => {
  const [isOnline] = useState(navigator.onLine);

  const addExpense = (expense) => {
    if (isOnline) {
      // Normal online flow
      return expense;
    } else {
      // Add to offline queue
      const offlineExpenses = JSON.parse(localStorage.getItem('offlineExpenses') || '[]');
      const offlineExpense = { ...expense, offline: true, timestamp: Date.now() };
      offlineExpenses.push(offlineExpense);
      localStorage.setItem('offlineExpenses', JSON.stringify(offlineExpenses));
      return offlineExpense;
    }
  };

  return { addExpense, isOnline };
};

export default OfflineSupport;