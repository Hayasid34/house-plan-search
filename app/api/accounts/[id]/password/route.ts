import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 管理者が他のユーザーのパスワードを変更
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const { newPassword } = await request.json();

    // バリデーション
    if (!newPassword) {
      return NextResponse.json(
        { error: '新しいパスワードを入力してください' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上で入力してください' },
        { status: 400 }
      );
    }

    // Supabaseクライアントを作成（認証チェック用）
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // サービスロールクライアントを作成（管理操作用）
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

    // ログインユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken.value);

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ログインユーザーのアカウント情報を取得して権限確認
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'アカウント情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 管理者権限チェック
    if (account.role !== 'admin') {
      return NextResponse.json(
        { error: 'この操作には管理者権限が必要です' },
        { status: 403 }
      );
    }

    // 対象ユーザーが同じ会社に属しているか確認
    const { data: targetAccount, error: targetError } = await supabaseAdmin
      .from('accounts')
      .select('company_id')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetAccount) {
      return NextResponse.json(
        { error: '対象ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    if (targetAccount.company_id !== account.company_id) {
      return NextResponse.json(
        { error: 'この操作は許可されていません' },
        { status: 403 }
      );
    }

    // Admin APIを使ってパスワードを更新
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: 'パスワードの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'パスワードを正常に更新しました',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'パスワード変更中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
