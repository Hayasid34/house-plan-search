# 用途地域API統合ガイド

## 現在の状態

✅ **モックデータで動作中**
- 全47都道府県の主要都市データ
- 約80市区町村、300+の大字データ
- ドロップダウンと住所検索に対応

## API統合への移行

### 段階的な移行プラン

#### Phase 1: 無料APIで試す（現在可能）

1. **HeartRails Geo API を有効化**
```bash
# .env.local を作成
cp .env.local.example .env.local

# 設定を変更
NEXT_PUBLIC_ZONING_API_PROVIDER=heartRails
```

2. **動作確認**
- 住所検索で座標取得が可能に
- 用途地域はまだモックデータ

#### Phase 2: カスタムAPI実装（推奨）

1. **国土交通省データをダウンロード**
```bash
# 都市計画決定情報をダウンロード
wget https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-A29-v2_2.html
```

2. **PostGISデータベースセットアップ**
```bash
# PostgreSQL + PostGISをインストール
docker run --name postgis -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgis/postgis

# GeoJSONデータをインポート
npm run import-geojson
```

3. **API Routeを実装に置き換え**
```typescript
// app/api/zoning/route.ts
// getZoningDistrictByCoordinates() を実装
```

#### Phase 3: 商用サービス統合（本番環境）

1. **Google Maps API を設定**
```bash
# .env.local
NEXT_PUBLIC_ZONING_API_PROVIDER=google
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```

2. **キャッシュ機能を有効化**
- Vercel KV または Redis を設定
- API呼び出しを削減してコスト最適化

## ファイル構成

```
house-plan-search/
├── lib/
│   ├── api/
│   │   ├── apiConfig.ts          # ✅ API設定（作成済み）
│   │   ├── geocodingClient.ts    # ✅ 住所→座標（作成済み）
│   │   └── zoningClient.ts       # ✅ 座標→用途地域（作成済み）
│   └── zoningData.ts             # ✅ モックデータ（フォールバック用）
├── app/
│   └── api/
│       └── zoning/
│           └── route.ts          # ✅ API Route（作成済み）
└── docs/
    └── ZONING_API_INTEGRATION.md # ✅ 詳細設計（作成済み）
```

## 使い方

### 開発環境（現在）
```typescript
// そのまま使用可能、モックデータで動作
```

### HeartRails API（無料）を試す
```typescript
// .env.local
NEXT_PUBLIC_ZONING_API_PROVIDER=heartRails

// 自動的にHeartRails Geo APIを使用して住所→座標変換
```

### カスタムAPI実装後
```typescript
// page.tsxで使用
import { getZoningByAddress } from '@/lib/api/zoningClient';

const zoningInfo = await getZoningByAddress('東京都渋谷区道玄坂');
// → { zoningDistrict, coordinates, source: 'api' }
```

## API呼び出しコスト試算

### HeartRails（無料）+ 自前PostGIS
- Geocoding: 無料（HeartRails）
- 用途地域: 無料（自前API）
- インフラ: $20-50/月（Vercel Pro + Supabase等）

### Google Maps + 自前PostGIS
- Geocoding: $5/1000件
- 用途地域: 無料（自前API）
- 月10,000検索で約$50-70/月

### 完全外注（例: ゼンリンAPI）
- 従量課金: 詳細は要問い合わせ
- 月額: 推定$200-500/月

## 次のステップ

### すぐに実行可能
1. [ ] `.env.local`を作成して HeartRails を試す
2. [ ] `/api/zoning` エンドポイントをテスト

### 本番環境準備
1. [ ] 国土交通省データをダウンロード
2. [ ] PostGIS環境をセットアップ
3. [ ] GeoJSONインポートスクリプト作成
4. [ ] API Route実装を完成させる
5. [ ] キャッシュ機能追加

### 商用リリース前
1. [ ] Google Maps API契約
2. [ ] Redis/Vercel KV設定
3. [ ] レート制限実装
4. [ ] エラーモニタリング設定

## サポートドキュメント

- 詳細設計: `docs/ZONING_API_INTEGRATION.md`
- API設定: `lib/api/apiConfig.ts`
- 実装例: `lib/api/geocodingClient.ts`, `lib/api/zoningClient.ts`

## お問い合わせ

API統合について質問がある場合は、開発チームに問い合わせてください。
