import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import crypto from 'crypto';

const TOKENS_FILE = join(process.cwd(), 'data', 'resetTokens.json');

export interface ResetToken {
  token: string;
  email: string;
  expiresAt: string;
  createdAt: string;
}

// トークンファイルを読み込む
function readTokensData(): ResetToken[] {
  try {
    if (!existsSync(TOKENS_FILE)) {
      return [];
    }
    const data = readFileSync(TOKENS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tokens file:', error);
    return [];
  }
}

// トークンファイルに書き込む
function writeTokensData(tokens: ResetToken[]): void {
  try {
    const dir = dirname(TOKENS_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  } catch (error) {
    console.error('Error writing tokens file:', error);
    throw error;
  }
}

// リセットトークンを生成
export function generateResetToken(email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const tokens = readTokensData();

  // 既存の同じメールアドレスのトークンを削除
  const filteredTokens = tokens.filter(t => t.email !== email);

  // 新しいトークンを追加（1時間有効）
  const newToken: ResetToken = {
    token,
    email,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1時間後
    createdAt: new Date().toISOString(),
  };

  filteredTokens.push(newToken);
  writeTokensData(filteredTokens);

  return token;
}

// トークンを検証
export function validateResetToken(token: string): { valid: boolean; email?: string } {
  const tokens = readTokensData();
  const resetToken = tokens.find(t => t.token === token);

  if (!resetToken) {
    return { valid: false };
  }

  // 有効期限チェック
  if (new Date(resetToken.expiresAt) < new Date()) {
    // 期限切れトークンを削除
    const filteredTokens = tokens.filter(t => t.token !== token);
    writeTokensData(filteredTokens);
    return { valid: false };
  }

  return { valid: true, email: resetToken.email };
}

// トークンを削除（使用後）
export function deleteResetToken(token: string): void {
  const tokens = readTokensData();
  const filteredTokens = tokens.filter(t => t.token !== token);
  writeTokensData(filteredTokens);
}

// 期限切れトークンをクリーンアップ
export function cleanupExpiredTokens(): void {
  const tokens = readTokensData();
  const now = new Date();
  const validTokens = tokens.filter(t => new Date(t.expiresAt) > now);
  writeTokensData(validTokens);
}
