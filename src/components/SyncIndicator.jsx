import React, { useState, useEffect } from 'react';
import { CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getBackupInfo } from '../utils/socialAuthHelpers';

const SyncIndicator = () => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced
  const [lastSync, setLastSync] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.isSocialLogin) {
      loadSyncInfo();
      
      // Listen for sync events
      const handleSync = () => {
        setSyncStatus('syncing');
        setTimeout(() => {
          setSyncStatus('synced');
          loadSyncInfo();
          setTimeout(() => setSyncStatus('idle'), 2000);
        }, 1000);
      };

      window.addEventListener('userDataSync', handleSync);
      return () => window.removeEventListener('userDataSync', handleSync);
    }
  }, [user]);

  const loadSyncInfo = () => {
    if (user) {
      const backupInfo = getBackupInfo(user.id);
      if (backupInfo) {
        setLastSync(backupInfo.lastUpdated);
      }
    }
  };

  if (!user || !user.isSocialLogin) return null;

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`sync-indicator ${syncStatus}`}>
      <div className="sync-icon">
        {syncStatus === 'syncing' && <CloudArrowUpIcon className="spinning" />}
        {syncStatus === 'synced' && <CheckCircleIcon />}
        {syncStatus === 'idle' && <CloudArrowUpIcon />}
      </div>
      <div className="sync-text">
        {syncStatus === 'syncing' && 'Syncing...'}
        {syncStatus === 'synced' && 'Synced'}
        {syncStatus === 'idle' && `Last sync: ${formatLastSync(lastSync)}`}
      </div>
    </div>
  );
};

export default SyncIndicator;