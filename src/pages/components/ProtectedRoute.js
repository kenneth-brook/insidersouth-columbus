import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';

const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{
          from: location.pathname,
          returnState: location.state || null,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
