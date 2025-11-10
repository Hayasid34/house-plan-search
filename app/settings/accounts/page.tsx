'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMonthlyUsagesByUserId } from '@/lib/demo-data';

interface Account {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  last_sign_in: string | null;
}

export default function AccountsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contractAccountLimit] = useState(10); // 契約アカウント数（デフォルト10）
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedRole, setEditedRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // アカウント作成依頼用のフォームデータ
  const [requestCompanyName, setRequestCompanyName] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestPhone, setRequestPhone] = useState('');

  useEffect(() => {
    // デモモード: 認証は既にTOP画面で確認済み
    // デモ用アカウントデータ
    setAccounts([
      {
        id: 'demo-user-id',
        name: 'デモ太郎',
        email: 'demo@dandori.com',
        phone: '03-1234-5678',
        role: 'admin',
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString(),
      }
    ]);

    setLoading(false);
  }, [router]);

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setEditedName(account.name);
    setEditedEmail(account.email);
    setEditedPhone(account.phone);
    setEditedRole(account.role);
    setShowEditModal(true);
  };

  const handleChangePassword = (account: Account) => {
    setEditingAccount(account);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAccount) return;

    // TODO: API Routeを使用してアカウント更新（ベンダー側のデータと同期）
    // 更新されたデータを反映
    setAccounts(prevAccounts =>
      prevAccounts.map(acc =>
        acc.id === editingAccount.id
          ? { ...acc, name: editedName, email: editedEmail, phone: editedPhone, role: editedRole }
          : acc
      )
    );

    alert('アカウント情報を更新しました。（デモモードでは実際には保存されません）');

    setShowEditModal(false);
    setEditingAccount(null);
  };

  const handleSavePassword = async () => {
    if (!editingAccount) return;

    if (newPassword !== confirmPassword) {
      alert('パスワードが一致しません。');
      return;
    }

    if (newPassword.length < 8) {
      alert('パスワードは8文字以上で入力してください。');
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${editingAccount.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'パスワードの更新に失敗しました');
      }

      alert('パスワードを更新しました。');

      setShowPasswordModal(false);
      setEditingAccount(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      alert(error instanceof Error ? error.message : 'パスワードの更新に失敗しました。');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('このアカウントを削除しますか？')) return;

    // TODO: API Routeを使用してアカウント削除（ベンダー側のデータと同期）
    setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== accountId));
    alert('アカウントを削除しました。（デモモードでは実際には削除されません）');
  };

  const handleRequestNewAccount = () => {
    setShowRequestModal(true);
  };

  const handleAccountRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // APIにPOSTリクエストを送信
      const response = await fetch('/api/account-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: requestCompanyName,
          name: requestName,
          email: requestEmail,
          phone: requestPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'メール送信に失敗しました');
      }

      alert('アカウント作成依頼を送信しました。担当者から連絡をお待ちください。');

      // モーダルを閉じてフォームをリセット
      setShowRequestModal(false);
      setRequestCompanyName('');
      setRequestName('');
      setRequestEmail('');
      setRequestPhone('');
    } catch (error) {
      console.error('Account request error:', error);
      alert(error instanceof Error ? error.message : 'メール送信に失敗しました。しばらくしてから再度お試しください。');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者';
      case 'editor':
        return '編集者';
      case 'viewer':
        return '閲覧者';
      default:
        return '不明';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F9] flex items-center justify-center">
        <p className="text-[#5E6C84]">読み込み中...</p>
      </div>
    );
  }

  const usedAccounts = accounts.length;
  const remainingAccounts = contractAccountLimit - usedAccounts;

  return (
    <div className="min-h-screen bg-[#F7F8F9]">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-[#DFE1E6]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
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
              </div>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#44546F] hover:text-[#172B4D] font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-colors text-sm"
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
        <aside className="w-64 bg-white border-r border-[#DFE1E6] min-h-[calc(100vh-73px)]">
          <nav className="p-3">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => router.push('/settings/company')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-[#44546F] hover:bg-[#F4F5F7] rounded-md transition-colors font-medium text-sm"
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
                  className="w-full flex items-center gap-3 px-3 py-2 text-left bg-[#E9F2FF] text-[#0C66E4] rounded-md font-medium text-sm"
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#172B4D]">アカウント管理</h2>
            <button
              onClick={handleRequestNewAccount}
              className="px-4 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-md flex items-center gap-2 transition-colors font-medium text-sm shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規アカウント作成を依頼
            </button>
          </div>

          {/* アカウント数カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5E6C84] text-sm mb-2 font-medium">契約アカウント数</p>
                  <p className="text-3xl font-bold text-[#0C66E4]">{contractAccountLimit}</p>
                </div>
                <div className="w-12 h-12 bg-[#E9F2FF] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0C66E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5E6C84] text-sm mb-2 font-medium">利用中アカウント数</p>
                  <p className="text-3xl font-bold text-[#00875A]">{usedAccounts}</p>
                </div>
                <div className="w-12 h-12 bg-[#DFFCF0] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00875A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5E6C84] text-sm mb-2 font-medium">残りアカウント数</p>
                  <p className={`text-3xl font-bold ${remainingAccounts > 0 ? 'text-[#172B4D]' : 'text-[#DE350B]'}`}>
                    {remainingAccounts}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${remainingAccounts > 0 ? 'bg-[#F4F5F7]' : 'bg-[#FFEBE6]'}`}>
                  <svg className={`w-6 h-6 ${remainingAccounts > 0 ? 'text-[#44546F]' : 'text-[#DE350B]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              {remainingAccounts === 0 && (
                <p className="text-xs text-[#DE350B] mt-2">
                  ⚠️ アカウント数の上限に達しています
                </p>
              )}
            </div>
          </div>

          {/* 利用状況 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow overflow-hidden mb-6">
            <div className="p-4 border-b border-[#DFE1E6]">
              <h3 className="text-lg font-bold text-[#172B4D]">利用状況</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F7F8F9] border-b border-[#DFE1E6]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">年月</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">プラン登録数</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">敷地計画登録数</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-[#172B4D]">合計</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {(() => {
                    const currentUserId = accounts.length > 0 ? accounts[0].id : 'demo-user-id';
                    const usages = getMonthlyUsagesByUserId(currentUserId);
                    const sortedUsages = usages.sort((a, b) => {
                      if (a.year !== b.year) return b.year - a.year;
                      return b.month - a.month;
                    });

                    if (sortedUsages.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-[#5E6C84]">
                            利用データがありません
                          </td>
                        </tr>
                      );
                    }

                    return sortedUsages.map((usage) => {
                      const total = usage.plan_registrations + usage.site_plan_registrations;
                      return (
                        <tr key={usage.id} className="hover:bg-[#F4F5F7] transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-[#172B4D]">
                              {usage.year}年{usage.month}月
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-medium text-[#0C66E4]">
                              {usage.plan_registrations}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-medium text-[#00875A]">
                              {usage.site_plan_registrations}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-semibold text-[#172B4D]">
                              {total}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* アカウント一覧 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4 border-b border-[#DFE1E6]">
              <h3 className="text-lg font-bold text-[#172B4D]">アカウント一覧</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F7F8F9] border-b border-[#DFE1E6]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">氏名</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">メールアドレス</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">連絡先</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">権限</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">最終ログイン</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-[#F4F5F7] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#172B4D] font-medium">{account.name}</td>
                      <td className="px-6 py-4 text-sm text-[#172B4D]">{account.email}</td>
                      <td className="px-6 py-4 text-sm text-[#5E6C84]">{account.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.role === 'admin'
                            ? 'bg-[#F3F0FF] text-[#6554C0]'
                            : account.role === 'editor'
                            ? 'bg-[#E9F2FF] text-[#0C66E4]'
                            : 'bg-[#F4F5F7] text-[#44546F]'
                        }`}>
                          {getRoleLabel(account.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5E6C84]">
                        {account.last_sign_in ? new Date(account.last_sign_in).toLocaleDateString('ja-JP') : '未ログイン'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 text-sm text-[#0C66E4] hover:bg-[#E9F2FF] rounded-md transition-colors font-medium"
                            onClick={() => handleEditAccount(account)}
                          >
                            編集
                          </button>
                          <button
                            className="px-3 py-1 text-sm text-[#00875A] hover:bg-[#DFFCF0] rounded-md transition-colors font-medium"
                            onClick={() => handleChangePassword(account)}
                          >
                            パスワード変更
                          </button>
                          {account.role !== 'admin' && (
                            <button
                              className="px-3 py-1 text-sm text-[#DE350B] hover:bg-[#FFEBE6] rounded-md transition-colors font-medium"
                              onClick={() => handleDeleteAccount(account.id)}
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {accounts.length === 0 && (
              <div className="p-8 text-center text-[#5E6C84]">
                アカウントがありません。
              </div>
            )}
          </div>

          {/* 注意事項 */}
          <div className="mt-6 bg-[#E9F2FF] border border-[#B3D4FF] rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-[#0C66E4] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-[#172B4D]">
                <p className="font-semibold mb-1">アカウント管理について</p>
                <ul className="list-disc list-inside space-y-1 text-[#44546F]">
                  <li>新しいアカウントの作成はベンダー管理画面で行われます</li>
                  <li>「新規アカウント作成を依頼」ボタンからリクエストを送信できます</li>
                  <li>作成されたアカウントの情報編集・パスワード変更・削除はこの画面から行えます</li>
                  <li>契約アカウント数を増やす場合は、ベンダーにお問い合わせください</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 編集モーダル */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-primary mb-4">アカウント編集</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  連絡先
                </label>
                <input
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  placeholder="03-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  権限
                </label>
                <select
                  value={editedRole}
                  onChange={(e) => setEditedRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                >
                  <option value="admin">管理者</option>
                  <option value="editor">編集者</option>
                  <option value="viewer">閲覧者</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-bg-soft hover:bg-bg-medium text-text-primary rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white rounded-lg transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* パスワード変更モーダル */}
      {showPasswordModal && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-primary mb-4">パスワード変更</h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-text-primary">
                <span className="font-medium">{editingAccount.name}</span> のパスワードを変更します
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  新しいパスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  placeholder="8文字以上"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  新しいパスワード（確認） <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  placeholder="もう一度入力"
                />
              </div>

              <div className="text-xs text-text-sub">
                <p>パスワードの要件:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>8文字以上</li>
                  <li>英数字を含めることを推奨</li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2 bg-bg-soft hover:bg-bg-medium text-text-primary rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSavePassword}
                  className="flex-1 px-4 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white rounded-lg transition-colors"
                >
                  パスワード変更
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* アカウント作成依頼モーダル */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#172B4D] mb-4">アカウント作成依頼</h3>
            <p className="text-sm text-[#5E6C84] mb-6">
              以下の情報を入力して「依頼メールを送信」ボタンを押すと、メールクライアントが開きます。
            </p>
            <form onSubmit={handleAccountRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  会社名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={requestCompanyName}
                  onChange={(e) => setRequestCompanyName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4]"
                  placeholder="株式会社◯◯"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4]"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4]"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  連絡先 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={requestPhone}
                  onChange={(e) => setRequestPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4]"
                  placeholder="03-1234-5678"
                />
              </div>

              <div className="bg-[#F4F5F7] p-3 rounded-md">
                <p className="text-xs text-[#5E6C84]">
                  送信先: cs.group@dandori-work.com
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestCompanyName('');
                    setRequestName('');
                    setRequestEmail('');
                    setRequestPhone('');
                  }}
                  className="flex-1 px-4 py-2 bg-white hover:bg-[#F4F5F7] text-[#172B4D] rounded-md border border-[#DFE1E6] transition-colors font-medium text-sm"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-md transition-colors font-medium text-sm"
                >
                  依頼メールを送信
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
