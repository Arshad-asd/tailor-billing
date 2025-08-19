import { Outlet } from 'react-router-dom';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminLayout from '../../layouts/AdminLayout';

const AdminPanel = () => {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AuthGuard>
  );
};

export default AdminPanel; 