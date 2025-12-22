import { NextRequest, NextResponse } from 'next/server';

// ローカルテスト用の簡易認証
// Supabaseが使えない場合のフォールバック

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

    console.log('[LOCAL LOGIN] Login attempt for:', username);

    // バリデーション
    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードを入力してください' },
        { status: 400 }
      );
    }

    // デモアカウントで認証
    const account = DEMO_ACCOUNTS.find(
      acc => acc.username === username && acc.password === password
    );

    if (!account) {
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    console.log('[LOCAL LOGIN] Auth successful for:', account.username);

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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
