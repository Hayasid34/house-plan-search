'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // トークンの検証
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('無効なリンクです');
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/validate-token?token=${token}`);
        const data = await response.json();

        if (!response.ok || !data.valid) {
          setError('リンクの有効期限が切れているか、無効です');
          setValidating(false);
          return;
        }

        setEmail(data.email);
        setValidating(false);
      } catch (err) {
        setError('トークンの検証中にエラーが発生しました');
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // パスワードの検証
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'パスワードの更新に失敗しました');
      }

      setMessage('パスワードが正常に更新されました');
      // 3秒後にログイン画面にリダイレクト
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 検証中
  if (validating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">トークンを確認しています...</p>
        </div>
      </div>
    );
  }

  // トークンが無効
  if (error && !email) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <img
              src="/images/dandori-logo.png"
              alt="DandoriWork Logo"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900">ダンドリワーク</h1>
          </div>
          <div className="bg-red-50 border border-red-300 rounded p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← ログイン画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ・ヘッダー */}
        <div className="flex items-center justify-center mb-12">
          <div className="mr-4">
            <img
              src="/images/dandori-logo.png"
              alt="DandoriWork Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '0.05em' }}>
              ダンドリワーク
            </h1>
          </div>
        </div>

        {/* パスワードリセットフォーム */}
        <div className="space-y-6">
          {/* ユーザー名表示 */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">ユーザー名</h2>
            <p className="text-xl font-bold text-gray-900">{email}</p>
          </div>

          {message && (
            <div className="p-4 bg-green-50 border border-green-300 rounded">
              <p className="text-sm text-green-700">{message}</p>
              <p className="text-xs text-green-600 mt-2">
                まもなくログイン画面に移動します...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 新しいパスワード */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-gray-700 mb-2"
              >
                新しいパスワードを入力
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900"
                disabled={loading || !!message}
                minLength={6}
              />
            </div>

            {/* 新しいパスワードの確認 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm text-gray-700 mb-2"
              >
                新しいパスワードの確認
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900"
                disabled={loading || !!message}
                minLength={6}
              />
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-3 rounded transition-colors"
            >
              {loading ? '更新中...' : '登録'}
            </button>
          </form>

          {/* ログインに戻る */}
          {!message && (
            <div className="text-center mt-6">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
                onClick={() => router.push('/login')}
              >
                ← ログイン画面に戻る
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
