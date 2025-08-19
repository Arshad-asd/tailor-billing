import HomePage from '../pages/customer-website/HomePage';
import ServicesPage from '../pages/customer-website/ServicesPage';
import PricingPage from '../pages/customer-website/PricingPage';
import ContactPage from '../pages/customer-website/ContactPage';
import AboutPage from '../pages/customer-website/AboutPage';
import CustomerDashboard from '../pages/customer-website/CustomerDashboard';
import ProfilePage from '../pages/customer-website/ProfilePage';

const customerRoutes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/services',
    element: <ServicesPage />,
  },
  {
    path: '/pricing',
    element: <PricingPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/customer/dashboard',
    element: <CustomerDashboard />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
];

export default customerRoutes; 