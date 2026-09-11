import { useState } from 'react';
import { useAffiliateDashboard } from '../hooks/use-affiliate-auth';
import { useAffiliateCommissions } from '../hooks/use-affiliate-commissions';
import { Copy, DollarSign, Users, TrendingUp, ExternalLink } from 'lucide-react';

export function AffiliateDashboard() {
  const { data: dashboard, isLoading: dashboardLoading } = useAffiliateDashboard();
  const [page, setPage] = useState(1);
  const { data: commissionsData, isLoading: commissionsLoading } = useAffiliateCommissions(page, 20);
  const [copied, setCopied] = useState(false);

  const referralUrl = dashboard
    ? `${window.location.origin}/register?ref=${dashboard.affiliate_code}`
    : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Affiliate Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Earn 30% commission on every referral's recharge
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
