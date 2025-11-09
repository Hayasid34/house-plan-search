'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <p className="text-text-sub">読み込み中...</p>
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
                  className="w-full flex items-center gap-3 px-3 py-2 text-left bg-[#E9F2FF] text-[#0C66E4] rounded-md font-medium text-sm"
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
            </ul>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-8 bg-[#F7F8F9]">
          <h2 className="text-2xl font-bold text-[#172B4D] mb-6">全体ダッシュボード</h2>

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

            {/* アカウント数 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5E6C84] text-sm mb-2 font-medium">アカウント数</p>
                  <p className="text-3xl font-bold text-[#172B4D]">1</p>
                </div>
                <div className="w-12 h-12 bg-[#F3F0FF] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#6554C0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6]">
            <h3 className="text-lg font-bold text-[#172B4D] mb-5">クイックアクション</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/vendor/company/new')}
                className="flex items-center gap-4 p-5 bg-white hover:bg-[#F7F8F9] rounded-lg transition-all border-2 border-[#DFE1E6] hover:border-[#0C66E4] group"
              >
                <div className="w-10 h-10 bg-[#E9F2FF] group-hover:bg-[#0C66E4] rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-[#0C66E4] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#172B4D] text-sm">プレイス新規作成</p>
                  <p className="text-xs text-[#5E6C84] mt-1">会社情報を新規登録</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/vendor/accounts')}
                className="flex items-center gap-4 p-5 bg-white hover:bg-[#F7F8F9] rounded-lg transition-all border-2 border-[#DFE1E6] hover:border-[#0C66E4] group"
              >
                <div className="w-10 h-10 bg-[#E9F2FF] group-hover:bg-[#0C66E4] rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-[#0C66E4] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#172B4D] text-sm">アカウント追加</p>
                  <p className="text-xs text-[#5E6C84] mt-1">新しいユーザーを招待</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
