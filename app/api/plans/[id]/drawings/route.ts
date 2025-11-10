import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 図面を追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
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

    // プランが存在するか確認
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('id, company_id')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    // 図面ファイルをSupabase Storageにアップロード
    const timestamp = Date.now();
    const safeFileName = file.name
      .replace(/[^\w\s.-]/gi, '_')
      .replace(/\s+/g, '_');
    const fileName = `drawings/${planId}/${timestamp}_${safeFileName}`;
    const fileBuffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('plan-pdfs')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
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

    // drawingsテーブルにデータを保存
    const { data: newDrawing, error: insertError } = await supabaseAdmin
      .from('drawings')
      .insert({
        plan_id: planId,
        type,
        file_path: publicUrl,
        original_filename: file.name
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // アップロードしたファイルを削除
      await supabaseAdmin.storage.from('plan-pdfs').remove([fileName]);
      return NextResponse.json(
        { error: '図面の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      drawing: {
        id: newDrawing.id,
        type: newDrawing.type,
        filePath: newDrawing.file_path,
        originalFilename: newDrawing.original_filename,
        uploadedAt: newDrawing.created_at
      },
      message: '図面を追加しました',
    });
  } catch (error) {
    console.error('Drawing upload error:', error);
    return NextResponse.json(
      { error: '図面のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 図面を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const { searchParams } = new URL(request.url);
    const drawingId = searchParams.get('drawingId');

    if (!drawingId) {
      return NextResponse.json(
        { error: '図面IDが指定されていません' },
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

    // 図面情報を取得
    const { data: drawing, error: drawingError } = await supabaseAdmin
      .from('drawings')
      .select('*')
      .eq('id', drawingId)
      .eq('plan_id', planId)
      .single();

    if (drawingError || !drawing) {
      return NextResponse.json(
        { error: '図面が見つかりません' },
        { status: 404 }
      );
    }

    // Storageからファイルのパスを抽出
    const filePathMatch = drawing.file_path.match(/plan-pdfs\/(.+)$/);
    if (filePathMatch) {
      const filePath = filePathMatch[1];
      await supabaseAdmin.storage.from('plan-pdfs').remove([filePath]);
    }

    // データベースから削除
    const { error: deleteError } = await supabaseAdmin
      .from('drawings')
      .delete()
      .eq('id', drawingId);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return NextResponse.json(
        { error: '図面の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '図面を削除しました',
    });
  } catch (error) {
    console.error('Drawing delete error:', error);
    return NextResponse.json(
      { error: '図面の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
