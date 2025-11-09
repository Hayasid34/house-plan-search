import { NextRequest, NextResponse } from 'next/server';
import { toggleFavorite } from '@/lib/plansData';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const plan = await toggleFavorite(id);

    if (!plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { error: 'お気に入りの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
