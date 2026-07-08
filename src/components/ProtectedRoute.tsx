import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading state while checking authentication
    // --- MODIFIED: Removed min-h-screen, added padding ---
    return (
      <div className="py-24 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child component (e.g., Profile or CreateBlog)
  return <Outlet />;
};

export default ProtectedRoute;