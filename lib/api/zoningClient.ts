// 座標→用途地域取得 API クライアント

import { API_CONFIG } from './apiConfig';
import { ZoningDistrict } from '@/lib/zoningData';
import { Coordinates } from './geocodingClient';

export interface ZoningInfo {
  zoningDistrict: ZoningDistrict;
  source: 'api' | 'cache' | 'mock';
  timestamp: string;
}

/**
 * カスタムAPIから用途地域情報を取得
 */
async function getZoningFromCustomAPI(coordinates: Coordinates): Promise<ZoningInfo> {
  const url = new URL(API_CONFIG.zoning.custom.baseUrl, window.location.origin);
  url.searchParams.set('lat', coordinates.lat.toString());
  url.searchParams.set('lng', coordinates.lng.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Zoning API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    zoningDistrict: data.zoningDistrict,
    source: 'api',
    timestamp: new Date().toISOString(),
  };
}

/**
 * モックデータから用途地域情報を取得（フォールバック）
 */
function getZoningFromMock(coordinates: Coordinates): ZoningInfo {
  // デフォルトの用途地域（第一種住居地域）を返す
  return {
    zoningDistrict: {
      name: '第一種住居地域',
      buildingCoverageRatio: 60,
      floorAreaRatio: 300,
      description: '住居の環境を守るための地域。大規模店舗以外の店舗も可。',
    },
    source: 'mock',
    timestamp: new Date().toISOString(),
  };
}

/**
 * 座標から用途地域情報を取得
 */
export async function getZoningByCoordinates(coordinates: Coordinates): Promise<ZoningInfo> {
  const provider = API_CONFIG.provider;

  // モックモードの場合
  if (provider === 'mock') {
    return getZoningFromMock(coordinates);
  }

  try {
    // カスタムAPIから取得を試みる
    return await getZoningFromCustomAPI(coordinates);
  } catch (error) {
    console.error('Zoning API error:', error);
    console.log('Falling back to mock data');

    // フォールバック: モックデータ
    return getZoningFromMock(coordinates);
  }
}

/**
 * 住所から直接用途地域情報を取得（Geocoding + Zoning）
 */
export async function getZoningByAddress(address: string): Promise<ZoningInfo & { coordinates: Coordinates }> {
  // まず住所から座標を取得
  const { geocodeAddress } = await import('./geocodingClient');
  const geocodingResult = await geocodeAddress(address);

  // 座標から用途地域を取得
  const zoningInfo = await getZoningByCoordinates(geocodingResult.coordinates);

  return {
    ...zoningInfo,
    coordinates: geocodingResult.coordinates,
  };
}
