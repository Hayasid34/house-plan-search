import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // バリデーション
    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードを入力してください' },
        { status: 400 }
      );
    }

    // 一時的なSupabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Supabaseで認証（usernameをemailとして使用）
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error || !data.user || !data.session) {
      console.error('Supabase auth error:', error);
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // 認証済みセッションでaccountsテーブルをクエリ
    // 新しいクライアントにセッションを設定
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
      httpOnly: false,  // クライアントサイドで読み取れるように変更
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.session.expires_in,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
