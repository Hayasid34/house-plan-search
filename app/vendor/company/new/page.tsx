'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cst_number: '',
    place_code: '',
    postal_code: '',
    address: '',
    email: '',
    website_url: '',
    phone: '',
    fax_number: '',
    qualified_invoice_number: '',
    admin_name: '',
    max_accounts: '10',
    is_public: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // デモモード: コンソールに出力
    console.log('新規プレイス作成:', {
      ...formData,
      current_accounts: 0,
      max_accounts: parseInt(formData.max_accounts),
    });

    alert('プレイスが作成されました！（デモモード）');

    // 会社一覧ページに戻る
    router.push('/vendor/companies');

    // 本番環境では以下のコードを使用
    // try {
    //   const supabase = createClient();
    //   const { data, error } = await supabase
    //     .from('companies')
    //     .insert([{
    //       name: formData.name,
    //       cst_number: formData.cst_number,
    //       place_code: formData.place_code,
    //       postal_code: formData.postal_code || null,
    //       address: formData.address || null,
    //       email: formData.email || null,
    //       website_url: formData.website_url || null,
    //       phone: formData.phone || null,
    //       fax_number: formData.fax_number || null,
    //       qualified_invoice_number: formData.qualified_invoice_number || null,
    //       admin_name: formData.admin_name || null,
    //       max_accounts: parseInt(formData.max_accounts),
    //       current_accounts: 0,
    //       is_public: formData.is_public,
    //     }])
    //     .select();
    //
    //   if (error) throw error;
    //   router.push('/vendor/companies');
    // } catch (error) {
    //   console.error('Error creating company:', error);
    //   alert('プレイスの作成に失敗しました。');
    // } finally {
    //   setLoading(false);
    // }
  };

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
                <p className="text-sm text-[#5E6C84]">管理画面</p>
              </div>
            </button>
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#172B4D]">プレイス新規作成</h2>
            <p className="text-sm text-[#5E6C84] mt-1">新しい会社情報を登録します</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 基本情報 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow mb-6">
              <h3 className="text-lg font-bold text-[#172B4D] mb-5">基本情報</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    プレイス名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: 株式会社サンプル建設"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    CST番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.cst_number}
                    onChange={(e) => setFormData({ ...formData, cst_number: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="5桁の数字"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    プレイスコード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.place_code}
                    onChange={(e) => setFormData({ ...formData, place_code: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: PLACE001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    管理者氏名
                  </label>
                  <input
                    type="text"
                    value={formData.admin_name}
                    onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: 山田 太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    アカウント契約数 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.max_accounts}
                    onChange={(e) => setFormData({ ...formData, max_accounts: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 連絡先情報 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow mb-6">
              <h3 className="text-lg font-bold text-[#172B4D] mb-5">連絡先情報</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    住所
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: 東京都渋谷区..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: info@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    WebサイトURL
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: 03-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    FAX番号
                  </label>
                  <input
                    type="tel"
                    value={formData.fax_number}
                    onChange={(e) => setFormData({ ...formData, fax_number: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: 03-1234-5679"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172B4D] mb-2">
                    適格事業者番号
                  </label>
                  <input
                    type="text"
                    value={formData.qualified_invoice_number}
                    onChange={(e) => setFormData({ ...formData, qualified_invoice_number: e.target.value })}
                    className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0C66E4] focus:border-transparent text-sm"
                    placeholder="例: T1234567890123"
                  />
                </div>
              </div>
            </div>

            {/* 公開設定 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow mb-6">
              <h3 className="text-lg font-bold text-[#172B4D] mb-5">公開設定</h3>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 text-[#0C66E4] border-[#DFE1E6] rounded focus:ring-[#0C66E4]"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-[#172B4D] cursor-pointer">
                  このプレイスを公開する
                </label>
              </div>
              <p className="text-xs text-[#5E6C84] mt-2 ml-7">
                公開すると、ユーザーがこのプレイスの情報を閲覧できるようになります
              </p>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.push('/vendor/companies')}
                className="px-6 py-2 bg-white hover:bg-[#F4F5F7] text-[#172B4D] rounded-md border border-[#DFE1E6] transition-all font-medium text-sm"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-md transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '作成中...' : 'プレイスを作成'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
