import { useState } from 'react';
import { useEnhancedAffiliateDashboard, useAffiliateCommissions, useAffiliateWithdrawalHistory, useRequestWithdrawal } from '../hooks/use-affiliate-commissions';
import { Copy, DollarSign, Users, TrendingUp, ExternalLink, Download, Zap, Lock } from 'lucide-react';
import QRCode from 'qrcode.react';

export function AffiliateDashboard() {
  const { data: dashboard, isLoading: dashboardLoading } = useEnhancedAffiliateDashboard();
  const [page, setPage] = useState(1);
  const { data: commissionsData } = useAffiliateCommissions(page, 20);
  const { data: withdrawalsData } = useAffiliateWithdrawalHistory(1);
  const { mutate: requestWithdrawal, isPending: isWithdrawing } = useRequestWithdrawal();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Affiliate Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Earn commissions on every referral's recharge
        </p>
      </div>

      {/* Status Alert */}
      {dashboard.status !== 'active' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <Lock className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-200">Account Status: {dashboard.status}</p>
            <p className="text-sm text-red-700 dark:text-red-300">Fraud Score: {dashboard.fraud_score}/100</p>
          </div>
        </div>
      )}

      {/* Referral Link Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-sm text-green-600 mt-2">Copied!</p>}
          </div>
          <button
            onClick={() => setShowQR(!showQR)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>
        </div>
        {showQR && (
          <div className="mt-4 flex justify-center">
            <QRCode value={referralUrl} size={200} />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Referred"
          value={dashboard.referred_count}
          subtext={`Tier Bonus: ${(dashboard.current_tier_bonus * 100).toFixed(0)}%`}
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Earned"
          value={`$${dashboard.total_earned.toFixed(2)}`}
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          label="Pending"
          value={`$${dashboard.total_pending.toFixed(2)}`}
          highlight
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Commission Rate"
          value={`${(dashboard.final_commission_rate * 100).toFixed(1)}%`}
          subtext={`Base: ${(dashboard.commission_rate * 100).toFixed(0)}%`}
        />
      </div>

      {/* Commission Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Level 1 Commission</p>
          <p className="text-2xl font-bold">{(dashboard.commission_rate * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-2">Direct referrals</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Level 2 Commission</p>
          <p className="text-2xl font-bold">{(dashboard.second_level_rate * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-2">Of level 1 commission</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available to Withdraw</p>
          <p className="text-2xl font-bold text-green-600">${dashboard.available_for_withdrawal.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Min: ${dashboard.minimum_withdrawal}</p>
        </div>
      </div>

      {/* Withdrawal Section */}
      {dashboard.available_for_withdrawal > 0 && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Request Withdrawal</h3>
          <div className="flex gap-4">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={`Min: $${dashboard.minimum_withdrawal}`}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
            />
            <button
              onClick={handleWithdrawal}
              disabled={isWithdrawing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Wallet: {dashboard.usdt_wallet}</p>
        </div>
      )}

      {/* Commissions Table */}
      {commissionsData?.commissions && (
        <div className="mb-8">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Referred Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard.referred_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Earned
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${dashboard.total_earned.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Payment
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${dashboard.total_pending.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Referral Link
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <strong>Your Code:</strong> {dashboard.affiliate_code}
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Share this link with potential users. You'll earn 30% commission on every recharge they make.
        </p>
      </div>

      {/* Account Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Details
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{dashboard.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {dashboard.full_name || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">USDT Wallet</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">
              {dashboard.usdt_wallet}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Telegram</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {dashboard.telegram_handle || 'Not provided'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Commissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Commission History
          </h2>
        </div>

        {commissionsLoading ? (
          <div className="p-6 text-center">Loading commissions...</div>
        ) : !commissionsData?.commissions.length ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            No commissions yet. Share your referral link to start earning!
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Topup Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Commission (30%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {commissionsData.commissions.map((commission) => (
                    <tr key={commission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(commission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${commission.topup_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${commission.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {commission.paid ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {commissionsData.total > 20 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, commissionsData.total)} of{' '}
                  {commissionsData.total} commissions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 20 >= commissionsData.total}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
