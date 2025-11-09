import { NextRequest, NextResponse } from 'next/server';
import { getUsernameFromRequest } from '@/lib/auth';
import { authenticateUser, updateUserPasswordByUsername } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    // セッションからユーザー名を取得
    const username = getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // バリデーション
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '現在のパスワードと新しいパスワードを入力してください' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新しいパスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }

    // 現在のパスワードを検証
    const user = authenticateUser(username, currentPassword);
    if (!user) {
      return NextResponse.json(
        { error: '現在のパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // パスワードを更新
    const success = updateUserPasswordByUsername(username, newPassword);
    if (!success) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'パスワードが正常に更新されました',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'パスワード変更中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
