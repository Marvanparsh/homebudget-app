import React, { useState, useMemo } from 'react';
import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon, 
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CalendarIcon as CalendarIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  RocketLaunchIcon as RocketLaunchIconSolid
} from '@heroicons/react/24/solid';

const AchievementLevels = ({ expenses = [], budgets = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Debug: Log props
  console.log('AchievementLevels rendered with:', { expenses: expenses.length, budgets: budgets.length });

  // Define achievement levels
  const achievementLevels = useMemo(() => {
    const totalExpenses = expenses.length;
    const totalBudgets = budgets.length;
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const daysActive = expenses.length > 0 ? 
      Math.ceil((Date.now() - Math.min(...expenses.map(e => e.createdAt))) / (1000 * 60 * 60 * 24)) : 0;

    return [
      // Beginner Levels
      {
        id: 'first-budget',
        title: 'Budget Creator',
        description: 'Created your first budget',
        icon: BanknotesIcon,
        iconSolid: BanknotesIconSolid,
        category: 'beginner',
        level: 1,
        requirement: 'Create 1 budget',
        unlocked: totalBudgets >= 1,
        progress: Math.min(totalBudgets, 1),
        maxProgress: 1,
        points: 50,
        color: '#10B981'
      },
      {
        id: 'first-expense',
        title: 'Expense Tracker',
        description: 'Logged your first expense',
        icon: ChartBarIcon,
        iconSolid: ChartBarIconSolid,
        category: 'beginner',
        level: 1,
        requirement: 'Add 1 expense',
        unlocked: totalExpenses >= 1,
        progress: Math.min(totalExpenses, 1),
        maxProgress: 1,
        points: 25,
        color: '#3B82F6'
      },
      {
        id: 'budget-master',
        title: 'Budget Master',
        description: 'Created 5 different budgets',
        icon: TrophyIcon,
        iconSolid: TrophyIconSolid,
        category: 'beginner',
        level: 2,
        requirement: 'Create 5 budgets',
        unlocked: totalBudgets >= 5,
        progress: Math.min(totalBudgets, 5),
        maxProgress: 5,
        points: 150,
        color: '#F59E0B'
      },

      // Intermediate Levels
      {
        id: 'expense-warrior',
        title: 'Expense Warrior',
        description: 'Tracked 25 expenses',
        icon: FireIcon,
        iconSolid: FireIconSolid,
        category: 'intermediate',
        level: 3,
        requirement: 'Track 25 expenses',
        unlocked: totalExpenses >= 25,
        progress: Math.min(totalExpenses, 25),
        maxProgress: 25,
        points: 200,
        color: '#EF4444'
      },
      {
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Active for 7 consecutive days',
        icon: CalendarIcon,
        iconSolid: CalendarIconSolid,
        category: 'intermediate',
        level: 3,
        requirement: 'Stay active for 7 days',
        unlocked: daysActive >= 7,
        progress: Math.min(daysActive, 7),
        maxProgress: 7,
        points: 175,
        color: '#8B5CF6'
      },
      {
        id: 'spender-1k',
        title: 'Thousand Tracker',
        description: 'Tracked ₹1,000 in expenses',
        icon: BanknotesIcon,
        iconSolid: BanknotesIconSolid,
        category: 'intermediate',
        level: 4,
        requirement: 'Track ₹1,000 total',
        unlocked: totalSpent >= 1000,
        progress: Math.min(totalSpent, 1000),
        maxProgress: 1000,
        points: 250,
        color: '#059669'
      },

      // Advanced Levels
      {
        id: 'expense-legend',
        title: 'Expense Legend',
        description: 'Tracked 100 expenses',
        icon: StarIcon,
        iconSolid: StarIconSolid,
        category: 'advanced',
        level: 5,
        requirement: 'Track 100 expenses',
        unlocked: totalExpenses >= 100,
        progress: Math.min(totalExpenses, 100),
        maxProgress: 100,
        points: 500,
        color: '#DC2626'
      },
      {
        id: 'month-master',
        title: 'Monthly Master',
        description: 'Active for 30 days',
        icon: ShieldCheckIcon,
        iconSolid: ShieldCheckIconSolid,
        category: 'advanced',
        level: 5,
        requirement: 'Stay active for 30 days',
        unlocked: daysActive >= 30,
        progress: Math.min(daysActive, 30),
        maxProgress: 30,
        points: 400,
        color: '#7C3AED'
      },
      {
        id: 'budget-guru',
        title: 'Budget Guru',
        description: 'Created 10 budgets',
        icon: RocketLaunchIcon,
        iconSolid: RocketLaunchIconSolid,
        category: 'advanced',
        level: 6,
        requirement: 'Create 10 budgets',
        unlocked: totalBudgets >= 10,
        progress: Math.min(totalBudgets, 10),
        maxProgress: 10,
        points: 600,
        color: '#DB2777'
      },

      // Expert Levels
      {
        id: 'financial-ninja',
        title: 'Financial Ninja',
        description: 'Tracked ₹10,000 in expenses',
        icon: TrophyIcon,
        iconSolid: TrophyIconSolid,
        category: 'expert',
        level: 7,
        requirement: 'Track ₹10,000 total',
        unlocked: totalSpent >= 10000,
        progress: Math.min(totalSpent, 10000),
        maxProgress: 10000,
        points: 1000,
        color: '#B91C1C'
      },
      {
        id: 'ultimate-tracker',
        title: 'Ultimate Tracker',
        description: 'Tracked 500 expenses',
        icon: StarIcon,
        iconSolid: StarIconSolid,
        category: 'expert',
        level: 8,
        requirement: 'Track 500 expenses',
        unlocked: totalExpenses >= 500,
        progress: Math.min(totalExpenses, 500),
        maxProgress: 500,
        points: 1500,
        color: '#7C2D12'
      }
    ];
  }, [expenses, budgets]);

  const categories = [
    { id: 'all', name: 'All Levels', icon: '🏆' },
    { id: 'beginner', name: 'Beginner', icon: '🌱' },
    { id: 'intermediate', name: 'Intermediate', icon: '⚡' },
    { id: 'advanced', name: 'Advanced', icon: '🔥' },
    { id: 'expert', name: 'Expert', icon: '👑' }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievementLevels 
    : achievementLevels.filter(achievement => achievement.category === selectedCategory);

  const totalPoints = achievementLevels
    .filter(achievement => achievement.unlocked)
    .reduce((sum, achievement) => sum + achievement.points, 0);

  const unlockedCount = achievementLevels.filter(achievement => achievement.unlocked).length;
  const totalCount = achievementLevels.length;

  const getProgressPercentage = (achievement) => {
    return (achievement.progress / achievement.maxProgress) * 100;
  };

  return (
    <div className="achievement-levels">
      <div style={{ background: 'red', color: 'white', padding: '10px', marginBottom: '10px' }}>
        🏆 ACHIEVEMENTS DEBUG: {expenses.length} expenses, {budgets.length} budgets
      </div>
      <div className="achievement-header">
        <div className="achievement-title">
          <TrophyIconSolid className="trophy-icon" />
          <h2>Achievement Levels</h2>
        </div>
        <div className="achievement-stats">
          <div className="stat">
            <span className="stat-value">{unlockedCount}/{totalCount}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalPoints}</span>
            <span className="stat-label">Points</span>
          </div>
        </div>
      </div>

      <div className="overall-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {Math.round((unlockedCount / totalCount) * 100)}% Complete
        </span>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      <div className="achievements-grid">
        {filteredAchievements.map(achievement => {
          const IconComponent = achievement.unlocked ? achievement.iconSolid : achievement.icon;
          const progressPercentage = getProgressPercentage(achievement);
          
          return (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              style={{ '--achievement-color': achievement.color }}
            >
              <div className="achievement-icon-container">
                <IconComponent className="achievement-icon" />
                {achievement.unlocked && (
                  <div className="unlock-badge">✓</div>
                )}
                <div className="level-badge">Lv.{achievement.level}</div>
              </div>
              
              <div className="achievement-info">
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
                
                <div className="achievement-progress">
                  <div className="progress-bar-small">
                    <div 
                      className="progress-fill-small" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="progress-text-small">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                
                <div className="achievement-meta">
                  <span className="requirement">{achievement.requirement}</span>
                  <span className="points">+{achievement.points} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {unlockedCount === totalCount && (
        <div className="completion-celebration">
          <div className="celebration-icon">🎉</div>
          <h3>Achievement Master!</h3>
          <p>Congratulations! You've unlocked all achievements. You're a true financial champion!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementLevels;