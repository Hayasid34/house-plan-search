'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Company, UserProfile } from '@/types/database';
import { getDefaultCompanyId, getCompanyById, getUserProfilesByCompanyId, getRoleLabel, getMonthlyUsagesByCompanyId } from '@/lib/demo-data';

export default function CompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planData, setPlanData] = useState({
    title: '',
    description: '',
    layout: '',
    floor_area_tsubo: '',
    price_range_min: '',
    price_range_max: '',
  });

  useEffect(() => {
    // デモモード: 認証チェックをスキップ
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@dandori.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    } as User;

    setUser(demoUser);

    // localStorageから選択された会社IDを取得（なければデフォルト）
    const storedCompanyId = localStorage.getItem('demo_company_id');
    const companyId = storedCompanyId || getDefaultCompanyId();

    const selectedCompany = getCompanyById(companyId);
    if (selectedCompany) {
      setCompany(selectedCompany);
      // 会社に紐づくアカウントを取得
      const companyAccounts = getUserProfilesByCompanyId(companyId);
      setAccounts(companyAccounts);
    }

    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/vendor/login');
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // デモモード: コンソールに出力
    console.log('新規プラン登録:', {
      ...planData,
      company_id: company?.id,
      is_published: false,
    });
    alert('プランが登録されました！（デモモード）');
    // フォームをリセット
    setPlanData({
      title: '',
      description: '',
      layout: '',
      floor_area_tsubo: '',
      price_range_min: '',
      price_range_max: '',
    });
    setShowPlanForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F9] flex items-center justify-center">
        <p className="text-[#5E6C84]">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F9]">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-[#DFE1E6]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/vendor')}
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
                <p className="text-sm text-[#5E6C84]">ベンダー管理画面</p>
              </div>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-[#172B4D]">{user?.email}</p>
                <p className="text-xs text-[#5E6C84]">管理者</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white hover:bg-[#F4F5F7] text-[#172B4D] rounded-md border border-[#DFE1E6] transition-all font-medium text-sm"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー */}
        <aside className="w-64 bg-white border-r border-[#DFE1E6] min-h-[calc(100vh-73px)]">
          <nav className="p-3">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => router.push('/vendor')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-[#44546F] hover:bg-[#F4F5F7] rounded-md transition-colors font-medium text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  全体ダッシュボード
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/vendor/companies')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-[#44546F] hover:bg-[#F4F5F7] rounded-md transition-colors font-medium text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  会社管理
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/vendor/accounts')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-[#44546F] hover:bg-[#F4F5F7] rounded-md transition-colors font-medium text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  アカウント管理
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/vendor/usage')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-[#44546F] hover:bg-[#F4F5F7] rounded-md transition-colors font-medium text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  利用状況
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-8 bg-[#F7F8F9]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#172B4D]">{company?.name}</h2>
              <p className="text-sm text-[#5E6C84] mt-1">CST番号: {company?.cst_number}</p>
            </div>
            <button
              onClick={() => {
                // 会社IDをlocalStorageに保存して、ユーザー側のページに遷移
                localStorage.setItem('current_company_id', company?.id || '');
                router.push('/');
              }}
              className="px-4 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-md transition-colors font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              代理ログイン
            </button>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* プラン数 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5E6C84] text-sm mb-2 font-medium">登録プラン数</p>
                  <p className="text-3xl font-bold text-[#172B4D]">0</p>
                </div>
                <div className="w-12 h-12 bg-[#E9F2FF] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0C66E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 敷地計画数 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5E6C84] text-sm mb-2 font-medium">敷地計画数</p>
                  <p className="text-3xl font-bold text-[#172B4D]">0</p>
                </div>
                <div className="w-12 h-12 bg-[#DFFCF0] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00875A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 閲覧数（今月） */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5E6C84] text-sm mb-2 font-medium">今月の閲覧数</p>
                  <p className="text-3xl font-bold text-[#172B4D]">0</p>
                </div>
                <div className="w-12 h-12 bg-[#F3F0FF] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#6554C0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 会社情報カード */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#172B4D]">会社情報</h3>
              <button
                onClick={() => router.push('/vendor/company/settings')}
                className="px-3 py-1 text-sm text-[#0C66E4] hover:bg-[#E9F2FF] rounded-md transition-colors font-medium"
              >
                編集
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#5E6C84] mb-1 font-medium">プレイス名</p>
                <p className="text-[#172B4D] font-medium">{company?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[#5E6C84] mb-1 font-medium">会社ID</p>
                <p className="text-[#172B4D] font-mono text-sm">{company?.id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[#5E6C84] mb-1 font-medium">管理者氏名</p>
                <p className="text-[#172B4D]">{company?.admin_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[#5E6C84] mb-1 font-medium">アカウント契約数</p>
                <p className="text-[#172B4D]">{company?.max_accounts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-[#5E6C84] mb-1 font-medium">アカウント登録数</p>
                <p className="text-[#172B4D]">{company?.current_accounts || 0}</p>
              </div>
            </div>
          </div>


          {/* プラン作成フォーム */}
          {showPlanForm && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow mt-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#172B4D]">新規プラン登録</h3>
                <button
                  onClick={() => setShowPlanForm(false)}
                  className="text-[#5E6C84] hover:text-[#172B4D] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePlanSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* プランタイトル */}
                  <div>
                    <label className="block text-sm font-medium text-[#172B4D] mb-2">
                      プランタイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={planData.title}
                      onChange={(e) => setPlanData({ ...planData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                      placeholder="例: 3LDK 平屋プラン"
                    />
                  </div>

                  {/* 間取り */}
                  <div>
                    <label className="block text-sm font-medium text-[#172B4D] mb-2">
                      間取り
                    </label>
                    <input
                      type="text"
                      value={planData.layout}
                      onChange={(e) => setPlanData({ ...planData, layout: e.target.value })}
                      className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                      placeholder="例: 3LDK"
                    />
                  </div>

                  {/* 床面積 */}
                  <div>
                    <label className="block text-sm font-medium text-[#172B4D] mb-2">
                      床面積（坪）
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={planData.floor_area_tsubo}
                      onChange={(e) => setPlanData({ ...planData, floor_area_tsubo: e.target.value })}
                      className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                      placeholder="例: 30.5"
                    />
                  </div>

                  {/* 価格帯（最小） */}
                  <div>
                    <label className="block text-sm font-medium text-[#172B4D] mb-2">
                      価格帯（最小）
                    </label>
                    <input
                      type="number"
                      value={planData.price_range_min}
                      onChange={(e) => setPlanData({ ...planData, price_range_min: e.target.value })}
                      className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                      placeholder="例: 2000000"
                    />
                  </div>

                  {/* 価格帯（最大） */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-[#172B4D] mb-2">
                      価格帯（最大）
                    </label>
                    <input
                      type="number"
                      value={planData.price_range_max}
                      onChange={(e) => setPlanData({ ...planData, price_range_max: e.target.value })}
                      className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                      placeholder="例: 3000000"
                    />
                  </div>
                </div>

                {/* 説明 */}
                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    プラン説明
                  </label>
                  <textarea
                    value={planData.description}
                    onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="プランの詳細説明を入力してください"
                  />
                </div>

                {/* ボタン */}
                <div className="flex gap-3 justify-end pt-4 border-t border-[#DFE1E6]">
                  <button
                    type="button"
                    onClick={() => setShowPlanForm(false)}
                    className="px-5 py-2 bg-white hover:bg-[#F4F5F7] text-[#172B4D] rounded-md border border-[#DFE1E6] transition-all font-medium text-sm"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-md transition-all font-medium text-sm"
                  >
                    プランを登録
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 所属アカウント一覧 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#172B4D]">所属アカウント</h3>
              <span className="text-sm text-[#5E6C84] font-medium">
                {accounts.length}件 / 契約数 {company?.max_accounts}件
              </span>
            </div>

            {accounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F7F8F9] border-b border-[#DFE1E6]">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">アカウント名</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">権限</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">登録日</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">最終更新日</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6]">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-[#F4F5F7] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#172B4D] font-medium">
                          {account.display_name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            account.role === 'admin'
                              ? 'bg-[#F3F0FF] text-[#6554C0]'
                              : account.role === 'sales'
                              ? 'bg-[#E9F2FF] text-[#0C66E4]'
                              : 'bg-[#F4F5F7] text-[#44546F]'
                          }`}>
                            {getRoleLabel(account.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#5E6C84]">
                          {new Date(account.created_at).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#5E6C84]">
                          {new Date(account.updated_at).toLocaleDateString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#5E6C84]">
                この会社に所属するアカウントはありません。
              </div>
            )}
          </div>

          {/* 利用状況 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#172B4D]">利用状況（直近6ヶ月）</h3>
            </div>

            {(() => {
              const companyId = company?.id;
              if (!companyId) return null;

              const usages = getMonthlyUsagesByCompanyId(companyId);
              const sortedUsages = usages.sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
              }).slice(0, 30); // 最新30件まで表示

              if (sortedUsages.length === 0) {
                return (
                  <div className="text-center py-8 text-[#5E6C84]">
                    利用データがありません。
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F7F8F9] border-b border-[#DFE1E6]">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">年月</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">ユーザー</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">権限</th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">プラン登録数</th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">敷地計画登録数</th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">合計</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE1E6]">
                      {sortedUsages.map((usage) => {
                        const user = accounts.find(acc => acc.id === usage.user_id);
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
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user?.role === 'admin'
                                  ? 'bg-[#F3F0FF] text-[#6554C0]'
                                  : user?.role === 'editor'
                                  ? 'bg-[#E9F2FF] text-[#0C66E4]'
                                  : 'bg-[#F4F5F7] text-[#44546F]'
                              }`}>
                                {user ? getRoleLabel(user.role) : 'unknown'}
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
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
