import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthGuard = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, loading, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    // Don't redirect while loading or not initialized
    if (loading || !initialized) return;

    // If not authenticated, redirect to appropriate login
    if (!isAuthenticated) {
      if (allowedRoles && allowedRoles.includes('admin')) {
        navigate('/admin/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }

    // If authenticated but role doesn't match, redirect to appropriate login
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      if (allowedRoles.includes('admin')) {
        navigate('/admin/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }
  }, [isAuthenticated, userRole, loading, initialized, allowedRoles, navigate]);

  // Show loading while checking authentication or not initialized
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authenticated or role doesn't match, don't render children
  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(userRole))) {
    return null;
  }

  // If authenticated and role matches, render children
  return children;
};

export default AuthGuard; 