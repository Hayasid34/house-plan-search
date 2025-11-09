import { NextRequest, NextResponse } from 'next/server';
import { validateResetToken, deleteResetToken } from '@/lib/resetTokens';
import { updateUserPassword } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // バリデーション
    if (!token || !password) {
      return NextResponse.json(
        { error: 'トークンとパスワードが必要です' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }

    // トークンを検証
    const validation = validateResetToken(token);
    if (!validation.valid || !validation.email) {
      return NextResponse.json(
        { error: 'トークンが無効または期限切れです' },
        { status: 400 }
      );
    }

    // パスワードを更新
    const success = updateUserPassword(validation.email, password);
    if (!success) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // トークンを削除（使用済み）
    deleteResetToken(token);

    return NextResponse.json({
      success: true,
      message: 'パスワードが正常に更新されました',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'パスワードの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
