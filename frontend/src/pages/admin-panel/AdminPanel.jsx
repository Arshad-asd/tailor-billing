import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminLayout from '../../layouts/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPanel = () => {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminLayout>
        <Suspense 
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </AdminLayout>
    </AuthGuard>
  );
};

export default AdminPanel; 