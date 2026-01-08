'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Company } from '@/types/database';
import { getDefaultCompanyId, getCompanyById, saveCompany } from '@/lib/demo-data';

export default function CompanySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalCompany, setOriginalCompany] = useState<Company | null>(null);

  useEffect(() => {
    // デモモード: 認証は既にTOP画面で確認済み
    // 選択された会社情報を取得
    const companyId = getDefaultCompanyId();
    const selectedCompany = getCompanyById(companyId);
    if (selectedCompany) {
      setCompany(selectedCompany);
      setOriginalCompany(selectedCompany);
    }

    setLoading(false);
  }, [router]);

  const handleSave = () => {
    if (!company) return;

    // デモモード: localStorageに保存
    saveCompany(company);
    alert('会社情報を更新しました。');
    setIsEditMode(false);
    setOriginalCompany(company);
  };

  const handleCancel = () => {
    if (originalCompany) {
      setCompany(originalCompany);
    }
    setIsEditMode(false);
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
              onClick={() => router.push('/search')}
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
              </div>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/search')}
                className="border border-line-separator hover:bg-bg-soft text-text-sub hover:text-text-primary font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                戻る
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
                  onClick={() => router.push('/settings/company')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left bg-dw-blue text-white rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  会社情報
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/settings/accounts')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-sub hover:bg-bg-soft hover:text-text-primary rounded-lg transition-colors font-medium"
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
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">会社情報</h2>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="bg-dw-blue hover:bg-dw-blue-hover text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                編集
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 border border-line-separator">
            {isEditMode && (
              <div className="flex gap-3 mb-6 pb-6 border-b border-line-separator">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white rounded-lg transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-bg-soft hover:bg-bg-medium text-text-primary rounded-lg transition-colors"
                >
                  キャンセル
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* 会社ID */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  会社ID
                </label>
                <div className="w-full px-4 py-2 border border-line-separator rounded-lg bg-gray-50 text-gray-600">
                  {company?.id || '-'}
                </div>
                <p className="text-xs text-text-sub mt-1">
                  ※ ベンダー管理項目のため編集できません
                </p>
              </div>

              {/* CST番号 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  CST番号
                </label>
                <div className="w-full px-4 py-2 border border-line-separator rounded-lg bg-gray-50 text-gray-600">
                  {company?.cst_number || '-'}
                </div>
                <p className="text-xs text-text-sub mt-1">
                  ※ ベンダー管理項目のため編集できません
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
                  placeholder="東京都渋谷区神南1-2-3"
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
                  placeholder="info@demo-koumuten.com"
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
                  placeholder="https://demo-koumuten.com"
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
                <div className="w-full px-4 py-2 border border-line-separator rounded-lg bg-gray-50 text-gray-600">
                  {company?.max_accounts || 0}
                </div>
                <p className="text-xs text-text-sub mt-1">
                  ※ ベンダー管理項目のため編集できません
                </p>
              </div>

              {/* アカウント登録数 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  アカウント登録数
                </label>
                <div className="w-full px-4 py-2 border border-line-separator rounded-lg bg-gray-50 text-gray-600">
                  {company?.current_accounts || 0}
                </div>
                <p className="text-xs text-text-sub mt-1">
                  ※ ベンダー管理項目のため編集できません
                </p>
              </div>

              {/* 公開ステータス */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  公開ステータス
                </label>
                <div className="px-4 py-2 border border-line-separator rounded-lg bg-gray-50">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    company?.is_public
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {company?.is_public ? '公開' : '非公開'}
                  </span>
                </div>
                <p className="text-xs text-text-sub mt-1">
                  ※ ベンダー管理項目のため編集できません
                </p>
              </div>

              {/* 作成日時 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  作成日時
                </label>
                <div className="w-full px-4 py-2 border border-line-separator rounded-lg bg-gray-50 text-gray-600">
                  {company?.created_at ? new Date(company.created_at).toLocaleString('ja-JP') : '-'}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
