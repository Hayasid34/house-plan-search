'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { demoCompanies, getMonthlyUsagesByUserId } from '@/lib/demo-data';

interface Account {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'editor' | 'viewer';
  company_id: string;
  company_name: string;
  company_cst_number: string;
  created_at: string;
  last_sign_in: string | null;
}

export default function AccountsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newUserId, setNewUserId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [newCompanyId, setNewCompanyId] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedRole, setEditedRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [editedCompanyId, setEditedCompanyId] = useState('');
  const [changePassword, setChangePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);

  // 検索条件
  const [searchUserId, setSearchUserId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchCompanyId, setSearchCompanyId] = useState('');
  const [searchCompanyName, setSearchCompanyName] = useState('');
  const [showAdminOnly, setShowAdminOnly] = useState(false);
  const [showEditorOnly, setShowEditorOnly] = useState(false);
  const [showViewerOnly, setShowViewerOnly] = useState(false);

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

    // デモ用アカウントデータ（クライアント側の設定ページと同期）
    const demoAccounts = [
      {
        id: 'demo-user-id',
        name: 'デモ太郎',
        email: 'demo@dandori.com',
        phone: '03-1234-5678',
        role: 'admin' as const,
        company_id: demoCompanies[0].id,
        company_name: demoCompanies[0].name,
        company_cst_number: demoCompanies[0].cst_number,
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString(),
      }
    ];
    setAccounts(demoAccounts);
    setFilteredAccounts(demoAccounts);

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
    //
    //   // ダミーデータ（後でSupabaseから取得）
    //   setAccounts([
    //     {
    //       id: user.id,
    //       email: user.email || '',
    //       role: 'admin',
    //       created_at: user.created_at,
    //       last_sign_in: user.last_sign_in_at,
    //     }
    //   ]);
    // };
    //
    // checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/vendor/login');
  };

  // ユーザーIDを自動生成（6桁の数字）
  const generateUserId = () => {
    let userId: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      // 100000から999999までのランダムな6桁の数字を生成
      userId = String(Math.floor(100000 + Math.random() * 900000));
      attempts++;
    } while (accounts.some(acc => acc.id === userId) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      alert('ユーザーIDの生成に失敗しました。もう一度お試しください。');
      return;
    }

    setNewUserId(userId);
  };

  const handleSearch = () => {
    let filtered = [...accounts];

    // ユーザーID検索
    if (searchUserId.trim()) {
      filtered = filtered.filter(acc =>
        acc.id.toLowerCase().includes(searchUserId.toLowerCase())
      );
    }

    // 電話番号検索
    if (searchPhone.trim()) {
      filtered = filtered.filter(acc =>
        acc.phone.toLowerCase().includes(searchPhone.toLowerCase())
      );
    }

    // ユーザー名検索
    if (searchName.trim()) {
      filtered = filtered.filter(acc =>
        acc.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // メールアドレス検索
    if (searchEmail.trim()) {
      filtered = filtered.filter(acc =>
        acc.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // 会社ID検索
    if (searchCompanyId.trim()) {
      filtered = filtered.filter(acc =>
        acc.company_id.toLowerCase().includes(searchCompanyId.toLowerCase())
      );
    }

    // 会社名検索
    if (searchCompanyName.trim()) {
      filtered = filtered.filter(acc =>
        acc.company_name.toLowerCase().includes(searchCompanyName.toLowerCase())
      );
    }

    // 権限フィルター
    if (showAdminOnly || showEditorOnly || showViewerOnly) {
      filtered = filtered.filter(acc => {
        if (showAdminOnly && acc.role === 'admin') return true;
        if (showEditorOnly && acc.role === 'editor') return true;
        if (showViewerOnly && acc.role === 'viewer') return true;
        return false;
      });
    }

    setFilteredAccounts(filtered);
  };

  const handleClearSearch = () => {
    setSearchUserId('');
    setSearchPhone('');
    setSearchName('');
    setSearchEmail('');
    setSearchCompanyId('');
    setSearchCompanyName('');
    setShowAdminOnly(false);
    setShowEditorOnly(false);
    setShowViewerOnly(false);
    setFilteredAccounts(accounts);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserId) {
      alert('ユーザーIDを入力または自動生成してください。');
      return;
    }

    if (newUserId.length !== 6 || !/^\d{6}$/.test(newUserId)) {
      alert('ユーザーIDは6桁の数字で入力してください。');
      return;
    }

    if (accounts.some(acc => acc.id === newUserId)) {
      alert('このユーザーIDは既に使用されています。');
      return;
    }

    if (!newCompanyId) {
      alert('所属プレイスを選択してください。');
      return;
    }

    const selectedCompany = demoCompanies.find(c => c.id === newCompanyId);
    if (!selectedCompany) {
      alert('選択されたプレイスが見つかりません。');
      return;
    }

    // TODO: API Routeを使用してアカウント作成（クライアント側と同期）
    const newAccount: Account = {
      id: newUserId,
      name: newName,
      email: newEmail,
      phone: newPhone,
      role: newRole,
      company_id: selectedCompany.id,
      company_name: selectedCompany.name,
      company_cst_number: selectedCompany.cst_number,
      created_at: new Date().toISOString(),
      last_sign_in: null,
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    setFilteredAccounts(updatedAccounts);
    alert('アカウントを作成しました。（デモモードでは実際には保存されません）');

    setShowCreateModal(false);
    setNewUserId('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setNewRole('editor');
    setNewCompanyId('');
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setEditedName(account.name);
    setEditedEmail(account.email);
    setEditedPhone(account.phone);
    setEditedRole(account.role);
    setEditedCompanyId(account.company_id);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAccount) return;

    if (!editedCompanyId) {
      alert('所属プレイスを選択してください。');
      return;
    }

    const selectedCompany = demoCompanies.find(c => c.id === editedCompanyId);
    if (!selectedCompany) {
      alert('選択されたプレイスが見つかりません。');
      return;
    }

    // TODO: API Routeを使用してアカウント更新（クライアント側と同期）
    const updatedAccounts = accounts.map(acc =>
      acc.id === editingAccount.id
        ? {
            ...acc,
            name: editedName,
            email: editedEmail,
            phone: editedPhone,
            role: editedRole,
            company_id: selectedCompany.id,
            company_name: selectedCompany.name,
            company_cst_number: selectedCompany.cst_number,
          }
        : acc
    );

    setAccounts(updatedAccounts);
    setFilteredAccounts(updatedAccounts);

    alert('アカウント情報を更新しました。（デモモードでは実際には保存されません）');

    setShowEditModal(false);
    setEditingAccount(null);
  };

  const handleChangePassword = (account: Account) => {
    setEditingAccount(account);
    setChangePassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!editingAccount) return;

    if (changePassword !== confirmPassword) {
      alert('パスワードが一致しません。');
      return;
    }

    if (changePassword.length < 8) {
      alert('パスワードは8文字以上で入力してください。');
      return;
    }

    // TODO: API Routeを使用してパスワード更新
    alert('パスワードを更新しました。（デモモードでは実際には保存されません）');

    setShowPasswordModal(false);
    setEditingAccount(null);
    setChangePassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('このアカウントを削除しますか？')) return;

    // TODO: API Routeを使用してアカウント削除（クライアント側と同期）
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    setFilteredAccounts(updatedAccounts);
    alert('アカウントを削除しました。（デモモードでは実際には削除されません）');
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
                  className="w-full flex items-center gap-3 px-3 py-2 text-left bg-[#E9F2FF] text-[#0C66E4] rounded-md font-medium text-sm"
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#172B4D]">アカウント管理</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-md flex items-center gap-2 transition-colors font-medium text-sm shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規アカウント作成
            </button>
          </div>

          {/* 検索フォーム */}
          <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-[#172B4D] mb-4">アカウント検索</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  ユーザーID
                </label>
                <input
                  type="text"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                  placeholder="ユーザーIDで検索"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  電話番号
                </label>
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                  placeholder="電話番号で検索"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                  placeholder="ユーザー名で検索"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  メールアドレス
                </label>
                <input
                  type="text"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                  placeholder="メールアドレスで検索"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  会社ID
                </label>
                <input
                  type="text"
                  value={searchCompanyId}
                  onChange={(e) => setSearchCompanyId(e.target.value)}
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                  placeholder="会社IDで検索"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172B4D] mb-1">
                  会社名
                </label>
                <input
                  type="text"
                  value={searchCompanyName}
                  onChange={(e) => setSearchCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#DFE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C66E4] text-sm"
                  placeholder="会社名で検索"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#172B4D] mb-2">
                ユーザーレベル
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAdminOnly}
                    onChange={(e) => setShowAdminOnly(e.target.checked)}
                    className="w-4 h-4 text-[#0C66E4] border-[#DFE1E6] rounded focus:ring-2 focus:ring-[#0C66E4]"
                  />
                  <span className="text-sm text-[#172B4D]">管理者</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEditorOnly}
                    onChange={(e) => setShowEditorOnly(e.target.checked)}
                    className="w-4 h-4 text-[#0C66E4] border-[#DFE1E6] rounded focus:ring-2 focus:ring-[#0C66E4]"
                  />
                  <span className="text-sm text-[#172B4D]">編集者</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showViewerOnly}
                    onChange={(e) => setShowViewerOnly(e.target.checked)}
                    className="w-4 h-4 text-[#0C66E4] border-[#DFE1E6] rounded focus:ring-2 focus:ring-[#0C66E4]"
                  />
                  <span className="text-sm text-[#172B4D]">閲覧者</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-md flex items-center gap-2 transition-colors font-medium text-sm shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                検索
              </button>
              <button
                onClick={handleClearSearch}
                className="px-6 py-2 bg-white hover:bg-[#F4F5F7] text-[#172B4D] rounded-md border border-[#DFE1E6] transition-colors font-medium text-sm"
              >
                クリア
              </button>
            </div>
          </div>

          {/* アカウント一覧 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#DFE1E6] hover:shadow-md transition-shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F7F8F9] border-b border-[#DFE1E6]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">氏名</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">ユーザーID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">メールアドレス</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">所属プレイス</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">連絡先</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">権限</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">今月の利用</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">最終ログイン</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#172B4D]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {filteredAccounts.map((account) => {
                  // 今月の利用状況を取得
                  const now = new Date();
                  const currentYear = now.getFullYear();
                  const currentMonth = now.getMonth() + 1;
                  const usages = getMonthlyUsagesByUserId(account.id);
                  const currentMonthUsage = usages.find(
                    u => u.year === currentYear && u.month === currentMonth
                  );
                  const planCount = currentMonthUsage?.plan_registrations || 0;
                  const sitePlanCount = currentMonthUsage?.site_plan_registrations || 0;

                  return (
                    <tr key={account.id} className="hover:bg-[#F4F5F7] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#172B4D] font-medium">{account.name}</td>
                      <td className="px-6 py-4 text-sm text-[#5E6C84]">{account.id}</td>
                      <td className="px-6 py-4 text-sm text-[#172B4D]">{account.email}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#172B4D] font-medium">{account.company_name}</div>
                        <div className="text-xs text-[#5E6C84]">CST: {account.company_cst_number}</div>
                      </td>
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
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#172B4D]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#0C66E4] font-medium">プラン: {planCount}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#00875A] font-medium">敷地: {sitePlanCount}</span>
                          </div>
                        </div>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* アカウント作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-primary mb-4">新規アカウント作成</h3>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  ユーザーID（6桁の数字） <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    className="flex-1 px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                    placeholder="123456"
                  />
                  <button
                    type="button"
                    onClick={generateUserId}
                    className="px-4 py-2 bg-[#0C66E4] hover:bg-[#0055CC] text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    自動生成
                  </button>
                </div>
                <p className="text-xs text-[#5E6C84] mt-1">
                  ダンドリワークに登録済みの方は既存のIDを入力してください
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
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
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  連絡先
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  placeholder="03-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                  placeholder="8文字以上"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  所属プレイス <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                >
                  <option value="">選択してください</option>
                  {demoCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} (CST: {company.cst_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  権限
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'editor' | 'viewer')}
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
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-bg-soft hover:bg-bg-medium text-text-primary rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white rounded-lg transition-colors"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  所属プレイス <span className="text-red-500">*</span>
                </label>
                <select
                  value={editedCompanyId}
                  onChange={(e) => setEditedCompanyId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue"
                >
                  <option value="">選択してください</option>
                  {demoCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} (CST: {company.cst_number})
                    </option>
                  ))}
                </select>
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
                  value={changePassword}
                  onChange={(e) => setChangePassword(e.target.value)}
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
                    setChangePassword('');
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
    </div>
  );
}
