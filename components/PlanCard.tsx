'use client';

import dynamic from 'next/dynamic';
import { Plan } from '@/lib/plansData';

// PDFThumbnailをクライアントサイドのみで読み込む
const PDFThumbnail = dynamic(() => import('./PDFThumbnail'), {
  ssr: false,
  loading: () => (
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-dw-blue border-t-transparent"></div>
      <p className="mt-2 text-sm">読込中...</p>
    </div>
  ),
});

interface PlanCardProps {
  plan: Plan;
  onClick?: () => void;
  onFavoriteToggle?: (planId: string) => void;
}

export default function PlanCard({ plan, onClick, onFavoriteToggle }: PlanCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(plan.id);
    }
  };
  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-line-separator hover:shadow-md hover:border-line-focused transition-all cursor-pointer overflow-hidden"
    >
      {/* サムネイル */}
      <div className="bg-bg-soft h-48 flex items-center justify-center text-text-disable overflow-hidden relative">
        <PDFThumbnail pdfPath={plan.pdfPath} />
        {/* お気に入りボタン */}
        {onFavoriteToggle && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110 z-10"
            title={plan.favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            {plan.favorite ? (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400 hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* 情報 */}
      <div className="p-4">
        {/* タイトルと間取り */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-text-primary flex-1 line-clamp-1">
            {plan.title}
          </h3>
          <span className="ml-2 px-3 py-1 bg-label-03 text-dw-blue text-sm font-bold rounded-full whitespace-nowrap">
            {plan.layout === '-' ? '不明' : plan.layout}
          </span>
        </div>

        {/* 面積情報 */}
        <div className="flex gap-4 text-sm text-text-sub mb-3">
          <div>
            <span className="font-medium">延床:</span> {plan.totalArea > 0 ? `${plan.totalArea}坪` : '不明'}
          </div>
        </div>

        {/* 特徴タグ */}
        {plan.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {plan.features.slice(0, 4).map((feature, index) => (
              <span
                key={`${plan.id}-${feature}-${index}`}
                className={`px-2 py-1 text-xs rounded ${
                  index === 0 ? 'bg-label-01 text-text-primary' :
                  index === 1 ? 'bg-label-02 text-text-primary' :
                  index === 2 ? 'bg-label-06 text-text-primary' :
                  'bg-label-05 text-text-primary'
                }`}
              >
                {feature}
              </span>
            ))}
            {plan.features.length > 4 && (
              <span className="px-2 py-1 text-xs rounded bg-bg-medium text-text-sub">
                +{plan.features.length - 4}
              </span>
            )}
          </div>
        )}

        {/* フッター */}
        <div className="flex items-center justify-between text-xs text-text-disable pt-3 border-t border-line-separator">
          <div className="truncate">{plan.originalFilename}</div>
          <div className="whitespace-nowrap ml-2">{formatDate(plan.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}
