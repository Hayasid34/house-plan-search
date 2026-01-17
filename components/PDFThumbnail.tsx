'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface PDFThumbnailProps {
  pdfPath: string;
  thumbnailPath?: string;
}

export default function PDFThumbnail({ pdfPath, thumbnailPath }: PDFThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer でレイジーローディング
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // 200px手前から読み込み開始（さらに早めに）
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // サムネイルがない場合はローディング状態を解除
  useEffect(() => {
    if (!thumbnailPath) {
      setIsLoading(false);
    }
  }, [thumbnailPath]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className="text-center p-2">
        <svg className="mx-auto h-12 w-12 text-icon-disable" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-sm text-text-disable">プレビュー読込失敗</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-bg-soft">
      {!isVisible ? (
        // プレースホルダー（PDFアイコン）
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-16 w-16 text-icon-disable" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-soft z-10">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-dw-blue border-t-transparent"></div>
                <p className="mt-2 text-sm text-text-sub">読込中...</p>
              </div>
            </div>
          )}
          {thumbnailPath ? (
            // サムネイル画像がある場合は画像を表示（超高速！）
            <img
              src={thumbnailPath}
              alt="Plan thumbnail"
              className="w-full h-full object-contain"
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
              style={{
                minHeight: '192px',
              }}
            />
          ) : (
            // サムネイルがない場合はフォールバック（PDFアイコン）
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-icon-disable" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-xs text-text-disable">サムネイル未生成</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
