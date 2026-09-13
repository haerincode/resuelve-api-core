import { useQuery } from '@tanstack/react-query';
import type { AffiliateDashboardData, AffiliateCommission } from '../types';

export function useAffiliateDashboard() {
  return useQuery({
    queryKey: ['affiliate-dashboard'],
    queryFn: async (): Promise<AffiliateDashboardData> => {
      const response = await fetch('/api/affiliate/dashboard', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/';
        }
        throw new Error('Failed to fetch dashboard');
      }
      return response.json();
    }
  });
}

export function useAffiliateCommissions(page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: ['affiliate-commissions', page],
    queryFn: async () => {
      const response = await fetch(`/api/affiliate/commissions?page=${page}&limit=${limit}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch commissions');
      return response.json();
    }
  });
}

export function useAffiliateWallet() {
  return useQuery({
    queryKey: ['affiliate-wallet'],
    queryFn: async () => {
      const response = await fetch('/api/affiliate/wallet', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch wallet');
      return response.json();
    }
  });
}
