import { NextRequest } from 'next/server';

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
