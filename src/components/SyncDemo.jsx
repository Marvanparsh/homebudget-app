import { useState } from 'react';
import EnhancedSyncIndicator from './EnhancedSyncIndicator';
import { toast } from 'react-toastify';

const SyncDemo = () => {
  const [compactMode, setCompactMode] = useState(false);

  const handleSyncComplete = (result) => {
    console.log('Sync completed:', result);
    // Handle sync completion - update UI, refresh data, etc.
  };

  return (
    <div className="sync-demo">
      <div className="demo-header">
        <h2>Enhanced Auto Sync Demo</h2>
        <p>Experience the improved auto sync functionality with better responsiveness and user feedback.</p>
        
        <div className="demo-controls">
          <label className="demo-toggle">
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
            />
            <span>Compact Mode</span>
          </label>
        </div>
      </div>

      <div className="demo-content">
        <div className="demo-section">
          <h3>Key Improvements:</h3>
          <ul className="improvements-list">
            <li>✨ <strong>Smooth Toggle Animation</strong> - Enhanced visual feedback when enabling/disabling auto sync</li>
            <li>🎯 <strong>Real-time Progress</strong> - Live progress bar during sync operations</li>
            <li>⏰ <strong>Smart Timing</strong> - Shows next sync countdown and intelligent interval options</li>
            <li>🔄 <strong>Responsive Design</strong> - Optimized for all screen sizes with compact mode</li>
            <li>💡 <strong>Better UX</strong> - Toast notifications and status indicators for clear feedback</li>
            <li>⚡ <strong>Performance</strong> - Debounced operations and efficient state management</li>
          </ul>
        </div>

        <div className="demo-sync-container">
          <EnhancedSyncIndicator 
            onSyncComplete={handleSyncComplete}
            compact={compactMode}
          />
        </div>

        <div className="demo-features">
          <div className="feature-card">
            <h4>🎛️ Enhanced Toggle</h4>
            <p>Smooth animations with visual feedback and status indicators</p>
          </div>
          
          <div className="feature-card">
            <h4>📊 Progress Tracking</h4>
            <p>Real-time progress bars with shimmer effects during sync</p>
          </div>
          
          <div className="feature-card">
            <h4>⏱️ Smart Intervals</h4>
            <p>Intelligent sync timing with user-friendly options</p>
          </div>
          
          <div className="feature-card">
            <h4>📱 Responsive</h4>
            <p>Works perfectly on desktop, tablet, and mobile devices</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncDemo;