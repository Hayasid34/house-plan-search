// 住所→座標変換 API クライアント

import { API_CONFIG } from './apiConfig';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
  prefecture?: string;
  city?: string;
  town?: string;
}

/**
 * HeartRails Geo API を使用して住所から座標を取得
 */
async function geocodeWithHeartRails(address: string): Promise<GeocodingResult> {
  const url = new URL(API_CONFIG.geocoding.heartRails.baseUrl);
  url.searchParams.set('method', 'searchByGeoLocation');
  url.searchParams.set('q', address);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`HeartRails API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.response || !data.response.location || data.response.location.length === 0) {
    throw new Error('住所が見つかりませんでした');
  }

  const location = data.response.location[0];

  return {
    coordinates: {
      lat: parseFloat(location.y),
      lng: parseFloat(location.x),
    },
    formattedAddress: location.address || address,
    prefecture: location.prefecture,
    city: location.city,
    town: location.town,
  };
}

/**
 * Google Maps Geocoding API を使用して住所から座標を取得
 */
async function geocodeWithGoogle(address: string): Promise<GeocodingResult> {
  const apiKey = API_CONFIG.geocoding.google.apiKey;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  const url = new URL(API_CONFIG.geocoding.google.baseUrl);
  url.searchParams.set('address', address);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('region', 'jp'); // 日本優先
  url.searchParams.set('language', 'ja'); // 日本語

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error(`住所が見つかりませんでした: ${data.status}`);
  }

  const result = data.results[0];
  const location = result.geometry.location;

  // 住所コンポーネントから都道府県・市区町村を抽出
  const addressComponents = result.address_components;
  const prefecture = addressComponents.find((c: any) =>
    c.types.includes('administrative_area_level_1')
  )?.long_name;
  const city = addressComponents.find((c: any) =>
    c.types.includes('locality') || c.types.includes('administrative_area_level_2')
  )?.long_name;
  const town = addressComponents.find((c: any) =>
    c.types.includes('sublocality_level_1') || c.types.includes('sublocality')
  )?.long_name;

  return {
    coordinates: {
      lat: location.lat,
      lng: location.lng,
    },
    formattedAddress: result.formatted_address,
    prefecture,
    city,
    town,
  };
}

/**
 * 住所から座標を取得（プロバイダーを自動選択）
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  const provider = API_CONFIG.provider;

  try {
    // Googleプロバイダーの場合
    if (provider === 'google' && API_CONFIG.geocoding.google.apiKey) {
      return await geocodeWithGoogle(address);
    }

    // デフォルトはHeartRails（無料）
    return await geocodeWithHeartRails(address);
  } catch (error) {
    console.error('Geocoding error:', error);

    // フォールバック: HeartRails→Google
    if (provider === 'google') {
      try {
        console.log('Falling back to HeartRails API');
        return await geocodeWithHeartRails(address);
      } catch (fallbackError) {
        console.error('Fallback geocoding error:', fallbackError);
        throw fallbackError;
      }
    }

    throw error;
  }
}

/**
 * 複数の住所を一括で座標変換
 */
export async function geocodeAddresses(addresses: string[]): Promise<GeocodingResult[]> {
  const results = await Promise.allSettled(
    addresses.map(address => geocodeAddress(address))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<GeocodingResult> =>
      result.status === 'fulfilled'
    )
    .map(result => result.value);
}
