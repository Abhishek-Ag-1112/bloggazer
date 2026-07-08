import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const AdminRoute: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      toast.error('Unauthorized. Admin access only.');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading auth state...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
