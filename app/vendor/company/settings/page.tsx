'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Company } from '@/types/database';
import { getDefaultCompanyId, getCompanyById, saveCompany } from '@/lib/demo-data';

export default function CompanySettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [originalCompany, setOriginalCompany] = useState<Company | null>(null);

  useEffect(() => {
    // デモモード: 認証チェックをスキップ
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@dandori.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    } as User;

    setUser(demoUser);

    // 選択された会社情報を取得
    const companyId = getDefaultCompanyId();
    const selectedCompany = getCompanyById(companyId);
    if (selectedCompany) {
      setCompany(selectedCompany);
      setOriginalCompany(selectedCompany);
    }

    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/vendor/login');
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setCompany(originalCompany);
    setIsEditMode(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (company) {
      saveCompany(company);
    }
    alert('会社情報を保存しました。');

    setOriginalCompany(company);
    setIsEditMode(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <p className="text-text-sub">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-line-separator">
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
                <h1 className="text-2xl font-bold text-text-primary">
                  DandoriFinder
                </h1>
                <p className="text-sm text-text-sub">ベンダー管理画面</p>
              </div>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">{user?.email}</p>
                <p className="text-xs text-text-sub">管理者</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-bg-soft hover:bg-bg-medium text-text-primary rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー */}
        <aside className="w-64 bg-white border-r border-line-separator min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push('/vendor')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-sub hover:bg-bg-soft hover:text-text-primary rounded-lg transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  全体ダッシュボード
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/vendor/company')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-sub hover:bg-bg-soft hover:text-text-primary rounded-lg transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  会社ダッシュボード
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/vendor/company/settings')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left bg-dw-blue text-white rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  会社情報設定
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/vendor/companies')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-sub hover:bg-bg-soft hover:text-text-primary rounded-lg transition-colors font-medium"
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-sub hover:bg-bg-soft hover:text-text-primary rounded-lg transition-colors font-medium"
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-sub hover:bg-bg-soft hover:text-text-primary rounded-lg transition-colors font-medium"
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
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">会社情報設定</h2>
            {!isEditMode && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="bg-white rounded-lg p-6 border border-line-separator">
            <div className="space-y-6">
              {/* 会社ID */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  会社ID
                </label>
                <input
                  type="text"
                  value={company?.id || ''}
                  disabled
                  className="w-full px-4 py-2 border border-line-separator rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* CST番号 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  CST番号
                </label>
                <input
                  type="text"
                  value={company?.cst_number || ''}
                  onChange={(e) => company && setCompany({ ...company, cst_number: e.target.value })}
                  disabled={!isEditMode}
                  maxLength={5}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="10001"
                />
                <p className="text-xs text-text-sub mt-1">
                  ※ 5桁の数字を入力してください
                </p>
              </div>

              {/* プレイス名 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  プレイス名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={company?.name || ''}
                  onChange={(e) => company && setCompany({ ...company, name: e.target.value })}
                  required
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="デモ工務店"
                />
              </div>

              {/* 郵便番号 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  郵便番号
                </label>
                <input
                  type="text"
                  value={company?.postal_code || ''}
                  onChange={(e) => company && setCompany({ ...company, postal_code: e.target.value })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="150-0001"
                />
              </div>

              {/* 住所 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  住所
                </label>
                <input
                  type="text"
                  value={company?.address || ''}
                  onChange={(e) => company && setCompany({ ...company, address: e.target.value })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="東京都渋谷区1-2-3"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={company?.email || ''}
                  onChange={(e) => company && setCompany({ ...company, email: e.target.value })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="info@example.com"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={company?.website_url || ''}
                  onChange={(e) => company && setCompany({ ...company, website_url: e.target.value })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="https://example.com"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={company?.phone || ''}
                  onChange={(e) => company && setCompany({ ...company, phone: e.target.value })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="03-1234-5678"
                />
              </div>

              {/* FAX番号 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  FAX番号
                </label>
                <input
                  type="tel"
                  value={company?.fax_number || ''}
                  onChange={(e) => company && setCompany({ ...company, fax_number: e.target.value })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="03-1234-5679"
                />
              </div>

              {/* 適格事業者番号 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  適格事業者番号
                </label>
                <input
                  type="text"
                  value={company?.qualified_invoice_number || ''}
                  onChange={(e) => company && setCompany({ ...company, qualified_invoice_number: e.target.value })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="T1234567890123"
                />
              </div>

              {/* 管理者氏名 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  管理者氏名
                </label>
                <input
                  type="text"
                  value={company?.admin_name || ''}
                  onChange={(e) => company && setCompany({ ...company, admin_name: e.target.value })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="山田 太郎"
                />
              </div>

              {/* アカウント契約数 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  アカウント契約数
                </label>
                <input
                  type="number"
                  value={company?.max_accounts || 0}
                  onChange={(e) => company && setCompany({ ...company, max_accounts: parseInt(e.target.value) || 0 })}
                  disabled={!isEditMode}
                  min="0"
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* アカウント登録数 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  アカウント登録数
                </label>
                <input
                  type="number"
                  value={company?.current_accounts || 0}
                  disabled
                  className="w-full px-4 py-2 border border-line-separator rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-text-sub mt-1">
                  ※ 登録数は自動的に計算されます
                </p>
              </div>

              {/* 公開ステータス */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  公開ステータス <span className="text-red-500">*</span>
                </label>
                <select
                  value={company?.is_public ? 'public' : 'private'}
                  onChange={(e) => company && setCompany({ ...company, is_public: e.target.value === 'public' })}
                  disabled={!isEditMode}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue disabled:bg-gray-50 disabled:text-gray-600"
                >
                  <option value="public">公開</option>
                  <option value="private">非公開</option>
                </select>
                {isEditMode && (
                  <p className="text-xs text-text-sub mt-1">
                    非公開にすると、解約時などに会社情報が一般ユーザーに表示されなくなります。
                  </p>
                )}
              </div>

              {/* 作成日時 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  作成日時
                </label>
                <input
                  type="text"
                  value={company?.created_at ? new Date(company.created_at).toLocaleString('ja-JP') : ''}
                  disabled
                  className="w-full px-4 py-2 border border-line-separator rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* 保存ボタン */}
            {isEditMode && (
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-line-separator">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-bg-soft hover:bg-bg-medium text-text-primary rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
