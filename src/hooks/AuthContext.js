import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = Cookies.get('token');
    const storedUserId = Cookies.get('userId'); // Retrieve userId from cookies

    if (token && storedUserId) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (id, token) => {
    setIsAuthenticated(true);
    setUserId(id);
    Cookies.set('token', token, { path: '/', expires: 1 }); // Expires in 1 day
    Cookies.set('userId', id, { path: '/', expires: 1 }); // Store userId in cookies
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    Cookies.remove('token');
    Cookies.remove('userId'); // Remove userId from cookies
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
