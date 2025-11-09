'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlanUpload from '@/components/PlanUpload';
import PlanUploadWithOCR from '@/components/PlanUploadWithOCR';
import { checkAuthClient } from '@/lib/auth';

export default function UploadPage() {
  const router = useRouter();
  const [uploadMode, setUploadMode] = useState<'filename' | 'ocr'>('filename');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 認証チェック
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = checkAuthClient();
      if (!isAuth) {
        router.push('/login');
      } else {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleUploadComplete = () => {
    // アップロード完了後、トップページに戻る
    router.push('/');
  };

  // 認証チェック中はローディング表示
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-dw-blue border-t-transparent"></div>
          <p className="mt-4 text-text-sub">認証確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-line-separator">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img
                src="/images/dandori-logo.png"
                alt="DandoriFinder Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <div className="text-left">
                <h1 className="text-3xl font-bold text-text-primary">
                  プランアップロード
                </h1>
                <p className="mt-2 text-text-sub">
                  PDFファイルから住宅プランを登録します
                </p>
              </div>
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-text-sub hover:text-text-primary flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              検索画面に戻る
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        {/* モード選択 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-line-separator mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">アップロード方法を選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setUploadMode('filename')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                uploadMode === 'filename'
                  ? 'border-dw-blue bg-bg-active'
                  : 'border-line-separator hover:border-line-dark'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                  uploadMode === 'filename' ? 'border-dw-blue' : 'border-line-dark'
                }`}>
                  {uploadMode === 'filename' && (
                    <div className="w-3 h-3 rounded-full bg-dw-blue"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary mb-2">
                    📝 ファイル名から登録
                  </h3>
                  <p className="text-sm text-text-sub">
                    ファイル名の命名ルールに従って自動的にプラン情報を抽出します。
                    従来の方法で確実に登録したい場合に使用してください。
                  </p>
                  <div className="mt-2 inline-block bg-bg-medium text-text-primary text-xs px-2 py-1 rounded">
                    精度: 100%
                  </div>
                </div>
              </div>
            </button>

            <button
              disabled
              className="p-6 rounded-lg border-2 transition-all text-left border-line-separator bg-bg-soft opacity-60 cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 border-line-dark">
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-text-primary">
                      🤖 AI自動解析
                    </h3>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded font-medium">
                      準備中
                    </span>
                  </div>
                  <p className="text-sm text-text-sub">
                    PDFをアップロードすると、AIが自動的に図面を解析して情報を抽出します。
                    抽出結果を確認・修正してから登録できます。
                  </p>
                  <div className="mt-2 inline-block bg-gray-300 text-gray-600 text-xs px-2 py-1 rounded">
                    精度: 95%以上
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* アップロードコンポーネント */}
        {uploadMode === 'ocr' ? (
          <PlanUploadWithOCR />
        ) : (
          <PlanUpload onUploadComplete={handleUploadComplete} />
        )}

        {/* 使い方ガイド - ファイル名モードの時のみ表示 */}
        {uploadMode === 'filename' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-line-separator p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">ファイル名の命名ルール</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-text-primary mb-2">基本形式</h3>
                <code className="block bg-bg-soft px-4 py-3 rounded text-sm">
                  {'建物坪数_間取り_階数_進入方向_敷地面積_特徴1-特徴2-特徴3...pdf'}
                </code>
              </div>

              <div>
                <h3 className="font-bold text-text-primary mb-2">例</h3>
                <ul className="space-y-2 text-sm">
                  <li className="bg-bg-soft px-4 py-2 rounded">
                    <code>32.5坪_3LDK_2階建て_南_50坪.pdf</code>
                    <span className="ml-3 text-text-sub">（特徴なし）</span>
                  </li>
                  <li className="bg-bg-soft px-4 py-2 rounded">
                    <code>38坪_4LDK_2階建て_東_60坪_吹き抜け.pdf</code>
                    <span className="ml-3 text-text-sub">（特徴1つ）</span>
                  </li>
                  <li className="bg-bg-soft px-4 py-2 rounded">
                    <code>28坪_2LDK_平屋_北_45坪_WIC-ロフト-SIC.pdf</code>
                    <span className="ml-3 text-text-sub">（特徴3つ）</span>
                  </li>
                  <li className="bg-bg-soft px-4 py-2 rounded">
                    <code>35坪_3LDK_2階建て_南東_55坪_吹き抜け-WIC-パントリー-和室-ウッドデッキ.pdf</code>
                    <span className="ml-3 text-text-sub">（特徴5つ：無制限）</span>
                  </li>
                  <li className="bg-blue-50 px-4 py-2 rounded border border-dw-blue">
                    <code>-_3LDK_-_南_-坪_吹き抜け.pdf</code>
                    <span className="ml-3 text-dw-blue font-medium">（不明な項目は - または -坪 で入力可能）</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-text-primary mb-2">注意事項</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-text-sub">
                  <li>建物坪数、間取り、階数、進入方向、敷地面積はアンダースコア（_）で区切ります</li>
                  <li>特徴は無制限に追加でき、ハイフン（-）で区切ります</li>
                  <li>坪数には単位（坪）を付けてください</li>
                  <li>間取りの形式：2LDK, 3LDK, 4LDK など</li>
                  <li>階数：平屋、2階建て、3階建て</li>
                  <li>進入方向：東・西・南・北・北東・北西・南東・南西</li>
                  <li className="text-dw-blue font-medium">不明な項目は - または -坪 で入力できます（建物坪数・敷地面積は -坪 でも可）</li>
                </ul>
              </div>

              <div className="bg-bg-active border border-dw-blue rounded-lg p-4 mt-6">
                <p className="text-sm text-text-primary">
                  <strong>よく使われる特徴キーワード：</strong>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    '吹き抜け',
                    'WIC',
                    'ロフト',
                    'SIC',
                    'パントリー',
                    '小屋裏収納',
                    '和室',
                    'ウッドデッキ',
                    'バルコニー',
                    '書斎',
                    'テラス',
                    '土間',
                  ].map((keyword) => (
                    <span
                      key={keyword}
                      className="bg-white border border-line-separator px-3 py-1 rounded text-sm text-text-sub"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
