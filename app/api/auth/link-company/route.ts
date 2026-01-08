import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ユーザーと会社を紐付けるAPI
export async function POST(request: NextRequest) {
  try {
    const { company_id } = await request.json();

    if (!company_id) {
      return NextResponse.json(
        { error: '会社IDが必要です' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }

    // 会社情報を取得
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, contract_account_limit')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: '会社が見つかりません' },
        { status: 404 }
      );
    }

    // 現在のアカウント数をカウント
    const { count: currentAccounts, error: countError } = await supabase
      .from('accounts')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', company_id);

    if (countError) {
      console.error('Account count error:', countError);
      return NextResponse.json(
        { error: 'アカウント数の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 上限チェック
    const accountLimit = company.contract_account_limit || 10;
    if ((currentAccounts || 0) >= accountLimit) {
      return NextResponse.json(
        {
          error: 'アカウント上限に達しています',
          message: `この会社は最大${accountLimit}アカウントまでですが、既に${currentAccounts}アカウントが登録されています。`,
        },
        { status: 403 }
      );
    }

    // アカウントに会社を紐付け
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({
        company_id: company_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Account update error:', updateError);
      return NextResponse.json(
        { error: '会社の紐付けに失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${company.name}に紐付けられました`,
      account: updatedAccount,
      company: company,
    });
  } catch (error) {
    console.error('Unexpected error in link-company:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
