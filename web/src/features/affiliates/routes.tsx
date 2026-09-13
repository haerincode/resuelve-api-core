import { Navigate } from 'react-router-dom';
import { AffiliateAuthPage } from './components/affiliate-auth-page';
import { AffiliateDashboard } from './components/affiliate-dashboard';
import { AffiliateAdminPanel } from './components/affiliate-admin-panel';
import { useAffiliateAuth } from './hooks/use-affiliate-auth';
import { useAuthStore } from '@/stores/auth-store';
import { common } from '@/lib/roles';

// Protected route wrapper for authenticated affiliates
function ProtectedAffiliateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAffiliateAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/affiliate/auth" replace />;
}

// Protected route wrapper for admin users
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.auth.user);
  const isAdmin = user?.role === 100; // RoleRootUser
  return isAdmin ? <>{children}</> : <Navigate to="/dashboard/overview" replace />;
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
