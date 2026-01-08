import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 会社検索API
// CST番号または会社名で検索
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const cstNumber = searchParams.get('cst_number');

    if (!query && !cstNumber) {
      return NextResponse.json(
        { error: '検索キーワードまたはCST番号を指定してください' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let companiesQuery = supabase
      .from('companies')
      .select('id, name, cst_number, address, email, phone, contract_account_limit, current_accounts');

    // CST番号での検索（完全一致）
    if (cstNumber) {
      companiesQuery = companiesQuery.eq('cst_number', cstNumber);
    }
    // 会社名での検索（部分一致）
    else if (query) {
      companiesQuery = companiesQuery.ilike('name', `%${query}%`);
    }

    const { data: companies, error } = await companiesQuery.limit(20);

    if (error) {
      console.error('Company search error:', error);
      return NextResponse.json(
        { error: '会社の検索に失敗しました' },
        { status: 500 }
      );
    }

    // 各会社のアカウント数をカウント
    const companiesWithCount = await Promise.all(
      (companies || []).map(async (company) => {
        const { count } = await supabase
          .from('accounts')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', company.id);

        return {
          ...company,
          current_accounts: count || 0,
          is_full: (count || 0) >= (company.contract_account_limit || 10),
        };
      })
    );

    return NextResponse.json({
      companies: companiesWithCount,
      count: companiesWithCount.length,
    });
  } catch (error) {
    console.error('Unexpected error in company search:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
