'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ログインに失敗しました');
      }

      // ログイン成功 - トップページにリダイレクト
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ・ヘッダー */}
        <div className="flex items-center justify-center mb-12">
          {/* ダンドリワークのカラフルなロゴマーク */}
          <div className="mr-4">
            <img
              src="/images/dandori-logo.png"
              alt="DandoriFinder Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          {/* テキストロゴ */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '0.05em' }}>
              DandoriFinder
            </h1>
          </div>
        </div>

        {/* ログインフォーム */}
        <div className="space-y-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ユーザー名 */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-gray-700 mb-2"
              >
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900"
                disabled={loading}
              />
            </div>

            {/* パスワード */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-gray-700 mb-2"
              >
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900 pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700"
                  onClick={() => router.push('/forgot-password')}
                >
                  パスワードを忘れた方は？
                </button>
              </div>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-3 rounded transition-colors"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          {/* 新規登録リンク */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => alert('新規登録機能は実装されていません')}
            >
              新規登録はこちら
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
