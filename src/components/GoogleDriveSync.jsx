import React, { useState, useEffect } from 'react';
import { CloudArrowUpIcon, CloudArrowDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { syncToGoogleDrive, syncFromGoogleDrive, enableAutoSync } from '../utils/googleDriveSync';

const GoogleDriveSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);

  useEffect(() => {
    const lastSyncTime = localStorage.getItem('lastGoogleDriveSync');
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime));
    }
  }, []);

  const handleUpload = async () => {
    setSyncing(true);
    const success = await syncToGoogleDrive();
    if (success) {
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('lastGoogleDriveSync', now.toISOString());
    }
    setSyncing(false);
  };

  const handleDownload = async () => {
    setSyncing(true);
    await syncFromGoogleDrive();
    setSyncing(false);
    window.location.reload(); // Refresh to show synced data
  };

  const toggleAutoSync = () => {
    if (!autoSyncEnabled) {
      enableAutoSync();
      setAutoSyncEnabled(true);
      localStorage.setItem('autoSyncEnabled', 'true');
    } else {
      setAutoSyncEnabled(false);
      localStorage.setItem('autoSyncEnabled', 'false');
    }
  };

  return (
    <div className="google-drive-sync">
      <h3>📁 Google Drive Sync</h3>
      <p className="sync-description">
        Sync your budget data to a "HomeBudget" folder in your Google Drive
      </p>
      
      <div className="sync-actions">
        <button 
          className="btn btn--outline"
          onClick={handleUpload}
          disabled={syncing}
        >
          <CloudArrowUpIcon width={16} />
          {syncing ? 'Uploading...' : 'Upload to Drive'}
        </button>
        
        <button 
          className="btn btn--outline"
          onClick={handleDownload}
          disabled={syncing}
        >
          <CloudArrowDownIcon width={16} />
          {syncing ? 'Downloading...' : 'Download from Drive'}
        </button>
      </div>

      <div className="auto-sync-toggle">
        <label>
          <input
            type="checkbox"
            checked={autoSyncEnabled}
            onChange={toggleAutoSync}
          />
          Enable Auto-Sync
        </label>
      </div>

      {lastSync && (
        <div className="last-sync">
          <CheckCircleIcon width={16} />
          Last synced: {lastSync.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default GoogleDriveSync;