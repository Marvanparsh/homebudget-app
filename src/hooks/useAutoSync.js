import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

export const useAutoSync = (onSyncComplete) => {
  const [autoSync, setAutoSync] = useState(() => 
    localStorage.getItem('autoSync') === 'true'
  );
  const [syncInterval, setSyncInterval] = useState(() => 
    parseInt(localStorage.getItem('syncInterval')) || 30
  );
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(() => {
    const saved = localStorage.getItem('lastSync');
    return saved ? new Date(saved) : null;
  });
  const [nextSyncTime, setNextSyncTime] = useState(() => {
    const saved = localStorage.getItem('nextSyncTime');
    return saved ? new Date(saved) : null;
  });
  const [syncProgress, setSyncProgress] = useState(0);
  const [isToggling, setIsToggling] = useState(false);

  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  // Debounced sync function to prevent multiple simultaneous syncs
  const performSync = useCallback(async () => {
    if (syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    setSyncProgress(0);

    try {
      // Simulate progress for better UX
      progressRef.current = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 12, 90));
      }, 250);

      // Simulate API call - replace with actual sync logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
      setSyncProgress(100);

      // Mock result - replace with actual sync result
      const mockResult = {
        newTransactions: Math.floor(Math.random() * 5),
        success: Math.random() > 0.1 // 90% success rate
      };

      if (mockResult.success) {
        setSyncStatus('success');
        const now = new Date();
        setLastSync(now);
        localStorage.setItem('lastSync', now.toISOString());

        if (mockResult.newTransactions > 0) {
          toast.success(`✅ Found ${mockResult.newTransactions} new transactions!`);
        } else {
          toast.info('✨ All transactions are up to date');
        }

        // Update next sync time
        if (autoSync) {
          const nextSync = new Date(Date.now() + (syncInterval * 60 * 1000));
          setNextSyncTime(nextSync);
          localStorage.setItem('nextSyncTime', nextSync.toISOString());
        }

        onSyncComplete?.(mockResult);
      } else {
        throw new Error('Sync failed');
      }

      // Reset progress after delay
      setTimeout(() => setSyncProgress(0), 2000);

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setSyncProgress(0);
      toast.error('❌ Sync failed - please try again');
    }
  }, [syncStatus, autoSync, syncInterval, onSyncComplete]);

  // Toggle auto sync with smooth animation
  const toggleAutoSync = useCallback(async () => {
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
      setNextSyncTime(null);
      localStorage.removeItem('nextSyncTime');
    }
    
    setIsToggling(false);
  }, [autoSync]);

  // Update sync interval with user feedback
  const updateSyncInterval = useCallback((newInterval) => {
    setSyncInterval(newInterval);
    localStorage.setItem('syncInterval', newInterval.toString());
    
    // Update next sync time if auto sync is enabled
    if (autoSync) {
      const nextSync = new Date(Date.now() + (newInterval * 60 * 1000));
      setNextSyncTime(nextSync);
      localStorage.setItem('nextSyncTime', nextSync.toISOString());
    }
    
    // User-friendly feedback
    const intervalText = newInterval < 60 ? `${newInterval} minutes` : 
                        newInterval === 60 ? '1 hour' : 
                        newInterval === 180 ? '3 hours' :
                        newInterval === 360 ? '6 hours' :
                        newInterval === 720 ? '12 hours' : '24 hours';
    
    toast.success(`⏱️ Sync interval updated to ${intervalText}`);
  }, [autoSync]);

  // Auto sync interval management
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
  }, [autoSync, syncInterval, performSync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, []);

  // Calculate time until next sync
  const getTimeUntilNextSync = useCallback(() => {
    if (!nextSyncTime || !autoSync) return null;
    
    const now = new Date();
    const diff = nextSyncTime - now;
    
    if (diff <= 0) return null;
    
    const minutes = Math.ceil(diff / (1000 * 60));
    return minutes;
  }, [nextSyncTime, autoSync]);

  // Get status display text
  const getStatusText = useCallback(() => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing transactions...';
      case 'success':
        return 'Sync completed successfully';
      case 'error':
        return 'Sync failed - please try again';
      default:
        return 'Ready to sync';
    }
  }, [syncStatus]);

  return {
    // State
    autoSync,
    syncInterval,
    syncStatus,
    lastSync,
    nextSyncTime,
    syncProgress,
    isToggling,
    
    // Actions
    performSync,
    toggleAutoSync,
    updateSyncInterval,
    
    // Computed values
    timeUntilNextSync: getTimeUntilNextSync(),
    statusText: getStatusText(),
    
    // Status checks
    isSyncing: syncStatus === 'syncing',
    hasError: syncStatus === 'error',
    isSuccess: syncStatus === 'success'
  };
};

export default useAutoSync;