import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { User, UserRole } from './types';

const USERS_FILE = join(process.cwd(), 'data', 'users.json');

// デフォルトユーザー
const DEFAULT_USERS: User[] = [
  {
    username: 'admin',
    email: 'hayashi.takashi@dandoli-works.com',
    password: 'password',
    companyId: '3988',
    companyName: 'ダンドリ工務店',
    role: 'admin',
  },
  {
    username: 'user',
    email: 'user@dandoli-works.com',
    password: 'password',
    companyId: '3988',
    companyName: 'ダンドリ工務店',
    role: 'user',
  },
  {
    username: 'viewer',
    email: 'viewer@dandoli-works.com',
    password: 'password',
    companyId: '3988',
    companyName: 'ダンドリ工務店',
    role: 'viewer',
  },
];

// 型を再エクスポート
export type { User, UserRole };

// ユーザーファイルを読み込む
function readUsersData(): User[] {
  try {
    if (!existsSync(USERS_FILE)) {
      return DEFAULT_USERS;
    }
    const data = readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return DEFAULT_USERS;
  }
}

// ユーザーファイルに書き込む
function writeUsersData(users: User[]): void {
  try {
    const dir = dirname(USERS_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
    throw error;
  }
}

// ユーザー名でユーザーを取得
export function getUserByUsername(username: string): User | null {
  const users = readUsersData();
  return users.find(u => u.username === username) || null;
}

// メールアドレスでユーザーを取得
export function getUserByEmail(email: string): User | null {
  const users = readUsersData();
  return users.find(u => u.email === email) || null;
}

// すべてのユーザーを取得
export function getAllUsers(): User[] {
  return readUsersData();
}

// パスワードを更新
export function updateUserPassword(email: string, newPassword: string): boolean {
  const users = readUsersData();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return false;
  }

  users[userIndex].password = newPassword;
  writeUsersData(users);
  return true;
}

// ユーザーを認証
export function authenticateUser(username: string, password: string): User | null {
  const users = readUsersData();
  return users.find(u => u.username === username && u.password === password) || null;
}

// ユーザー名でパスワードを更新
export function updateUserPasswordByUsername(username: string, newPassword: string): boolean {
  const users = readUsersData();
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    return false;
  }

  users[userIndex].password = newPassword;
  writeUsersData(users);
  return true;
}
