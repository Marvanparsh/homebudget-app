import React, { useEffect, useState } from 'react';
import { TrophyIcon } from '@heroicons/react/24/solid';

const AchievementNotification = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`achievement-notification ${isVisible ? 'visible' : ''}`}>
      <div className="notification-content">
        <div className="notification-icon">
          <TrophyIcon />
        </div>
        <div className="notification-text">
          <h4>Achievement Unlocked!</h4>
          <p>{achievement.title}</p>
          <span className="points">+{achievement.points} points</span>
        </div>
        <button className="close-btn" onClick={() => setIsVisible(false)}>
          ×
        </button>
      </div>
      <div className="confetti-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="confetti-piece" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
          }} />
        ))}
      </div>
    </div>
  );
};

export default AchievementNotification;