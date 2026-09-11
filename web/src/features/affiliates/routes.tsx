import { Navigate } from 'react-router-dom';
import { AffiliateAuthPage } from './components/affiliate-auth-page';
import { AffiliateDashboard } from './components/affiliate-dashboard';
import { AffiliateAdminPanel } from './components/affiliate-admin-panel';
import { useAffiliateAuth } from './hooks/use-affiliate-auth';

// Protected route wrapper for authenticated affiliates
function ProtectedAffiliateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAffiliateAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/affiliate/auth" replace />;
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
      <ProtectedAffiliateRoute>
        <AffiliateAdminPanel />
      </ProtectedAffiliateRoute>
    )
  }
];
