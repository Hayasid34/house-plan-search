import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ローカルテスト用のデモアカウント
const DEMO_ACCOUNTS = [
  {
    username: 'admin@test.com',
    password: 'password123',
    user: {
      id: 'demo-user-1',
      email: 'admin@test.com',
      name: 'テスト管理者',
      role: 'admin',
      company: {
        id: 'demo-company-1',
        name: 'テスト株式会社',
        cst_number: 'CST001'
      }
    }
  },
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: 'demo-user-2',
      email: 'admin',
      name: '管理者',
      role: 'admin',
      company: {
        id: 'demo-company-1',
        name: 'テスト株式会社',
        cst_number: 'CST001'
      }
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('[LOGIN] Login attempt for:', username);
    console.log('[LOGIN] Supabase URL:', supabaseUrl);
    console.log('[LOGIN] Anon key exists:', !!supabaseAnonKey);

    // バリデーション
    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードを入力してください' },
        { status: 400 }
      );
    }

    // Supabaseが利用できない場合はローカル認証を使用
    let useLocalAuth = false;

    try {
      // 一時的なSupabaseクライアントを作成
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Supabaseで認証（usernameをemailとして使用）
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error || !data.user || !data.session) {
        // ネットワークエラーの場合はローカル認証にフォールバック
        if (error && (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND'))) {
          console.log('[LOGIN] Supabase unavailable, using local auth');
          useLocalAuth = true;
        } else {
          console.error('[LOGIN] Supabase auth error:', error);
          console.error('[LOGIN] Error details:', JSON.stringify(error, null, 2));
          return NextResponse.json(
            { error: 'ユーザー名またはパスワードが正しくありません' },
            { status: 401 }
          );
        }
      } else {
        // Supabase認証成功
        console.log('[LOGIN] Auth successful for user:', data.user.id);

        // 認証済みセッションでaccountsテーブルをクエリ
        const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        // accountsテーブルから追加情報を取得
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('*, companies(*)')
          .eq('id', data.user.id)
          .single();

        if (accountError || !account) {
          console.error('Account fetch error:', accountError);
          return NextResponse.json(
            { error: 'アカウント情報の取得に失敗しました' },
            { status: 500 }
          );
        }

        // レスポンスを作成してクッキーを設定
        const response = NextResponse.json(
          {
            success: true,
            username: data.user.email,
            user: {
              id: data.user.id,
              email: data.user.email,
              name: account.name,
              role: account.role,
              company: account.companies
            }
          },
          { status: 200 }
        );

        // Supabaseのセッショントークンをクッキーに保存
        response.cookies.set('supabase-auth-token', data.session.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: data.session.expires_in,
          path: '/',
        });

        return response;
      }
    } catch (err) {
      console.error('[LOGIN] Network error, falling back to local auth:', err);
      useLocalAuth = true;
    }

    // ローカル認証を使用
    if (useLocalAuth) {
      const account = DEMO_ACCOUNTS.find(
        acc => acc.username === username && acc.password === password
      );

      if (!account) {
        return NextResponse.json(
          { error: 'ユーザー名またはパスワードが正しくありません' },
          { status: 401 }
        );
      }

      console.log('[LOGIN] Local auth successful for:', account.username);

      // セッショントークンを生成
      const sessionToken = Buffer.from(
        `${username}:${Date.now()}:${Math.random()}`
      ).toString('base64');

      // レスポンスを作成してクッキーを設定
      const response = NextResponse.json(
        {
          success: true,
          username: account.user.email,
          user: account.user
        },
        { status: 200 }
      );

      // セッショントークンをクッキーに保存
      response.cookies.set('supabase-auth-token', sessionToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7日間
        path: '/',
      });

      response.cookies.set('session', sessionToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
