import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

// A simple Google icon SVG to use on the button
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#34A853" d="M6.306 14.691L11.72 18.238C13.099 15.022 16.216 12.8 20 12.8c1.556 0 2.999.44 4.252 1.199l5.657-5.657C26.96 6.053 23.636 4.938 20 4.938C14.331 4.938 9.3 7.404 6.306 11.691z" />
    <path fill="#FBBC05" d="M20 35.1c-3.138 0-5.917-1.326-7.901-3.419l-5.657 5.657C9.3 40.596 14.331 43.062 20 43.062c5.966 0 10.982-2.589 14.07-6.681l-5.657-5.657C25.46 33.791 22.869 35.1 20 35.1z" />
    <path fill="#EB4335" d="M43.611 20.083H24v8h11.303c-.792 2.228-2.206 4.14-4.088 5.571l5.657 5.657C39.429 36.313 42 31.331 42 25.9c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const Login: React.FC = () => {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signIn();
      navigate('/profile'); // Redirect to profile after successful sign-in
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  // If user is already logged in, redirect them
  if (user) {
    return <Navigate to="/profile" replace />;
  }

  // Show loading spinner while auth state is being checked
  if (loading) {
    // --- MODIFIED: Removed bg-gray-50 dark:bg-gray-950 ---
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  // --- MODIFIED: Removed bg-gray-50 dark:bg-gray-950 ---
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
            <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in with your Google account to create blogs, comment, and manage your profile.
          </p>
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;