# Vercelデプロイガイド

このドキュメントでは、DandoriFinderをVercelにデプロイする手順を説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [GitHubへのプッシュ](#githubへのプッシュ)
3. [Vercelアカウント作成](#vercelアカウント作成)
4. [プロジェクトのインポート](#プロジェクトのインポート)
5. [環境変数の設定](#環境変数の設定)
6. [デプロイの実行](#デプロイの実行)
7. [Supabase設定の更新](#supabase設定の更新)
8. [動作確認](#動作確認)

---

## 前提条件

- [x] Supabaseプロジェクトが作成済み
- [x] GitHubリポジトリが作成済み
- [x] ローカルで動作確認済み

---

## 1. GitHubへのプッシュ

### 1-1. 変更をコミット

最新の変更をGitHubにプッシュします：

```bash
# すべての変更をステージング
git add .

# コミット
git commit -m "Add Google login and company selection flow

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHubにプッシュ
git push origin main
```

### 1-2. プッシュの確認

GitHubリポジトリにアクセスして、最新の変更が反映されているか確認：
```
https://github.com/Hayasid34/house-plan-search
```

---

## 2. Vercelアカウント作成

### 2-1. Vercelにアクセス

1. [https://vercel.com](https://vercel.com) にアクセス
2. **「Sign Up」** をクリック
3. **「Continue with GitHub」** を選択
4. GitHubアカウントで認証

---

## 3. プロジェクトのインポート

### 3-1. 新しいプロジェクトを作成

1. Vercel ダッシュボードで **「Add New」** → **「Project」** をクリック
2. **「Import Git Repository」** セクションで `house-plan-search` を検索
3. **「Import」** をクリック

### 3-2. プロジェクト設定

**Framework Preset**: Next.js（自動検出）
**Root Directory**: `.`（デフォルト）
**Build Command**: `npm run build`（デフォルト）
**Output Directory**: `.next`（デフォルト）

---

## 4. 環境変数の設定

デプロイ前に、以下の環境変数を設定します。

### 4-1. Vercelで環境変数を追加

**Configure Project** ページで **「Environment Variables」** セクションまでスクロール

以下の環境変数を追加：

#### Supabase設定

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zmojbbvpavnqhekitild.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb2piYnZwYXZucWhla2l0aWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTA3MTQsImV4cCI6MjA3ODE4NjcxNH0.NwqS1LjvHNwHJEiHMvLtzwQn_b6c76pCiSBWIpYXORY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb2piYnZwYXZucWhla2l0aWxkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYxMDcxNCwiZXhwIjoyMDc4MTg2NzE0fQ.yZq3s5eXa5jwpSOSBxQ9AwJTAe99wDV9ZnP_r8m29Dc` |

⚠️ **重要**: すべての環境変数は **Production**, **Preview**, **Development** の3つの環境すべてにチェックを入れてください。

### 4-2. 環境変数を追加する手順

1. 変数名を入力（例: `NEXT_PUBLIC_SUPABASE_URL`）
2. 値を貼り付け
3. 環境を選択（Production, Preview, Development すべて）
4. **「Add」** をクリック
5. 次の変数を追加（上記3つすべて）

---

## 5. デプロイの実行

### 5-1. デプロイ開始

1. 環境変数の設定が完了したら **「Deploy」** をクリック
2. デプロイプロセスが開始されます（通常2〜3分）

### 5-2. デプロイ進行状況

以下のステップが実行されます：
- ✅ Building
- ✅ Deploying
- ✅ Assigning Domain

### 5-3. デプロイ完了

**「Congratulations!」** 画面が表示されたら、デプロイ完了です。

デプロイされたURLを確認：
```
https://house-plan-search-xxxxxxx.vercel.app
```

---

## 6. Supabase設定の更新

### 6-1. Redirect URLsの追加

Googleログインを動作させるため、Supabaseにデプロイされたドメインを登録します。

1. [Supabase Dashboard](https://app.supabase.com) にアクセス
2. プロジェクトを選択
3. **「Authentication」** → **「URL Configuration」** を開く

### 6-2. Site URLを更新

**Site URL** を本番環境のURLに変更：
```
https://house-plan-search-xxxxxxx.vercel.app
```

### 6-3. Redirect URLsを追加

**Redirect URLs** に以下を追加：
```
https://house-plan-search-xxxxxxx.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

※ `xxxxxxx` は実際のVercelドメインに置き換えてください

4. **「Save」** をクリック

---

## 7. Google OAuth設定の更新（オプション）

GoogleログインをVercelで使用する場合、Google Cloud Consoleの設定も更新します。

### 7-1. Google Cloud Consoleにアクセス

1. [Google Cloud Console](https://console.cloud.google.com/)
2. **「APIとサービス」** → **「認証情報」**
3. 作成したOAuth 2.0クライアントIDを選択

### 7-2. 承認済みリダイレクトURIを追加

以下を追加：
```
https://zmojbbvpavnqhekitild.supabase.co/auth/v1/callback
```

**「保存」** をクリック

---

## 8. 動作確認

### 8-1. デプロイされたサイトにアクセス

1. Vercelから発行されたURLにアクセス
   ```
   https://house-plan-search-xxxxxxx.vercel.app
   ```

2. ログインページにアクセス
   ```
   https://house-plan-search-xxxxxxx.vercel.app/login
   ```

### 8-2. デモアカウントでテスト

デモアカウントでログインして動作確認：
- ユーザー名: `demo`
- パスワード: `demo123`

### 8-3. Googleログインをテスト（OAuth設定済みの場合）

1. **「Googleでログイン」** をクリック
2. Googleアカウントで認証
3. 会社選択画面が表示される
4. CST番号 `CST00001` で検索
5. 「株式会社サンプル」を選択
6. `/search` ページにリダイレクトされる

---

## 🎉 デプロイ完了！

おめでとうございます！Vercelへのデプロイが完了しました。

### デプロイされたアプリのURL

**本番環境**: `https://house-plan-search-xxxxxxx.vercel.app`

### カスタムドメインの設定（オプション）

独自ドメインを使用したい場合：

1. Vercel Dashboard → プロジェクトを選択
2. **「Settings」** → **「Domains」**
3. カスタムドメインを追加（例: `dandorifinder.com`）
4. DNS設定を更新（Vercelが指示を表示）

---

## 🔄 継続的デプロイ

Vercelは自動的にGitHubと連携しています：

- **main ブランチにプッシュ** → 本番環境に自動デプロイ
- **プルリクエスト作成** → プレビュー環境を自動作成

### ローカルで変更を加えた場合

```bash
# 変更を加える
git add .
git commit -m "Update feature"
git push origin main
```

→ Vercelが自動的に新しいバージョンをデプロイします（通常2〜3分）

---

## 🐛 トラブルシューティング

### ビルドエラーが発生する

- **原因**: TypeScriptエラーやlintエラー
- **解決**: ローカルで `npm run build` を実行してエラーを確認

### 環境変数が反映されない

- **原因**: 環境変数の設定ミス
- **解決**: Vercel Dashboard → Settings → Environment Variables で確認

### Googleログインが動作しない

- **原因**: Supabaseのリダイレクト設定が不足
- **解決**: Supabase Dashboard → Authentication → URL Configuration を確認

### 500エラーが発生する

- **原因**: Supabase接続エラー
- **解決**: Vercel Dashboard → Deployments → 最新デプロイ → Function Logs を確認

---

## 📚 参考ドキュメント

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🔐 セキュリティのベストプラクティス

1. ✅ `.env.local` は必ず `.gitignore` に含める
2. ✅ Supabase Service Role Key は本番環境のみで使用
3. ✅ RLS (Row Level Security) を必ず有効化
4. ✅ HTTPS のみで運用（Vercelはデフォルトで対応）
5. ✅ 定期的にSupabaseのアクセスログを確認
