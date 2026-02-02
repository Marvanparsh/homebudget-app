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
  
  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  return { notifications, addNotification, removeNotification };
};

// Drag and drop hook with 5-second hold requirement
export const useDragAndDrop = (items, onReorder) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [holdStartTime, setHoldStartTime] = useState(null);

  const startHoldTimer = useCallback((e, item, index) => {
    const timer = setTimeout(() => {
      setIsDragEnabled(true);
      e.target.style.cursor = 'grabbing';
      e.target.style.transform = 'scale(1.02)';
    }, 3000);
    
    setHoldTimer(timer);
    setHoldStartTime(Date.now());
    e.target.style.cursor = 'grab';
  }, []);

  const clearHoldTimer = useCallback((e) => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
    setHoldStartTime(null);
    setIsDragEnabled(false);
    if (e?.target) {
      e.target.style.cursor = 'default';
      e.target.style.transform = 'scale(1)';
    }
  }, [holdTimer]);

  const handleDragStart = useCallback((e, item, index) => {
    if (!isDragEnabled) {
      e.preventDefault();
      return;
    }
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  }, [isDragEnabled]);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverIndex(null);
    clearHoldTimer(e);
  }, [clearHoldTimer]);

  const handleDragOver = useCallback((e, index) => {
    if (!isDragEnabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, [isDragEnabled]);

  const handleDrop = useCallback((e, dropIndex) => {
    if (!isDragEnabled) return;
    e.preventDefault();
    if (!draggedItem || draggedItem.index === dropIndex) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedItem.index, 1);
    newItems.splice(dropIndex, 0, removed);
    
    onReorder(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  }, [draggedItem, items, onReorder, isDragEnabled]);

  const handleMouseDown = useCallback((e, item, index) => {
    startHoldTimer(e, item, index);
  }, [startHoldTimer]);

  const handleMouseUp = useCallback((e) => {
    const holdDuration = holdStartTime ? Date.now() - holdStartTime : 0;
    if (holdDuration < 3000) {
      clearHoldTimer(e);
    }
  }, [holdStartTime, clearHoldTimer]);

  const handleMouseLeave = useCallback((e) => {
    clearHoldTimer(e);
  }, [clearHoldTimer]);

  const handleTouchStart = useCallback((e, item, index) => {
    startHoldTimer(e, item, index);
  }, [startHoldTimer]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragEnabled) return;
    e.preventDefault();
    const touch = e.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elementBelow?.closest('[data-drop-index]');
    if (dropTarget) {
      const index = parseInt(dropTarget.dataset.dropIndex);
      setDragOverIndex(index);
    }
  }, [isDragEnabled]);

  const handleTouchEnd = useCallback((e) => {
    const holdDuration = holdStartTime ? Date.now() - holdStartTime : 0;
    
    if (holdDuration >= 3000 && isDragEnabled) {
      if (dragOverIndex !== null && draggedItem && draggedItem.index !== dragOverIndex) {
        const newItems = [...items];
        const [removed] = newItems.splice(draggedItem.index, 1);
        newItems.splice(dragOverIndex, 0, removed);
        onReorder(newItems);
      }
      setDraggedItem(null);
      setDragOverIndex(null);
    }
    
    clearHoldTimer(e);
  }, [draggedItem, dragOverIndex, items, onReorder, isDragEnabled, holdStartTime, clearHoldTimer]);

  return {
    draggedItem,
    dragOverIndex,
    isDragEnabled,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
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