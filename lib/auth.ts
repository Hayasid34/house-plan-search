import { NextRequest } from 'next/server';

// ローカルテスト用のデモアカウント情報
const DEMO_ACCOUNTS: { [key: string]: { id: string; email: string; role: string; company_id: string } } = {
  'demo-user-0': { id: 'demo-user-0', email: 'demo@example.com', role: 'viewer', company_id: 'demo-company-1' },
  'demo-user-1': { id: 'demo-user-1', email: 'admin@test.com', role: 'admin', company_id: 'demo-company-1' },
  'demo-user-2': { id: 'demo-user-2', email: 'admin', role: 'admin', company_id: 'demo-company-1' },
};

/**
 * 認証情報を取得する共通関数（Supabase認証 or ローカル認証）
 */
export async function getAuthenticatedUser(authToken: string, supabase: any, supabaseAdmin: any) {
  let user: any;
  let account: any;

  try {
    // まずSupabase認証を試す
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(authToken);

    if (!authError && supabaseUser) {
      // Supabase認証成功
      user = supabaseUser;

      // ユーザーのアカウント情報を取得
      const { data: accountData, error: accountError } = await supabaseAdmin
        .from('accounts')
        .select('role, company_id')
        .eq('id', user.id)
        .single();

      if (accountError || !accountData) {
        return { error: 'アカウント情報の取得に失敗しました', status: 500 };
      }

      account = accountData;
    } else {
      // ローカル認証トークン（demo/demo123など）
      // トークンをデコードしてユーザー情報を取得
      const decoded = Buffer.from(authToken, 'base64').toString('utf-8');
      const username = decoded.split(':')[0];

      // デモアカウント情報を検索
      let demoAccount = null;
      if (username === 'demo') {
        demoAccount = DEMO_ACCOUNTS['demo-user-0'];
      } else if (username === 'admin@test.com') {
        demoAccount = DEMO_ACCOUNTS['demo-user-1'];
      } else if (username === 'admin') {
        demoAccount = DEMO_ACCOUNTS['demo-user-2'];
      }

      // Supabaseから最初のcompanyを取得（ローカル認証時は実際のcompany_idを使用）
      const { data: companies, error: companyError } = await supabaseAdmin
        .from('companies')
        .select('id')
        .limit(1)
        .single();

      if (companyError || !companies) {
        return { error: 'デモ用の会社情報が見つかりません', status: 500 };
      }

      if (!demoAccount) {
        user = { id: 'demo-user-0', email: 'demo@example.com' };
        account = { company_id: companies.id, role: 'viewer' };
      } else {
        user = { id: demoAccount.id, email: demoAccount.email };
        // 実際のcompany_idを使用
        account = { company_id: companies.id, role: demoAccount.role };
      }
    }
  } catch (error) {
    // エラー時もローカル認証として処理
    const { data: companies, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .limit(1)
      .single();

    if (companyError || !companies) {
      return { error: 'デモ用の会社情報が見つかりません', status: 500 };
    }

    user = { id: 'demo-user-0', email: 'demo@example.com' };
    account = { company_id: companies.id, role: 'viewer' };
  }

  return { user, account };
}

/**
 * クライアントサイドで認証状態をチェック
 */
export function checkAuthClient(): boolean {
  if (typeof window === 'undefined') return false;

  // クッキーからSupabase認証トークンを確認
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie =>
    cookie.trim().startsWith('supabase-auth-token=')
  );
  return !!authCookie;
}

/**
 * APIリクエストから認証状態をチェック（サーバーサイド用）
 */
export function isAuthenticatedFromRequest(request: NextRequest): boolean {
  const authToken = request.cookies.get('supabase-auth-token');
  return !!authToken?.value;
}

/**
 * セッショントークンからユーザー名を取得
 */
export function getUsernameFromSession(sessionToken: string): string | null {
  try {
    // Base64デコード
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    // username:timestamp:random の形式なので、最初の部分を取得
    const parts = decoded.split(':');
    return parts[0] || null;
  } catch (error) {
    console.error('Failed to decode session token:', error);
    return null;
  }
}

/**
 * リクエストからユーザー名を取得
 */
export function getUsernameFromRequest(request: NextRequest): string | null {
  const session = request.cookies.get('session');
  if (!session?.value) {
    return null;
  }
  return getUsernameFromSession(session.value);
}
