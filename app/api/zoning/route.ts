// 用途地域取得 API Route
// GET /api/zoning?lat=35.6812&lng=139.7671

import { NextRequest, NextResponse } from 'next/server';
import { ZoningDistrict } from '@/lib/zoningData';

/**
 * TODO: 実際の実装では以下のいずれかを使用
 * 1. PostGIS + 国土交通省GeoJSONデータ
 * 2. 外部APIへのプロキシ
 * 3. キャッシュされたデータベース
 */

// 仮の用途地域データ（実装例）
// 実際には座標に基づいてGeoJSON検索やDB検索を行う
function getZoningDistrictByCoordinates(lat: number, lng: number): ZoningDistrict {
  // TODO: 実際の実装
  // 1. PostGISでポイントインポリゴン検索
  // 2. GeoJSONファイルから検索
  // 3. 外部APIを呼び出し

  // デモ用: 座標範囲で簡易判定
  // 東京23区の中心付近
  if (lat >= 35.6 && lat <= 35.75 && lng >= 139.6 && lng <= 139.85) {
    // 渋谷・港区エリア
    if (lat >= 35.65 && lng >= 139.70) {
      return {
        name: '商業地域',
        buildingCoverageRatio: 80,
        floorAreaRatio: 600,
        description: '銀行、映画館、飲食店、百貨店などが集まる地域。',
      };
    }
    // 住宅エリア
    return {
      name: '第一種低層住居専用地域',
      buildingCoverageRatio: 50,
      floorAreaRatio: 100,
      heightLimit: 10,
      description: '低層住宅のための地域。2階建て以下が中心。',
    };
  }

  // 大阪市エリア
  if (lat >= 34.6 && lat <= 34.75 && lng >= 135.45 && lng <= 135.55) {
    return {
      name: '近隣商業地域',
      buildingCoverageRatio: 80,
      floorAreaRatio: 300,
      description: '近隣の住民が日用品を買物などをする地域。住宅も可。',
    };
  }

  // デフォルト
  return {
    name: '第一種住居地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 300,
    description: '住居の環境を守るための地域。大規模店舗以外の店舗も可。',
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    // パラメータ検証
    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: 'lat and lng parameters are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // 座標の範囲チェック（日本国内）
    if (lat < 20 || lat > 46 || lng < 122 || lng > 154) {
      return NextResponse.json(
        { error: 'Coordinates are outside Japan' },
        { status: 400 }
      );
    }

    // 用途地域を取得
    const zoningDistrict = getZoningDistrictByCoordinates(lat, lng);

    // レスポンス
    return NextResponse.json(
      {
        zoningDistrict,
        coordinates: { lat, lng },
        timestamp: new Date().toISOString(),
        source: 'demo', // 'postgis' | 'geojson' | 'external-api' など
      },
      {
        headers: {
          // キャッシュ設定（1年間）
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (error) {
    console.error('Zoning API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
