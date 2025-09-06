import React, { useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../hooks/useInteractions';
import { calculateSpentByBudget } from '../helpers';

const NotificationSystem = ({ budgets, expenses }) => {
  const { notifications, addNotification, removeNotification } = useNotification();
  
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 4000);
      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);
  
  useEffect(() => {
    const shownNotifications = JSON.parse(localStorage.getItem('shownNotifications') || '[]');
    
    budgets?.forEach(budget => {
      const spent = calculateSpentByBudget(budget.id);
      const percentage = spent / budget.amount;
      const notificationKey = `${budget.id}-${Math.floor(percentage * 10)}`;
      
      if (!shownNotifications.includes(notificationKey)) {
        if (percentage >= 0.9) {
          addNotification(
            `⚠️ ${budget.name} budget is 90% spent!`,
            'warning',
            5000
          );
          shownNotifications.push(notificationKey);
        } else if (percentage >= 0.8) {
          addNotification(
            `📊 ${budget.name} budget is 80% spent`,
            'info',
            4000
          );
          shownNotifications.push(notificationKey);
        }
      }
    });
    
    localStorage.setItem('shownNotifications', JSON.stringify(shownNotifications));
  }, [budgets, expenses, addNotification]);
  
  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <ExclamationTriangleIcon width={20} />;
      case 'success': return <CheckCircleIcon width={20} />;
      default: return <InformationCircleIcon width={20} />;
    }
  };
  
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification ${notification.type}`}
        >
          {getIcon(notification.type)}
          <span>{notification.message}</span>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;