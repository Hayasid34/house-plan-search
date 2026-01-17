'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // デモモード: どんなユーザー名・パスワードでもログイン可能
    if (username && password) {
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
    //     email: username,
    //     password,
    //   });
    //
    //   if (error) {
    //     setError('ユーザー名またはパスワードが正しくありません');
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

  // Googleでログイン
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    // Supabase環境変数チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Supabase設定がない、または無効な場合はデモモードに
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('undefined') || supabaseUrl.includes('zmojbbvpavnqhekitild')) {
      console.log('Supabase not configured, using demo mode');
      setError('');
      setTimeout(() => {
        router.push('/vendor');
        setGoogleLoading(false);
      }, 500);
      return;
    }

    try {
      const supabase = createClient();

      // Supabaseの設定が完了している場合はOAuth認証を使用
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/vendor`,
        },
      });

      if (error) {
        // Supabase設定がない場合はデモモードとして処理
        console.log('Supabase OAuth unavailable, using demo mode');
        // デモモードとして処理（実際のプロジェクトでは削除してください）
        setTimeout(() => {
          router.push('/vendor');
        }, 500);
        return;
      }
    } catch (err) {
      console.error('Google login error:', err);
      // エラーの場合もデモモードで続行
      setTimeout(() => {
        router.push('/vendor');
      }, 500);
    } finally {
      setGoogleLoading(false);
    }
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
          <p className="text-text-sub">管理画面</p>
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
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-1">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue focus:border-transparent"
                placeholder="admin"
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

          {/* 区切り線 */}
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t border-line-separator"></div>
            <div className="px-4 text-sm text-text-sub">または</div>
            <div className="flex-1 border-t border-line-separator"></div>
          </div>

          {/* Googleログインボタン */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white hover:bg-bg-soft disabled:bg-gray-100 text-text-primary font-medium py-3 rounded-lg border border-line-separator transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? 'ログイン中...' : 'Googleでログイン'}
          </button>

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
