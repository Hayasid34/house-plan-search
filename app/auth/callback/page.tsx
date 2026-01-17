'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // URLからコードを取得してセッションを交換
        const { data: sessionData, error } = await supabase.auth.getSession();

        if (error || !sessionData.session) {
          console.error('Auth callback error:', error);
          router.push('/login');
          return;
        }

        const user = sessionData.session.user;

        // アカウント情報を取得して会社紐付けチェック
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('id, company_id')
          .eq('id', user.id)
          .single();

        if (accountError) {
          console.error('Account fetch error:', accountError);
          // アカウント情報が取得できない場合もログインエラーへ
          router.push('/login');
          return;
        }

        // 会社が紐付いていない場合は会社選択画面へ
        if (!account.company_id) {
          const next = searchParams.get('next') || '/search';
          router.push(`/auth/company-select?next=${encodeURIComponent(next)}`);
          return;
        }

        // 会社が紐付いている場合は指定先へリダイレクト
        const next = searchParams.get('next') || '/search';
        router.push(next);
      } catch (err) {
        console.error('Callback processing error:', err);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-dw-blue border-t-transparent"></div>
        <p className="mt-4 text-text-sub">認証処理中...</p>
      </div>
    </div>
  );
}
