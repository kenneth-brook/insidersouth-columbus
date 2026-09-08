import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Demo sessions intentionally do not survive a page refresh.
    localStorage.removeItem('selectedItineraryId');
  }, []);

  const login = (id = 'demo-user') => {
    setIsAuthenticated(true);
    setUserId(id);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    localStorage.removeItem('selectedItineraryId');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout, isDemoMode: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
