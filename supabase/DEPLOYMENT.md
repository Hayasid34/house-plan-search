# Supabaseデプロイ手順

## 1. Supabaseプロジェクトの作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. 新しいプロジェクトを作成
   - Organization: 新規作成または既存を選択
   - Name: `dandori-finder` など
   - Database Password: 強力なパスワードを設定（メモ必須！）
   - Region: `Northeast Asia (Tokyo)` を選択
4. 「Create new project」をクリック

## 2. データベーススキーマの適用

1. Supabaseダッシュボードの左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `supabase/schema.sql` の内容を全てコピーしてペースト
4. 「Run」をクリックして実行
5. エラーがないことを確認

## 3. API KeysとURLの取得

1. Supabaseダッシュボードの左メニューから「Settings」→「API」を選択
2. 以下の値をコピー:
   - Project URL: `https://xxxxx.supabase.co`
   - anon public key: `eyJhbGc...`（長い文字列）

## 4. 環境変数の設定（ローカル）

`.env.local` ファイルを以下のように更新:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（実際のキー）
```

## 5. 認証設定

1. Supabaseダッシュボードの左メニューから「Authentication」を選択
2. 「Providers」タブで「Email」を有効化
3. 「Email Templates」でメールテンプレートをカスタマイズ（オプション）

## 6. Vercelへのデプロイ

### 6-1. Gitリポジトリの準備

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/dandori-finder.git
git push -u origin main
```

### 6-2. Vercelプロジェクトの作成

1. https://vercel.com にアクセス
2. 「Add New」→「Project」をクリック
3. GitHubリポジトリを選択
4. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabaseプロジェクトurl
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
5. 「Deploy」をクリック

## 7. 初期データの投入（オプション）

デモ用の会社とアカウントを作成する場合:

1. Supabaseダッシュボードの「SQL Editor」で以下を実行:

```sql
-- デモ会社を作成
INSERT INTO companies (name, cst_number, address, phone, email, contract_account_limit)
VALUES ('デモ株式会社', 'CST001', '東京都渋谷区', '03-1234-5678', 'demo@example.com', 10);
```

2. Supabaseダッシュボードの「Authentication」→「Users」で手動でユーザーを作成

3. 作成したユーザーのUUIDをコピーして、accountsテーブルに登録:

```sql
INSERT INTO accounts (id, user_id, name, phone, company_id, role)
VALUES (
  'ユーザーのUUID',
  '123456',
  'デモ太郎',
  '03-1234-5678',
  '会社のUUID',
  'admin'
);
```

## 8. 動作確認

1. Vercelのデプロイ先URLにアクセス
2. ログイン機能をテスト
3. データの登録・表示をテスト

## トラブルシューティング

### RLSエラーが出る場合

Row Level Security (RLS)が有効になっているため、適切なポリシーが必要です。
`schema.sql`を再度実行してポリシーが作成されているか確認してください。

### 認証エラーが出る場合

1. `.env.local`または Vercelの環境変数が正しく設定されているか確認
2. SupabaseのProject URLとAPI Keyが正しいか確認
3. ブラウザのキャッシュをクリア

### データが表示されない場合

1. Supabaseダッシュボードの「Table Editor」でデータが入っているか確認
2. RLSポリシーが正しく設定されているか確認
3. ブラウザの開発者ツールでネットワークエラーを確認
