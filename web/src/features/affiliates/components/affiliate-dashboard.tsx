import { useState } from 'react';
import { useEnhancedAffiliateDashboard, useAffiliateCommissions, useAffiliateWithdrawalHistory, useRequestWithdrawal } from '../hooks/use-affiliate-commissions';
import { Copy, DollarSign, Users, TrendingUp, Zap, Lock } from 'lucide-react';

declare const QRCode: any;

export function AffiliateDashboard() {
  const { data: dashboard, isLoading: dashboardLoading } = useEnhancedAffiliateDashboard();
  const [page, setPage] = useState(1);
  const { data: commissionsData } = useAffiliateCommissions(page, 20);
  const { mutate: requestWithdrawal, isPending: isWithdrawing } = useRequestWithdrawal();
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load dashboard</div>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/register?ref=${dashboard.affiliate_code}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdrawal = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < dashboard.minimum_withdrawal) {
      alert(`Minimum withdrawal: ${dashboard.minimum_withdrawal}`);
      return;
    }
    requestWithdrawal({
      amount: parseFloat(withdrawAmount),
      wallet: dashboard.usdt_wallet
    });
    setWithdrawAmount('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Affiliate Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Earn commissions on every referral's recharge</p>
      </div>

      {dashboard.status !== 'active' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <Lock className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-200">Account Status: {dashboard.status}</p>
            <p className="text-sm text-red-700 dark:text-red-300">Fraud Score: {dashboard.fraud_score}/100</p>
          </div>
        </div>
      )}

      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
              <input type="text" value={referralUrl} readOnly className="flex-1 bg-transparent outline-none text-sm" />
              <button onClick={copyReferralLink} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-sm text-green-600 mt-2">Copied!</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="w-6 h-6" />} label="Referred" value={dashboard.referred_count} subtext={`Tier: ${(dashboard.current_tier_bonus * 100).toFixed(0)}%`} />
        <StatCard icon={<DollarSign className="w-6 h-6" />} label="Total Earned" value={`$${dashboard.total_earned.toFixed(2)}`} />
        <StatCard icon={<Zap className="w-6 h-6" />} label="Pending" value={`$${dashboard.total_pending.toFixed(2)}`} highlight />
        <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Rate" value={`${(dashboard.final_commission_rate * 100).toFixed(1)}%`} subtext={`Base: ${(dashboard.commission_rate * 100).toFixed(0)}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Level 1</p>
          <p className="text-2xl font-bold">{(dashboard.commission_rate * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-2">Direct referrals</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Level 2</p>
          <p className="text-2xl font-bold">{(dashboard.second_level_rate * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-2">Of level 1 commission</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available</p>
          <p className="text-2xl font-bold text-green-600">${dashboard.available_for_withdrawal.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Min: ${dashboard.minimum_withdrawal}</p>
        </div>
      </div>

      {dashboard.available_for_withdrawal > 0 && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Request Withdrawal</h3>
          <div className="flex gap-4">
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder={`Min: $${dashboard.minimum_withdrawal}`} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg" />
            <button onClick={handleWithdrawal} disabled={isWithdrawing} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {isWithdrawing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Wallet: {dashboard.usdt_wallet}</p>
        </div>
      )}

      {commissionsData?.commissions && (
        <div>
          <h3 className="text-lg font-bold mb-4">Recent Commissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Recharge</th>
                  <th className="text-left py-2 px-4">Commission</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissionsData.commissions.map((c: any) => (
                  <tr key={c.id} className="border-b dark:border-gray-700">
                    <td className="py-2 px-4">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4">${c.topup_amount.toFixed(2)}</td>
                    <td className="py-2 px-4 font-semibold">${c.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${c.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext, highlight }: any) {
  return (
    <div className={`p-6 rounded-lg border ${highlight ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between mb-4">
        <span className={`${highlight ? 'text-green-600' : 'text-blue-600'}`}>{icon}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
    </div>
  );
}
