import React from 'react';
import '../achievement-velocity.css';

const SimpleAchievementBar = ({ expenses = [], budgets = [] }) => {
  const totalExpenses = expenses.length;
  const totalBudgets = budgets.length;
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const achievements = [
    {
      id: 'budget',
      icon: '🏦',
      title: 'Budget Creator',
      unlocked: totalBudgets >= 1
    },
    {
      id: 'tracker',
      icon: '📊',
      title: 'Expense Tracker',
      unlocked: totalExpenses >= 5
    },
    {
      id: 'master',
      icon: '🏆',
      title: 'Budget Master',
      unlocked: totalBudgets >= 3
    },
    {
      id: 'money',
      icon: '💰',
      title: 'Money Tracker',
      unlocked: totalSpent >= 1000
    },
    {
      id: 'champion',
      icon: '👑',
      title: 'Financial Champion',
      unlocked: totalExpenses >= 20
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="achievement-velocity">
      <h3>🏆 Your Achievements</h3>
      <div className="achievement-grid">
        {achievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-header">
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-label">{achievement.title}</div>
            </div>
            <div className="achievement-status">
              {achievement.unlocked ? '✓ Unlocked' : '🔒 Locked'}
            </div>
          </div>
        ))}
      </div>
      <div className="achievement-insights">
        <div className="achievement-summary">
          <span className="summary-text">{unlockedCount} of 5 achievements unlocked</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleAchievementBar;