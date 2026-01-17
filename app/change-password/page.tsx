'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthClient } from '@/lib/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 認証チェック
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = checkAuthClient();
      if (!isAuth) {
        router.push('/login');
      } else {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // バリデーション
    if (newPassword.length < 6) {
      setError('新しいパスワードは6文字以上で入力してください');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }

    if (currentPassword === newPassword) {
      setError('現在のパスワードと同じパスワードは設定できません');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'パスワードの変更に失敗しました');
      }

      setMessage('パスワードが正常に変更されました');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // 3秒後にトップページにリダイレクト
      setTimeout(() => {
        router.push('/search');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードの変更に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 認証チェック中
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-dw-blue border-t-transparent"></div>
          <p className="mt-4 text-text-sub">認証確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-line-separator">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/search')}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src="/images/dandori-logo.png"
                alt="DandoriFinder Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <div className="text-left">
                <h1 className="text-3xl font-bold text-text-primary">
                  DandoriFinder
                </h1>
                <p className="mt-2 text-text-sub">
                  過去の住宅プランを簡単に検索・閲覧できます
                </p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-line-separator p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            パスワード変更
          </h2>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded">
              <p className="text-sm text-green-700">{message}</p>
              <p className="text-xs text-green-600 mt-2">
                まもなくトップページに移動します...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 現在のパスワード */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-text-sub mb-2"
              >
                現在のパスワード
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent"
                disabled={loading || !!message}
              />
            </div>

            {/* 新しいパスワード */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-text-sub mb-2"
              >
                新しいパスワード
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent"
                disabled={loading || !!message}
              />
              <p className="mt-1 text-xs text-text-disable">
                6文字以上で入力してください
              </p>
            </div>

            {/* 新しいパスワード（確認） */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text-sub mb-2"
              >
                新しいパスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent"
                disabled={loading || !!message}
              />
            </div>

            {/* ボタン */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !!message}
                className="flex-1 bg-dw-blue hover:bg-dw-blue-hover disabled:bg-gray-300 text-white font-medium py-3 rounded-md transition-colors"
              >
                {loading ? '変更中...' : 'パスワードを変更'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/search')}
                className="px-6 py-3 border-2 border-line-dark text-text-sub rounded-md font-medium hover:bg-bg-soft transition-colors"
                disabled={loading}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
