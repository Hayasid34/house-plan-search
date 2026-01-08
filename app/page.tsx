'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/dandori-logo.png"
              alt="DandoriFinder Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              DandoriFinder
            </h1>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            ログイン
          </button>
        </div>
      </header>

      {/* メインビジュアル */}
      <section className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 text-white py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-lg mb-4 opacity-90">建築会社に特化した間取り検索アプリ</p>
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            理想の間取りを
            <br />
            ひと目で検索
          </h2>
          <p className="text-xl mb-8 opacity-90">
            お客様の「段取り」をもっとスムーズに。
          </p>
          <p className="text-2xl font-bold mb-8">
            5プランまでずっと無料
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-blue-600 font-bold px-10 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            7日間無料トライアルはこちら
          </button>
          <p className="mt-4 text-sm opacity-80">
            カード登録不要・すべての機能をお試し
          </p>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 特徴1: 見える */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-3xl font-bold text-blue-600 mb-4">見える</h3>
              <p className="text-gray-700 mb-6">
                間取りを一覧で確認
              </p>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  PDF管理
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  図面整理
                </span>
              </div>
            </div>

            {/* 特徴2: わかる */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-3xl font-bold text-green-600 mb-4">わかる</h3>
              <p className="text-gray-700 mb-6">
                条件に合う間取りが把握
              </p>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  絞り込み
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  AI検索
                </span>
              </div>
            </div>

            {/* 特徴3: ラクになる */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-3xl font-bold text-pink-600 mb-4">ラクになる</h3>
              <p className="text-gray-700 mb-6">
                打ち合わせ準備が完結
              </p>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  敷地計画
                </span>
                <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  建蔽率計算
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 料金体系 */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            シンプルな料金体系
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 border-2 border-blue-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <p className="text-blue-600 font-bold mb-2">まずは無料でスタート</p>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  ¥0<span className="text-2xl">/月</span>
                </div>
                <p className="text-lg font-bold text-gray-700">5プランまでずっと無料</p>
              </div>
              <div className="border-l-2 border-blue-200 pl-8 hidden md:block h-32"></div>
              <div className="text-gray-700">
                <p className="text-xl font-bold mb-4">6プラン以上：</p>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  基本料金¥5,000円〜
                  <span className="text-sm text-gray-500 ml-2">(税別)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            今すぐ無料で始めましょう
          </h2>
          <p className="text-xl mb-8 opacity-90">
            7日間、すべての機能を無料でお試しいただけます
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-blue-600 font-bold px-10 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            無料トライアルを開始
          </button>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/dandori-logo.png"
                alt="DandoriFinder Logo"
                width={30}
                height={30}
                className="object-contain"
              />
              <span className="text-lg font-bold text-white">DandoriFinder</span>
            </div>
            <div className="flex gap-8">
              <button
                onClick={() => router.push('/login')}
                className="hover:text-white transition-colors"
              >
                資料請求
              </button>
              <button
                onClick={() => router.push('/login')}
                className="hover:text-white transition-colors"
              >
                お問い合わせ
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
            <p>&copy; 2024 DandoriFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
