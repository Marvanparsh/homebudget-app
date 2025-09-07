// Local backup/restore as fallback for Google Drive sync
import { fetchUserData, setUserData } from '../helpers';

// Export data as downloadable file
export const exportToFile = () => {
  try {
    const budgets = fetchUserData('budgets') || [];
    const expenses = fetchUserData('expenses') || [];
    
    const data = {
      budgets,
      expenses,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `homebudget-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data');
  }
};

// Import data from file
export const importFromFile = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.budgets) setUserData('budgets', data.budgets);
          if (data.expenses) setUserData('expenses', data.expenses);
          
          resolve(true);
        } catch (error) {
          reject(new Error('Invalid backup file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    
    input.click();
  });
};