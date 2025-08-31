import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchData } from '../helpers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = fetchData('currentUser');
    setUser(currentUser);
    setLoading(false);

    // Listen for storage changes (when auth actions update localStorage)
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(newUser);
      }
    };

    // Listen for custom events (for same-tab updates)
    const handleAuthChange = (e) => {
      const newUser = fetchData('currentUser');
      setUser(newUser);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('authChange'));
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};