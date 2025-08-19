import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = lazy(() => import('../pages/admin-panel/AdminDashboard'));
const JobOrders = lazy(() => import('../pages/admin-panel/JobOrders'));
const Materials = lazy(() => import('../pages/admin-panel/Materials'));
const Inventory = lazy(() => import('../pages/admin-panel/Inventory'));
const Delivery = lazy(() => import('../pages/admin-panel/Delivery'));
const Sales = lazy(() => import('../pages/admin-panel/Sales'));
const DailyReport = lazy(() => import('../pages/admin-panel/DailyReport'));
const Purchase = lazy(() => import('../pages/admin-panel/Purchase'));
const ReceiptPage = lazy(() => import('../pages/admin-panel/Receipt'));
const Customers = lazy(() => import('../pages/admin-panel/Customers'));
const Services = lazy(() => import('../pages/admin-panel/Services'));
const Measurements = lazy(() => import('../pages/admin-panel/Measurements'));
const Settings = lazy(() => import('../pages/admin-panel/Settings'));
// const Users = lazy(() => import('../pages/admin-panel/Users'));

const adminRoutes = [
  // Default route - redirect to dashboard
  {
    path: '',
    element: <Navigate to="dashboard" replace />,
  },
  
  // {
  //   path: 'users',
  //   element: <Users />,
  // },

  {
    path: 'dashboard',
    element: <AdminDashboard />,
  },
  {
    path: 'job-orders',
    element: <JobOrders />,
  },
  {
    path: 'measurements',
    element: <Measurements />,
  },
  {
    path: 'materials',
    element: <Materials />,
  },
  {
    path: 'inventory',
    element: <Inventory />,
  },
  {
    path: 'delivery',
    element: <Delivery />,
  },
  {
    path: 'sales',
    element: <Sales />,
  },
  {
    path: 'daily-report',
    element: <DailyReport />,
  },
  {
    path: 'purchase',
    element: <Purchase />,
  },
  {
    path: 'receipt',
    element: <ReceiptPage />,
  },
  {
    path: 'customers',
    element: <Customers />,
  },
  {
    path: 'services',
    element: <Services />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
];

export default adminRoutes; 