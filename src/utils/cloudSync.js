// Cloud sync utility for budget data
import { fetchUserData, setUserData, fetchData } from '../helpers';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const syncToCloud = async () => {
  try {
    const currentUser = fetchData('currentUser');
    if (!currentUser?.email) return false;

    const budgets = fetchUserData('budgets') || [];
    const expenses = fetchUserData('expenses') || [];
    
    const response = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentUser.email,
        data: { budgets, expenses },
        timestamp: Date.now()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
};

export const syncFromCloud = async () => {
  try {
    const currentUser = fetchData('currentUser');
    if (!currentUser?.email) return false;

    const response = await fetch(`${API_BASE}/sync/${currentUser.email}`);
    if (!response.ok) return false;

    const { data } = await response.json();
    if (data.budgets) setUserData('budgets', data.budgets);
    if (data.expenses) setUserData('expenses', data.expenses);
    
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
};