// ユーザーの役割
export type UserRole = 'admin' | 'user' | 'viewer';

// ユーザー情報
export interface User {
  username: string;
  email: string;
  password: string; // 本番環境では必ずハッシュ化
  companyId: string;
  companyName: string;
  role: UserRole;
}
