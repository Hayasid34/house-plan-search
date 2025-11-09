// DandoriFinder データベース型定義

export interface Company {
  id: string; // 会社ID
  cst_number: string; // CST番号（5桁）
  place_code: string; // プレイスコード
  name: string; // 会社名
  postal_code: string | null; // 郵便番号
  address: string | null; // 住所
  email: string | null; // メールアドレス
  website_url: string | null; // URL
  phone: string | null; // 電話番号
  fax_number: string | null; // FAX番号
  qualified_invoice_number: string | null; // 適格事業者番号
  admin_name: string | null; // 管理者氏名
  max_accounts: number; // アカウント契約数
  current_accounts: number; // アカウント登録数
  is_public: boolean; // 公開ステータス（公開/非公開）
  created_at: string; // 作成日時
}

export interface UserProfile {
  id: string;
  company_id: string | null;
  display_name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  floor_plan_image_url: string | null;
  layout: string | null;
  floor_area_tsubo: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  features: string[] | null;
  specifications: Record<string, any> | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface SitePlan {
  id: string;
  company_id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  plan_data: Record<string, any>;
  pdf_image_data: string | null;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  company_id: string;
  plan_id: string | null;
  site_plan_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  inquiry_type: 'plan_inquiry' | 'site_plan' | 'general' | null;
  message: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

// 月ごとの利用状況
export interface MonthlyUsage {
  id: string;
  user_id: string;
  company_id: string;
  year: number; // 年
  month: number; // 月 (1-12)
  plan_registrations: number; // プラン登録数
  site_plan_registrations: number; // 敷地計画登録数
  created_at: string;
  updated_at: string;
}
