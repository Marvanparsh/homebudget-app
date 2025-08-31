import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, LightBulbIcon, PlayIcon } from '@heroicons/react/24/outline';

const ImprovedOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Your Financial Journey! 🎯',
      description: 'Take control of your money with smart budgeting',
      action: 'Get Started',
      tips: ['Track every expense', 'Set realistic budgets', 'Review weekly']
    },
    {
      id: 'budget',
      title: 'Create Your First Budget 💰',
      description: 'Start with categories like Food, Transport, Entertainment',
      action: 'Create Budget',
      tips: ['Use the 50/30/20 rule', 'Start small', 'Be realistic']
    },
    {
      id: 'expense',
      title: 'Add Your First Expense ⚡',
      description: 'Quick entry with voice input and templates',
      action: 'Add Expense',
      tips: ['Use quick templates', 'Voice input available', 'Auto-categorization']
    }
  ];

  const completeStep = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  return (
    <div className="improved-onboarding">
      <div className="onboarding-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="onboarding-content">
        <div className="step-header">
          <h2>{steps[currentStep].title}</h2>
          <p>{steps[currentStep].description}</p>
        </div>

        <div className="tips-section">
          <h3><LightBulbIcon width={20} /> Pro Tips</h3>
          <ul>
            {steps[currentStep].tips.map((tip, index) => (
              <li key={index}>
                <CheckCircleIcon width={16} />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <button 
          className="btn btn--dark onboarding-action"
          onClick={() => completeStep(steps[currentStep].id)}
        >
          <PlayIcon width={16} />
          {steps[currentStep].action}
        </button>
      </div>
    </div>
  );
};

export default ImprovedOnboarding;