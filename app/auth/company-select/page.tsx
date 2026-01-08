'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  cst_number: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  contract_account_limit: number;
  current_accounts: number;
  is_full: boolean;
}

export default function CompanySelectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/search';

  const [searchType, setSearchType] = useState<'cst' | 'name'>('cst');
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linking, setLinking] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // 会社検索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('検索キーワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setCompanies([]);

    try {
      const params = new URLSearchParams();
      if (searchType === 'cst') {
        params.append('cst_number', searchQuery.trim());
      } else {
        params.append('q', searchQuery.trim());
      }

      const response = await fetch(`/api/companies/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '検索に失敗しました');
      }

      if (data.companies.length === 0) {
        setError('会社が見つかりませんでした');
      } else {
        setCompanies(data.companies);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 会社選択
  const handleSelectCompany = async (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);

    if (!company) return;

    // 上限チェック
    if (company.is_full) {
      setError(`${company.name}はアカウント上限（${company.contract_account_limit}）に達しています`);
      return;
    }

    setLinking(true);
    setSelectedCompanyId(companyId);
    setError('');

    try {
      const response = await fetch('/api/auth/link-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id: companyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || '会社の紐付けに失敗しました');
      }

      // 成功したらリダイレクト
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : '会社の紐付けに失敗しました');
      setSelectedCompanyId(null);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <img
            src="/images/dandori-logo.png"
            alt="DandoriFinder Logo"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            会社を選択
          </h1>
          <p className="text-text-sub">
            所属する会社を検索して選択してください
          </p>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-line-separator">
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              検索方法
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cst"
                  checked={searchType === 'cst'}
                  onChange={(e) => setSearchType(e.target.value as 'cst')}
                  className="mr-2"
                />
                <span className="text-text-primary">CST番号で検索</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="name"
                  checked={searchType === 'name'}
                  onChange={(e) => setSearchType(e.target.value as 'name')}
                  className="mr-2"
                />
                <span className="text-text-primary">会社名で検索</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                searchType === 'cst' ? 'CST12345' : '株式会社〇〇'
              }
              className="flex-1 px-4 py-2 border border-line-separator rounded-lg focus:outline-none focus:ring-2 focus:ring-dw-blue focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white font-medium rounded-lg transition-colors disabled:bg-button-disable disabled:cursor-not-allowed"
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* 検索結果 */}
        {companies.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-line-separator">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              検索結果（{companies.length}件）
            </h2>
            <div className="space-y-3">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={`p-4 border rounded-lg ${
                    company.is_full
                      ? 'bg-gray-50 border-gray-300'
                      : 'bg-white border-line-separator hover:border-dw-blue cursor-pointer'
                  } transition-colors`}
                  onClick={() => !company.is_full && handleSelectCompany(company.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary mb-1">
                        {company.name}
                      </h3>
                      <p className="text-sm text-text-sub mb-1">
                        CST番号: {company.cst_number}
                      </p>
                      {company.address && (
                        <p className="text-sm text-text-sub">
                          {company.address}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            company.is_full
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {company.current_accounts} / {company.contract_account_limit} アカウント
                        </span>
                        {company.is_full && (
                          <span className="text-xs text-red-600 font-medium">
                            （上限に達しています）
                          </span>
                        )}
                      </div>
                    </div>
                    {!company.is_full && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCompany(company.id);
                        }}
                        disabled={linking && selectedCompanyId === company.id}
                        className="ml-4 px-4 py-2 bg-dw-blue hover:bg-dw-blue-hover text-white text-sm font-medium rounded-lg transition-colors disabled:bg-button-disable disabled:cursor-not-allowed"
                      >
                        {linking && selectedCompanyId === company.id
                          ? '処理中...'
                          : '選択'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ヘルプテキスト */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-sub">
            会社が見つからない場合は、管理者にお問い合わせください
          </p>
        </div>
      </div>
    </div>
  );
}
