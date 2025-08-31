import React, { useState, useEffect } from 'react';
import { DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const MobileOptimizations = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return (
    <div className={`app-container ${isMobile ? 'mobile' : 'desktop'} ${isLandscape ? 'landscape' : 'portrait'}`}>
      {children}
      {isMobile && (
        <div className="mobile-indicator">
          <DevicePhoneMobileIcon width={16} />
          <span>Mobile View</span>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizations;