import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { isTokenExpired, isTokenExpiringSoon } from '../utils/tokenUtils';

const useTokenExpiry = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Check token expiry
  const checkTokenExpiry = useCallback(() => {
    if (!token || !isAuthenticated) return;

    if (isTokenExpired(token)) {
      console.log('Token is expired');
      setIsExpired(true);
      setShowLogoutModal(true);
    } else if (isTokenExpiringSoon(token)) {
      console.log('Token is expiring soon');
      // You can show a warning here if needed
    }
  }, [token, isAuthenticated]);

  // Force logout when token expires
  const handleForceLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Force logout failed:', error);
    }
  }, [dispatch]);

  // Check token expiry on mount and when token changes
  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  // Set up periodic token expiry check (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkTokenExpiry();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenExpiry]);

  // Listen for token expired events from API
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired event received');
      setIsExpired(true);
      setShowLogoutModal(true);
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  // Handle logout modal close
  const handleCloseLogoutModal = useCallback(() => {
    setShowLogoutModal(false);
    setIsExpired(false);
  }, []);

  // Handle manual logout
  const handleManualLogout = useCallback(() => {
    setIsExpired(false);
    setShowLogoutModal(true);
  }, []);

  return {
    showLogoutModal,
    isExpired,
    handleCloseLogoutModal,
    handleManualLogout,
    handleForceLogout,
  };
};

export default useTokenExpiry; 