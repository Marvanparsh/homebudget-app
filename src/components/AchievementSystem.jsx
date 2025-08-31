import React, { useEffect, useState } from 'react';
import { TrophyIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { useAchievements } from '../hooks/useInteractions';

const AchievementSystem = ({ expenses, budgets }) => {
  const { achievements, checkAchievements } = useAchievements();
  const [showAchievement, setShowAchievement] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  useEffect(() => {
    checkAchievements(expenses || [], budgets || []);
  }, [expenses, budgets, checkAchievements]);
  
  useEffect(() => {
    const shownAchievements = JSON.parse(localStorage.getItem('shownAchievements') || '[]');
    const newAchievement = achievements.find(a => !shownAchievements.includes(a.id));
    
    if (newAchievement && !showAchievement) {
      setShowAchievement(newAchievement);
      const updatedShown = [...shownAchievements, newAchievement.id];
      localStorage.setItem('shownAchievements', JSON.stringify(updatedShown));
      setTimeout(() => setShowAchievement(null), 5000);
    }
  }, [achievements, showAchievement]);
  
  const achievementsList = [
    { 
      id: 'first-expense', 
      title: 'Getting Started', 
      description: 'Added your first expense', 
      icon: '🎯',
      category: 'Beginner',
      points: 10
    },
    { 
      id: 'budget-saver', 
      title: 'Budget Guardian', 
      description: 'Stayed under 80% of budget for a month', 
      icon: '💰',
      category: 'Saving',
      points: 25
    },
    { 
      id: 'week-tracker', 
      title: 'Consistency Champion', 
      description: 'Tracked expenses for 7 consecutive days', 
      icon: '📅',
      category: 'Habit',
      points: 20
    },
    { 
      id: 'category-master', 
      title: 'Organization Expert', 
      description: 'Created and used 5+ budget categories', 
      icon: '🏆',
      category: 'Organization',
      points: 30
    },
    { 
      id: 'expense-expert', 
      title: 'Data Master', 
      description: 'Logged 50+ expenses', 
      icon: '⭐',
      category: 'Milestone',
      points: 50
    }
  ];
  
  const totalPoints = achievementsList
    .filter(achievement => achievements.some(a => a.id === achievement.id))
    .reduce((sum, achievement) => sum + achievement.points, 0);
  
  const unlockedCount = achievements.length;
  const totalCount = achievementsList.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;
  
  return (
    <>
      {showAchievement && (
        <div className="achievement-popup">
          <button 
            className="achievement-close"
            onClick={() => setShowAchievement(null)}
            aria-label="Close achievement notification"
          >
            <XMarkIcon width={20} />
          </button>
          
          <div className="achievement-content">
            <div className="achievement-icon-large">
              {achievementsList.find(a => a.id === showAchievement.id)?.icon || '🏆'}
            </div>
            <h3>🎉 Achievement Unlocked!</h3>
            <h4>{achievementsList.find(a => a.id === showAchievement.id)?.title}</h4>
            <p>{achievementsList.find(a => a.id === showAchievement.id)?.description}</p>
            <div className="achievement-points">
              +{achievementsList.find(a => a.id === showAchievement.id)?.points} points
            </div>
          </div>
          
          <div className="confetti">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className="confetti-piece" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="achievements-panel">
        <div className="achievements-header">
          <div className="achievements-title">
            <TrophyIcon width={24} className="trophy-icon" />
            <h3>Achievements</h3>
          </div>
          <div className="achievements-stats">
            <div className="stat">
              <StarIcon width={16} />
              <span>{totalPoints} pts</span>
            </div>
            <div className="stat">
              <span>{unlockedCount}/{totalCount}</span>
            </div>
          </div>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="progress-text">{Math.round(progressPercentage)}% Complete</span>
        </div>
        
        <div className="achievements-grid">
          {achievementsList.map(achievement => {
            const isUnlocked = achievements.some(a => a.id === achievement.id);
            return (
              <div 
                key={achievement.id} 
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                onClick={() => setSelectedAchievement(achievement)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedAchievement(achievement);
                  }
                }}
              >
                <div className="achievement-icon">
                  {isUnlocked ? achievement.icon : '🔒'}
                </div>
                <div className="achievement-info">
                  <h4 className="achievement-title">{achievement.title}</h4>
                  <p className="achievement-desc">{achievement.description}</p>
                  <div className="achievement-meta">
                    <span className="category">{achievement.category}</span>
                    <span className="points">{achievement.points} pts</span>
                  </div>
                </div>
                {isUnlocked && <div className="unlock-indicator">✓</div>}
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedAchievement && (
        <div className="achievement-modal" onClick={() => setSelectedAchievement(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedAchievement(null)}
              aria-label="Close modal"
            >
              <XMarkIcon width={20} />
            </button>
            
            <div className="modal-header">
              <div className="modal-icon">
                {selectedAchievement.icon}
              </div>
              <h3>{selectedAchievement.title}</h3>
              <span className="modal-category">{selectedAchievement.category}</span>
            </div>
            
            <div className="modal-body">
              <p>{selectedAchievement.description}</p>
              <div className="modal-points">
                <StarIcon width={16} />
                <span>{selectedAchievement.points} points</span>
              </div>
              
              {achievements.some(a => a.id === selectedAchievement.id) ? (
                <div className="achievement-status unlocked">
                  <span>🎉 Unlocked!</span>
                </div>
              ) : (
                <div className="achievement-status locked">
                  <span>🔒 Keep going to unlock this achievement</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AchievementSystem;