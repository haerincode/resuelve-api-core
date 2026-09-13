import { Navigate } from 'react-router-dom';
import { AffiliateDashboard } from './components/affiliate-dashboard';
import { AffiliateAdminPanel } from './components/affiliate-admin-panel';
import { useAuthStore } from '@/stores/auth-store';

function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuthStore();
  if (!auth.user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuthStore();
  if (!auth.user) return <Navigate to="/dashboard/overview" replace />;
  if (auth.user.role !== 100) return <Navigate to="/dashboard/overview" replace />;
  return <>{children}</>;
}

export const affiliateRoutes = [
  {
    path: '/affiliate/dashboard',
    element: (
      <ProtectedUserRoute>
        <AffiliateDashboard />
      </ProtectedUserRoute>
    )
  },
  {
    path: '/affiliate/admin',
    element: (
      <ProtectedAdminRoute>
        <AffiliateAdminPanel />
      </ProtectedAdminRoute>
    )
  }
];
