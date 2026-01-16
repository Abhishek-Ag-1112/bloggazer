import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Page Not Found
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Oops! The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Home className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
