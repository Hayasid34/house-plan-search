'use client';

import { useState, useEffect } from 'react';
import { demoCompanies, getDefaultCompanyId, setCurrentCompany, getCompanyById } from '@/lib/demo-data';
import type { Company } from '@/types/database';

interface CompanySwitcherProps {
  onCompanyChange?: (company: Company) => void;
}

export default function CompanySwitcher({ onCompanyChange }: CompanySwitcherProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(getDefaultCompanyId());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 初期ロード時に選択された会社を取得
    const companyId = getDefaultCompanyId();
    setSelectedCompanyId(companyId);
  }, []);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCurrentCompany(companyId);
    setIsOpen(false);

    const company = getCompanyById(companyId);
    if (company && onCompanyChange) {
      onCompanyChange(company);
    }

    // ページをリロードして全体に反映
    window.location.reload();
  };

  const selectedCompany = getCompanyById(selectedCompanyId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-line-separator rounded-lg hover:bg-bg-soft transition-colors"
      >
        <svg className="w-5 h-5 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium text-text-primary">
          {selectedCompany?.display_name || 'デモ工務店'}
        </span>
        <svg
          className={`w-4 h-4 text-text-sub transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 背景オーバーレイ */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* ドロップダウンメニュー */}
          <div className="absolute top-full mt-2 left-0 w-72 bg-white border border-line-separator rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <p className="text-xs text-text-sub px-3 py-2 font-medium">会社を選択</p>
              {demoCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanyChange(company.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                    selectedCompanyId === company.id
                      ? 'bg-dw-blue text-white'
                      : 'hover:bg-bg-soft text-text-primary'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        selectedCompanyId === company.id ? 'text-white' : 'text-text-sub'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {company.display_name}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        selectedCompanyId === company.id ? 'text-white opacity-80' : 'text-text-sub'
                      }`}>
                        {company.service_area?.slice(0, 2).join('、')}
                        {company.service_area && company.service_area.length > 2 && '...'}
                      </p>
                    </div>
                    {selectedCompanyId === company.id && (
                      <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
