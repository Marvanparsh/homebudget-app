import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAutoSync } from '../hooks/useAutoSync';

const EnhancedSyncIndicator = ({ onSyncComplete, compact = false }) => {
  const {
    autoSync,
    syncStatus,
    lastSync,
    syncProgress,
    isToggling,
    timeUntilNextSync,
    statusText,
    performSync,
    toggleAutoSync,
    updateSyncInterval,
    isSyncing,
    hasError,
    isSuccess
  } = useAutoSync(onSyncComplete);

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

  if (compact) {
    return (
      <div className={`sync-indicator-compact ${syncStatus}`}>
        <button
          onClick={performSync}
          disabled={isSyncing}
          className={`sync-btn-compact ${isSyncing ? 'syncing' : ''}`}
          title={statusText}
        >
          {getStatusIcon()}
        </button>
        
        {autoSync && timeUntilNextSync && (
          <span className="next-sync-compact">
            {timeUntilNextSync}m
          </span>
        )}
        
        {isSyncing && (
          <div className="progress-ring">
            <svg width="24" height="24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${syncProgress * 0.628} 62.8`}
                transform="rotate(-90 12 12)"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`enhanced-sync-indicator ${syncStatus}`}>
      <div className="sync-header">
        <div className="sync-status-display">
          {getStatusIcon()}
          <div className="status-info">
            <span className="status-text">{statusText}</span>
            {lastSync && (
              <small className="last-sync-time">
                Last: {lastSync.toLocaleTimeString()}
              </small>
            )}
          </div>
        </div>
        
        <div className="sync-actions">
          <button
            onClick={performSync}
            disabled={isSyncing}
            className={`sync-btn ${isSyncing ? 'syncing' : ''}`}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {isSyncing && (
        <div className="sync-progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${syncProgress}%` }}
            />
          </div>
          <small>Progress: {syncProgress}%</small>
        </div>
      )}

      <div className="auto-sync-controls">
        <label className={`auto-sync-toggle ${isToggling ? 'toggling' : ''}`}>
          <input
            type="checkbox"
            checked={autoSync}
            onChange={toggleAutoSync}
            disabled={isToggling}
          />
          <span className="toggle-slider">
            <span className="toggle-thumb" />
          </span>
          <div className="toggle-info">
            <span className="toggle-label">Auto Sync</span>
            <small className="toggle-desc">
              {autoSync ? (
                <>
                  🔄 Active
                  {timeUntilNextSync && (
                    <span className="next-sync-time">
                      • Next in {timeUntilNextSync}m
                    </span>
                  )}
                </>
              ) : (
                '⏸️ Disabled'
              )}
            </small>
          </div>
        </label>

        {autoSync && (
          <div className="interval-selector">
            <select
              onChange={(e) => updateSyncInterval(parseInt(e.target.value))}
              className="interval-select"
            >
              <option value={1}>1 min</option>
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={180}>3 hours</option>
              <option value={1440}>Daily</option>
            </select>
          </div>
        )}
      </div>

      {hasError && (
        <div className="error-message">
          <ExclamationTriangleIcon width={16} />
          <span>Connection issue - will retry automatically</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedSyncIndicator;