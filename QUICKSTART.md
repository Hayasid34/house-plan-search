# 🚀 DandoriFinder クイックスタート

Supabaseデプロイを**最短15分**で完了させる手順です。

## 📝 準備するもの

- [ ] Googleアカウント（Supabase用）
- [ ] Googleアカウント（Google Cloud Console用）
- [ ] メモ帳（API キーを保存）

---

## ⚡ 5ステップで完了

### ステップ1: Supabaseプロジェクト作成（3分）

1. [https://supabase.com](https://supabase.com) にアクセス
2. GitHubでサインアップ
3. **「New Project」** をクリック
   - Name: `dandorifinder`
   - Password: 強力なパスワード（**必ずメモ！**）
   - Region: `Northeast Asia (Tokyo)`
4. **「Create new project」** をクリック
5. **「Settings」** → **「API」** で以下をコピー：
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbG...
   ```

### ステップ2: データベース作成（2分）

1. Supabase Dashboard で **「SQL Editor」** を開く
2. **「New query」** をクリック
3. プロジェクト内の `supabase/deploy-schema.sql` の内容を全てコピー&ペースト
4. **「Run」** をクリック
5. ✅ Success! と表示されれば完了

### ステップ3: Google OAuth設定（5分）

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト作成
3. **「APIとサービス」** → **「認証情報」** → **「OAuth クライアント ID」**
4. アプリケーションの種類: **「ウェブアプリケーション」**
5. リダイレクトURI:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   ※ `xxxxx` は実際のSupabase Project IDに置き換え
6. **クライアントID** と **シークレット** をコピー
7. Supabase Dashboard → **「Authentication」** → **「Providers」** → **「Google」**
8. コピーしたIDとシークレットを貼り付け → **「Save」**

### ステップ4: 環境変数設定（2分）

プロジェクトの `.env.local` を編集：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### ステップ5: 動作確認（3分）

```bash
# 開発サーバー再起動
npm run dev
```

1. ブラウザで `http://localhost:3000/login` にアクセス
2. **「Googleでログイン」** をクリック
3. Google認証画面が表示されることを確認 ✅
4. 認証後、会社選択画面が表示される ✅
5. CST番号 `CST00001` で検索 → 「株式会社サンプル」を選択 ✅
6. 検索ページにリダイレクトされる ✅

---

## 🎉 完了！

おめでとうございます！Supabaseデプロイが完了しました。

### 次にやること

- [ ] 実際の会社データを登録
- [ ] 管理者アカウントの設定
- [ ] Vercel/Netlifyに本番デプロイ

---

## 📚 詳細ドキュメント

より詳しい説明は以下を参照：
- **完全ガイド**: [SUPABASE_DEPLOY.md](./SUPABASE_DEPLOY.md)
- **Google OAuth設定**: [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)

---

## 🆘 困ったときは

### Googleログインでエラーが出る

→ Google Cloud Console のリダイレクトURIが正しいか確認

### 会社選択画面で会社が見つからない

→ `supabase/deploy-schema.sql` が正しく実行されたか確認

### 環境変数が反映されない

→ 開発サーバーを再起動（`npm run dev`）
