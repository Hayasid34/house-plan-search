'use client';

import { useState } from 'react';
import { Drawing } from '@/lib/plansData';

interface DrawingManagerProps {
  planId: string;
  drawings: Drawing[];
  onDrawingAdded: () => void;
  onDrawingDeleted: () => void;
}

const drawingTypes: Drawing['type'][] = [
  '1階平面図',
  '2階平面図',
  '3階平面図',
  '立面図',
  '断面図',
  'その他',
];

export default function DrawingManager({
  planId,
  drawings,
  onDrawingAdded,
  onDrawingDeleted,
}: DrawingManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedType, setSelectedType] = useState<Drawing['type']>('1階平面図');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('ファイルを選択してください');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedType);

      const response = await fetch(`/api/plans/${planId}/drawings`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('図面を追加しました');
        setShowUploadForm(false);
        setSelectedFile(null);
        onDrawingAdded();
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('アップロード中にエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (drawingId: string) => {
    if (!confirm('この図面を削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/plans/${planId}/drawings?drawingId=${drawingId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('図面を削除しました');
        setSelectedDrawing(null);
        onDrawingDeleted();
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
        <h3 className="text-lg font-bold text-text-primary">図面</h3>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-dw-blue hover:bg-dw-blue-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          図面を追加
        </button>
      </div>

      {/* アップロードフォーム */}
      {showUploadForm && (
        <div className="bg-bg-soft border border-line-separator rounded-lg p-4 mb-4">
          <h4 className="font-bold text-text-primary mb-3">図面をアップロード</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">
                図面の種類
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as Drawing['type'])}
                className="w-full px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused"
              >
                {drawingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">
                ファイル（PDF/画像）
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-line-dark rounded-md focus:outline-none focus:ring-2 focus:ring-line-focused"
              />
              {selectedFile && (
                <p className="text-sm text-text-sub mt-1">選択: {selectedFile.name}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="flex-1 bg-dw-blue hover:bg-dw-blue-hover disabled:bg-button-disable text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isUploading ? 'アップロード中...' : 'アップロード'}
              </button>
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-line-dark text-text-sub rounded-lg hover:bg-bg-soft transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 図面一覧 */}
      {drawings && drawings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drawings.map((drawing) => (
            <div
              key={drawing.id}
              className="bg-white border-2 border-line-separator rounded-lg overflow-hidden hover:shadow-lg hover:border-dw-blue transition-all cursor-pointer"
              onClick={() => setSelectedDrawing(drawing)}
            >
              <div className="aspect-[4/3] bg-bg-soft flex items-center justify-center overflow-hidden relative">
                {drawing.filePath.endsWith('.pdf') ? (
                  <>
                    <iframe
                      src={`${drawing.filePath}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full pointer-events-none"
                      title={drawing.type}
                    />
                    <div className="absolute bottom-2 right-2 bg-dw-blue text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
                      PDF
                    </div>
                  </>
                ) : (
                  <img
                    src={drawing.filePath}
                    alt={drawing.type}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="p-3 border-t border-line-separator">
                <p className="text-sm font-bold text-text-primary truncate">{drawing.type}</p>
                <p className="text-xs text-text-disable mt-1">
                  {new Date(drawing.uploadedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-bg-soft rounded-lg">
          <p className="text-text-sub">図面はありません</p>
        </div>
      )}

      {/* 図面プレビューモーダル */}
      {selectedDrawing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDrawing(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-line-separator px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-primary">{selectedDrawing.type}</h3>
                <p className="text-sm text-text-sub">
                  {new Date(selectedDrawing.uploadedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedDrawing.id)}
                  className="text-red-600 hover:text-red-700 px-3 py-2 rounded border border-red-600 hover:bg-red-50 transition-colors"
                >
                  削除
                </button>
                <button
                  onClick={() => setSelectedDrawing(null)}
                  className="text-icon-sub hover:text-icon-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedDrawing.filePath.endsWith('.pdf') ? (
                <iframe
                  src={selectedDrawing.filePath}
                  className="w-full h-[70vh] rounded-lg border border-line-separator"
                  title="図面プレビュー"
                />
              ) : (
                <img
                  src={selectedDrawing.filePath}
                  alt={selectedDrawing.type}
                  className="w-full rounded-lg"
                />
              )}
              <div className="mt-4 text-center">
                <a
                  href={selectedDrawing.filePath}
                  download={selectedDrawing.originalFilename}
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
