import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // レスポンスを作成
    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    });

    // Supabase認証トークンを削除
    response.cookies.delete('supabase-auth-token');

    // 古いセッションクッキーも削除（互換性のため）
    response.cookies.delete('session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'ログアウト処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
