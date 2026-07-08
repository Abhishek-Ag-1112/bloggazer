// src/components/NavigationLoader.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';

const NavigationLoader = () => {
  const location = useLocation();

  useEffect(() => {
    // Start progress on mount (initial page load)
    NProgress.start();

    // Complete progress after a short delay
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300); // 300ms delay

    return () => {
      // Clear timeout and complete progress on unmount or location change
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]); // Re-run on every path change

  return null; // This component doesn't render anything
};

export default NavigationLoader;