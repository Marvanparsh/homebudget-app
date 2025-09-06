import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, LightBulbIcon, PlayIcon, FlagIcon, CurrencyDollarIcon, BoltIcon } from '@heroicons/react/24/outline';

const ImprovedOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Smart Budgeting!',
      icon: <FlagIcon width={24} />,
      description: 'Transform your financial habits with intelligent tracking and insights',
      action: 'Start Journey',
      tips: ['See where every dollar goes', 'Get AI-powered insights', 'Build lasting money habits']
    },
    {
      id: 'budget',
      title: 'Set Up Your First Budget',
      icon: <CurrencyDollarIcon width={24} />,
      description: 'Choose from templates or create custom categories that match your lifestyle',
      action: 'Create Budget',
      tips: ['Try the 50/30/20 rule (needs/wants/savings)', 'Start with your biggest expense category', 'You can always adjust amounts later']
    },
    {
      id: 'expense',
      title: 'Track Your First Expense',
      icon: <BoltIcon width={24} />,
      description: 'Experience smart suggestions, quick templates, and instant categorization',
      action: 'Add Expense',
      tips: ['Use voice input for hands-free entry', 'Smart suggestions learn your patterns', 'Photos automatically extract receipt data']
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
          <div className="step-title">
            {steps[currentStep].icon}
            <h2>{steps[currentStep].title}</h2>
          </div>
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