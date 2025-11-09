'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Company } from '@/types/database';
import { demoCompanies } from '@/lib/demo-data';

export default function CompaniesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>(demoCompanies);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(demoCompanies);
  const [searchId, setSearchId] = useState('');
  const [searchPlaceCode, setSearchPlaceCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCstNumber, setSearchCstNumber] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);

  useEffect(() => {
    // デモモード: 認証チェックをスキップ
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@dandori.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    } as User;

    setUser(demoUser);
    setLoading(false);

    // 本番環境では以下のコメントを解除してください
    // const checkAuth = async () => {
    //   const supabase = createClient();
    //   const { data: { user } } = await supabase.auth.getUser();
    //
    //   if (!user) {
    //     router.push('/vendor/login');
    //     return;
    //   }
    //
    //   setUser(user);
    //
    //   // 会社一覧を取得
    //   const { data: companiesData } = await supabase
    //     .from('companies')
    //     .select('*')
    //     .order('created_at', { ascending: false });
    //
    //   if (companiesData) {
    //     setCompanies(companiesData);
    //     setFilteredCompanies(companiesData);
    //   }
    //
    //   setLoading(false);
    // };
    //
    // checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/vendor/login');
  };

  const handleSearch = () => {
    let filtered = companies;

    // プレイスIDで検索
    if (searchId.trim()) {
      filtered = filtered.filter(company =>
        company.id.toLowerCase().includes(searchId.toLowerCase())
      );
    }

    // プレイスコードで検索
    if (searchPlaceCode.trim()) {
      filtered = filtered.filter(company =>
        company.place_code.toLowerCase().includes(searchPlaceCode.toLowerCase())
      );
    }

    // プレイス名で検索
    if (searchName.trim()) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // CST番号で検索
    if (searchCstNumber.trim()) {
      filtered = filtered.filter(company =>
        company.cst_number.includes(searchCstNumber)
      );
    }

    // 公開状況で検索
    if (showPublicOnly && !showPrivateOnly) {
      filtered = filtered.filter(company => company.is_public);
    } else if (showPrivateOnly && !showPublicOnly) {
      filtered = filtered.filter(company => !company.is_public);
    }

    setFilteredCompanies(filtered);
  };

  const handleReset = () => {
    setSearchId('');
    setSearchPlaceCode('');
    setSearchName('');
    setSearchCstNumber('');
    setShowPublicOnly(false);
    setShowPrivateOnly(false);
    setFilteredCompanies(companies);
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
                  className="w-full flex items-center gap-3 px-3 py-2 text-left bg-[#E9F2FF] text-[#0C66E4] rounded-md font-medium text-sm"
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
            </ul>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-8 bg-[#F7F8F9]">
          <h2 className="text-2xl font-bold text-[#172B4D] mb-6">会社管理</h2>

          {/* 検索フォーム */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow mb-6">
            <h3 className="text-lg font-bold text-[#172B4D] mb-4">検索条件</h3>
            <div className="space-y-4 mb-4">
              {/* Row 1: プレイスID, プレイスコード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-1">
                    プレイスID
                  </label>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                    placeholder="プレイスIDを入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-1">
                    プレイスコード
                  </label>
                  <input
                    type="text"
                    value={searchPlaceCode}
                    onChange={(e) => setSearchPlaceCode(e.target.value)}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                    placeholder="プレイスコードを入力"
                  />
                </div>
              </div>

              {/* Row 2: プレイス名, CST番号 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-1">
                    プレイス名
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                    placeholder="プレイス名を入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-1">
                    CST番号
                  </label>
                  <input
                    type="text"
                    value={searchCstNumber}
                    onChange={(e) => setSearchCstNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                    placeholder="CST番号を入力"
                    maxLength={5}
                  />
                </div>
              </div>

              {/* Row 3: 公開状況 */}
              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                  公開状況
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPublicOnly}
                      onChange={(e) => setShowPublicOnly(e.target.checked)}
                      className="w-4 h-4 text-[#0C66E4] border-[#DFE1E6] rounded focus:ring-[#0C66E4] cursor-pointer"
                    />
                    <span className="text-sm text-[#172B4D]">公開プレイスのみ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPrivateOnly}
                      onChange={(e) => setShowPrivateOnly(e.target.checked)}
                      className="w-4 h-4 text-[#0C66E4] border-[#DFE1E6] rounded focus:ring-[#0C66E4] cursor-pointer"
                    />
                    <span className="text-sm text-[#172B4D]">非公開プレイスのみ</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-md transition-colors font-medium text-sm"
              >
                検索
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-white hover:bg-[#F4F5F7] text-[#172B4D] rounded-md border border-[#DFE1E6] transition-colors font-medium text-sm"
              >
                リセット
              </button>
            </div>
          </div>

          {/* 検索結果 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4 border-b border-[#DFE1E6]">
              <p className="text-sm text-[#5E6C84] font-medium">
                検索結果: {filteredCompanies.length}件
              </p>
            </div>
            <table className="w-full">
              <thead className="bg-[#F7F8F9] border-b border-[#DFE1E6]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">プレイスID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">プレイス名</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">所在地</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">電話番号</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">管理者氏名</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">契約数</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">登録数</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">公開状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-[#F4F5F7] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#172B4D] font-mono">
                      {company.id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          // 会社を切り替えて会社情報ページに遷移
                          localStorage.setItem('demo_company_id', company.id);
                          router.push('/vendor/company');
                        }}
                        className="text-[#0C66E4] hover:underline font-medium"
                      >
                        {company.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5E6C84]">
                      {company.address || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5E6C84]">
                      {company.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5E6C84]">
                      {company.admin_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5E6C84]">
                      {company.max_accounts}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5E6C84]">
                      {company.current_accounts}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.is_public
                            ? 'bg-[#E9F2FF] text-[#0C66E4]'
                            : 'bg-[#FFF7E6] text-[#FF991F]'
                        }`}
                      >
                        {company.is_public ? '公開' : '非公開'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCompanies.length === 0 && (
              <div className="p-8 text-center text-[#5E6C84]">
                検索条件に一致する会社が見つかりませんでした。
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
