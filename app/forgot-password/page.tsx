'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'パスワードリセットのリクエストに失敗しました');
      }

      setMessage('パスワードリセットのご案内を送信しました。メールをご確認ください。');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードリセットのリクエストに失敗しました');
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
              alt="DandoriWork Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          {/* テキストロゴ */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '0.05em' }}>
              ダンドリワーク
            </h1>
          </div>
        </div>

        {/* パスワードリセットフォーム */}
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              パスワードをお忘れですか？
            </h2>
            <p className="text-sm text-gray-600">
              登録されているメールアドレスを入力してください。
              <br />
              パスワードリセット用のURLをお送りします。
            </p>
          </div>

          {message && (
            <div className="p-4 bg-green-50 border border-green-300 rounded">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-700 mb-2"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="例: user@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900"
                disabled={loading}
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-3 rounded transition-colors"
            >
              {loading ? '送信中...' : '送信'}
            </button>
          </form>

          {/* お問い合わせ */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-3">
              メールアドレスをお忘れの場合は、
              <br />
              お問い合わせください。
            </p>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => window.open('mailto:info@dandoli.jp', '_blank')}
            >
              お問い合わせ
            </button>
          </div>

          {/* ログインに戻る */}
          <div className="text-center mt-6">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => router.push('/login')}
            >
              ← ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
