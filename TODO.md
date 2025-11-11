# DandoriFinder タスクリスト

## 🔴 緊急・優先度高

- [ ] パスワード変更機能を本番環境にデプロイ（GitHubへプッシュ）
- [ ] 本番環境でのパスワード変更機能テスト（Cookie削除→再ログイン→テスト）

## 🟡 中優先度

- [ ] **各社ごとの公開ページ機能を設計・実装**
  - URLパターンの決定（パス/サブドメイン/カスタムドメイン）
  - アクセス制御の方針（公開/会社メンバーのみ/unlisted）
  - 表示内容の決定（プラン一覧、会社情報、検索機能など）
- [ ] アカウント作成依頼メール送信機能（Resend APIキー設定後にデプロイ）

## 🟢 通常優先度（API Route化）

### クライアント側（settings）
- [ ] アカウント更新API Route作成（settings側 - ベンダー側と同期）
  - ファイル: `/app/settings/accounts/page.tsx:76`
- [ ] アカウント削除API Route作成（settings側 - ベンダー側と同期）
  - ファイル: `/app/settings/accounts/page.tsx:137`

### ベンダー側（vendor）
- [ ] アカウント作成API Route作成（vendor側 - クライアント側と同期）
  - ファイル: `/app/vendor/accounts/page.tsx:242`
- [ ] アカウント更新API Route作成（vendor側 - クライアント側と同期）
  - ファイル: `/app/vendor/accounts/page.tsx:295`
- [ ] パスワード更新API Route作成（vendor側）
  - ファイル: `/app/vendor/accounts/page.tsx:340`
  - 注記: `/app/api/accounts/[id]/password/route.ts` は既に実装済み
- [ ] アカウント削除API Route作成（vendor側 - クライアント側と同期）
  - ファイル: `/app/vendor/accounts/page.tsx:352`

---

**最終更新**: 2025-11-11
**総タスク数**: 9個
**完了**: 0個
**残り**: 9個
