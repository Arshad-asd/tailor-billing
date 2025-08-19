import { Outlet, useLocation } from 'react-router-dom';
import CustomerLayout from './CustomerLayout';
import LogoutModalWrapper from '../components/modals/LogoutModalWrapper';
import useTokenExpiry from '../hooks/useTokenExpiry';

const Layout = () => {
  const location = useLocation();
  const path = location.pathname;
  const { showLogoutModal, isExpired, handleCloseLogoutModal } = useTokenExpiry();

  // Determine which layout to use based on the current path
  const getLayout = () => {
    console.log('Layout path:', path);
    
    // For authentication pages, use no layout (just render the component directly)
    if (path.startsWith('/admin/login') || 
        path === '/login/admin' ||
        path === '/login' ||
        path === '/login/customer' ||
        path === '/signup') {
      console.log('Using no layout for auth page');
      return <Outlet />;
    }
    
    // For admin routes, use no layout (AdminPanel has its own AdminLayout)
    if (path.startsWith('/admin')) {
      console.log('Using no layout for admin route');
      return <Outlet />;
    }
    
    // Customer routes
    console.log('Using CustomerLayout for customer route');
    return <CustomerLayout><Outlet /></CustomerLayout>;
  };

  return (
    <>
      {getLayout()}
      <LogoutModalWrapper 
        isOpen={showLogoutModal}
        onClose={handleCloseLogoutModal}
        isExpired={isExpired}
      />
    </>
  );
};

export default Layout;
