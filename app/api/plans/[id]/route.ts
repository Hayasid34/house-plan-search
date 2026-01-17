import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getAuthenticatedUser } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// プラン情報を更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Supabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 認証トークンを取得
    const cookieStore = await cookies();
    const authToken = cookieStore.get('supabase-auth-token');

    if (!authToken) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    // 認証情報を取得（Supabase認証 or ローカル認証）
    const authResult = await getAuthenticatedUser(authToken.value, supabase, supabaseAdmin);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, account } = authResult;

    // 編集権限チェック（admin または editor）
    if (account.role !== 'admin' && account.role !== 'editor') {
      return NextResponse.json(
        { error: 'プランを編集する権限がありません' },
        { status: 403 }
      );
    }

    // プランを取得して会社IDを確認
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('company_id')
      .eq('id', id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    // 同じ会社のプランかチェック
    if (plan.company_id !== account.company_id) {
      return NextResponse.json(
        { error: 'このプランを編集する権限がありません' },
        { status: 403 }
      );
    }

    const updates = await request.json();

    // プラン情報を更新
    const { data: updatedPlan, error: updateError } = await supabaseAdmin
      .from('plans')
      .update({
        layout: updates.layout,
        floors: updates.floors,
        total_area: updates.totalArea,
        direction: updates.direction,
        site_area: updates.siteArea,
        features: updates.features,
        title: `${updates.totalArea || ''}坪 ${updates.layout || ''} ${updates.floors || ''} ${updates.direction || ''}道路`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Plan update error:', updateError);
      return NextResponse.json(
        { error: 'プランの更新に失敗しました' },
        { status: 500 }
      );
    }

    // フォーマット変換して返す
    const formattedPlan = {
      id: updatedPlan.id,
      title: updatedPlan.title,
      layout: updatedPlan.layout,
      floors: updatedPlan.floors,
      totalArea: updatedPlan.total_area,
      direction: updatedPlan.direction,
      siteArea: updatedPlan.site_area,
      features: updatedPlan.features || [],
      pdfPath: updatedPlan.pdf_path,
      originalFilename: updatedPlan.original_filename,
      favorite: updatedPlan.favorite || false,
      createdAt: updatedPlan.created_at,
      updatedAt: updatedPlan.updated_at,
    };

    return NextResponse.json({
      success: true,
      plan: formattedPlan,
    });
  } catch (error) {
    console.error('Plan update error:', error);
    return NextResponse.json(
      { error: 'プランの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Supabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 認証トークンを取得
    const cookieStore = await cookies();
    const authToken = cookieStore.get('supabase-auth-token');

    if (!authToken) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    // 認証情報を取得（Supabase認証 or ローカル認証）
    const authResult = await getAuthenticatedUser(authToken.value, supabase, supabaseAdmin);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, account } = authResult;

    console.log('[DELETE] User:', user.id, 'Role:', account.role, 'Company ID:', account.company_id);

    // 削除権限チェック（admin または editor）
    if (account.role !== 'admin' && account.role !== 'editor') {
      console.log('[DELETE] Role check failed. Role:', account.role);
      return NextResponse.json(
        { error: 'プランを削除する権限がありません' },
        { status: 403 }
      );
    }

    // プランを取得して会社IDとファイルパスを確認
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('company_id, pdf_path')
      .eq('id', id)
      .single();

    if (planError || !plan) {
      console.log('[DELETE] Plan not found. Error:', planError);
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    console.log('[DELETE] Plan company ID:', plan.company_id, 'Account company ID:', account.company_id);

    // 同じ会社のプランかチェック
    if (plan.company_id !== account.company_id) {
      console.log('[DELETE] Company ID mismatch! Plan:', plan.company_id, 'Account:', account.company_id);
      return NextResponse.json(
        { error: 'このプランを削除する権限がありません' },
        { status: 403 }
      );
    }

    // Supabase Storageから削除（PDFファイル）
    try {
      // pdf_pathから実際のファイルパスを抽出
      // 例: "https://xxx.supabase.co/storage/v1/object/public/plan-pdfs/plans/xxx.pdf"
      // -> "plans/xxx.pdf"
      const filePathMatch = plan.pdf_path.match(/plan-pdfs\/(.+)$/);
      if (filePathMatch) {
        const filePath = filePathMatch[1];
        await supabaseAdmin.storage.from('plan-pdfs').remove([filePath]);
      }
    } catch (error) {
      console.error('PDF file deletion error:', error);
      // ファイル削除に失敗してもデータベースからは削除する
    }

    // 関連する図面を取得して削除
    const { data: drawings } = await supabaseAdmin
      .from('drawings')
      .select('file_path')
      .eq('plan_id', id);

    if (drawings && drawings.length > 0) {
      for (const drawing of drawings) {
        try {
          const filePathMatch = drawing.file_path.match(/plan-pdfs\/(.+)$/);
          if (filePathMatch) {
            await supabaseAdmin.storage.from('plan-pdfs').remove([filePathMatch[1]]);
          }
        } catch (error) {
          console.error('Drawing file deletion error:', error);
        }
      }
    }

    // 関連する写真を取得して削除
    const { data: photos } = await supabaseAdmin
      .from('photos')
      .select('file_path')
      .eq('plan_id', id);

    if (photos && photos.length > 0) {
      for (const photo of photos) {
        try {
          const filePathMatch = photo.file_path.match(/plan-pdfs\/(.+)$/);
          if (filePathMatch) {
            await supabaseAdmin.storage.from('plan-pdfs').remove([filePathMatch[1]]);
          }
        } catch (error) {
          console.error('Photo file deletion error:', error);
        }
      }
    }

    // データベースから削除（カスケード削除により関連データも削除される）
    const { error: deleteError } = await supabaseAdmin
      .from('plans')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Plan deletion error:', deleteError);
      return NextResponse.json(
        { error: 'プランの削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'プランを削除しました',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: '削除処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
