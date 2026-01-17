'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { demoUserProfiles, demoCompanies, getMonthlyUsagesByCompanyId, getCompanyUsageSummary, getRoleLabel } from '@/lib/demo-data';
import type { MonthlyUsage } from '@/types/database';

export default function VendorUsagePage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6months');

  // Get current company (vendor)
  const currentCompany = demoCompanies[0];
  const companyUsers = demoUserProfiles.filter(u => u.company_id === currentCompany.id);

  // Get all usage data for this company
  const allUsages = getMonthlyUsagesByCompanyId(currentCompany.id);
  const summary = getCompanyUsageSummary(currentCompany.id);

  // Filter usages based on selected user and period
  const filteredUsages = useMemo(() => {
    let filtered = allUsages;

    // Filter by user
    if (selectedUserId !== 'all') {
      filtered = filtered.filter(u => u.user_id === selectedUserId);
    }

    // Filter by period
    const now = new Date();
    const currentYearMonth = now.getFullYear() * 12 + (now.getMonth() + 1);

    if (selectedPeriod === '1month') {
      filtered = filtered.filter(u => {
        const usageYearMonth = u.year * 12 + u.month;
        return usageYearMonth === currentYearMonth;
      });
    } else if (selectedPeriod === '3months') {
      filtered = filtered.filter(u => {
        const usageYearMonth = u.year * 12 + u.month;
        return usageYearMonth >= currentYearMonth - 2 && usageYearMonth <= currentYearMonth;
      });
    } else if (selectedPeriod === '6months') {
      filtered = filtered.filter(u => {
        const usageYearMonth = u.year * 12 + u.month;
        return usageYearMonth >= currentYearMonth - 5 && usageYearMonth <= currentYearMonth;
      });
    }

    // Sort by year and month descending
    return filtered.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [allUsages, selectedUserId, selectedPeriod]);

  // Calculate summary for filtered data
  const filteredSummary = useMemo(() => {
    const totalPlans = filteredUsages.reduce((sum, u) => sum + u.plan_registrations, 0);
    const totalSitePlans = filteredUsages.reduce((sum, u) => sum + u.site_plan_registrations, 0);
    return { totalPlans, totalSitePlans };
  }, [filteredUsages]);

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = companyUsers.find(u => u.id === userId);
    return user?.display_name || 'Unknown User';
  };

  return (
    <div className="min-h-screen bg-[#F7F8F9]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#DFE1E6]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/vendor"
              className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src="/images/dandori-logo.png"
                alt="DandoriFinder Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-[#172B4D]">
                  DandoriFinder
                </h1>
                <p className="text-sm text-[#5E6C84]">管理画面</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5E6C84] mb-2 font-medium">総プラン登録数</p>
                <p className="text-3xl font-bold text-[#0C66E4]">{filteredSummary.totalPlans}</p>
              </div>
              <div className="w-12 h-12 bg-[#E9F2FF] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0C66E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5E6C84] mb-2 font-medium">総敷地計画登録数</p>
                <p className="text-3xl font-bold text-[#00875A]">{filteredSummary.totalSitePlans}</p>
              </div>
              <div className="w-12 h-12 bg-[#DFFCF0] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00875A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5E6C84] mb-2 font-medium">アクティブユーザー数</p>
                <p className="text-3xl font-bold text-[#172B4D]">
                  {new Set(filteredUsages.filter(u => u.plan_registrations > 0 || u.site_plan_registrations > 0).map(u => u.user_id)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#F3F0FF] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6554C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#172B4D] mb-2">
                ユーザーで絞り込み
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
              >
                <option value="all">すべてのユーザー</option>
                {companyUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.display_name} ({getRoleLabel(user.role)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172B4D] mb-2">
                期間で絞り込み
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
              >
                <option value="1month">今月</option>
                <option value="3months">過去3ヶ月</option>
                <option value="6months">過去6ヶ月</option>
                <option value="all">すべての期間</option>
              </select>
            </div>
          </div>
        </div>

        {/* Usage Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#DFE1E6]">
              <thead className="bg-[#F7F8F9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">
                    年月
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">
                    権限
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">
                    プラン登録数
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">
                    敷地計画登録数
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">
                    合計
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#DFE1E6]">
                {filteredUsages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#5E6C84]">
                      利用データがありません
                    </td>
                  </tr>
                ) : (
                  filteredUsages.map((usage) => {
                    const user = companyUsers.find(u => u.id === usage.user_id);
                    const total = usage.plan_registrations + usage.site_plan_registrations;

                    return (
                      <tr key={usage.id} className="hover:bg-[#F4F5F7] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-[#172B4D]">
                            {usage.year}年{usage.month}月
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-[#172B4D]">
                            {user?.display_name || 'Unknown User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            user?.role === 'admin'
                              ? 'bg-[#F3F0FF] text-[#6554C0]'
                              : user?.role === 'editor'
                              ? 'bg-[#E9F2FF] text-[#0C66E4]'
                              : 'bg-[#F4F5F7] text-[#44546F]'
                          }`}>
                            {user ? getRoleLabel(user.role) : '不明'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-[#0C66E4]">
                            {usage.plan_registrations}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-[#00875A]">
                            {usage.site_plan_registrations}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-[#172B4D]">
                            {total}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredUsages.length > 0 && (
                <tfoot className="bg-[#F7F8F9]">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm font-bold text-[#172B4D]">
                      合計
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#0C66E4]">
                      {filteredSummary.totalPlans}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#00875A]">
                      {filteredSummary.totalSitePlans}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#172B4D]">
                      {filteredSummary.totalPlans + filteredSummary.totalSitePlans}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
