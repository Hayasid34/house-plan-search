# Googleログイン設定手順

このドキュメントでは、DandoriFinderアプリケーションでGoogleログインを有効にする方法を説明します。

## 📋 前提条件

- Supabaseプロジェクトが作成済みであること
- Google Cloud Platformアカウントがあること

---

## 🔧 設定手順

### 1. Google Cloud Console での設定

#### 1-1. プロジェクトの作成（既存のプロジェクトがある場合はスキップ）

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択

#### 1-2. OAuth 2.0 認証情報の作成

1. サイドメニューから **「APIとサービス」** → **「認証情報」** を選択
2. **「認証情報を作成」** → **「OAuth クライアント ID」** をクリック
3. アプリケーションの種類: **「ウェブアプリケーション」** を選択
4. 名前を入力（例: `DandoriFinder`）
5. **承認済みのリダイレクト URI** に以下を追加:
   ```
   https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback
   ```
   ※ `<YOUR_SUPABASE_PROJECT_ID>` は実際のSupabaseプロジェクトIDに置き換えてください

6. **「作成」** をクリック
7. 表示される **クライアントID** と **クライアントシークレット** をコピーして保存

---

### 2. Supabase での設定

#### 2-1. Google Provider の有効化

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択
3. サイドメニューから **「Authentication」** → **「Providers」** を選択
4. **「Google」** を見つけて有効化
5. Google Cloud Console で取得した以下の情報を入力:
   - **Client ID**: 先ほどコピーしたクライアントID
   - **Client Secret**: 先ほどコピーしたクライアントシークレット
6. **「Save」** をクリック

#### 2-2. リダイレクトURLの確認

Supabaseの設定画面で、以下のリダイレクトURLが正しく設定されていることを確認:
```
http://localhost:3000/auth/callback
```

本番環境では、実際のドメインに変更してください:
```
https://your-domain.com/auth/callback
```

---

### 3. 環境変数の設定（既に設定済みの場合はスキップ）

`.env.local` ファイルに以下を追加（既に設定されている場合は確認のみ）:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

※ これらの値はSupabase Dashboard の **「Settings」** → **「API」** で確認できます

---

## ✅ 動作確認

### デモモード（現在の設定）

現在のアプリケーションは**デモモード**で動作しています。Googleログインボタンをクリックすると、Supabase設定がない場合でも自動的にログインページにリダイレクトされます。

### 本番環境での動作

上記の設定を完了すると、以下の流れでGoogleログインが機能します:

#### 🔄 Googleログインフロー（会社選択機能付き）

1. **ユーザーがGoogleログインボタンをクリック**
2. **Googleの認証画面にリダイレクト**
3. **ユーザーがGoogleアカウントで認証**
4. **`/auth/callback` にリダイレクト**
   - 認証コールバックでユーザー情報を取得
   - `accounts`テーブルに自動的にユーザープロファイル作成（会社未設定）
5. **会社紐付けチェック**
   - ✅ **会社が既に紐付いている場合** → 直接ページ遷移
     - 一般ユーザー: `/search` ページに遷移
     - 管理者: `/vendor` ページに遷移
   - ❌ **会社が未紐付けの場合** → `/auth/company-select` に遷移

#### 🏢 会社選択フロー

**初回Googleログイン時、または会社未設定の場合**:

1. **会社選択画面が表示される** (`/auth/company-select`)
2. **ユーザーが会社を検索**
   - **CST番号で検索**: 完全一致検索（例: CST12345）
   - **会社名で検索**: 部分一致検索（例: 株式会社〇〇）
3. **検索結果から会社を選択**
   - アカウント数の上限チェックが表示される
   - 上限に達している会社は選択不可
4. **会社選択後、自動的にアカウントと会社が紐付け**
5. **元のページへリダイレクト** (`/search` または `/vendor`)

#### 🔒 アカウント上限管理

- 各会社には `contract_account_limit`（契約アカウント上限）が設定されています
- 会社選択時、現在のアカウント数をリアルタイムで表示
- 上限に達している会社は選択できません
- 例: 上限10アカウント、現在8アカウント → あと2アカウント追加可能

---

## 🎯 実装されているページ

- **一般ユーザー用ログイン**: `http://localhost:3000/login`
- **管理画面用ログイン**: `http://localhost:3000/vendor/login`
- **認証コールバック**: `http://localhost:3000/auth/callback`
- **会社選択画面**: `http://localhost:3000/auth/company-select`

両方のログインページにGoogleログインボタンが実装されています。

---

## 🔧 実装されているAPI

### 会社検索API
**エンドポイント**: `GET /api/companies/search`

**パラメータ**:
- `cst_number`: CST番号で検索（完全一致）
- `q`: 会社名で検索（部分一致）

**レスポンス例**:
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "株式会社サンプル",
      "cst_number": "CST12345",
      "address": "東京都渋谷区",
      "contract_account_limit": 10,
      "current_accounts": 5,
      "is_full": false
    }
  ],
  "count": 1
}
```

### 会社紐付けAPI
**エンドポイント**: `POST /api/auth/link-company`

**リクエストボディ**:
```json
{
  "company_id": "uuid"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "message": "株式会社サンプルに紐付けられました",
  "account": { ... },
  "company": { ... }
}
```

**エラーレスポンス**（上限超過時）:
```json
{
  "error": "アカウント上限に達しています",
  "message": "この会社は最大10アカウントまでですが、既に10アカウントが登録されています。"
}
```

---

## 🗄️ データベース設定

### 必要なマイグレーション

Googleログイン時に自動的にユーザープロファイルを作成するため、以下のマイグレーションを適用してください:

**ファイル**: `supabase/migrations/003_auto_create_user_profile.sql`

このマイグレーションは以下を実行します:
1. **トリガー関数の作成**: `handle_new_user()`
   - `auth.users`にユーザーが作成されたら自動的に`accounts`テーブルにレコードを作成
   - 初回は`company_id`がNULL（会社未設定）
   - デフォルトロールは`viewer`
2. **トリガーの設定**: `on_auth_user_created`
   - `auth.users`のINSERT時に発火

### マイグレーション適用方法

#### Supabase CLIを使用する場合
```bash
cd supabase
supabase db push
```

#### Supabase Dashboardを使用する場合
1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択
3. 左メニューから **「SQL Editor」** を選択
4. `supabase/migrations/003_auto_create_user_profile.sql` の内容をコピー&ペースト
5. **「Run」** をクリック

---

## 🔒 セキュリティ上の注意

1. **クライアントシークレット** は絶対にGitにコミットしないでください
2. `.env.local` は `.gitignore` に含まれていることを確認してください
3. 本番環境では、許可されたリダイレクトURIを厳密に管理してください

---

## 🐛 トラブルシューティング

### Googleログインボタンをクリックしても何も起こらない

- ブラウザのコンソールでエラーを確認
- Supabaseの環境変数が正しく設定されているか確認
- デモモードの場合は自動的に検索ページにリダイレクトされます

### "OAuth configuration not found" エラー

- Supabase Dashboard で Google Provider が有効化されているか確認
- Client ID と Client Secret が正しく入力されているか確認

### リダイレクトURIのミスマッチエラー

- Google Cloud Console の承認済みリダイレクトURIが正しいか確認
- Supabase のプロジェクトIDが正しいか確認

### 会社選択画面で会社が見つからない

- CST番号が正しいか確認（完全一致で検索されます）
- 会社名は部分一致で検索できます（例: 「株式会社」だけでも検索可能）
- `companies`テーブルにデータが登録されているか確認

### 「アカウント上限に達しています」エラー

- 会社の`contract_account_limit`を確認
- 現在の`accounts`テーブルで該当会社のアカウント数を確認
- 必要に応じて会社の上限を引き上げるか、不要なアカウントを削除

### 会社選択後もログインページに戻ってしまう

- `accounts`テーブルの`company_id`が正しく更新されているか確認
- ブラウザのコンソールでエラーを確認
- ネットワークタブで`/api/auth/link-company`のレスポンスを確認

---

## 📚 参考リンク

- [Supabase Auth - Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

## 📝 備考

### デモモードから本番環境への移行

デモモードから本番環境に移行する際は、以下のコードを確認してください:

- **`/app/login/page.tsx`** (58-92行目)
- **`/app/vendor/login/page.tsx`** (52-86行目)

デモモード用のフォールバック処理が含まれています。本番環境では、エラーハンドリングを適切に実装してください。

### 会社選択フローの仕組み

1. **自動プロファイル作成**:
   - Googleログイン時、`auth.users`にユーザーが作成されると自動的に`accounts`テーブルにレコードが作成されます
   - この時点では`company_id`はNULL（会社未設定）

2. **会社紐付けチェック**:
   - 認証コールバックで`accounts.company_id`をチェック
   - NULLの場合は会社選択画面へリダイレクト

3. **アカウント上限管理**:
   - 会社選択時に現在のアカウント数を自動カウント
   - `contract_account_limit`と比較して上限チェック
   - 上限超過の場合は選択不可

### 関連ファイル

- **マイグレーション**: `supabase/migrations/003_auto_create_user_profile.sql`
- **会社検索API**: `app/api/companies/search/route.ts`
- **会社紐付けAPI**: `app/api/auth/link-company/route.ts`
- **会社選択画面**: `app/auth/company-select/page.tsx`
- **認証コールバック**: `app/auth/callback/page.tsx`
