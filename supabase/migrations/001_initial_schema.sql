-- DandoriFinder Database Schema for Supabase
-- Version: 1.0
-- Date: 2025-11-05

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Companies Table (会社テーブル)
-- =============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_kana TEXT,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address TEXT,
  building TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  subscription_plan TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. User Profiles Table (ユーザープロフィールテーブル)
-- =============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'admin', 'editor', 'viewer'
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. Plans Table (プランテーブル)
-- =============================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  plan_number TEXT NOT NULL UNIQUE,
  plan_name TEXT,
  building_type TEXT,
  structure_type TEXT,
  floors_above INTEGER,
  floors_below INTEGER,
  total_floor_area NUMERIC(10,2),
  building_area NUMERIC(10,2),
  site_area NUMERIC(10,2),
  building_coverage_ratio NUMERIC(5,2),
  floor_area_ratio NUMERIC(5,2),
  design_date DATE,
  designer_name TEXT,
  tags TEXT[],
  thumbnail_url TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'deleted'
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. Site Plans Table (敷地計画テーブル)
-- =============================================
CREATE TABLE site_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  site_plan_number TEXT NOT NULL UNIQUE,
  site_plan_name TEXT,
  site_area NUMERIC(10,2),
  location_prefecture TEXT,
  location_city TEXT,
  location_address TEXT,
  zoning_district TEXT,
  building_coverage_ratio NUMERIC(5,2),
  floor_area_ratio NUMERIC(5,2),
  height_limit NUMERIC(5,2),
  tags TEXT[],
  thumbnail_url TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'deleted'
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. Inquiries Table (問い合わせテーブル)
-- =============================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  site_plan_id UUID REFERENCES site_plans(id) ON DELETE CASCADE,
  inquiry_type TEXT NOT NULL, -- 'plan' or 'site_plan'
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'resolved', 'closed'
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. Monthly Usage Table (月次利用状況テーブル)
-- =============================================
CREATE TABLE monthly_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  plan_registrations INTEGER DEFAULT 0,
  site_plan_registrations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Companies indexes
CREATE INDEX idx_companies_is_active ON companies(is_active);
CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);

-- User profiles indexes
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

-- Plans indexes
CREATE INDEX idx_plans_company_id ON plans(company_id);
CREATE INDEX idx_plans_created_by ON plans(created_by);
CREATE INDEX idx_plans_plan_number ON plans(plan_number);
CREATE INDEX idx_plans_status ON plans(status);
CREATE INDEX idx_plans_building_type ON plans(building_type);
CREATE INDEX idx_plans_created_at ON plans(created_at DESC);

-- Site plans indexes
CREATE INDEX idx_site_plans_company_id ON site_plans(company_id);
CREATE INDEX idx_site_plans_created_by ON site_plans(created_by);
CREATE INDEX idx_site_plans_site_plan_number ON site_plans(site_plan_number);
CREATE INDEX idx_site_plans_status ON site_plans(status);
CREATE INDEX idx_site_plans_location_prefecture ON site_plans(location_prefecture);
CREATE INDEX idx_site_plans_created_at ON site_plans(created_at DESC);

-- Inquiries indexes
CREATE INDEX idx_inquiries_company_id ON inquiries(company_id);
CREATE INDEX idx_inquiries_plan_id ON inquiries(plan_id);
CREATE INDEX idx_inquiries_site_plan_id ON inquiries(site_plan_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_assigned_to ON inquiries(assigned_to);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- Monthly usage indexes
CREATE INDEX idx_monthly_usage_user_id ON monthly_usage(user_id);
CREATE INDEX idx_monthly_usage_company_id ON monthly_usage(company_id);
CREATE INDEX idx_monthly_usage_year_month ON monthly_usage(year DESC, month DESC);

-- =============================================
-- Functions for automatic timestamp updates
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_plans_updated_at BEFORE UPDATE ON site_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_usage_updated_at BEFORE UPDATE ON monthly_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Function to increment monthly usage
-- =============================================
CREATE OR REPLACE FUNCTION increment_monthly_usage(
  p_user_id UUID,
  p_company_id UUID,
  p_type TEXT -- 'plan' or 'site_plan'
)
RETURNS VOID AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM NOW());
  current_month INTEGER := EXTRACT(MONTH FROM NOW());
BEGIN
  IF p_type = 'plan' THEN
    INSERT INTO monthly_usage (user_id, company_id, year, month, plan_registrations, site_plan_registrations)
    VALUES (p_user_id, p_company_id, current_year, current_month, 1, 0)
    ON CONFLICT (user_id, year, month)
    DO UPDATE SET
      plan_registrations = monthly_usage.plan_registrations + 1,
      updated_at = NOW();
  ELSIF p_type = 'site_plan' THEN
    INSERT INTO monthly_usage (user_id, company_id, year, month, plan_registrations, site_plan_registrations)
    VALUES (p_user_id, p_company_id, current_year, current_month, 0, 1)
    ON CONFLICT (user_id, year, month)
    DO UPDATE SET
      site_plan_registrations = monthly_usage.site_plan_registrations + 1,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Views for easy data access
-- =============================================

-- Company summary view
CREATE OR REPLACE VIEW company_summary AS
SELECT
  c.id,
  c.name,
  c.is_active,
  c.subscription_plan,
  COUNT(DISTINCT up.id) as total_users,
  COUNT(DISTINCT CASE WHEN up.is_active THEN up.id END) as active_users,
  COUNT(DISTINCT p.id) as total_plans,
  COUNT(DISTINCT sp.id) as total_site_plans,
  COUNT(DISTINCT i.id) as total_inquiries,
  c.created_at
FROM companies c
LEFT JOIN user_profiles up ON c.id = up.company_id
LEFT JOIN plans p ON c.id = p.company_id AND p.status = 'active'
LEFT JOIN site_plans sp ON c.id = sp.company_id AND sp.status = 'active'
LEFT JOIN inquiries i ON c.id = i.company_id
GROUP BY c.id;

-- User activity view
CREATE OR REPLACE VIEW user_activity AS
SELECT
  up.id,
  up.display_name,
  up.email,
  up.company_id,
  c.name as company_name,
  up.role,
  COUNT(DISTINCT p.id) as plans_created,
  COUNT(DISTINCT sp.id) as site_plans_created,
  up.last_login_at,
  up.created_at
FROM user_profiles up
JOIN companies c ON up.company_id = c.id
LEFT JOIN plans p ON up.id = p.created_by
LEFT JOIN site_plans sp ON up.id = sp.created_by
GROUP BY up.id, c.name;
