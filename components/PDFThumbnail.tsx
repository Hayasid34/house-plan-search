'use client';

import { useState } from 'react';

interface PDFThumbnailProps {
  pdfPath: string;
}

export default function PDFThumbnail({ pdfPath }: PDFThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        <p className="mt-2 text-sm">プレビュー読込失敗</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-dw-blue border-t-transparent"></div>
            <p className="mt-2 text-sm">読込中...</p>
          </div>
        </div>
      )}
      <object
        data={`${pdfPath}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
        type="application/pdf"
        className="w-full h-full"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          minHeight: '192px',
          pointerEvents: 'none'
        }}
      >
        <embed
          src={`${pdfPath}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
          type="application/pdf"
          className="w-full h-full"
          style={{
            minHeight: '192px',
            pointerEvents: 'none'
          }}
        />
      </object>
    </div>
  );
}
