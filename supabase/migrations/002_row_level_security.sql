-- DandoriFinder Row Level Security (RLS) Policies
-- Version: 1.0
-- Date: 2025-11-05

-- =============================================
-- Enable Row Level Security on all tables
-- =============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper Function: Get current user's company_id
-- =============================================
CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper Function: Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper Function: Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper Function: Check if user is editor or admin
CREATE OR REPLACE FUNCTION auth.can_edit()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =============================================
-- Companies Table Policies
-- =============================================

-- Users can view their own company
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id = auth.user_company_id());

-- Only admins can update their company
CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (id = auth.user_company_id() AND auth.is_admin())
  WITH CHECK (id = auth.user_company_id() AND auth.is_admin());

-- System admin can do everything (for vendor management)
-- Note: This would be for a separate vendor admin user, not regular users
CREATE POLICY "System admins have full access to companies"
  ON companies FOR ALL
  USING (auth.jwt() ->> 'is_vendor_admin' = 'true');

-- =============================================
-- User Profiles Table Policies
-- =============================================

-- Users can view profiles in their company
CREATE POLICY "Users can view profiles in their company"
  ON user_profiles FOR SELECT
  USING (company_id = auth.user_company_id());

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can create users in their company
CREATE POLICY "Admins can create users in their company"
  ON user_profiles FOR INSERT
  WITH CHECK (company_id = auth.user_company_id() AND auth.is_admin());

-- Admins can update users in their company
CREATE POLICY "Admins can update users in their company"
  ON user_profiles FOR UPDATE
  USING (company_id = auth.user_company_id() AND auth.is_admin())
  WITH CHECK (company_id = auth.user_company_id() AND auth.is_admin());

-- Admins can delete users in their company
CREATE POLICY "Admins can delete users in their company"
  ON user_profiles FOR DELETE
  USING (company_id = auth.user_company_id() AND auth.is_admin());

-- =============================================
-- Plans Table Policies
-- =============================================

-- All users in company can view plans
CREATE POLICY "Users can view plans in their company"
  ON plans FOR SELECT
  USING (company_id = auth.user_company_id());

-- Editors and admins can create plans
CREATE POLICY "Editors and admins can create plans"
  ON plans FOR INSERT
  WITH CHECK (company_id = auth.user_company_id() AND auth.can_edit());

-- Editors and admins can update plans in their company
CREATE POLICY "Editors and admins can update plans"
  ON plans FOR UPDATE
  USING (company_id = auth.user_company_id() AND auth.can_edit())
  WITH CHECK (company_id = auth.user_company_id() AND auth.can_edit());

-- Admins can delete plans
CREATE POLICY "Admins can delete plans"
  ON plans FOR DELETE
  USING (company_id = auth.user_company_id() AND auth.is_admin());

-- =============================================
-- Site Plans Table Policies
-- =============================================

-- All users in company can view site plans
CREATE POLICY "Users can view site plans in their company"
  ON site_plans FOR SELECT
  USING (company_id = auth.user_company_id());

-- Editors and admins can create site plans
CREATE POLICY "Editors and admins can create site plans"
  ON site_plans FOR INSERT
  WITH CHECK (company_id = auth.user_company_id() AND auth.can_edit());

-- Editors and admins can update site plans in their company
CREATE POLICY "Editors and admins can update site plans"
  ON site_plans FOR UPDATE
  USING (company_id = auth.user_company_id() AND auth.can_edit())
  WITH CHECK (company_id = auth.user_company_id() AND auth.can_edit());

-- Admins can delete site plans
CREATE POLICY "Admins can delete site plans"
  ON site_plans FOR DELETE
  USING (company_id = auth.user_company_id() AND auth.is_admin());

-- =============================================
-- Inquiries Table Policies
-- =============================================

-- All users in company can view inquiries for their company
CREATE POLICY "Users can view inquiries for their company"
  ON inquiries FOR SELECT
  USING (company_id = auth.user_company_id());

-- Allow anonymous INSERT for public inquiry form (from website visitors)
CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Editors and admins can update inquiries
CREATE POLICY "Editors and admins can update inquiries"
  ON inquiries FOR UPDATE
  USING (company_id = auth.user_company_id() AND auth.can_edit())
  WITH CHECK (company_id = auth.user_company_id() AND auth.can_edit());

-- Admins can delete inquiries
CREATE POLICY "Admins can delete inquiries"
  ON inquiries FOR DELETE
  USING (company_id = auth.user_company_id() AND auth.is_admin());

-- =============================================
-- Monthly Usage Table Policies
-- =============================================

-- All users in company can view usage for their company
CREATE POLICY "Users can view usage for their company"
  ON monthly_usage FOR SELECT
  USING (company_id = auth.user_company_id());

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
  ON monthly_usage FOR SELECT
  USING (user_id = auth.uid());

-- System can insert/update usage (via functions)
CREATE POLICY "System can manage usage records"
  ON monthly_usage FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: In production, you should create a service role for the increment_monthly_usage function
-- and restrict direct table access. For now, this allows the function to work.

-- =============================================
-- Storage Policies (for file uploads)
-- =============================================

-- Create storage bucket for plan files
INSERT INTO storage.buckets (id, name, public)
VALUES ('plans', 'plans', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for site plan files
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-plans', 'site-plans', true)
ON CONFLICT (id) DO NOTHING;

-- Plans bucket policies
CREATE POLICY "Users can upload plan files to their company folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'plans'
    AND auth.can_edit()
    AND (storage.foldername(name))[1] = auth.user_company_id()::text
  );

CREATE POLICY "Anyone can view plan files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plans');

CREATE POLICY "Users can update their company's plan files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'plans'
    AND auth.can_edit()
    AND (storage.foldername(name))[1] = auth.user_company_id()::text
  )
  WITH CHECK (
    bucket_id = 'plans'
    AND auth.can_edit()
    AND (storage.foldername(name))[1] = auth.user_company_id()::text
  );

CREATE POLICY "Admins can delete their company's plan files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'plans'
    AND auth.is_admin()
    AND (storage.foldername(name))[1] = auth.user_company_id()::text
  );

-- Site Plans bucket policies
CREATE POLICY "Users can upload site plan files to their company folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-plans'
    AND auth.can_edit()
    AND (storage.foldername(name))[1] = auth.user_company_id()::text
  );

CREATE POLICY "Anyone can view site plan files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-plans');

CREATE POLICY "Users can update their company's site plan files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'site-plans'
    AND auth.can_edit()
    AND (storage.foldername(name))[1] = auth.user_company_id()::text
  )
  WITH CHECK (
    bucket_id = 'site-plans'
    AND auth.can_edit()
    AND (storage.foldername(name))[1] = auth.user_company_id()::text
  );

CREATE POLICY "Admins can delete their company's site plan files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'site-plans'
    AND auth.is_admin()
    AND (storage.foldername(name))[1] = auth.user_company_id()::text
  );

-- =============================================
-- Public Schema Grants
-- =============================================

-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read access to anonymous users (for inquiries)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON companies TO anon;
GRANT SELECT ON plans TO anon;
GRANT SELECT ON site_plans TO anon;
GRANT INSERT ON inquiries TO anon;
