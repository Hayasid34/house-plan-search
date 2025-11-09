'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisResult {
  totalArea: number;
  layout: string;
  floors: string;
  direction: string;
  siteArea: number;
  features: string[];
  confidence: {
    totalArea: number;
    layout: number;
    floors: number;
    direction: number;
    siteArea: number;
    features: number;
    overall: number;
  };
}

interface PlanData extends AnalysisResult {
  file: File;
  fileName: string;
  status?: 'pending' | 'analyzing' | 'analyzed' | 'uploading' | 'success' | 'error';
  error?: string;
  errorDetails?: string;
  setupInstructions?: string[];
}

export default function PlanUploadWithOCR() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // ファイル選択ハンドラー
  const handleFileChange = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const files = Array.from(selectedFiles);
    const newPlans: PlanData[] = files.map(file => ({
      file,
      fileName: file.name,
      totalArea: 0,
      layout: '-',
      floors: '-',
      direction: '-',
      siteArea: 0,
      features: [],
      status: 'pending' as const,
      confidence: {
        totalArea: 0,
        layout: 0,
        floors: 0,
        direction: 0,
        siteArea: 0,
        features: 0,
        overall: 0,
      },
    }));

    setPlans(prev => [...prev, ...newPlans]);

    // 各ファイルを解析
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const planIndex = plans.length + i;

      // ステータスを解析中に更新
      setPlans(prev => prev.map((p, idx) =>
        idx === planIndex ? { ...p, status: 'analyzing' as const } : p
      ));

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/analyze-plan', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.analysis) {
          setPlans(prev => prev.map((p, idx) =>
            idx === planIndex
              ? { ...p, ...data.analysis, status: 'analyzed' as const }
              : p
          ));
        } else {
          setPlans(prev => prev.map((p, idx) =>
            idx === planIndex
              ? {
                  ...p,
                  status: 'error' as const,
                  error: data.error || '解析に失敗しました',
                  errorDetails: data.details,
                  setupInstructions: data.setupInstructions,
                }
              : p
          ));
        }
      } catch (error) {
        console.error('Analysis error:', error);
        setPlans(prev => prev.map((p, idx) =>
          idx === planIndex
            ? { ...p, status: 'error' as const, error: '解析中にエラーが発生しました' }
            : p
        ));
      }
    }
  }, [plans.length]);

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
  const removePlan = useCallback((index: number) => {
    setPlans(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  // アップロード実行
  const handleUploadAll = async () => {
    if (plans.length === 0) return;

    const validPlans = plans.filter(p => p.status === 'analyzed' || p.status === 'error');
    if (validPlans.length === 0) {
      alert('アップロード可能なプランがありません');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: validPlans.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      if (plan.status !== 'analyzed') continue;

      // ステータスを更新: アップロード中
      setPlans(prev =>
        prev.map((p, idx) =>
          idx === i ? { ...p, status: 'uploading' as const } : p
        )
      );

      try {
        const formData = new FormData();
        formData.append('file', plan.file);
        formData.append('layout', plan.layout);
        formData.append('floors', plan.floors);
        formData.append('totalArea', plan.totalArea.toString());
        formData.append('direction', plan.direction);
        formData.append('siteArea', plan.siteArea.toString());
        formData.append('features', plan.features.join(','));

        const response = await fetch('/api/plans/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('アップロードに失敗しました');
        }

        // 成功
        setPlans(prev =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'success' as const } : p
          )
        );
        successCount++;
      } catch (error) {
        // エラー
        const errorMsg = error instanceof Error ? error.message : 'アップロードに失敗しました';
        setPlans(prev =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error' as const, error: errorMsg } : p
          )
        );
        errorCount++;
      }

      // 進捗を更新
      setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }

    setIsUploading(false);

    // 結果を表示
    if (errorCount === 0) {
      alert(`✅ ${successCount}件のプランをアップロードしました`);
      setPlans([]);
      setUploadProgress({ current: 0, total: 0 });
      router.push('/');
    } else {
      alert(`アップロード完了\n成功: ${successCount}件\n失敗: ${errorCount}件`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-line-separator p-6">
      <h2 className="text-xl font-bold text-text-primary mb-4">プランをアップロード</h2>

      {/* ドラッグ&ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
          className="mx-auto h-12 w-12 text-icon-disable mb-4"
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
        <p className="text-text-sub mb-2">PDFファイルをドラッグ&ドロップ</p>
        <p className="text-sm text-text-disable mb-4">または</p>
        <label className="inline-block">
          <input
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
          <span className="bg-button-primary hover:bg-button-primary-hover text-white px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block">
            ファイルを選択
          </span>
        </label>
        <p className="text-xs text-text-disable mt-4">
          PDFをアップロードすると、AIが自動的に図面を解析します
          <br />
          精度: 95%以上
        </p>
      </div>

      {/* アップロード予定ファイル一覧 */}
      {plans.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-text-primary">
              アップロード予定 ({plans.length}件)
            </h3>
            {isUploading && (
              <div className="text-sm text-dw-blue font-medium">
                {uploadProgress.current} / {uploadProgress.total} 件アップロード中...
              </div>
            )}
          </div>

          {/* 進捗バー */}
          {isUploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-dw-blue h-3 transition-all duration-300 ease-out"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {plans.map((plan, index) => {
              const { file, status, error, confidence } = plan;

              // ボーダーと背景色を状態に応じて変更
              let borderColor = 'border-line-separator';
              let bgColor = 'bg-white';
              if (status === 'error') {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-50';
              } else if (status === 'success') {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-50';
              } else if (status === 'analyzing') {
                borderColor = 'border-dw-blue';
                bgColor = 'bg-blue-50';
              } else if (status === 'uploading') {
                borderColor = 'border-dw-blue';
                bgColor = 'bg-blue-50';
              } else if (status === 'analyzed' && confidence.overall < 70) {
                borderColor = 'border-yellow-500';
                bgColor = 'bg-yellow-50';
              }

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${borderColor} ${bgColor} transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {/* ステータスアイコン */}
                        {status === 'analyzing' || status === 'uploading' ? (
                          <div className="inline-block animate-spin rounded-full h-5 w-5 border-3 border-dw-blue border-t-transparent"></div>
                        ) : status === 'success' ? (
                          <svg
                            className="w-5 h-5 text-green-600"
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
                        ) : status === 'error' ? (
                          <svg
                            className="w-5 h-5 text-red-600"
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
                            className="w-5 h-5 text-gray-400"
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
                        <p className="font-medium text-text-primary text-sm truncate">
                          {file.name}
                        </p>
                        {/* ステータスラベル */}
                        {status === 'analyzing' && (
                          <span className="text-xs px-2 py-1 bg-dw-blue text-white rounded">
                            AI解析中
                          </span>
                        )}
                        {status === 'analyzed' && (
                          <span className="text-xs px-2 py-1 bg-green-600 text-white rounded">
                            解析完了 ({confidence.overall}%)
                          </span>
                        )}
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

                      {status === 'analyzed' && (
                        <div className="text-sm text-text-sub space-y-1 ml-7">
                          <p>間取り: {plan.layout === '-' ? '不明' : plan.layout}</p>
                          <p>階数: {plan.floors === '-' ? '不明' : plan.floors}</p>
                          <p>建物坪数: {plan.totalArea > 0 ? `${plan.totalArea}坪` : '不明'}</p>
                          <p>進入方向: {plan.direction === '-' ? '不明' : plan.direction}</p>
                          <p>敷地面積: {plan.siteArea > 0 ? `${plan.siteArea}坪` : '不明'}</p>
                          {plan.features.length > 0 && (
                            <p>特徴 ({plan.features.length}個): {plan.features.join(', ')}</p>
                          )}
                          <p className="text-xs text-dw-blue mt-2">
                            全体信頼度: {confidence.overall}%
                          </p>
                        </div>
                      )}

                      {/* エラーメッセージ */}
                      {status === 'error' && error && (
                        <div className="ml-7 mt-2 space-y-2">
                          <p className="text-sm text-red-600 font-medium">❌ {error}</p>
                          {plan.errorDetails && (
                            <p className="text-sm text-red-600">{plan.errorDetails}</p>
                          )}
                          {plan.setupInstructions && plan.setupInstructions.length > 0 && (
                            <div className="bg-white border border-red-300 rounded p-3 mt-2">
                              <p className="text-sm font-bold text-red-700 mb-2">設定手順:</p>
                              <ol className="text-xs text-red-600 space-y-1 list-decimal list-inside">
                                {plan.setupInstructions.map((instruction, i) => (
                                  <li key={i}>{instruction}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {!isUploading && status !== 'analyzing' && (
                      <button
                        onClick={() => removePlan(index)}
                        className="text-icon-sub hover:text-icon-error transition-colors ml-2"
                        title="削除"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              onClick={handleUploadAll}
              disabled={
                isUploading ||
                plans.every(p => p.status !== 'analyzed') ||
                plans.some(p => p.status === 'analyzing')
              }
              className="bg-dw-blue hover:bg-dw-blue-hover disabled:bg-button-disable text-white font-medium px-6 py-3 rounded-lg transition-colors flex-1 min-w-[200px]"
            >
              {isUploading
                ? `アップロード中... (${uploadProgress.current}/${uploadProgress.total})`
                : `${plans.filter(p => p.status === 'analyzed').length}件をアップロード`
              }
            </button>

            {plans.some(p => p.status === 'error') && !isUploading && (
              <button
                onClick={() => setPlans(prev => prev.filter(p => p.status !== 'error'))}
                className="border border-red-600 text-red-600 hover:bg-red-50 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                失敗したファイルを削除
              </button>
            )}

            {plans.some(p => p.status === 'success') && !isUploading && (
              <button
                onClick={() => setPlans(prev => prev.filter(p => p.status !== 'success'))}
                className="border border-green-600 text-green-600 hover:bg-green-50 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                完了したファイルを削除
              </button>
            )}

            <button
              onClick={() => {
                setPlans([]);
                setUploadProgress({ current: 0, total: 0 });
              }}
              disabled={isUploading || plans.some(p => p.status === 'analyzing')}
              className="border border-line-separator hover:bg-bg-soft text-text-primary font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              全てクリア
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
