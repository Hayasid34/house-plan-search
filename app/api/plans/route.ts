import { NextRequest, NextResponse } from 'next/server';
import { searchPlans, getPlan } from '@/lib/plansData';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // IDで検索する場合
    const id = searchParams.get('id');
    if (id) {
      const plan = await getPlan(id);
      return NextResponse.json({
        success: true,
        plans: plan ? [plan] : [],
        count: plan ? 1 : 0,
      });
    }

    // クエリパラメータから検索条件を取得
    const layout = searchParams.get('layout') || undefined;
    const floors = searchParams.get('floors') || undefined;
    const minArea = searchParams.get('minArea')
      ? parseFloat(searchParams.get('minArea')!)
      : undefined;
    const maxArea = searchParams.get('maxArea')
      ? parseFloat(searchParams.get('maxArea')!)
      : undefined;
    const minSiteArea = searchParams.get('minSiteArea')
      ? parseFloat(searchParams.get('minSiteArea')!)
      : undefined;
    const maxSiteArea = searchParams.get('maxSiteArea')
      ? parseFloat(searchParams.get('maxSiteArea')!)
      : undefined;
    const direction = searchParams.get('direction') || undefined;
    const featuresStr = searchParams.get('features');
    const features = featuresStr
      ? featuresStr.split(',').filter(f => f.trim())
      : undefined;
    const favoriteOnly = searchParams.get('favoriteOnly') === 'true';

    // プランを検索
    const plans = await searchPlans({
      layout,
      floors,
      minArea,
      maxArea,
      minSiteArea,
      maxSiteArea,
      direction,
      features,
      favoriteOnly,
    });

    return NextResponse.json({
      success: true,
      plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json(
      { error: 'プランの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
