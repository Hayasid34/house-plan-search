import { NextRequest, NextResponse } from 'next/server';
import { validateResetToken } from '@/lib/resetTokens';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'トークンが指定されていません' },
        { status: 400 }
      );
    }

    const validation = validateResetToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: 'トークンが無効または期限切れです' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: validation.email,
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'トークンの検証中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
