import { Navigate } from 'react-router-dom';
import { AffiliateAuthPage } from './components/affiliate-auth-page';
import { AffiliateDashboard } from './components/affiliate-dashboard';
import { AffiliateAdminPanel } from './components/affiliate-admin-panel';
import { useAffiliateAuth } from './hooks/use-affiliate-auth';
import { useAuthStore } from '@/stores/auth-store';

function ProtectedAffiliateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAffiliateAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/affiliate/auth" replace />;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.auth.user);
  if (!user) return <Navigate to="/dashboard/overview" replace />;
  if (user.role !== 100) return <Navigate to="/dashboard/overview" replace />;
  return <>{children}</>;
}

export const affiliateRoutes = [
  {
    path: '/affiliate/auth',
    element: <AffiliateAuthPage />
  },
  {
    path: '/affiliate/dashboard',
    element: (
      <ProtectedAffiliateRoute>
        <AffiliateDashboard />
      </ProtectedAffiliateRoute>
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
