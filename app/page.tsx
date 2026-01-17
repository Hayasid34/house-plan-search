'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-bg-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-line-separator z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/dandori-logo.png"
              alt="DandoriFinder Logo"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-xl font-bold text-text-primary">
              DandoriFinder
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-5 py-2 text-text-sub hover:text-text-primary font-medium transition-colors"
            >
              ログイン
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-5 py-2 bg-button-primary text-white font-medium rounded-lg hover:bg-button-primary-hover transition-colors"
            >
              無料で始める
            </button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-bg-selected to-bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-active text-dw-blue rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-dw-blue rounded-full animate-pulse"></span>
              建築会社に特化した間取り検索アプリ
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight tracking-tight">
              間取り検索を、
              <br />
              <span className="text-dw-blue">
                もっとスマートに
              </span>
            </h1>

            <p className="text-xl text-text-sub mb-10 max-w-2xl mx-auto leading-relaxed">
              PDFをアップロードするだけでAIが自動解析。
              <br />
              お客様との打ち合わせ準備を劇的に効率化します。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-button-primary text-white font-bold rounded-xl text-lg hover:bg-button-primary-hover transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                7日間無料で試す
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-button-secondary text-text-primary font-medium rounded-xl text-lg border-2 border-button-secondary-frame hover:bg-button-secondary-hover hover:border-button-secondary-frame-hover transition-all"
              >
                デモを見る
              </button>
            </div>

            <p className="text-sm text-text-disable">
              クレジットカード不要 • 5プランまで永久無料
            </p>
          </div>

          {/* プロダクトイメージ */}
          <div className={`mt-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative bg-gradient-to-br from-bg-soft to-bg-medium rounded-2xl p-8 shadow-2xl">
              <div className="aspect-video bg-bg-white rounded-xl shadow-inner flex items-center justify-center border border-line-separator">
                <div className="text-center text-text-placeholder">
                  <svg className="w-16 h-16 mx-auto mb-4 text-icon-basic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <p className="text-lg font-medium">間取り検索画面</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-24 bg-bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-title mb-4">
              3つのステップで業務効率化
            </h2>
            <p className="text-lg text-text-sub">
              複雑な操作は不要。直感的に使える設計です。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ステップ1 */}
            <div className="group relative bg-bg-white rounded-2xl p-8 border border-line-separator hover:border-line-focused hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-bg-selected text-dw-blue rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">アップロード</h3>
              <p className="text-text-sub leading-relaxed">
                PDFをドラッグ&ドロップするだけ。AIが間取りの情報を自動で読み取ります。
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-bg-soft text-text-sub rounded-full text-sm">
                  PDF対応
                </span>
                <span className="px-3 py-1 bg-bg-soft text-text-sub rounded-full text-sm">
                  AI解析
                </span>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="group relative bg-bg-white rounded-2xl p-8 border border-line-separator hover:border-line-success hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-label-02 text-text-primary rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">検索・絞り込み</h3>
              <p className="text-text-sub leading-relaxed">
                LDK数、面積、特徴など多彩な条件で瞬時に絞り込み。欲しい間取りがすぐ見つかります。
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-bg-soft text-text-sub rounded-full text-sm">
                  高速検索
                </span>
                <span className="px-3 py-1 bg-bg-soft text-text-sub rounded-full text-sm">
                  20+フィルター
                </span>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="group relative bg-bg-white rounded-2xl p-8 border border-line-separator hover:border-dw-blue hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-label-05 text-text-primary rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">提案・共有</h3>
              <p className="text-text-sub leading-relaxed">
                お気に入り登録や敷地計画機能で、お客様への提案準備がスムーズに完了。
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-bg-soft text-text-sub rounded-full text-sm">
                  敷地計画
                </span>
                <span className="px-3 py-1 bg-bg-soft text-text-sub rounded-full text-sm">
                  お気に入り
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能ハイライト */}
      <section className="py-24 bg-bg-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-title mb-6">
                AIが間取りを
                <br />
                自動で解析
              </h2>
              <p className="text-lg text-text-sub mb-8 leading-relaxed">
                PDFをアップロードするだけで、AIが間取り図から情報を自動抽出。
                手作業での入力は不要です。
              </p>
              <ul className="space-y-4">
                {['LDK数・部屋数の認識', '延床面積の自動計算', '特徴タグの自動付与', '方角・配置の把握'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-primary">
                    <svg className="w-5 h-5 text-line-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-bg-white rounded-2xl p-8 shadow-xl border border-line-separator">
              <div className="aspect-square bg-bg-selected rounded-xl flex items-center justify-center">
                <svg className="w-24 h-24 text-icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 料金セクション */}
      <section className="py-24 bg-bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-title mb-4">
              シンプルな料金プラン
            </h2>
            <p className="text-lg text-text-sub">
              まずは無料で始めて、必要に応じてアップグレード
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 無料プラン */}
            <div className="bg-bg-white rounded-2xl p-8 border-2 border-line-separator hover:border-line-dark transition-colors">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-text-sub mb-2">フリープラン</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-text-primary">¥0</span>
                  <span className="text-text-placeholder">/月</span>
                </div>
              </div>
              <p className="text-text-sub mb-6">小規模チームやお試しに最適</p>
              <ul className="space-y-3 mb-8">
                {['5プランまで登録可能', 'AI自動解析', '基本検索機能', 'PDF閲覧'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-primary">
                    <svg className="w-5 h-5 text-icon-disable" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 border-2 border-button-secondary-frame text-text-primary font-medium rounded-xl hover:bg-button-secondary-hover transition-colors"
              >
                無料で始める
              </button>
            </div>

            {/* 有料プラン */}
            <div className="bg-dw-blue rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                おすすめ
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white/80 mb-2">プロプラン</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">¥5,000</span>
                  <span className="text-white/70">〜/月</span>
                </div>
              </div>
              <p className="text-white/80 mb-6">本格的に活用したいチームに</p>
              <ul className="space-y-3 mb-8">
                {['プラン数無制限', '高度なAI分析', 'チーム共有機能', '敷地計画ツール', '優先サポート'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-white text-dw-blue font-bold rounded-xl hover:bg-bg-soft transition-colors"
              >
                7日間無料トライアル
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-bg-dark">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            間取り検索を、今日から効率化
          </h2>
          <p className="text-xl text-white/70 mb-10">
            まずは無料で始めてみませんか？
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-10 py-4 bg-white text-text-primary font-bold rounded-xl text-lg hover:bg-bg-soft transition-all shadow-xl hover:-translate-y-0.5"
          >
            無料アカウントを作成
          </button>
          <p className="mt-6 text-white/50 text-sm">
            セットアップは1分で完了 • クレジットカード不要
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-text-primary text-white/60 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/images/dandori-logo.png"
                  alt="DandoriFinder Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="text-lg font-bold text-white">DandoriFinder</span>
              </div>
              <p className="text-sm max-w-xs">
                建築会社に特化した間取り検索アプリ。
                お客様への提案準備を効率化します。
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <h4 className="text-white font-medium mb-4">プロダクト</h4>
                <ul className="space-y-2 text-sm">
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">機能一覧</button></li>
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">料金プラン</button></li>
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">導入事例</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">サポート</h4>
                <ul className="space-y-2 text-sm">
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">お問い合わせ</button></li>
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">資料請求</button></li>
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">ヘルプセンター</button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2024 DandoriFinder. All rights reserved.</p>
            <div className="flex gap-6">
              <button className="hover:text-white transition-colors">プライバシーポリシー</button>
              <button className="hover:text-white transition-colors">利用規約</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
