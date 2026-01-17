// API設定

export type ZoningAPIProvider = 'mock' | 'heartRails' | 'google' | 'custom';

export const API_CONFIG = {
  // APIプロバイダー（環境変数で切り替え可能）
  provider: (process.env.NEXT_PUBLIC_ZONING_API_PROVIDER as ZoningAPIProvider) || 'mock',

  // Geocoding API設定
  geocoding: {
    // HeartRails Geo API（無料、日本特化）
    heartRails: {
      baseUrl: 'https://geoapi.heartrails.com/api/json',
      // APIキー不要
    },

    // Google Maps Geocoding API（有料、高精度）
    google: {
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      baseUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
    },
  },

  // 用途地域API設定
  zoning: {
    // カスタムAPI（自前でホスティングする場合）
    custom: {
      baseUrl: process.env.NEXT_PUBLIC_ZONING_API_URL || '/api/zoning',
    },
  },

  // キャッシュ設定
  cache: {
    enabled: true,
    ttl: 30 * 24 * 60 * 60 * 1000, // 30日（ミリ秒）
    maxSize: 50 * 1024 * 1024, // 50MB
  },
} as const;
