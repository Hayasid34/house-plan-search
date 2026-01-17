# Supabaseデプロイ完全ガイド

このドキュメントでは、DandoriFinderをSupabaseにデプロイする手順を説明します。

## 📋 目次

1. [Supabaseプロジェクト作成](#1-supabaseプロジェクト作成)
2. [データベースセットアップ](#2-データベースセットアップ)
3. [Google OAuth設定](#3-google-oauth設定)
4. [環境変数設定](#4-環境変数設定)
5. [テストデータ作成](#5-テストデータ作成)
6. [動作確認](#6-動作確認)

---

## 1. Supabaseプロジェクト作成

### 1-1. アカウント作成

1. [https://supabase.com](https://supabase.com) にアクセス
2. **「Start your project」** をクリック
3. GitHubアカウントでサインアップ

### 1-2. 新しいプロジェクトを作成

1. ダッシュボードで **「New Project」** をクリック
2. 以下を入力：
   - **Name**: `dandorifinder`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（**必ずメモしてください！**）
   - **Region**: `Northeast Asia (Tokyo)` を選択（日本向け）
   - **Pricing Plan**: `Free`（開発用）または `Pro`（本番用）
3. **「Create new project」** をクリック
4. プロジェクト作成完了まで1〜2分待つ

### 1-3. プロジェクト情報を取得

プロジェクト作成後、以下の情報を取得します：

1. 左メニューから **「Settings」** → **「API」** を選択
2. 以下の情報をコピーしてメモ：

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **重要**: `service_role key`は秘密情報です。絶対にGitにコミットしないでください！

---

## 2. データベースセットアップ

### 2-1. 基本スキーマの作成

1. Supabase Dashboardで **「SQL Editor」** を選択
2. **「New query」** をクリック
3. 以下のSQLを貼り付けて実行：

```sql
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
```

4. **「Run」** をクリックして実行

### 2-2. Row Level Security (RLS) の設定

新しいクエリで以下を実行：

```sql
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
```

### 2-3. トリガー関数の作成

新しいクエリで以下を実行：

```sql
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
```

### 2-4. Googleログイン用の自動ユーザー作成トリガー

新しいクエリで以下を実行：

```sql
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
```

---

## 3. Google OAuth設定

### 3-1. Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. **「APIとサービス」** → **「認証情報」** を選択
4. **「認証情報を作成」** → **「OAuth クライアント ID」** をクリック
5. アプリケーションの種類: **「ウェブアプリケーション」** を選択
6. 名前を入力（例: `DandoriFinder`）
7. **承認済みのリダイレクト URI** に以下を追加：
   ```
   https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback
   ```
   ※ `<YOUR_SUPABASE_PROJECT_ID>` は実際のSupabaseプロジェクトIDに置き換え

8. **「作成」** をクリック
9. 表示される **クライアントID** と **クライアントシークレット** をコピー

### 3-2. Supabaseでの設定

1. Supabase Dashboard で **「Authentication」** → **「Providers」** を選択
2. **「Google」** を見つけて **「Enable」** をクリック
3. Google Cloud Console で取得した情報を入力：
   - **Client ID**: クライアントID
   - **Client Secret**: クライアントシークレット
4. **「Save」** をクリック

### 3-3. リダイレクトURLの設定

Supabase Dashboard の **「Authentication」** → **「URL Configuration」** で以下を設定：

**Site URL**:
```
http://localhost:3000
```

**Redirect URLs**（本番環境では実際のドメインに変更）:
```
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

---

## 4. 環境変数設定

### 4-1. ローカル環境（`.env.local`）

プロジェクトルートの `.env.local` ファイルを編集：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4-2. 開発サーバーの再起動

```bash
# 開発サーバーを再起動
npm run dev
```

---

## 5. テストデータ作成

### 5-1. テスト会社を作成

Supabase の SQL Editor で実行：

```sql
-- テスト会社を作成
INSERT INTO companies (name, cst_number, address, phone, email, contract_account_limit)
VALUES
  ('株式会社サンプル', 'CST00001', '東京都渋谷区', '03-1234-5678', 'info@sample.co.jp', 10),
  ('テスト工務店', 'CST00002', '大阪府大阪市', '06-9876-5432', 'contact@test-builder.jp', 5);
```

### 5-2. 会社IDを確認

```sql
-- 作成した会社のIDを確認
SELECT id, name, cst_number FROM companies;
```

---

## 6. 動作確認

### 6-1. Googleログインのテスト

1. ブラウザで `http://localhost:3000/login` にアクセス
2. **「Googleでログイン」** ボタンをクリック
3. Googleの認証画面が表示されることを確認
4. 認証後、`/auth/company-select` にリダイレクトされることを確認
5. 会社検索でCST番号 `CST00001` を検索
6. 「株式会社サンプル」が表示されることを確認
7. 「選択」ボタンをクリック
8. `/search` ページにリダイレクトされることを確認

### 6-2. データベースの確認

Supabase の SQL Editor で確認：

```sql
-- ユーザーが作成されているか確認
SELECT * FROM auth.users;

-- アカウントが作成されているか確認
SELECT id, user_id, name, company_id, role FROM accounts;
```

### 6-3. 会社紐付けの確認

```sql
-- 会社に紐付いているアカウントを確認
SELECT
  a.name as account_name,
  a.user_id,
  c.name as company_name,
  c.cst_number,
  a.role
FROM accounts a
LEFT JOIN companies c ON a.company_id = c.id;
```

---

## 🎉 デプロイ完了！

これでSupabaseへのデプロイが完了しました。

### 次のステップ

1. **本番環境へのデプロイ**（Vercel/Netlify）
   - 環境変数を設定
   - Supabase の URL Configuration を本番ドメインに変更

2. **会社データの登録**
   - 実際の会社データをCSVインポートまたはSQL実行

3. **管理者アカウントの作成**
   - 特定のユーザーに `admin` ロールを付与

---

## 🐛 トラブルシューティング

### Googleログインでエラーが出る

- Google Cloud Console の承認済みリダイレクト URI が正しいか確認
- Supabase の Google Provider が有効になっているか確認

### 会社選択画面で会社が見つからない

- `companies` テーブルにデータが登録されているか確認
- CST番号が正しいか確認（完全一致検索）

### アカウント上限エラー

- `companies.contract_account_limit` を確認
- 不要なアカウントを削除または上限を引き上げ

---

## 📚 参考ドキュメント

- [Supabase Documentation](https://supabase.com/docs)
- [Google OAuth Setup](./GOOGLE_AUTH_SETUP.md)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
