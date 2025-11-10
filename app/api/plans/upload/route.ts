import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const layout = formData.get('layout') as string;
    const floors = formData.get('floors') as string;
    const totalArea = parseFloat(formData.get('totalArea') as string);
    const direction = formData.get('direction') as string;
    const siteArea = parseFloat(formData.get('siteArea') as string);
    const featuresStr = formData.get('features') as string;
    const features = JSON.parse(featuresStr || '[]');

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // Supabaseクライアントを作成（認証チェック用）
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // サービスロールクライアントを作成（ストレージ操作用）
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 認証トークンを取得してセッションを設定
    const cookieStore = await cookies();
    const authToken = cookieStore.get('supabase-auth-token');

    if (!authToken) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // セッションを設定
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

    // PDFファイルをSupabase Storageにアップロード（サービスロールキーを使用）
    const timestamp = Date.now();
    // ファイル名をURLセーフに変換（日本語や特殊文字を削除）
    const safeFileName = file.name
      .replace(/[^\w\s.-]/gi, '_') // 特殊文字をアンダースコアに置き換え
      .replace(/\s+/g, '_');         // スペースをアンダースコアに置き換え
    const fileName = `${timestamp}_${safeFileName}`;
    const fileBuffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('plan-pdfs')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      );
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('plan-pdfs')
      .getPublicUrl(fileName);

    // plansテーブルにデータを保存（サービスロールキーを使用）
    const { data: newPlan, error: insertError } = await supabaseAdmin
      .from('plans')
      .insert({
        company_id: account.company_id,
        name: title, // 既存のnameカラムに値を設定
        title,
        layout,
        floors,
        total_area: totalArea,
        direction,
        site_area: siteArea,
        features,
        pdf_path: publicUrl,
        original_filename: file.name,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // アップロードしたファイルを削除
      await supabaseAdmin.storage.from('plan-pdfs').remove([fileName]);
      return NextResponse.json(
        { error: 'データの保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: newPlan,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'アップロード処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ファイルサイズ制限を設定（50MB）
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};
