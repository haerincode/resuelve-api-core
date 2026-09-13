import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AffiliateLoginRequest,
  AffiliateRegisterRequest,
  AffiliateAuthResponse
} from '../types';

const AFFILIATE_TOKEN_KEY = 'affiliate_token';

export function useAffiliateAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async (data: AffiliateLoginRequest): Promise<AffiliateAuthResponse> => {
      const response = await fetch('/api/affiliate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem(AFFILIATE_TOKEN_KEY, data.token);
      queryClient.invalidateQueries({ queryKey: ['affiliate-dashboard'] });
    }
  });

  const register = useMutation({
    mutationFn: async (data: AffiliateRegisterRequest): Promise<AffiliateAuthResponse> => {
      const response = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem(AFFILIATE_TOKEN_KEY, data.token);
      queryClient.invalidateQueries({ queryKey: ['affiliate-dashboard'] });
    }
  });

  const logout = () => {
    localStorage.removeItem(AFFILIATE_TOKEN_KEY);
    queryClient.clear();
  };

  const getToken = () => localStorage.getItem(AFFILIATE_TOKEN_KEY);

  const isAuthenticated = !!getToken();

  return {
    login,
    register,
    logout,
    getToken,
    isAuthenticated
  };
}
