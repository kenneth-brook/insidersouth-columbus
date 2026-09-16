import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();
const DEMO_AUTH_COOKIE = 'columbusDemoAuth';
const DEMO_USER_COOKIE = 'columbusDemoUser';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const authenticated = Cookies.get(DEMO_AUTH_COOKIE) === 'true';
    const storedUserId = Cookies.get(DEMO_USER_COOKIE);

    if (authenticated && storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
    }
  }, []);

  const login = (id = 'demo-user') => {
    setIsAuthenticated(true);
    setUserId(id);
    Cookies.set(DEMO_AUTH_COOKIE, 'true', { path: '/', expires: 1, sameSite: 'Lax' });
    Cookies.set(DEMO_USER_COOKIE, id, { path: '/', expires: 1, sameSite: 'Lax' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    Cookies.remove(DEMO_AUTH_COOKIE, { path: '/' });
    Cookies.remove(DEMO_USER_COOKIE, { path: '/' });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout, isDemoMode: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
