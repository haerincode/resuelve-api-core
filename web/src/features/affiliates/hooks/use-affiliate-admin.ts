import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Affiliate, AffiliateCommission } from '../types';

interface AllAffiliatesResponse {
  affiliates: Affiliate[];
}

interface PendingCommissionsResponse {
  commissions: (AffiliateCommission & { Affiliate: Affiliate })[];
}

export function useAllAffiliates() {
  return useQuery({
    queryKey: ['all-affiliates'],
    queryFn: async (): Promise<AllAffiliatesResponse> => {
      const response = await fetch('/api/affiliate/admin/affiliates', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch affiliates');
      return response.json();
    }
  });
}

export function usePendingCommissions() {
  return useQuery({
    queryKey: ['pending-commissions'],
    queryFn: async (): Promise<PendingCommissionsResponse> => {
      const response = await fetch('/api/affiliate/admin/commissions/pending', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pending commissions');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}

export function useMarkCommissionsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionIds: number[]) => {
      const response = await fetch('/api/affiliate/admin/commissions/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commission_ids: commissionIds })
      });
      if (!response.ok) throw new Error('Failed to mark commissions as paid');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-commissions'] });
      queryClient.invalidateQueries({ queryKey: ['all-affiliates'] });
    }
  });
}

export function useExportPendingCommissions() {
  return () => {
    window.open('/api/affiliate/admin/export/pending', '_blank');
  };
}
