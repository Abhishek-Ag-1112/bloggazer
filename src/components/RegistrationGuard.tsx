// src/components/RegistrationGuard.tsx
import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from './PageLoader';

const RegistrationGuard: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  // If user is logged in, has a pending status, and is NOT on the finish-profile page
  if (user && user.status === 'pending' && location.pathname !== '/finish-profile') {
    // Redirect them to complete their profile
    return <Navigate to="/finish-profile" replace />;
  }

  // If user is logged in, has an active status, and IS on the finish-profile page
  if (user && user.status === 'active' && location.pathname === '/finish-profile') {
    // Redirect them away, they've already registered
    return <Navigate to="/profile" replace />;
  }

  // Otherwise, render the intended route
  return <Outlet />;
};

export default RegistrationGuard;