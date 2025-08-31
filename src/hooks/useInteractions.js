import React, { useState, useEffect, useCallback } from 'react';

// Auto-complete hook
export const useAutoComplete = (items, key = 'name') => {
  const [suggestions, setSuggestions] = useState([]);
  
  const getSuggestions = useCallback((input) => {
    if (!input) return [];
    return items
      .filter(item => item[key].toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5);
  }, [items, key]);
  
  return { suggestions, getSuggestions };
};

// Voice input hook
export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };
    
    recognition.start();
  }, []);
  
  return { isListening, transcript, startListening, setTranscript };
};

// Swipe gesture hook
export const useSwipeGesture = (onSwipeLeft, onSwipeRight) => {
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const handleTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };
  
  const handleTouchEnd = (e) => {
    if (!isSwiping || !e.changedTouches || !e.changedTouches[0]) return;
    
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
    
    setIsSwiping(false);
  };
  
  return { handleTouchStart, handleTouchEnd };
};

// Notification hook
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);
  
  return { notifications, addNotification };
};

// Achievement system hook
export const useAchievements = () => {
  const [achievements, setAchievements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('achievements') || '[]');
    } catch {
      return [];
    }
  });
  
  const checkAchievements = useCallback((expenses, budgets) => {
    const existingIds = achievements.map(a => a.id);
    const newAchievements = [];
    
    // First expense achievement
    if (expenses.length === 1 && !existingIds.includes('first-expense')) {
      newAchievements.push({ id: 'first-expense', title: 'First Step!', description: 'Added your first expense' });
    }
    
    // Budget saver achievement
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    if (totalBudget > 0 && (totalSpent / totalBudget) < 0.8 && !existingIds.includes('budget-saver')) {
      newAchievements.push({ id: 'budget-saver', title: 'Budget Saver!', description: 'Stayed under 80% of budget' });
    }
    
    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements];
      setAchievements(updatedAchievements);
      localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
    }
  }, [achievements]);
  
  return { achievements, checkAchievements };
};