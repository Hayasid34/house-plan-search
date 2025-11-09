# DandoriFinder - Supabase デプロイメントガイド

このドキュメントでは、DandoriFinderアプリケーションをSupabaseにデプロイする手順を説明します。

## 目次

1. [前提条件](#前提条件)
2. [Supabaseプロジェクトのセットアップ](#supabaseプロジェクトのセットアップ)
3. [データベースマイグレーション](#データベースマイグレーション)
4. [環境変数の設定](#環境変数の設定)
5. [認証の設定](#認証の設定)
6. [ストレージの設定](#ストレージの設定)
7. [デプロイ](#デプロイ)
8. [初期データの投入](#初期データの投入)
9. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント（無料プランで開始可能）
- Vercel または他のホスティングサービスのアカウント（デプロイ用）

---

## Supabaseプロジェクトのセットアップ

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://app.supabase.com)にログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - Project name: `dandorifinder` (または任意の名前)
   - Database Password: 強力なパスワードを生成（メモしておく）
   - Region: `Northeast Asia (Tokyo)` を推奨
   - Pricing Plan: `Free` プランで開始可能

4. プロジェクトが作成されるまで1-2分待つ

### 2. APIキーの取得

1. プロジェクトダッシュボードで「Settings」→「API」に移動
2. 以下の値をメモ：
   - `Project URL` (例: `https://xxxxx.supabase.co`)
   - `anon public` key
   - `service_role` key（管理機能用、絶対に公開しない）

---

## データベースマイグレーション

### オプション1: SQL Editorを使用（推奨）

1. Supabaseダッシュボードで「SQL Editor」に移動
2. 「New query」をクリック

#### ステップ1: 初期スキーマの実行

`supabase/migrations/001_initial_schema.sql` の内容をコピーして、SQL Editorに貼り付け、「Run」をクリック

#### ステップ2: RLSポリシーの実行

`supabase/migrations/002_row_level_security.sql` の内容をコピーして、SQL Editorに貼り付け、「Run」をクリック

### オプション2: Supabase CLIを使用

```bash
# Supabase CLIのインストール
npm install -g supabase

# Supabaseにログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref YOUR_PROJECT_ID

# マイグレーションの実行
supabase db push
```

### マイグレーション確認

1. 「Table Editor」に移動
2. 以下のテーブルが作成されていることを確認：
   - companies
   - user_profiles
   - plans
   - site_plans
   - inquiries
   - monthly_usage

---

## 環境変数の設定

### 1. 環境変数ファイルの作成

プロジェクトルートで `.env.local` ファイルを作成：

```bash
cp .env.local.example .env.local
```

### 2. 環境変数の設定

`.env.local` ファイルを編集し、Supabaseの値を入力：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. ローカルでの動作確認

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` を開き、アプリケーションが正常に動作することを確認

---

## 認証の設定

### 1. Email認証の設定

1. Supabaseダッシュボードで「Authentication」→「Providers」に移動
2. 「Email」プロバイダーが有効になっていることを確認
3. 「Email Templates」で、メールテンプレートをカスタマイズ可能

### 2. リダイレクトURLの設定

1. 「Authentication」→「URL Configuration」に移動
2. 「Site URL」を本番環境のURLに設定（例: `https://dandorifinder.com`）
3. 「Redirect URLs」に以下を追加：
   - `http://localhost:3000/*` (開発環境用)
   - `https://YOUR_DOMAIN.com/*` (本番環境用)
   - `https://YOUR_DOMAIN.vercel.app/*` (Vercel使用時)

### 3. セキュリティ設定

1. 「Authentication」→「Policies」に移動
2. 「Enable email confirmations」を有効化（推奨）
3. パスワード要件を設定（最小文字数、複雑さなど）

---

## ストレージの設定

ファイルアップロード機能を使用する場合：

### 1. ストレージバケットの確認

1. 「Storage」に移動
2. 以下のバケットが自動作成されていることを確認：
   - `plans` (プラン用)
   - `site-plans` (敷地計画用)

*注: RLSポリシーのマイグレーションで自動作成されます*

### 2. バケット設定の調整

各バケットで以下を設定：

- **Public bucket**: `true` (一般公開可能にする場合)
- **File size limit**: 10MB (デフォルト、必要に応じて調整)
- **Allowed MIME types**:
  - `application/pdf`
  - `image/jpeg`
  - `image/png`

### 3. ストレージポリシーの確認

「Policies」タブで、以下のポリシーが設定されていることを確認：
- ユーザーが自社フォルダにファイルをアップロード可能
- 誰でもファイルを閲覧可能
- 管理者が自社のファイルを削除可能

---

## デプロイ

### Vercelへのデプロイ（推奨）

#### 1. Vercelプロジェクトの作成

```bash
# Vercel CLIのインストール
npm install -g vercel

# プロジェクトのデプロイ
vercel
```

または、[Vercel Dashboard](https://vercel.com/dashboard)から：

1. 「New Project」をクリック
2. GitHubリポジトリを選択
3. プロジェクト設定：
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 2. 環境変数の設定

Vercel Dashboardで「Settings」→「Environment Variables」に移動し、以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN.vercel.app
NODE_ENV=production
NEXT_PUBLIC_DEMO_MODE=false
```

#### 3. デプロイの実行

- GitHubにプッシュすると自動的にデプロイされます
- または Vercel CLIで `vercel --prod` を実行

### 他のホスティングサービス

#### Netlify

1. `netlify.toml` を作成：

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Netlify Dashboardで環境変数を設定
3. GitHubリポジトリを接続してデプロイ

#### Railway, Render, Flyなど

各サービスのドキュメントに従って、Next.jsアプリケーションとしてデプロイ

---

## 初期データの投入

### 1. 最初の会社とユーザーの作成

#### オプション1: SQL Editorで直接作成

Supabase SQL Editorで実行：

```sql
-- 会社を作成
INSERT INTO companies (id, name, name_kana, email, subscription_plan, subscription_status)
VALUES (
  gen_random_uuid(),
  'サンプル会社',
  'サンプルカイシャ',
  'contact@example.com',
  'basic',
  'active'
);

-- 作成した会社のIDを取得（次のステップで使用）
SELECT id FROM companies WHERE name = 'サンプル会社';
```

#### オプション2: アプリケーションから登録

1. `/vendor/signup` にアクセス（実装が必要な場合は作成）
2. 会社情報とユーザー情報を入力して登録

### 2. デモデータの削除

本番環境では、`lib/demo-data.ts` のデモデータを使用しないように設定：

```typescript
// .env.local
NEXT_PUBLIC_DEMO_MODE=false
```

実際のSupabaseデータベースからデータを取得するようにコードを更新：

```typescript
// 例: app/vendor/companies/page.tsx
const { data: companies } = await supabase
  .from('companies')
  .select('*')
  .order('created_at', { ascending: false });
```

---

## トラブルシューティング

### よくある問題と解決策

#### 1. 「Not authorized」エラー

**原因**: Row Level Security (RLS) ポリシーが正しく設定されていない

**解決策**:
- `002_row_level_security.sql` が正しく実行されているか確認
- Supabaseダッシュボードの「Authentication」→「Policies」でポリシーを確認
- テーブルごとにRLSが有効になっているか確認

#### 2. 「relation does not exist」エラー

**原因**: テーブルが作成されていない

**解決策**:
- `001_initial_schema.sql` を再実行
- 「Table Editor」でテーブルの存在を確認
- マイグレーションの順序を確認（001 → 002）

#### 3. ファイルアップロードが失敗する

**原因**: ストレージポリシーまたはバケット設定の問題

**解決策**:
- 「Storage」でバケットが作成されているか確認
- バケットのポリシーを確認（RLSマイグレーションを再実行）
- ファイルサイズ制限を確認
- CORS設定を確認

#### 4. 認証リダイレクトが動作しない

**原因**: リダイレクトURLが正しく設定されていない

**解決策**:
- 「Authentication」→「URL Configuration」を確認
- 本番環境のURLを正確に設定
- ワイルドカード (`/*`) が含まれているか確認

#### 5. パフォーマンスが遅い

**解決策**:
- データベースインデックスが作成されているか確認（`001_initial_schema.sql`に含まれています）
- クエリを最適化（不要なデータを取得しない）
- ページネーションを実装
- キャッシュを活用

### デバッグツール

#### Supabase Logs

1. Supabaseダッシュボードで「Logs」に移動
2. エラーログを確認：
   - API Logs: APIリクエストのログ
   - Database Logs: SQLクエリのログ
   - Auth Logs: 認証関連のログ

#### ローカルでのデバッグ

```bash
# Supabaseのローカル環境を起動
supabase start

# アプリケーションをローカルSupabaseに接続
# .env.local を更新:
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
```

---

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - `service_role` キーは絶対にクライアントコードで使用しない
   - `.env.local` をgitignoreに追加
   - 本番環境の環境変数は暗号化されたストレージに保存

2. **RLSポリシー**
   - すべてのテーブルでRLSを有効化
   - 最小権限の原則に従う
   - 定期的にポリシーをレビュー

3. **認証**
   - Email確認を有効化
   - 強力なパスワード要件を設定
   - レート制限を設定

4. **データベース**
   - 定期的なバックアップ（Supabaseは自動バックアップを提供）
   - 機密データの暗号化
   - SQLインジェクション対策（Supabaseクライアントは自動的に対策済み）

---

## 監視とメンテナンス

### パフォーマンス監視

1. Supabaseダッシュボードの「Reports」で：
   - データベース使用量
   - API呼び出し数
   - ストレージ使用量
   を定期的に確認

2. アラートを設定：
   - 使用量が上限に近づいたら通知
   - エラー率が高い場合に通知

### 定期メンテナンス

- **毎週**: ログを確認してエラーをチェック
- **毎月**: データベースのパフォーマンスを確認
- **四半期**: セキュリティポリシーをレビュー
- **年次**: データベーススキーマの最適化を検討

---

## スケーリング計画

### 現在の想定規模
- 初期: 50社
- 目標: 5,000社

### スケーリングのマイルストーン

#### 100社到達時
- [ ] データベースインデックスの最適化
- [ ] ページネーションの実装
- [ ] キャッシュ戦略の導入

#### 500社到達時
- [ ] プロフェッショナルプランへのアップグレード検討
- [ ] CDNの導入
- [ ] 画像最適化の強化

#### 1,000社到達時
- [ ] データベースの水平スケーリング検討
- [ ] マイクロサービス化の検討
- [ ] AWS移行の準備開始

詳細なスケーリング戦略については、前回の会話で提供したAWS移行プランを参照してください。

---

## サポート

問題が解決しない場合：

1. [Supabase公式ドキュメント](https://supabase.com/docs)
2. [Supabase Discord](https://discord.supabase.com)
3. [Next.js公式ドキュメント](https://nextjs.org/docs)
4. プロジェクトのGitHub Issues

---

## 更新履歴

- 2025-11-05: 初版作成
