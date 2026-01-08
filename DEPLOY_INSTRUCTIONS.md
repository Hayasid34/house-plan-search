# デプロイ手順

## 現在の状況

以下の変更がローカルにコミットされています（コミットID: e68d8b0）:

### 追加された機能
1. **ローカル認証システム** - Supabase接続不可時の代替認証
   - テストアカウント1: `admin` / `admin123`
   - テストアカウント2: `admin@test.com` / `password123`

2. **PDFサムネイル生成機能**
   - 自動サムネイル生成スクリプト
   - サムネイル表示コンポーネント

3. **ドキュメント追加**
   - `ACCOUNT_SETUP.md` - アカウント作成手順
   - `THUMBNAIL_SETUP.md` - サムネイル設定手順

### 変更されたファイル
- `app/api/auth/login/route.ts` - ローカル認証フォールバック追加
- `app/api/plans/route.ts` - プラン取得APIの改善
- `app/api/plans/upload/route.ts` - アップロード処理の改善
- `components/PDFThumbnail.tsx` - サムネイル表示
- `components/PlanCard.tsx` - カード表示の改善
- その他

---

## GitHubにプッシュする方法

### オプション1: SSH鍵を追加（推奨）

1. https://github.com/settings/keys にアクセス（Hayasid34アカウント）
2. 「New SSH key」をクリック
3. 以下の公開鍵を貼り付け:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIA8QpUlIEwq+hV4pTROt4+loMPNpde8G25f+IoKSl7HH hayashi.takashi@dandori-work.com
```

4. 「Add SSH key」をクリック
5. ターミナルで実行:

```bash
cd ~/house-plan-search
git push origin main
```

### オプション2: GitHub Desktop使用

1. GitHub Desktopを開く
2. `house-plan-search`リポジトリを選択
3. 「Push origin」ボタンをクリック

### オプション3: VS Code使用

1. VS Codeで`house-plan-search`フォルダを開く
2. 左サイドバーのSource Control（ソース管理）を開く
3. 「Sync Changes」または「Push」ボタンをクリック

---

## デプロイの確認

プッシュが完了すると：

1. **Vercel**: 自動的に新しいデプロイが開始されます
   - https://vercel.com/dashboard で確認できます
   - 通常2-3分でデプロイ完了

2. **デプロイ後の動作確認**:
   - デプロイされたURLにアクセス
   - ログイン画面で `admin` / `admin123` でログイン
   - 正常にログインできればOK

---

## トラブルシューティング

### プッシュできない場合

**エラー**: "Permission denied"

**原因**: SSH鍵がGitHubアカウントに登録されていない

**解決**: 上記「オプション1」の手順に従ってSSH鍵を追加

---

**作成日**: 2024年12月22日
**コミットID**: e68d8b0
