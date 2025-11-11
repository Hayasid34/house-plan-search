'use client';

import { useState, useCallback } from 'react';
import { parseFilename, ParseResult } from '@/lib/parseFilename';

interface UploadedFile {
  file: File;
  parseResult: ParseResult;
  preview?: string;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  isEditing?: boolean;
  editedData?: {
    layout: string;
    floors: string;
    totalArea: number;
    direction: string;
    siteArea: number;
    features: string[];
  };
}

interface PlanUploadProps {
  onUploadComplete?: () => void;
}

// 選択肢の定義
const LAYOUT_OPTIONS = ['2LDK', '3LDK', '4LDK', '5LDK', '6LDK'];
const FLOORS_OPTIONS = ['平屋', '2階建て', '3階建て'];
const DIRECTION_OPTIONS = ['東', '西', '南', '北', '北東', '北西', '南東', '南西'];
const FEATURE_OPTIONS = [
  '吹き抜け', 'ロフト', 'スキップフロア', '中庭（パティオ）',
  '回遊動線', '家事動線', 'アイランドキッチン／アイランド動線',
  '玄関土間', 'シューズクローク', 'パントリー',
  'ランドリールーム（脱衣分離含む）', 'ファミリースペース／スタディコーナー',
  'リビング階段', 'セカンドリビング', 'ウォークインクローゼット',
  '対面キッチン', '2階リビング', '和室', 'サンルーム',
  '駐車1台', '駐車2台', '駐車3台', '駐車4台',
  'WIC', 'SIC', '小屋裏収納', 'ウッドデッキ', 'バルコニー', '書斎', 'テラス', '土間'
];

export default function PlanUpload({ onUploadComplete }: PlanUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // ファイル選択ハンドラー
  const handleFileChange = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const uploadedFiles: UploadedFile[] = fileArray
      .filter(file => file.type === 'application/pdf')
      .map(file => ({
        file,
        parseResult: parseFilename(file.name),
        status: 'pending' as const,
      }));

    setFiles(prev => [...prev, ...uploadedFiles]);
  }, []);

  // ドラッグ&ドロップハンドラー
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [handleFileChange]);

  // ファイル削除
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 編集モード開始
  const startEdit = useCallback((index: number) => {
    setFiles(prev => prev.map((f, i) => {
      if (i === index && f.parseResult.data) {
        return {
          ...f,
          isEditing: true,
          editedData: {
            layout: f.parseResult.data.layout,
            floors: f.parseResult.data.floors,
            totalArea: f.parseResult.data.totalArea,
            direction: f.parseResult.data.direction,
            siteArea: f.parseResult.data.siteArea,
            features: [...f.parseResult.data.features],
          }
        };
      }
      return f;
    }));
  }, []);

  // 編集キャンセル
  const cancelEdit = useCallback((index: number) => {
    setFiles(prev => prev.map((f, i) =>
      i === index ? { ...f, isEditing: false, editedData: undefined } : f
    ));
  }, []);

  // 編集保存
  const saveEdit = useCallback((index: number) => {
    setFiles(prev => prev.map((f, i) => {
      if (i === index && f.editedData && f.parseResult.data) {
        return {
          ...f,
          isEditing: false,
          parseResult: {
            ...f.parseResult,
            data: {
              ...f.parseResult.data,
              ...f.editedData,
              title: `${f.editedData.totalArea > 0 ? f.editedData.totalArea : '-'}坪 ${f.editedData.layout} ${f.editedData.floors} ${f.editedData.direction}道路`,
            }
          },
          editedData: undefined,
        };
      }
      return f;
    }));
  }, []);

  // 編集データ更新
  const updateEditData = useCallback((index: number, field: string, value: any) => {
    setFiles(prev => prev.map((f, i) => {
      if (i === index && f.editedData) {
        return {
          ...f,
          editedData: {
            ...f.editedData,
            [field]: value,
          }
        };
      }
      return f;
    }));
  }, []);

  // 特徴のトグル
  const toggleFeature = useCallback((index: number, feature: string) => {
    setFiles(prev => prev.map((f, i) => {
      if (i === index && f.editedData) {
        const features = f.editedData.features.includes(feature)
          ? f.editedData.features.filter(feat => feat !== feature)
          : [...f.editedData.features, feature];
        return {
          ...f,
          editedData: {
            ...f.editedData,
            features,
          }
        };
      }
      return f;
    }));
  }, []);

  // アップロード実行
  const handleUpload = async () => {
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.parseResult.success);
    if (validFiles.length === 0) {
      alert('アップロード可能なファイルがありません');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const fileData = validFiles[i];
      const { file, parseResult } = fileData;

      if (!parseResult.success || !parseResult.data) continue;

      // ステータスを更新: アップロード中
      setFiles(prev =>
        prev.map(f =>
          f.file === file ? { ...f, status: 'uploading' as const } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append('file', file);
        // ファイル名（拡張子なし）をタイトルとして使用
        const titleFromFilename = file.name.replace(/\.pdf$/i, '');
        formData.append('title', titleFromFilename);
        formData.append('layout', parseResult.data.layout);
        formData.append('floors', parseResult.data.floors);
        formData.append('totalArea', parseResult.data.totalArea.toString());
        formData.append('direction', parseResult.data.direction);
        formData.append('siteArea', parseResult.data.siteArea.toString());
        formData.append('features', JSON.stringify(parseResult.data.features));

        const response = await fetch('/api/plans/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`アップロードに失敗しました`);
        }

        // 成功
        setFiles(prev =>
          prev.map(f =>
            f.file === file ? { ...f, status: 'success' as const } : f
          )
        );
        successCount++;
      } catch (error) {
        // エラー
        const errorMsg = error instanceof Error ? error.message : 'アップロードに失敗しました';
        setFiles(prev =>
          prev.map(f =>
            f.file === file ? { ...f, status: 'error' as const, error: errorMsg } : f
          )
        );
        errorCount++;
      }

      // 進捗を更新
      setUploadProgress({ current: i + 1, total: validFiles.length });
    }

    setUploading(false);

    // 結果を表示
    if (errorCount === 0) {
      alert(`✅ ${successCount}件のプランをアップロードしました`);
      setFiles([]);
      setUploadProgress({ current: 0, total: 0 });
      onUploadComplete?.();
    } else {
      alert(`アップロード完了\n成功: ${successCount}件\n失敗: ${errorCount}件\n\n失敗したファイルは赤色で表示されています。`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-line-separator p-5">
      <h2 className="text-lg font-bold text-text-primary mb-3">プランをアップロード</h2>

      {/* ドラッグ&ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
          dragActive
            ? 'border-dw-blue bg-bg-active'
            : 'border-line-separator hover:border-dw-blue'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg
          className="mx-auto h-10 w-10 text-icon-disable mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-text-sub mb-2">PDFファイルをドラッグ&ドロップ</p>
        <p className="text-xs text-text-disable mb-3">または</p>
        <label className="inline-block">
          <input
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
          <span className="bg-button-primary hover:bg-button-primary-hover text-white px-5 py-2 text-sm rounded-lg cursor-pointer transition-colors inline-block">
            ファイルを選択
          </span>
        </label>
        <p className="text-xs text-text-disable mt-3">
          例: 32.5坪_3LDK_2階建て_南_50坪_吹き抜け-WIC-ロフト.pdf
          <span className="text-dw-blue font-medium ml-2">（不明な項目は - または -坪 可）</span>
        </p>
      </div>

      {/* アップロード予定ファイル一覧 */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-text-primary">
              アップロード予定 ({files.length}件)
            </h3>
            {uploading && (
              <div className="text-sm text-dw-blue font-medium">
                {uploadProgress.current} / {uploadProgress.total} 件アップロード中...
              </div>
            )}
          </div>

          {/* 進捗バー */}
          {uploading && (
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-dw-blue h-2 transition-all duration-300 ease-out"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {files.map((uploadedFile, index) => {
              const { file, parseResult, status, error } = uploadedFile;
              const isValid = parseResult.success;

              // ボーダーと背景色を状態に応じて変更
              let borderColor = 'border-line-separator';
              let bgColor = 'bg-white';
              if (!isValid || status === 'error') {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-50';
              } else if (status === 'success') {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-50';
              } else if (status === 'uploading') {
                borderColor = 'border-dw-blue';
                bgColor = 'bg-blue-50';
              }

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${borderColor} ${bgColor} transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* ステータスアイコン */}
                        {status === 'uploading' ? (
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-dw-blue border-t-transparent"></div>
                        ) : status === 'success' ? (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : status === 'error' || !isValid ? (
                          <svg
                            className="w-4 h-4 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                        <p className="font-medium text-text-primary text-xs truncate">
                          {file.name}
                        </p>
                        {/* ステータスラベル */}
                        {status === 'uploading' && (
                          <span className="text-xs px-2 py-1 bg-dw-blue text-white rounded">
                            アップロード中
                          </span>
                        )}
                        {status === 'success' && (
                          <span className="text-xs px-2 py-1 bg-green-600 text-white rounded">
                            完了
                          </span>
                        )}
                        {status === 'error' && (
                          <span className="text-xs px-2 py-1 bg-red-600 text-white rounded">
                            失敗
                          </span>
                        )}
                      </div>

                      {isValid && parseResult.data ? (
                        uploadedFile.isEditing && uploadedFile.editedData ? (
                          // 編集モード
                          <div className="ml-7 mt-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-text-sub block mb-1">間取り</label>
                                <select
                                  value={uploadedFile.editedData.layout}
                                  onChange={(e) => updateEditData(index, 'layout', e.target.value)}
                                  className="w-full text-xs border border-line-separator rounded px-2 py-1"
                                >
                                  <option value="-">不明</option>
                                  {LAYOUT_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-text-sub block mb-1">階数</label>
                                <select
                                  value={uploadedFile.editedData.floors}
                                  onChange={(e) => updateEditData(index, 'floors', e.target.value)}
                                  className="w-full text-xs border border-line-separator rounded px-2 py-1"
                                >
                                  <option value="-">不明</option>
                                  {FLOORS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-text-sub block mb-1">建物坪数</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={uploadedFile.editedData.totalArea || ''}
                                  onChange={(e) => updateEditData(index, 'totalArea', parseFloat(e.target.value) || 0)}
                                  className="w-full text-xs border border-line-separator rounded px-2 py-1"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-text-sub block mb-1">進入方向</label>
                                <select
                                  value={uploadedFile.editedData.direction}
                                  onChange={(e) => updateEditData(index, 'direction', e.target.value)}
                                  className="w-full text-xs border border-line-separator rounded px-2 py-1"
                                >
                                  <option value="-">不明</option>
                                  {DIRECTION_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-text-sub block mb-1">敷地面積</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={uploadedFile.editedData.siteArea || ''}
                                  onChange={(e) => updateEditData(index, 'siteArea', parseFloat(e.target.value) || 0)}
                                  className="w-full text-xs border border-line-separator rounded px-2 py-1"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-text-sub block mb-1">特徴</label>
                              <div className="max-h-32 overflow-y-auto border border-line-separator rounded p-2">
                                <div className="grid grid-cols-2 gap-1">
                                  {FEATURE_OPTIONS.map(feature => (
                                    <label key={feature} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-bg-soft p-1 rounded">
                                      <input
                                        type="checkbox"
                                        checked={uploadedFile.editedData?.features.includes(feature) || false}
                                        onChange={() => toggleFeature(index, feature)}
                                        className="w-3 h-3"
                                      />
                                      <span>{feature}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              {uploadedFile.editedData?.features && uploadedFile.editedData.features.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {uploadedFile.editedData.features.map(feat => (
                                    <span key={feat} className="text-xs px-2 py-0.5 bg-label-01 rounded flex items-center gap-1">
                                      {feat}
                                      <button
                                        onClick={() => toggleFeature(index, feat)}
                                        className="text-red-600 hover:text-red-800"
                                      >×</button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(index)}
                                className="text-xs px-3 py-1 bg-dw-blue text-white rounded hover:bg-dw-blue-hover"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => cancelEdit(index)}
                                className="text-xs px-3 py-1 border border-line-separator rounded hover:bg-bg-soft"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          // 通常表示モード
                          <div className="text-xs text-text-sub ml-7 mt-1">
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                              <span>{parseResult.data.layout === '-' ? '不明' : parseResult.data.layout}</span>
                              <span>{parseResult.data.floors === '-' ? '不明' : parseResult.data.floors}</span>
                              <span>{parseResult.data.totalArea > 0 ? `${parseResult.data.totalArea}坪` : '不明'}</span>
                              <span>{parseResult.data.direction === '-' ? '不明' : `${parseResult.data.direction}道路`}</span>
                              <span>敷地{parseResult.data.siteArea > 0 ? `${parseResult.data.siteArea}坪` : '不明'}</span>
                            </div>
                            {parseResult.data.features.length > 0 && (
                              <p className="mt-0.5">特徴: {parseResult.data.features.join(', ')}</p>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="ml-7">
                          <p className="text-xs text-red-600 font-medium">{parseResult.error}</p>
                        </div>
                      )}

                      {/* アップロードエラーメッセージ */}
                      {status === 'error' && error && (
                        <div className="ml-7 mt-1">
                          <p className="text-xs text-red-600 font-medium">❌ {error}</p>
                        </div>
                      )}
                    </div>

                    {!uploading && !uploadedFile.isEditing && isValid && (
                      <button
                        onClick={() => startEdit(index)}
                        className="text-icon-sub hover:text-dw-blue transition-colors ml-2"
                        title="編集"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                    {!uploading && !uploadedFile.isEditing && (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-icon-sub hover:text-icon-error transition-colors ml-2"
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* アップロードボタン */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={handleUpload}
              disabled={uploading || files.every(f => !f.parseResult.success || f.status === 'success')}
              className="bg-dw-blue hover:bg-dw-blue-hover disabled:bg-button-disable text-white font-medium px-5 py-2.5 text-sm rounded-lg transition-colors flex-1 min-w-[200px]"
            >
              {uploading
                ? `アップロード中... (${uploadProgress.current}/${uploadProgress.total})`
                : `${files.filter(f => f.parseResult.success && f.status !== 'success').length}件をアップロード`
              }
            </button>

            {files.some(f => f.status === 'error') && !uploading && (
              <button
                onClick={() => setFiles(prev => prev.filter(f => f.status !== 'error'))}
                className="border border-red-600 text-red-600 hover:bg-red-50 font-medium px-4 py-2.5 text-sm rounded-lg transition-colors"
              >
                失敗を削除
              </button>
            )}

            {files.some(f => f.status === 'success') && !uploading && (
              <button
                onClick={() => setFiles(prev => prev.filter(f => f.status !== 'success'))}
                className="border border-green-600 text-green-600 hover:bg-green-50 font-medium px-4 py-2.5 text-sm rounded-lg transition-colors"
              >
                完了を削除
              </button>
            )}

            <button
              onClick={() => {
                setFiles([]);
                setUploadProgress({ current: 0, total: 0 });
              }}
              disabled={uploading}
              className="border border-line-separator hover:bg-bg-soft text-text-primary font-medium px-4 py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              全てクリア
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
