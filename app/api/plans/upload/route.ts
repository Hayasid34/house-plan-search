import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { generatePDFThumbnail } from '@/lib/pdfThumbnail';

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

    let user: any;
    let account: any;

    // Supabaseトークンかローカル認証トークンかを判定
    try {
      // まずSupabase認証を試す
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(authToken.value);

      if (!authError && supabaseUser) {
        // Supabase認証成功
        user = supabaseUser;

        // ユーザーのcompany_idを取得
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (accountError || !accountData) {
          return NextResponse.json(
            { error: '会社情報の取得に失敗しました' },
            { status: 500 }
          );
        }

        account = accountData;
      } else {
        // ローカル認証トークン（demo/demo123など）
        // Supabaseから最初のcompanyを取得
        const { data: companies, error: companyError } = await supabaseAdmin
          .from('companies')
          .select('id')
          .limit(1)
          .single();

        if (companyError || !companies) {
          return NextResponse.json(
            { error: 'デモ用の会社情報が見つかりません。Supabaseに会社データを作成してください。' },
            { status: 500 }
          );
        }

        user = {
          id: 'demo-user-0',
          email: 'demo@example.com'
        };
        account = {
          company_id: companies.id
        };
      }
    } catch (error) {
      // ローカル認証トークンの場合
      // Supabaseから最初のcompanyを取得
      const { data: companies, error: companyError } = await supabaseAdmin
        .from('companies')
        .select('id')
        .limit(1)
        .single();

      if (companyError || !companies) {
        return NextResponse.json(
          { error: 'デモ用の会社情報が見つかりません。Supabaseに会社データを作成してください。' },
          { status: 500 }
        );
      }

      user = {
        id: 'demo-user-0',
        email: 'demo@example.com'
      };
      account = {
        company_id: companies.id
      };
    }

    // PDFファイルをSupabase Storageにアップロード（サービスロールキーを使用）
    const timestamp = Date.now();
    // Supabase Storageは日本語ファイル名をサポートしないため、英数字とハイフン・アンダースコアのみに変換
    // ただし、original_filenameには元のファイル名を保存するので、表示は問題なし
    const safeFileName = file.name
      .replace(/[^\w.-]/g, '_')   // 英数字、ドット、ハイフン、アンダースコア以外を置き換え
      .replace(/\s+/g, '_');       // スペースをアンダースコアに置き換え
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

    // サムネイルを生成
    let thumbnailUrl: string | null = null;
    try {
      console.log('Generating PDF thumbnail...');
      const thumbnailBuffer = await generatePDFThumbnail(fileBuffer, { width: 400 });

      // サムネイルをStorageにアップロード
      const thumbnailFileName = `${timestamp}_${safeFileName.replace('.pdf', '')}_thumb.png`;
      const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabaseAdmin
        .storage
        .from('plan-thumbnails')
        .upload(thumbnailFileName, thumbnailBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (thumbnailUploadError) {
        console.error('Thumbnail upload error:', thumbnailUploadError);
        // サムネイルアップロードが失敗してもPDFアップロードは続行
      } else {
        // サムネイルの公開URLを取得
        const { data: { publicUrl: thumbPublicUrl } } = supabaseAdmin
          .storage
          .from('plan-thumbnails')
          .getPublicUrl(thumbnailFileName);
        thumbnailUrl = thumbPublicUrl;
        console.log('Thumbnail generated successfully:', thumbnailUrl);
      }
    } catch (thumbnailError) {
      console.error('Thumbnail generation error:', thumbnailError);
      // サムネイル生成が失敗してもPDFアップロードは続行
    }

    // plansテーブルにデータを保存（サービスロールキーを使用）
    // ローカル認証の場合、created_byをnullにする（UUIDエラーを回避）
    const createdBy = user.id.startsWith('demo-') ? null : user.id;

    const { data: newPlan, error: insertError } = await supabaseAdmin
      .from('plans')
      .insert({
        company_id: account.company_id,
        name: title, // nameカラムに値を設定
        title,
        layout,
        floors,
        total_area: totalArea,
        direction,
        site_area: siteArea,
        features,
        pdf_path: publicUrl,
        thumbnail_url: thumbnailUrl,
        original_filename: file.name,
        created_by: createdBy
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
