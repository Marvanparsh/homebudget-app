import React, { useState } from 'react';
import { BuildingLibraryIcon, ChartBarIcon, TrophyIcon, CurrencyDollarIcon, StarIcon, RocketLaunchIcon, SparklesIcon } from '@heroicons/react/24/outline';

const FinalAchievements = ({ expenses = [], budgets = [] }) => {
  const [hoveredAchievement, setHoveredAchievement] = useState(null);
  const totalExpenses = expenses.length;
  const totalBudgets = budgets.length;
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const achievements = [
    {
      id: 'first-budget',
      title: 'Budget Creator',
      icon: <BuildingLibraryIcon width={24} />,
      description: 'Create your first budget to start your financial journey',
      unlocked: totalBudgets >= 1,
      progress: Math.min(totalBudgets, 1),
      target: 1,
      points: 100,
      color: '#10B981'
    },
    {
      id: 'expense-tracker',
      title: 'Expense Tracker',
      icon: <ChartBarIcon width={24} />,
      description: 'Track 5 expenses to build the habit',
      unlocked: totalExpenses >= 5,
      progress: Math.min(totalExpenses, 5),
      target: 5,
      points: 200,
      color: '#3B82F6'
    },
    {
      id: 'budget-master',
      title: 'Budget Master',
      icon: <TrophyIcon width={24} />,
      description: 'Create 3 different budgets like a pro',
      unlocked: totalBudgets >= 3,
      progress: Math.min(totalBudgets, 3),
      target: 3,
      points: 300,
      color: '#F59E0B'
    },
    {
      id: 'money-tracker',
      title: 'Money Tracker',
      icon: <CurrencyDollarIcon width={24} />,
      description: 'Track ₹1,000 worth of expenses',
      unlocked: totalSpent >= 1000,
      progress: Math.min(totalSpent, 1000),
      target: 1000,
      points: 400,
      color: '#8B5CF6'
    },
    {
      id: 'financial-champion',
      title: 'Financial Champion',
      icon: <StarIcon width={24} />,
      description: 'Track 20 expenses and become a champion',
      unlocked: totalExpenses >= 20,
      progress: Math.min(totalExpenses, 20),
      target: 20,
      points: 500,
      color: '#EF4444'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const progressPercentage = Math.round((unlockedCount / achievements.length) * 100);

  const getProgressPercentage = (achievement) => {
    return Math.min((achievement.progress / achievement.target) * 100, 100);
  };

  return (
    <div className="final-achievements">
      <div className="achievements-header">
        <div className="header-content">
          <h2><TrophyIcon width={24} className="inline" /> Your Achievements</h2>
          <div className="stats">
            <span className="stat">{unlockedCount}/5 Unlocked</span>
            <span className="stat">{totalPoints} Points</span>
            <span className="stat">{progressPercentage}% Complete</span>
          </div>
        </div>
        <div className="overall-progress">
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement, index) => (
          <div 
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            style={{ '--achievement-color': achievement.color }}
            onMouseEnter={() => setHoveredAchievement(achievement.id)}
            onMouseLeave={() => setHoveredAchievement(null)}
          >
            <div className="achievement-number">{index + 1}</div>
            
            <div className="achievement-icon">
              {achievement.icon}
              {achievement.unlocked && <div className="unlock-badge">✓</div>}
            </div>
            
            <div className="achievement-content">
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              
              <div className="progress-section">
                <div className="progress-info">
                  <span className="progress-text">
                    {achievement.id === 'money-tracker' 
                      ? `₹${achievement.progress}/₹${achievement.target}`
                      : `${achievement.progress}/${achievement.target}`
                    }
                  </span>
                  <span className={`status ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                    {achievement.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill-small"
                    style={{ 
                      width: `${getProgressPercentage(achievement)}%`,
                      backgroundColor: achievement.unlocked ? achievement.color : '#9CA3AF'
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="points-badge">
                +{achievement.points} pts
              </div>
            </div>
            
            {hoveredAchievement === achievement.id && (
              <div className="hover-effect"></div>
            )}
          </div>
        ))}
      </div>

      <div className="achievements-footer">
        {unlockedCount === 0 && (
          <div className="motivational-message">
            <span className="message-icon"><StarIcon width={20} /></span>
            <p>Start your financial journey! Create your first budget to unlock achievements.</p>
          </div>
        )}
        {unlockedCount > 0 && unlockedCount < 5 && (
          <div className="motivational-message">
            <span className="message-icon"><RocketLaunchIcon width={20} /></span>
            <p>Great progress! You've unlocked {unlockedCount} out of 5 achievements. Keep going!</p>
          </div>
        )}
        {unlockedCount === 5 && (
          <div className="motivational-message champion">
            <span className="message-icon"><SparklesIcon width={20} /></span>
            <p>Congratulations! You're a Financial Champion with all achievements unlocked!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalAchievements;