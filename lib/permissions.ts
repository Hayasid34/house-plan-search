import { UserRole } from './types';

/**
 * 権限の定義
 */
export const Permissions = {
  // プラン関連
  VIEW_PLANS: 'view_plans',           // プラン閲覧
  CREATE_PLANS: 'create_plans',       // プラン作成
  EDIT_PLANS: 'edit_plans',           // プラン編集
  DELETE_PLANS: 'delete_plans',       // プラン削除
  
  // ユーザー管理
  MANAGE_USERS: 'manage_users',       // ユーザー管理
  
  // アカウント設定
  CHANGE_PASSWORD: 'change_password', // パスワード変更
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

/**
 * 役割ごとの権限マッピング
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    Permissions.VIEW_PLANS,
    Permissions.CREATE_PLANS,
    Permissions.EDIT_PLANS,
    Permissions.DELETE_PLANS,
    Permissions.MANAGE_USERS,
    Permissions.CHANGE_PASSWORD,
  ],
  user: [
    Permissions.VIEW_PLANS,
    Permissions.CREATE_PLANS,
    Permissions.EDIT_PLANS,
    Permissions.DELETE_PLANS,
    Permissions.CHANGE_PASSWORD,
  ],
  viewer: [
    Permissions.VIEW_PLANS,
    Permissions.CHANGE_PASSWORD,
  ],
};

/**
 * ユーザーの役割が特定の権限を持っているかチェック
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * ユーザーの役割が複数の権限すべてを持っているかチェック
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * ユーザーの役割が複数の権限のうち少なくとも1つを持っているかチェック
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * ユーザーが管理者かチェック
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * ユーザーが閲覧のみかチェック
 */
export function isViewer(role: UserRole): boolean {
  return role === 'viewer';
}

/**
 * 役割の表示名を取得
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: '管理者',
    user: '一般ユーザー',
    viewer: '閲覧のみ',
  };
  return displayNames[role];
}
