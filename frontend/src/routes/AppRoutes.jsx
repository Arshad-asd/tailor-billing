import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '../layouts/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import customerRoutes from './customerRoutes';
import adminRoutes from './adminRoutes';

// Import authentication pages
import LoginSelection from '../pages/auth/LoginSelection';
import CustomerLogin from '../pages/auth/CustomerLogin';
import AdminLogin from '../pages/auth/AdminLogin';
import TailorLogin from '../pages/auth/TailorLogin';
import RegisterForm from '../components/auth/RegisterForm';

// Lazy load the main viewport components
const AdminPanel = lazy(() => import('../pages/admin-panel/AdminPanel'));

// Route configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Customer Website Routes (Public)
      ...customerRoutes,

      // Authentication Routes (Public)
      {
        path: 'login',
        element: <LoginSelection />,
      },
      {
        path: 'login/customer',
        element: <CustomerLogin />,
      },
      {
        path: 'login/admin',
        element: <AdminLogin />,
      },
      {
        path: 'login/tailor',
        element: <TailorLogin />,
      },
      {
        path: 'signup',
        element: <RegisterForm />,
      },

      // Admin Login Route (Public)
      {
        path: 'admin/login',
        element: <AdminLogin />,
      },

      // Admin Panel Routes (Protected by AuthGuard in AdminPanel)
      {
        path: 'admin',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AdminPanel />
          </Suspense>
        ),
        children: adminRoutes,
      },

      // Fallback route
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

