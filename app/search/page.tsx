'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchForm, { SearchFilters } from '@/components/SearchForm';
import PlanCard from '@/components/PlanCard';
import AIAssistant from '@/components/AIAssistant';
import DrawingManager from '@/components/DrawingManager';
import PhotoManager from '@/components/PhotoManager';
import PlanEditForm from '@/components/PlanEditForm';
import { Plan } from '@/lib/plansData';
import { checkAuthClient } from '@/lib/auth';
import { getDefaultCompanyId, getCompanyById } from '@/lib/demo-data';
import type { Company } from '@/types/database';

export default function Home() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({
    layout: '',
    floors: '',
    minArea: '',
    maxArea: '',
    minSiteArea: '',
    maxSiteArea: '',
    features: [],
    direction: '',
    favoriteOnly: false,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [totalPlansCount, setTotalPlansCount] = useState(0);
  const [company, setCompany] = useState<Company | null>(null);

  // プランを取得
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.layout) params.append('layout', filters.layout);
      if (filters.floors) params.append('floors', filters.floors);
      if (filters.minArea) params.append('minArea', filters.minArea);
      if (filters.maxArea) params.append('maxArea', filters.maxArea);
      if (filters.minSiteArea) params.append('minSiteArea', filters.minSiteArea);
      if (filters.maxSiteArea) params.append('maxSiteArea', filters.maxSiteArea);
      if (filters.direction) params.append('direction', filters.direction);
      if (filters.features.length > 0) params.append('features', filters.features.join(','));
      if (filters.favoriteOnly) params.append('favoriteOnly', 'true');

      const response = await fetch(`/api/plans?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // 全プラン数を取得（高速化: 件数のみ取得）
  const fetchTotalPlansCount = async () => {
    try {
      const response = await fetch('/api/plans/count');
      const data = await response.json();
      if (data.success) {
        setTotalPlansCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch total plans count:', error);
    }
  };

  // 認証チェックと会社情報取得
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = checkAuthClient();
      if (!isAuth) {
        router.push('/login');
      } else {
        // 会社情報を取得
        const companyId = getDefaultCompanyId();
        const selectedCompany = getCompanyById(companyId);
        if (selectedCompany) {
          setCompany(selectedCompany);
        }
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // 初回ロード時とフィルター変更時にプランを取得
  useEffect(() => {
    if (!isAuthChecking) {
      fetchPlans();
      // 初回のみ全プラン数を取得
      if (totalPlansCount === 0) {
        fetchTotalPlansCount();
      }
    }
  }, [filters, isAuthChecking]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('このプランを削除しますか？\nPDFファイルも削除されます。')) {
      return;
    }

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('プランを削除しました');
        setSelectedPlan(null);
        // プランリストと全件数を再取得
        fetchPlans();
        fetchTotalPlansCount();
      } else {
        alert('削除に失敗しました: ' + (data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  const handleEdit = async (updates: Partial<Plan>) => {
    if (!selectedPlan) return;

    try {
      const response = await fetch(`/api/plans/${selectedPlan.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        alert('プラン情報を更新しました');
        setSelectedPlan(data.plan);
        setIsEditing(false);
        // プランリストを再取得
        fetchPlans();
      } else {
        alert('更新に失敗しました: ' + (data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('更新中にエラーが発生しました');
    }
  };

  // AIアシスタントからプランを開く
  const handleAIPlanClick = async (planId: string) => {
    try {
      const response = await fetch(`/api/plans?id=${planId}`);
      const data = await response.json();

      if (data.success && data.plans.length > 0) {
        setSelectedPlan(data.plans[0]);
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error);
    }
  };

  // 図面が追加/削除されたらプラン情報を再取得
  const handleDrawingUpdate = async () => {
    if (selectedPlan) {
      const response = await fetch(`/api/plans?id=${selectedPlan.id}`);
      const data = await response.json();
      if (data.success && data.plans.length > 0) {
        setSelectedPlan(data.plans[0]);
      }
    }
  };

  // お気に入り切り替え
  const handleFavoriteToggle = async (planId: string) => {
    try {
      // 楽観的更新：即座にUIを更新
      setPlans(prevPlans =>
        prevPlans.map(p =>
          p.id === planId ? { ...p, favorite: !p.favorite } : p
        )
      );

      const response = await fetch(`/api/plans/${planId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        // エラーの場合は元に戻す
        setPlans(prevPlans =>
          prevPlans.map(p =>
            p.id === planId ? { ...p, favorite: !p.favorite } : p
          )
        );
        alert('お気に入りの更新に失敗しました');
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      // エラーの場合は元に戻す
      setPlans(prevPlans =>
        prevPlans.map(p =>
          p.id === planId ? { ...p, favorite: !p.favorite } : p
        )
      );
      alert('お気に入りの更新中にエラーが発生しました');
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('ログアウト中にエラーが発生しました');
    }
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
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/dandori-logo.png"
                alt="DandoriFinder Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-text-primary">
                  DandoriFinder
                  {company && (
                    <span className="ml-3 text-lg text-dw-blue">- {company.name}</span>
                  )}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/upload')}
                className="bg-dw-blue hover:bg-dw-blue-hover text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                プランを追加
              </button>
              <button
                onClick={() => router.push('/settings/company')}
                className="border border-line-separator hover:bg-bg-soft text-text-sub hover:text-text-primary font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                title="設定"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                設定
              </button>
              <button
                onClick={() => router.push('/change-password')}
                className="border border-line-separator hover:bg-bg-soft text-text-sub hover:text-text-primary font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                title="パスワード変更"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                パスワード変更
              </button>
              <button
                onClick={handleLogout}
                className="border border-line-separator hover:bg-bg-soft text-text-sub hover:text-text-primary font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                title="ログアウト"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* サイドバーとメインコンテンツ */}
      <div className="flex">
        {/* 左サイドバー */}
        <aside className="w-64 bg-white border-r border-line-separator min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push('/search')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left bg-dw-blue text-white rounded-lg font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  プラン検索
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/site-plan')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-sub hover:bg-bg-soft hover:text-text-primary rounded-lg transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  敷地計画
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-6">
        {/* 検索フォーム */}
        <div className="mb-8">
          <SearchForm onSearch={handleSearch} totalCount={totalPlansCount} />
        </div>

        {/* 検索結果数 */}
        <div className="mb-6">
          <p className="text-text-sub">
            <span className="font-bold text-dw-blue text-xl">{plans.length}</span>
            <span className="ml-2">件のプランが見つかりました</span>
          </p>
        </div>

        {/* ローディング状態 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-dw-blue border-t-transparent"></div>
            <p className="mt-4 text-text-sub">読み込み中...</p>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onClick={() => setSelectedPlan(plan)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-icon-disable"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-text-primary">
              プランが見つかりませんでした
            </h3>
            <p className="mt-2 text-text-sub">
              検索条件を変更してもう一度お試しください
            </p>
          </div>
        )}
        </main>
      </div>

      {/* モーダル（プラン詳細） */}
      {selectedPlan && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="bg-white rounded-lg max-w-[98vw] w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-line-separator px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">
                {selectedPlan.title}
              </h2>
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-dw-blue hover:text-dw-blue-hover transition-colors flex items-center gap-2 px-4 py-2 rounded-lg border border-dw-blue hover:bg-bg-active"
                    title="プラン情報を編集"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm font-medium">編集</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedPlan.id)}
                  className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg border border-red-600 hover:bg-red-50"
                  title="プランを削除"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm font-medium">削除</span>
                </button>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-icon-sub hover:text-icon-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {isEditing ? (
                <PlanEditForm
                  plan={selectedPlan}
                  onSave={handleEdit}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  {/* 基本情報 - コンパクト表示 */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className="bg-bg-soft p-3 rounded-lg">
                      <div className="text-xs text-text-sub mb-1">間取り</div>
                      <div className="text-xl font-bold text-dw-blue">
                        {selectedPlan.layout === '-' ? '不明' : selectedPlan.layout}
                      </div>
                    </div>
                    <div className="bg-bg-soft p-3 rounded-lg">
                      <div className="text-xs text-text-sub mb-1">階数</div>
                      <div className="text-xl font-bold text-text-primary">
                        {selectedPlan.floors === '-' ? '不明' : selectedPlan.floors}
                      </div>
                    </div>
                    <div className="bg-bg-soft p-3 rounded-lg">
                      <div className="text-xs text-text-sub mb-1">建物坪数</div>
                      <div className="text-xl font-bold text-text-primary">
                        {selectedPlan.totalArea > 0 ? `${selectedPlan.totalArea}坪` : '不明'}
                      </div>
                    </div>
                    <div className="bg-bg-soft p-3 rounded-lg">
                      <div className="text-xs text-text-sub mb-1">進入方向</div>
                      <div className="text-xl font-bold text-text-primary">
                        {selectedPlan.direction === '-' ? '不明' : selectedPlan.direction}
                      </div>
                    </div>
                    <div className="bg-bg-soft p-3 rounded-lg">
                      <div className="text-xs text-text-sub mb-1">敷地面積</div>
                      <div className="text-xl font-bold text-text-primary">
                        {selectedPlan.siteArea > 0 ? `${selectedPlan.siteArea}坪` : '不明'}
                      </div>
                    </div>
                  </div>

                  {/* 特徴 - コンパクト表示 */}
                  {selectedPlan.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedPlan.features.map((feature, index) => (
                          <span
                            key={`${selectedPlan.id}-modal-${feature}-${index}`}
                            className={`px-2 py-1 text-sm rounded font-medium ${
                              index % 4 === 0 ? 'bg-label-01 text-text-primary' :
                              index % 4 === 1 ? 'bg-label-02 text-text-primary' :
                              index % 4 === 2 ? 'bg-label-06 text-text-primary' :
                              'bg-label-05 text-text-primary'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PDF表示エリア */}
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-text-primary mb-3">図面プレビュー</h3>
                    {/* 元のファイル名を表示 */}
                    <div className="bg-dw-blue text-white px-4 py-3 rounded-t-lg font-medium">
                      📄 {selectedPlan.originalFilename || selectedPlan.title + '.pdf'}
                    </div>
                    <div className="bg-bg-soft border-2 border-t-0 border-line-focused rounded-b-lg overflow-hidden">
                      <iframe
                        src={selectedPlan.pdfPath}
                        className="w-full h-[75vh]"
                        title="PDF Preview"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <a
                        href={selectedPlan.pdfPath}
                        download={selectedPlan.originalFilename}
                        className="inline-flex items-center gap-2 bg-dw-blue hover:bg-dw-blue-hover text-white font-medium px-6 py-3 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        PDFをダウンロード
                      </a>
                    </div>
                  </div>

                  {/* 図面 */}
                  <DrawingManager
                    planId={selectedPlan.id}
                    drawings={selectedPlan.drawings || []}
                    onDrawingAdded={handleDrawingUpdate}
                    onDrawingDeleted={handleDrawingUpdate}
                  />

                  {/* 写真 */}
                  <PhotoManager
                    planId={selectedPlan.id}
                    photos={selectedPlan.photos || []}
                    onPhotoAdded={handleDrawingUpdate}
                    onPhotoDeleted={handleDrawingUpdate}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AIアシスタント */}
      <AIAssistant onPlanClick={handleAIPlanClick} />
    </div>
  );
}
