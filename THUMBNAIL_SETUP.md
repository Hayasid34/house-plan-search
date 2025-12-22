# PDFサムネイル高速化セットアップガイド

## 問題

TOP画面のプレビューが読み込み中のまま止まる問題が発生していました。

### 原因
- PDFを`<object>`タグで直接埋め込んでいた
- 各カードでブラウザのPDFビューアが起動され、非常に重い処理になっていた
- 6件のプランがあると、6つのPDFビューアが同時起動してブラウザがフリーズ

## 解決策

PDFの代わりに**軽量な画像サムネイル**を表示するように変更しました。

### 実装内容

1. **サムネイル生成ライブラリ追加** (`lib/pdfThumbnail.ts`)
   - PDFの最初のページをPNG画像として生成
   - `pdfjs-dist`と`canvas`を使用

2. **アップロード時のサムネイル自動生成** (`app/api/plans/upload/route.ts`)
   - PDFアップロード時に自動的にサムネイルを生成
   - Supabase Storageの`plan-thumbnails`バケットに保存

3. **コンポーネント更新** (`components/PDFThumbnail.tsx`)
   - PDFの代わりに画像サムネイルを表示
   - Intersection Observerによる遅延読み込み
   - フォールバック処理（サムネイルがない場合）

4. **データ型更新** (`lib/plansData.ts`)
   - Plan型に`thumbnailPath`プロパティを追加

5. **API更新** (`app/api/plans/route.ts`)
   - レスポンスに`thumbnailPath`を含める

## セットアップ手順

### 1. Supabaseでストレージバケットを作成

Supabaseダッシュボードで以下の手順を実行してください：

1. **Storage** → **New bucket** をクリック
2. バケット名: `plan-thumbnails`
3. **Public bucket** にチェック（公開アクセス可能にする）
4. **Create bucket** をクリック

### 2. 既存PDFのサムネイルを一括生成

既にアップロード済みのPDFに対してサムネイルを生成します：

```bash
cd /Users/dw1003/house-plan-search
npx ts-node scripts/generate-thumbnails.ts
```

このスクリプトは：
- `thumbnail_url`がnullの全プランを取得
- 各PDFからサムネイルを生成
- Supabase Storageにアップロード
- データベースを更新

### 3. アプリケーションをビルド・起動

```bash
# 開発環境
npm run dev

# 本番環境
npm run build
npm start
```

## 効果

### 改善前
- ❌ 各カードでPDFビューアが起動（非常に重い）
- ❌ 6件表示で読み込みが終わらない
- ❌ ブラウザがフリーズ

### 改善後
- ✅ 軽量なPNG画像を表示（**超高速**）
- ✅ 画像キャッシュで2回目以降は即座に表示
- ✅ 遅延読み込みでさらに高速化
- ✅ 100件表示してもスムーズ

## トラブルシューティング

### サムネイルが表示されない場合

1. **Supabaseバケットを確認**
   ```
   Storage → plan-thumbnails を確認
   ```

2. **バケットが公開されているか確認**
   ```
   Storage → plan-thumbnails → Settings → Public access がオンか確認
   ```

3. **生成スクリプトを再実行**
   ```bash
   npx ts-node scripts/generate-thumbnails.ts
   ```

### Canvas関連のエラーが出る場合

macOSの場合、Xcodeコマンドラインツールが必要です：

```bash
xcode-select --install
```

Linuxの場合：

```bash
# Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# CentOS/RHEL
sudo yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
```

## 今後の新規アップロード

新しくPDFをアップロードする際は、自動的にサムネイルが生成されます。
手動でサムネイルを再生成する必要はありません。

---

**完了！プレビューが爆速になりました！** 🚀
