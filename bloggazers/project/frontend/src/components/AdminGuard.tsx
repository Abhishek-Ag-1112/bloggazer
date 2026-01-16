// src/components/AdminGuard.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavigationLoader from './NavigationLoader';

const AdminGuard: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <NavigationLoader />; // Or a spinner
    }

    if (!user || user.role !== 'admin') {
        console.log("AdminGuard Blocked:", { user, role: user?.role });
        // Redirect non-admins to home or a "not authorized" page
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="mb-2">You do not have permission to view this page.</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-left text-sm font-mono mb-6">
                    <p>User ID: {user?.id || 'Not Logged In'}</p>
                    <p>Current Role: {user?.role || 'undefined'}</p>
                    <p>Required Role: admin</p>
                </div>
                <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Go Back Home
                </a>
            </div>
        );
    }

    return <Outlet />;
};

export default AdminGuard;
