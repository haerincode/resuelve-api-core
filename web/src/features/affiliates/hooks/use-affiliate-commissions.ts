import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAffiliateAuth } from './use-affiliate-auth';
import type { AffiliateCommissionsResponse, AffiliateCommission } from '../types';

export function useAffiliateCommissions(page: number = 1, limit: number = 50) {
  const { getToken } = useAffiliateAuth();

  return useQuery({
    queryKey: ['affiliate-commissions', page, limit],
    queryFn: async (): Promise<AffiliateCommissionsResponse> => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/affiliate/commissions?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch commissions');
      return response.json();
    },
    enabled: !!getToken()
  });
}

export function useUpdateWallet() {
  const { getToken } = useAffiliateAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (usdtWallet: string) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/affiliate/wallet', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usdt_wallet: usdtWallet })
      });
      if (!response.ok) throw new Error('Failed to update wallet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-dashboard'] });
    }
  });
}
