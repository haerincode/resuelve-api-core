import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useEnhancedAffiliateDashboard() {
  return useQuery({
    queryKey: ['affiliate-dashboard-enhanced'],
    queryFn: async () => {
      const response = await fetch('/api/affiliate/dashboard/enhanced', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch enhanced dashboard');
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

export function useAffiliateWithdrawalHistory(page: number = 1) {
  return useQuery({
    queryKey: ['affiliate-withdrawals', page],
    queryFn: async () => {
      const response = await fetch(`/api/affiliate/withdrawal/history?page=${page}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch withdrawals');
      return response.json();
    }
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; wallet: string }) => {
      const response = await fetch('/api/affiliate/withdrawal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to request withdrawal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-dashboard-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['affiliate-withdrawals'] });
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
