import { useState } from 'react';
import {
  useAllAffiliates,
  usePendingCommissions,
  useMarkCommissionsPaid,
  useExportPendingCommissions
} from '../hooks/use-affiliate-admin';
import { Download, CheckCircle, Users, DollarSign } from 'lucide-react';

export function AffiliateAdminPanel() {
  const [activeTab, setActiveTab] = useState<'affiliates' | 'commissions'>('commissions');
  const [selectedCommissions, setSelectedCommissions] = useState<number[]>([]);

  const { data: affiliatesData, isLoading: affiliatesLoading } = useAllAffiliates();
  const { data: commissionsData, isLoading: commissionsLoading } = usePendingCommissions();
  const markPaidMutation = useMarkCommissionsPaid();
  const exportCommissions = useExportPendingCommissions();

  const handleSelectCommission = (id: number) => {
    setSelectedCommissions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!commissionsData?.commissions.length) return;
    if (selectedCommissions.length === commissionsData.commissions.length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(commissionsData.commissions.map(c => c.id));
    }
  };

  const handleMarkPaid = async () => {
    if (selectedCommissions.length === 0) return;
    if (!confirm(`Mark ${selectedCommissions.length} commission(s) as paid?`)) return;

    try {
      await markPaidMutation.mutateAsync(selectedCommissions);
      setSelectedCommissions([]);
      alert('Commissions marked as paid successfully');
    } catch (error) {
      alert('Failed to mark commissions as paid');
    }
  };

  const totalPending = commissionsData?.commissions.reduce((sum, c) => sum + c.amount, 0) || 0;
  const selectedTotal = commissionsData?.commissions
    .filter(c => selectedCommissions.includes(c.id))
    .reduce((sum, c) => sum + c.amount, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Affiliate Management
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage affiliates and process commission payments
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('commissions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'commissions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pending Commissions
              {commissionsData?.commissions.length ? (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {commissionsData.commissions.length}
                </span>
              ) : null}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'affiliates'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Affiliates ({affiliatesData?.affiliates.length || 0})
            </div>
          </button>
        </nav>
      </div>

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalPending.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Selected Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${selectedTotal.toFixed(2)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleMarkPaid}
              disabled={selectedCommissions.length === 0 || markPaidMutation.isPending}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Mark {selectedCommissions.length > 0 ? selectedCommissions.length : ''} as Paid
            </button>
            <button
              onClick={exportCommissions}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV for Payments
            </button>
          </div>

          {/* Commissions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {commissionsLoading ? (
              <div className="p-6 text-center">Loading commissions...</div>
            ) : !commissionsData?.commissions.length ? (
              <div className="p-6 text-center text-gray-600 dark:text-gray-400">
                No pending commissions
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCommissions.length === commissionsData.commissions.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Affiliate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        USDT Wallet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Topup
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Commission
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {commissionsData.commissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCommissions.includes(commission.id)}
                            onChange={() => handleSelectCommission(commission.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div>{commission.Affiliate.email}</div>
                          <div className="text-xs text-gray-500">{commission.Affiliate.full_name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {commission.Affiliate.usdt_wallet.slice(0, 10)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${commission.topup_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${commission.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Affiliates Tab */}
      {activeTab === 'affiliates' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {affiliatesLoading ? (
            <div className="p-6 text-center">Loading affiliates...</div>
          ) : !affiliatesData?.affiliates.length ? (
            <div className="p-6 text-center text-gray-600 dark:text-gray-400">
              No affiliates registered yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      USDT Wallet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Telegram
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {affiliatesData.affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {affiliate.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {affiliate.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                        {affiliate.affiliate_code}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                        {affiliate.usdt_wallet.slice(0, 12)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {affiliate.telegram_handle || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(affiliate.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
