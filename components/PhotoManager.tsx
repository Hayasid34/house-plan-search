'use client';

import { useState } from 'react';
import { Photo } from '@/lib/plansData';

interface PhotoManagerProps {
  planId: string;
  photos: Photo[];
  onPhotoAdded: () => void;
  onPhotoDeleted: () => void;
}

export default function PhotoManager({
  planId,
  photos,
  onPhotoAdded,
  onPhotoDeleted,
}: PhotoManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('ファイルを選択してください');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });

    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress({ current: i + 1, total: selectedFiles.length });

        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`/api/plans/${planId}/photos`, {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to upload ${file.name}:`, data.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Upload error for ${file.name}:`, error);
        }
      }

      if (successCount > 0) {
        alert(`${successCount}枚の写真を追加しました${errorCount > 0 ? `（${errorCount}枚失敗）` : ''}`);
        setShowUploadForm(false);
        setSelectedFiles([]);
        onPhotoAdded();
      } else {
        alert('すべての写真のアップロードに失敗しました');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('この写真を削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/plans/${planId}/photos?photoId=${photoId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('写真を削除しました');
        setSelectedPhoto(null);
        onPhotoDeleted();
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">写真</h3>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-dw-blue hover:bg-dw-blue-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          写真を追加
        </button>
      </div>

      {/* アップロードフォーム */}
      {showUploadForm && (
        <div className="bg-bg-soft border border-line-separator rounded-lg p-4 mb-4">
          <h4 className="font-bold text-text-primary mb-3">写真をアップロード</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">
                ファイル（画像）複数選択可
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-text-sub font-medium">選択: {selectedFiles.length}枚</p>
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <p key={index} className="text-xs text-text-disable truncate">
                        {index + 1}. {file.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* アップロード進捗 */}
            {isUploading && uploadProgress && (
              <div className="bg-bg-light p-3 rounded-lg">
                <div className="flex justify-between text-sm text-text-sub mb-2">
                  <span>アップロード中...</span>
                  <span>{uploadProgress.current} / {uploadProgress.total}</span>
                </div>
                <div className="w-full bg-bg-soft rounded-full h-2">
                  <div
                    className="bg-dw-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="flex-1 bg-dw-blue hover:bg-dw-blue-hover disabled:bg-button-disable text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isUploading ? `アップロード中... (${uploadProgress?.current || 0}/${uploadProgress?.total || 0})` : `アップロード${selectedFiles.length > 0 ? ` (${selectedFiles.length}枚)` : ''}`}
              </button>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFiles([]);
                }}
                disabled={isUploading}
                className="px-4 py-2 border border-line-dark text-text-sub rounded-lg hover:bg-bg-soft transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 写真一覧 */}
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white border-2 border-line-separator rounded-lg overflow-hidden hover:shadow-lg hover:border-dw-blue transition-all cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-[4/3] bg-bg-soft flex items-center justify-center overflow-hidden">
                <img
                  src={photo.filePath}
                  alt="写真"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-3 border-t border-line-separator">
                <p className="text-xs text-text-disable">
                  {new Date(photo.uploadedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-bg-soft rounded-lg">
          <p className="text-text-sub">写真はありません</p>
        </div>
      )}

      {/* 写真プレビューモーダル */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-line-separator px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-primary">写真</h3>
                <p className="text-sm text-text-sub">
                  {new Date(selectedPhoto.uploadedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="text-red-600 hover:text-red-700 px-3 py-2 rounded border border-red-600 hover:bg-red-50 transition-colors"
                >
                  削除
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-icon-sub hover:text-icon-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <img
                src={selectedPhoto.filePath}
                alt="写真"
                className="w-full rounded-lg"
              />
              <div className="mt-4 text-center">
                <a
                  href={selectedPhoto.filePath}
                  download={selectedPhoto.originalFilename}
                  className="inline-flex items-center gap-2 bg-dw-blue hover:bg-dw-blue-hover text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  ダウンロード
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
