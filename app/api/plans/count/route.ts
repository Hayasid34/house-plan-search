import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Supabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // サービスロールクライアントを作成（ローカル認証用）
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

    // プラン件数のみを取得（count()を使用してパフォーマンス向上）
    // ローカル認証の場合はsupabaseAdminを使用してRLSをバイパス
    const client = user.id.startsWith('demo-') ? supabaseAdmin : supabase;
    const { count, error } = await client
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
