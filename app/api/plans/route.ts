import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Supabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 認証トークンを取得
    const cookieStore = await cookies();
    const authToken = cookieStore.get('supabase-auth-token');

    if (!authToken) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken.value);

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザーのcompany_idを取得
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: '会社情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // クエリを開始
    let query = supabase
      .from('plans')
      .select('*')
      .eq('company_id', account.company_id);

    // IDで検索する場合
    const id = searchParams.get('id');
    if (id) {
      query = query.eq('id', id);
    }

    // 間取りで絞り込み
    const layout = searchParams.get('layout');
    if (layout && layout !== '-') {
      query = query.eq('layout', layout);
    }

    // 階数で絞り込み
    const floors = searchParams.get('floors');
    if (floors && floors !== '-') {
      query = query.eq('floors', floors);
    }

    // 建物坪数で絞り込み
    const minArea = searchParams.get('minArea');
    if (minArea) {
      query = query.gte('total_area', parseFloat(minArea));
    }
    const maxArea = searchParams.get('maxArea');
    if (maxArea) {
      query = query.lte('total_area', parseFloat(maxArea));
    }

    // 敷地面積で絞り込み
    const minSiteArea = searchParams.get('minSiteArea');
    if (minSiteArea) {
      query = query.gte('site_area', parseFloat(minSiteArea));
    }
    const maxSiteArea = searchParams.get('maxSiteArea');
    if (maxSiteArea) {
      query = query.lte('site_area', parseFloat(maxSiteArea));
    }

    // 進入方向で絞り込み
    const direction = searchParams.get('direction');
    if (direction && direction !== '-') {
      query = query.eq('direction', direction);
    }

    // 特徴で絞り込み（JSONBの配列に含まれているか）
    // 選択されたすべての特徴を持つプランのみを返す（AND条件）
    const featuresStr = searchParams.get('features');
    console.log('🔍 Features query param:', featuresStr);
    if (featuresStr) {
      // 空白をトリムして配列を作成
      const features = featuresStr.split(',').map(f => f.trim()).filter(f => f);
      console.log('🔍 Parsed and trimmed features array:', features);
      if (features.length > 0) {
        // PostgreSQLの@>演算子を使用して、指定されたすべての特徴を含むプランを検索
        // 各特徴に対してfilterを個別に適用することでAND条件を実現
        // JSON.stringifyを使用して日本語文字を正しくエンコード
        for (const feature of features) {
          console.log('🔍 Applying filter for feature:', feature);
          query = query.filter('features', '@>', JSON.stringify([feature]));
        }
      }
    }

    // お気に入りで絞り込み
    const favoriteOnly = searchParams.get('favoriteOnly');
    if (favoriteOnly === 'true') {
      query = query.eq('favorite', true);
    }

    // クエリを実行
    const { data: plans, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Plans fetch error:', error);
      return NextResponse.json(
        { error: 'プランの取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // プランIDのリストを取得
    const planIds = (plans || []).map((p: any) => p.id);

    // 図面と写真を一括取得（N+1クエリを回避）
    const [drawingsResult, photosResult] = await Promise.all([
      planIds.length > 0
        ? supabase
            .from('drawings')
            .select('*')
            .in('plan_id', planIds)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
      planIds.length > 0
        ? supabase
            .from('photos')
            .select('*')
            .in('plan_id', planIds)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] })
    ]);

    // 図面と写真をプランIDごとにグループ化
    const drawingsByPlan = (drawingsResult.data || []).reduce((acc: any, d: any) => {
      if (!acc[d.plan_id]) acc[d.plan_id] = [];
      acc[d.plan_id].push(d);
      return acc;
    }, {});

    const photosByPlan = (photosResult.data || []).reduce((acc: any, p: any) => {
      if (!acc[p.plan_id]) acc[p.plan_id] = [];
      acc[p.plan_id].push(p);
      return acc;
    }, {});

    // プランに図面と写真を統合
    const plansWithDrawings = (plans || []).map((plan: any) => ({
      ...plan,
      drawings: drawingsByPlan[plan.id] || [],
      photos: photosByPlan[plan.id] || []
    }));

    // Supabaseのスネークケースのフィールド名をキャメルケースに変換
    const formattedPlans = plansWithDrawings.map((plan: any) => ({
      id: plan.id,
      title: plan.title || plan.name, // titleがない場合はnameを使用
      layout: plan.layout,
      floors: plan.floors,
      totalArea: plan.total_area,
      direction: plan.direction,
      siteArea: plan.site_area,
      features: plan.features || [],
      pdfPath: plan.pdf_path,
      originalFilename: plan.original_filename,
      favorite: plan.favorite || false,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
      drawings: (plan.drawings || []).map((d: any) => ({
        id: d.id,
        type: d.type,
        filePath: d.file_path,
        originalFilename: d.original_filename,
        uploadedAt: d.created_at
      })),
      photos: (plan.photos || []).map((p: any) => ({
        id: p.id,
        filePath: p.file_path,
        originalFilename: p.original_filename,
        uploadedAt: p.created_at
      }))
    }));

    return NextResponse.json({
      success: true,
      plans: formattedPlans,
      count: formattedPlans.length,
    });
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json(
      { error: 'プランの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
