import { useQuery } from '@tanstack/react-query';

interface PendingStats {
  count: number;
  totalAmount: number;
}

export function usePendingCommissionsStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['pending-commissions-stats'],
    queryFn: async (): Promise<PendingStats> => {
      const response = await fetch('/api/affiliate/admin/commissions/pending', {
        credentials: 'include'
      });
      if (!response.ok) return { count: 0, totalAmount: 0 };
      const data = await response.json();
      return {
        count: data.commissions?.length || 0,
        totalAmount: data.commissions?.reduce((sum: number, c: any) => sum + c.amount, 0) || 0
      };
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 60000,
    gcTime: 5 * 60 * 1000
  });

  return { data: data || { count: 0, totalAmount: 0 }, isLoading };
}
