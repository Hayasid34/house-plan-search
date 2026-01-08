-- ========================================
-- DandoriFinder Supabaseデプロイ用SQLスクリプト
-- ========================================
-- このスクリプトをSupabase SQL Editorで順番に実行してください

-- ========================================
-- STEP 1: テーブル作成
-- ========================================

-- 1. 会社テーブル
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cst_number TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  contract_account_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. アカウントテーブル（Supabase Authと連携）
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. プランテーブル
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 敷地計画テーブル
CREATE TABLE IF NOT EXISTS site_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  created_by UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 月次利用状況テーブル
CREATE TABLE IF NOT EXISTS monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  plan_registrations INTEGER DEFAULT 0,
  site_plan_registrations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- ========================================
-- STEP 2: インデックス作成
-- ========================================

CREATE INDEX IF NOT EXISTS idx_accounts_company_id ON accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_company_id ON plans(company_id);
CREATE INDEX IF NOT EXISTS idx_site_plans_plan_id ON site_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_id ON monthly_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_company_id ON monthly_usage(company_id);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_year_month ON monthly_usage(year, month);

-- ========================================
-- STEP 3: Row Level Security (RLS) 設定
-- ========================================

-- RLS有効化
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 会社
DROP POLICY IF EXISTS "会社は自分の会社のデータのみ閲覧可能" ON companies;
CREATE POLICY "会社は自分の会社のデータのみ閲覧可能"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM accounts WHERE id = auth.uid()
  ));

-- RLSポリシー: アカウント
DROP POLICY IF EXISTS "アカウントは自分の会社のアカウントのみ閲覧可能" ON accounts;
CREATE POLICY "アカウントは自分の会社のアカウントのみ閲覧可能"
  ON accounts FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM accounts WHERE id = auth.uid()
  ));

-- RLSポリシー: プラン（閲覧）
DROP POLICY IF EXISTS "プランは自分の会社のプランのみ閲覧可能" ON plans;
CREATE POLICY "プランは自分の会社のプランのみ閲覧可能"
  ON plans FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM accounts WHERE id = auth.uid()
  ));

-- RLSポリシー: プラン（作成）
DROP POLICY IF EXISTS "プランは認証ユーザーのみ作成可能" ON plans;
CREATE POLICY "プランは認証ユーザーのみ作成可能"
  ON plans FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM accounts WHERE id = auth.uid()
  ));

-- ========================================
-- STEP 4: トリガー関数作成
-- ========================================

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_plans_updated_at ON site_plans;
CREATE TRIGGER update_site_plans_updated_at BEFORE UPDATE ON site_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_usage_updated_at ON monthly_usage;
CREATE TRIGGER update_monthly_usage_updated_at BEFORE UPDATE ON monthly_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 5: Googleログイン用の自動ユーザー作成トリガー
-- ========================================

-- Googleログイン時にaccountsテーブルへ自動的にユーザープロファイルを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (id, user_id, name, company_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, '未設定'),
    NULL,  -- 初回登録時は会社未設定
    'viewer'  -- デフォルトロール
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルにトリガーを設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 6: テストデータ作成（オプション）
-- ========================================

-- テスト会社を作成
INSERT INTO companies (name, cst_number, address, phone, email, contract_account_limit)
VALUES
  ('株式会社サンプル', 'CST00001', '東京都渋谷区1-1-1', '03-1234-5678', 'info@sample.co.jp', 10),
  ('テスト工務店', 'CST00002', '大阪府大阪市北区2-2-2', '06-9876-5432', 'contact@test-builder.jp', 5),
  ('デモハウス株式会社', 'CST00003', '愛知県名古屋市中区3-3-3', '052-1111-2222', 'hello@demohouse.co.jp', 15)
ON CONFLICT (cst_number) DO NOTHING;

-- ========================================
-- デプロイ完了！
-- ========================================
-- 以下のコマンドでテーブルが正しく作成されたか確認してください：
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
