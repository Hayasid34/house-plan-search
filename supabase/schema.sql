-- DandoriFinderデータベーススキーマ

-- 1. 会社テーブル
CREATE TABLE companies (
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
CREATE TABLE accounts (
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
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 敷地計画テーブル
CREATE TABLE site_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  created_by UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 月次利用状況テーブル
CREATE TABLE monthly_usage (
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

-- インデックスの作成
CREATE INDEX idx_accounts_company_id ON accounts(company_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_plans_company_id ON plans(company_id);
CREATE INDEX idx_site_plans_plan_id ON site_plans(plan_id);
CREATE INDEX idx_monthly_usage_user_id ON monthly_usage(user_id);
CREATE INDEX idx_monthly_usage_company_id ON monthly_usage(company_id);
CREATE INDEX idx_monthly_usage_year_month ON monthly_usage(year, month);

-- Row Level Security (RLS) の有効化
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 会社
CREATE POLICY "会社は自分の会社のデータのみ閲覧可能"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM accounts WHERE id = auth.uid()
  ));

-- RLSポリシー: アカウント  
CREATE POLICY "アカウントは自分の会社のアカウントのみ閲覧可能"
  ON accounts FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM accounts WHERE id = auth.uid()
  ));

-- RLSポリシー: プラン
CREATE POLICY "プランは自分の会社のプランのみ閲覧可能"
  ON plans FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM accounts WHERE id = auth.uid()
  ));

CREATE POLICY "プランは認証ユーザーのみ作成可能"
  ON plans FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM accounts WHERE id = auth.uid()
  ));

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_plans_updated_at BEFORE UPDATE ON site_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_usage_updated_at BEFORE UPDATE ON monthly_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
