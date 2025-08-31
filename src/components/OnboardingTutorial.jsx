import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const OnboardingTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    return !localStorage.getItem('hasSeenTutorial');
  });

  const steps = [
    {
      title: "Welcome to Budget Tracker! 👋",
      content: "Let's take a quick tour to help you get started with managing your finances effectively.",
      target: null,
      position: "center"
    },
    {
      title: "Create Your First Budget 💰",
      content: "Start by creating budget categories like Food, Transport, or Entertainment. Set realistic amounts for each category.",
      target: "[data-tutorial='budget-form']",
      position: "right"
    },
    {
      title: "Add Expenses Quickly ⚡",
      content: "Add your expenses here. You can use voice input, auto-complete, and quick amount buttons for faster entry.",
      target: "[data-tutorial='expense-form']",
      position: "left"
    },
    {
      title: "Quick Templates 🍕",
      content: "Click these buttons for instant expense entry - Coffee, Lunch, Gas, or Groceries with preset amounts.",
      target: ".quick-templates",
      position: "top"
    },
    {
      title: "Track Your Progress 📊",
      content: "View beautiful analytics showing your spending patterns, trends, and category breakdowns.",
      target: ".dashboard-grid",
      position: "top"
    },
    {
      title: "Achievements & Goals 🏆",
      content: "Earn achievements for good spending habits and get celebrated when you stay under budget!",
      target: ".achievements-overlay",
      position: "left"
    },
    {
      title: "You're All Set! 🚀",
      content: "You're ready to take control of your finances. Remember: small steps lead to big savings!",
      target: null,
      position: "center"
    }
  ];

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (isVisible && currentStepData?.target) {
      setTimeout(() => {
        const targetElement = document.querySelector(currentStepData.target);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [currentStep, isVisible, currentStepData]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const skipTutorial = () => {
    completeTutorial();
  };

  if (!isVisible) return null;

  const targetElement = currentStepData?.target ? document.querySelector(currentStepData.target) : null;

  return (
    <>
      <div className="onboarding-overlay" />
      
      {targetElement && (
        <div 
          className="onboarding-highlight"
          style={{
            top: Math.max(targetElement.offsetTop - 10, 0),
            left: Math.max(targetElement.offsetLeft - 10, 0),
            width: Math.min(targetElement.offsetWidth + 20, window.innerWidth - targetElement.offsetLeft + 10),
            height: Math.min(targetElement.offsetHeight + 20, window.innerHeight - targetElement.offsetTop + 10),
          }}
        />
      )}
      
      <div 
        className={`onboarding-tooltip ${currentStepData.position}`}
        style={targetElement ? {
          top: currentStepData.position === 'bottom' ? 
               Math.min(targetElement.offsetTop + targetElement.offsetHeight + 20, window.innerHeight - 250) :
               currentStepData.position === 'top' ? 
               Math.max(targetElement.offsetTop - 200, 20) :
               Math.max(Math.min(targetElement.offsetTop - 100, window.innerHeight - 250), 20),
          left: currentStepData.position === 'right' ? 
                Math.min(targetElement.offsetLeft + targetElement.offsetWidth + 20, window.innerWidth - 350) :
                currentStepData.position === 'left' ? 
                Math.max(targetElement.offsetLeft - 350, 20) :
                Math.max(Math.min(targetElement.offsetLeft - 150, window.innerWidth - 350), 20)
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="onboarding-content">
          <div className="onboarding-header">
            <h3>{currentStepData.title}</h3>
            <button className="skip-btn" onClick={skipTutorial}>
              <XMarkIcon width={16} />
            </button>
          </div>
          
          <p>{currentStepData.content}</p>
          
          <div className="onboarding-progress">
            <div className="progress-dots">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`progress-dot ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}
                />
              ))}
            </div>
            
            <div className="onboarding-actions">
              {currentStep > 0 && (
                <button className="btn btn--outline" onClick={prevStep}>
                  <ChevronLeftIcon width={16} />
                  Back
                </button>
              )}
              
              <button className="btn btn--dark" onClick={nextStep}>
                {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRightIcon width={16} />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="onboarding-arrow" />
      </div>
    </>
  );
};

export default OnboardingTutorial;