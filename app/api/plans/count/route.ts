import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
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

    // プラン件数のみを取得（count()を使用してパフォーマンス向上）
    const { count, error } = await supabase
      .from('plans')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', account.company_id);

    if (error) {
      console.error('Plans count error:', error);
      return NextResponse.json(
        { error: 'プラン件数の取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: count || 0,
    });
  } catch (error) {
    console.error('Plans count error:', error);
    return NextResponse.json(
      { error: 'プラン件数の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
