'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // デモモード: どんなメールアドレス・パスワードでもログイン可能
    if (email && password) {
      // 少し待機してログイン処理を模擬
      setTimeout(() => {
        router.push('/vendor');
      }, 500);
      return;
    }

    // 本番環境では以下のコメントを解除してください
    // try {
    //   const supabase = createClient();
    //   const { data, error } = await supabase.auth.signInWithPassword({
    //     email,
    //     password,
    //   });
    //
    //   if (error) {
    //     setError('メールアドレスまたはパスワードが正しくありません');
    //     setLoading(false);
    //     return;
    //   }
    //
    //   // ログイン成功 - ダッシュボードへリダイレクト
    //   router.push('/vendor');
    //   router.refresh();
    // } catch (err) {
    //   setError('ログインに失敗しました');
    //   setLoading(false);
    // }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <img
            src="/images/dandori-logo.png"
            alt="DandoriFinder Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            DandoriFinder
          </h1>
          <p className="text-text-sub">ベンダー管理画面</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-line-separator">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            ログイン
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-dw-blue hover:bg-dw-blue-hover text-white font-medium rounded-lg transition-colors disabled:bg-button-disable disabled:cursor-not-allowed"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-dw-blue hover:text-dw-blue-hover transition-colors"
            >
              パスワードをお忘れですか？
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-text-sub">
          <p>&copy; 2024 DandoriFinder. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
