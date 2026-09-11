export interface Affiliate {
  id: number;
  email: string;
  affiliate_code: string;
  usdt_wallet: string;
  full_name: string;
  telegram_handle: string;
  created_at: string;
}

export interface AffiliateCommission {
  id: number;
  affiliate_id: number;
  user_id: number;
  amount: number;
  topup_amount: number;
  paid: boolean;
  paid_at?: string;
  created_at: string;
}

export interface AffiliateDashboardData {
  affiliate_code: string;
  email: string;
  usdt_wallet: string;
  full_name: string;
  telegram_handle: string;
  referred_count: number;
  total_earned: number;
  total_pending: number;
  created_at: string;
}

export interface AffiliateCommissionsResponse {
  commissions: AffiliateCommission[];
  total: number;
  page: number;
  limit: number;
}

export interface AffiliateLoginRequest {
  email: string;
  password: string;
}

export interface AffiliateRegisterRequest {
  email: string;
  password: string;
  usdt_wallet: string;
  full_name?: string;
  telegram_handle?: string;
}

export interface AffiliateAuthResponse {
  token: string;
  affiliate_code: string;
  email: string;
}
