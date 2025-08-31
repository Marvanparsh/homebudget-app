import React, { useState, useEffect } from 'react';
import { calculateSpentByBudget } from '../helpers';

const GoalCelebration = ({ budgets }) => {
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    const celebratedGoals = JSON.parse(localStorage.getItem('celebratedGoals') || '[]');
    
    budgets?.forEach(budget => {
      if (!budget.amount || budget.amount <= 0) return;
      const spent = calculateSpentByBudget(budget.id);
      const percentage = spent / budget.amount;
      const goalKey = `${budget.id}-under-budget`;
      
      if (percentage < 0.8 && spent > 0 && !celebratedGoals.includes(goalKey)) {
        setCelebration({
          type: 'budget-success',
          title: '🎉 Great Job!',
          message: `You're staying under budget for ${budget.name}!`,
          budget: budget.name
        });
        
        celebratedGoals.push(goalKey);
        localStorage.setItem('celebratedGoals', JSON.stringify(celebratedGoals));
        
        setTimeout(() => setCelebration(null), 4000);
      }
    });
  }, [budgets]);

  if (!celebration) return null;

  return (
    <div className="goal-celebration">
      <div className="celebration-content">
        <h3>{celebration.title}</h3>
        <p>{celebration.message}</p>
        <button onClick={() => setCelebration(null)}>✨ Awesome!</button>
      </div>
      <div className="celebration-confetti">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="confetti-piece" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
          }} />
        ))}
      </div>
    </div>
  );
};

export default GoalCelebration;