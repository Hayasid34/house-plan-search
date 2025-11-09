'use client';

import { useState } from 'react';

export interface SearchFilters {
  layout: string;
  floors: string;
  minArea: string;
  maxArea: string;
  minSiteArea: string;
  maxSiteArea: string;
  features: string[];
  direction: string;
  favoriteOnly?: boolean;
}

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  totalCount?: number;
}

const layoutOptions = ['', '2LDK', '3LDK', '4LDK', '5LDK', '6LDK', '-'];
const floorsOptions = ['', '平屋', '2階建て', '3階建て', '-'];
const directionOptions = ['', '北', '南', '東', '西', '北東', '北西', '南東', '南西', '-'];

const featureOptions = [
  '吹き抜け',
  'ロフト',
  'スキップフロア',
  '中庭（パティオ）',
  '回遊動線',
  '家事動線',
  'アイランドキッチン／アイランド動線',
  '玄関土間',
  'シューズクローク',
  'パントリー',
  'ランドリールーム（脱衣分離含む）',
  'ファミリースペース／スタディコーナー',
  'リビング階段',
  'セカンドリビング',
  'ウォークインクローゼット',
  '対面キッチン',
  '2階リビング',
  '和室',
  'サンルーム',
  '駐車1台',
  '駐車2台',
  '駐車3台',
  '駐車4台',
];

export default function SearchForm({ onSearch, totalCount }: SearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    layout: '',
    floors: '',
    minArea: '',
    maxArea: '',
    minSiteArea: '',
    maxSiteArea: '',
    features: [],
    direction: '',
    favoriteOnly: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      layout: '',
      floors: '',
      minArea: '',
      maxArea: '',
      minSiteArea: '',
      maxSiteArea: '',
      features: [],
      direction: '',
      favoriteOnly: false,
    });
    onSearch({
      layout: '',
      floors: '',
      minArea: '',
      maxArea: '',
      minSiteArea: '',
      maxSiteArea: '',
      features: [],
      direction: '',
      favoriteOnly: false,
    });
  };

  // お気に入りフィルター切り替え
  const handleFavoriteToggle = () => {
    const newFilters = { ...filters, favoriteOnly: !filters.favoriteOnly };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  // 特徴の選択/解除
  const handleFeatureToggle = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];

    const newFilters = { ...filters, features: newFeatures };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-line-separator">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-text-primary">プラン検索</h2>
        {totalCount !== undefined && totalCount > 0 && (
          <div className="text-sm text-text-sub">
            <span className="text-dw-blue font-bold text-lg">{totalCount}</span>
            <span className="ml-1">件登録</span>
          </div>
        )}
        {/* お気に入りフィルター */}
        <button
          type="button"
          onClick={handleFavoriteToggle}
          className={`ml-auto px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            filters.favoriteOnly
              ? 'bg-yellow-500 text-white shadow-md'
              : 'bg-bg-soft text-text-sub hover:bg-bg-medium'
          }`}
          title={filters.favoriteOnly ? 'すべて表示' : 'お気に入りのみ表示'}
        >
          <svg className="w-5 h-5" fill={filters.favoriteOnly ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm">
            {filters.favoriteOnly ? 'お気に入りのみ' : 'お気に入り'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
        {/* 延床面積（最小） */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            延床面積（最小）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.minArea}
              onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
              placeholder="例: 30"
              className="flex-1 px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-text-sub">坪</span>
          </div>
        </div>

        {/* 延床面積（最大） */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            延床面積（最大）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.maxArea}
              onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
              placeholder="例: 50"
              className="flex-1 px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-text-sub">坪</span>
          </div>
        </div>

        {/* 間取り */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            間取り
          </label>
          <select
            value={filters.layout}
            onChange={(e) => setFilters({ ...filters, layout: e.target.value })}
            className="w-full px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent"
          >
            <option value="">すべて</option>
            {layoutOptions.slice(1).map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* 階数 */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            階数
          </label>
          <select
            value={filters.floors}
            onChange={(e) => setFilters({ ...filters, floors: e.target.value })}
            className="w-full px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent"
          >
            <option value="">すべて</option>
            {floorsOptions.slice(1).map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* 敷地面積（最小） */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            敷地面積（最小）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.minSiteArea}
              onChange={(e) => setFilters({ ...filters, minSiteArea: e.target.value })}
              placeholder="例: 50"
              className="flex-1 px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-text-sub">坪</span>
          </div>
        </div>

        {/* 敷地面積（最大） */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            敷地面積（最大）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.maxSiteArea}
              onChange={(e) => setFilters({ ...filters, maxSiteArea: e.target.value })}
              placeholder="例: 100"
              className="flex-1 px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-text-sub">坪</span>
          </div>
        </div>

        {/* 進入方向 */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            進入方向
          </label>
          <select
            value={filters.direction}
            onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
            className="w-full px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused focus:border-transparent"
          >
            <option value="">すべて</option>
            {directionOptions.slice(1).map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 特徴検索 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-text-sub mb-3">
          特徴で絞り込み
          {filters.features.length > 0 && (
            <span className="ml-2 text-dw-blue">
              ({filters.features.length}個選択中)
            </span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {featureOptions.map((feature) => {
            const isSelected = filters.features.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => handleFeatureToggle(feature)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-dw-blue text-white shadow-md scale-105'
                    : 'bg-bg-soft text-text-primary hover:bg-bg-medium hover:scale-105'
                }`}
              >
                {feature}
              </button>
            );
          })}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-button-primary text-white px-6 py-3 rounded-md font-medium hover:bg-button-primary-hover transition-colors"
        >
          検索
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 border-2 border-line-dark text-text-sub rounded-md font-medium hover:bg-bg-soft transition-colors"
        >
          リセット
        </button>
      </div>
    </form>
  );
}
