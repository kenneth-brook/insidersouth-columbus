import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';

const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
