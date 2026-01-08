# 用途地域API統合計画

## 概要
モックデータから実際の用途地域APIへの移行計画

## 利用可能なデータソース

### 1. 国土交通省 都市計画決定情報
- **URL**: https://nlftp.mlit.go.jp/ksj/
- **データ形式**: GeoJSON, Shapefile
- **更新頻度**: 年次
- **費用**: 無料
- **カバレッジ**: 全国
- **制限事項**: リアルタイム更新ではない、APIではなくファイルダウンロード形式

### 2. 地理院地図API
- **URL**: https://maps.gsi.go.jp/
- **データ形式**: タイル、API
- **費用**: 無料
- **制限事項**: 用途地域情報は限定的

### 3. 各自治体のオープンデータ
- **例**: 東京都オープンデータカタログ
- **データ形式**: CSV, JSON, GeoJSON
- **費用**: 無料
- **制限事項**: 自治体ごとにフォーマットが異なる

### 4. 民間サービス（推奨）

#### A. ゼンリン住宅地図API
- **費用**: 有料（従量課金）
- **精度**: 非常に高い
- **カバレッジ**: 全国
- **URL**: https://www.zenrin.co.jp/product/category/gis/api/

#### B. GEOSPACE API（NTT空間情報）
- **費用**: 有料
- **精度**: 高い
- **機能**: 住所→座標変換、用途地域情報
- **URL**: https://www.geospace.jp/

#### C. HeartRails Geo API（無料枠あり）
- **URL**: https://geoapi.heartrails.com/
- **費用**: 基本無料、商用利用は要相談
- **機能**: 住所→座標変換
- **制限事項**: 用途地域情報は提供していない

## 推奨アーキテクチャ

### フェーズ1: 住所→座標変換
```
住所入力 → Geocoding API → 緯度経度
```

**使用API候補**:
1. Google Maps Geocoding API（有料、精度高）
2. HeartRails Geo API（無料、日本特化）
3. 国土地理院 geocode API

### フェーズ2: 座標→用途地域取得
```
緯度経度 → 用途地域判定API → 用途地域情報
```

**実装方法**:
1. **オプションA**: 国土交通省のGeoJSONデータをダウンロードして自前でホスティング
   - 利点: 無料、制限なし
   - 欠点: 初期セットアップが複雑、データ更新の手間

2. **オプションB**: 民間APIサービスを利用
   - 利点: 実装が簡単、常に最新
   - 欠点: 月額費用が発生

3. **オプションC**: ハイブリッド（推奨）
   - 主要都市は自前DBでキャッシュ
   - それ以外はAPIで取得
   - キャッシュにより API呼び出しを削減

## 実装計画

### ステップ1: 環境変数とAPI設定
```typescript
// .env.local
GEOCODING_API_KEY=xxx
ZONING_API_KEY=xxx
ZONING_API_PROVIDER=mock|heartRails|google|custom
```

### ステップ2: APIクライアント作成
```typescript
// lib/api/geocodingClient.ts
export async function getCoordinates(address: string): Promise<{lat: number, lng: number}>

// lib/api/zoningClient.ts
export async function getZoningInfo(lat: number, lng: number): Promise<ZoningDistrict>
```

### ステップ3: 既存コードの更新
```typescript
// 現在
const oaza = availableOazas.find(o => o.id === selectedOazaId);

// API統合後
const zoningInfo = await getZoningByAddress(fullAddress);
```

### ステップ4: フォールバック機能
```typescript
try {
  // API呼び出し
  return await getZoningFromAPI(address);
} catch (error) {
  // フォールバック: モックデータ
  return getZoningFromMockData(address);
}
```

## データキャッシュ戦略

### ローカルキャッシュ
```typescript
// lib/cache/zoningCache.ts
- IndexedDB にキャッシュ
- 有効期限: 30日
- 容量制限: 50MB
```

### サーバーサイドキャッシュ
```typescript
// API Routes with Redis/Vercel KV
- GET /api/zoning?address=xxx
- キャッシュ期間: 1年
- 更新頻度: 都市計画変更時
```

## コスト試算

### Google Maps Platform (Geocoding + Places)
- Geocoding: $5 / 1000リクエスト
- 月間10,000検索 = $50/月

### 自前ホスティング（GeoJSON + PostGIS）
- サーバー費用: $20-50/月
- メンテナンス: 初期セットアップ + 年次更新

### HeartRails（無料枠）
- 住所→座標のみ: 無料
- 用途地域は別途必要

## 推奨実装プラン

### 開発フェーズ（現在）
✅ モックデータのまま

### MVP/テストフェーズ
1. HeartRails Geo API で住所→座標変換（無料）
2. 国土交通省GeoJSONデータをVercelでホスティング
3. 座標から用途地域をGeoJSON検索

### 商用リリースフェーズ
1. Google Maps Geocoding API（精度重視）
2. PostGIS + 国土交通省データ（コスト削減）
3. Redis/Vercel KVでキャッシュ（パフォーマンス）

## ファイル構成
```
lib/
├── api/
│   ├── geocodingClient.ts      # 住所→座標変換
│   ├── zoningClient.ts         # 座標→用途地域
│   └── apiConfig.ts            # API設定
├── cache/
│   └── zoningCache.ts          # キャッシュ管理
├── data/
│   └── zoningGeoJSON/          # 自前GeoJSONデータ
└── zoningData.ts               # 既存（フォールバック用）
```

## Next Steps
1. [ ] HeartRails Geo APIの動作確認
2. [ ] 国土交通省GeoJSONデータのダウンロードと変換
3. [ ] API切り替え可能な設計に変更
4. [ ] キャッシュ機能の実装
5. [ ] エラーハンドリングとフォールバック実装
