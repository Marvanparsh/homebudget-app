import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

export const useUndo = () => {
  const addUndoAction = useCallback((action) => {
    
    const undoToast = toast.info(
      <div className="undo-toast">
        <span>{action.message}</span>
        <button 
          className="undo-btn"
          onClick={() => {
            action.undo();
            toast.dismiss(undoToast);
            toast.success('Action undone!');
          }}
        >
          Undo
        </button>
      </div>,
      { 
        autoClose: 5000,
        closeButton: false,
        className: 'undo-toast-container'
      }
    );
  }, []);

  return { addUndoAction };
};