import { NextRequest, NextResponse } from 'next/server';
import { getUsernameFromRequest } from '@/lib/auth';
import { getUserByUsername } from '@/lib/users';

export async function GET(request: NextRequest) {
  try {
    const username = getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const user = getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // パスワードを除いたユーザー情報を返す
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
