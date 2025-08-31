import React, { useMemo } from 'react';
import { calculateSpentByBudget } from '../helpers';

const BudgetHealthScore = ({ budgets, expenses }) => {
  const healthData = useMemo(() => {
    if (!budgets?.length) return { score: 0, grade: 'N/A', insights: [] };
    
    let totalScore = 0;
    const insights = [];
    
    budgets.forEach(budget => {
      const spent = calculateSpentByBudget(budget.id);
      const percentage = spent / budget.amount;
      
      let budgetScore = 100;
      
      if (percentage > 1) {
        budgetScore = Math.max(0, 100 - (percentage - 1) * 200);
        insights.push(`⚠️ ${budget.name} is over budget by ${((percentage - 1) * 100).toFixed(1)}%`);
      } else if (percentage > 0.9) {
        budgetScore = 70;
        insights.push(`🟡 ${budget.name} is at ${(percentage * 100).toFixed(1)}% of budget`);
      } else if (percentage > 0.8) {
        budgetScore = 85;
      } else {
        budgetScore = 100;
        if (percentage < 0.5) {
          insights.push(`✅ ${budget.name} has great spending control`);
        }
      }
      
      totalScore += budgetScore;
    });
    
    const avgScore = totalScore / budgets.length;
    
    let grade = 'F';
    if (avgScore >= 90) grade = 'A+';
    else if (avgScore >= 85) grade = 'A';
    else if (avgScore >= 80) grade = 'B+';
    else if (avgScore >= 75) grade = 'B';
    else if (avgScore >= 70) grade = 'C+';
    else if (avgScore >= 65) grade = 'C';
    else if (avgScore >= 60) grade = 'D';
    
    // Add general insights
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const overallPercentage = totalSpent / totalBudget;
    
    if (overallPercentage < 0.7) {
      insights.push('🎉 Excellent overall budget management!');
    } else if (overallPercentage > 1) {
      insights.push('🚨 Overall spending exceeds total budget');
    }
    
    return { score: Math.round(avgScore), grade, insights: insights.slice(0, 3) };
  }, [budgets, expenses]);
  
  const getScoreColor = (score) => {
    if (score >= 85) return 'hsl(120, 70%, 50%)'; // Green
    if (score >= 70) return 'hsl(60, 70%, 50%)';  // Yellow
    if (score >= 50) return 'hsl(30, 70%, 50%)';  // Orange
    return 'hsl(0, 70%, 50%)'; // Red
  };
  
  const getGradeEmoji = (grade) => {
    switch (grade) {
      case 'A+': return '🏆';
      case 'A': return '⭐';
      case 'B+': case 'B': return '👍';
      case 'C+': case 'C': return '👌';
      case 'D': return '⚠️';
      default: return '🚨';
    }
  };
  
  return (
    <div className="budget-health-score">
      <h3>💊 Budget Health Score</h3>
      
      <div className="health-score-display">
        <div className="score-circle">
          <svg viewBox="0 0 100 100" className="score-ring">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--light))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={getScoreColor(healthData.score)}
              strokeWidth="8"
              strokeDasharray={`${(healthData.score / 100) * 251.2} 251.2`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              className="score-progress"
            />
          </svg>
          <div className="score-content">
            <div className="score-number">{healthData.score}</div>
            <div className="score-grade">
              {getGradeEmoji(healthData.grade)} {healthData.grade}
            </div>
          </div>
        </div>
        
        <div className="health-insights">
          <h4>💡 Insights</h4>
          {healthData.insights.length > 0 ? (
            <ul className="insights-list">
              {healthData.insights.map((insight, index) => (
                <li key={index} className="insight-item">{insight}</li>
              ))}
            </ul>
          ) : (
            <p className="no-insights">Keep tracking to get personalized insights!</p>
          )}
        </div>
      </div>
      
      <div className="health-tips">
        <h4>🎯 Quick Tips</h4>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">📊</span>
            <span>Review spending weekly</span>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🎯</span>
            <span>Set realistic budgets</span>
          </div>
          <div className="tip-card">
            <span className="tip-icon">💰</span>
            <span>Track every expense</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetHealthScore;