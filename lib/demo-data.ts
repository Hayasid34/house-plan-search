// デモモード用のダミーデータ

import type { Company, UserProfile, MonthlyUsage } from '@/types/database';

export const demoCompanies: Company[] = [
  {
    id: 'company-001',
    cst_number: '10001',
    place_code: 'PLC-10001',
    name: 'デモ工務店',
    postal_code: '150-0001',
    address: '東京都渋谷区神南1-2-3',
    email: 'info@demo-koumuten.com',
    website_url: 'https://demo-koumuten.com',
    phone: '03-1234-5678',
    fax_number: '03-1234-5679',
    qualified_invoice_number: 'T1234567890123',
    admin_name: '山田 太郎',
    max_accounts: 10,
    current_accounts: 3,
    is_public: true,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'company-002',
    cst_number: '20002',
    place_code: 'PLC-20002',
    name: 'さくらハウス株式会社',
    postal_code: '530-0001',
    address: '大阪府大阪市北区梅田3-4-5',
    email: 'contact@sakura-house.co.jp',
    website_url: 'https://sakura-house.co.jp',
    phone: '06-9876-5432',
    fax_number: '06-9876-5433',
    qualified_invoice_number: 'T2345678901234',
    admin_name: '佐藤 花子',
    max_accounts: 15,
    current_accounts: 8,
    is_public: true,
    created_at: '2023-06-20T00:00:00Z',
  },
  {
    id: 'company-003',
    cst_number: '30003',
    place_code: 'PLC-30003',
    name: 'グリーンリビング',
    postal_code: '460-0008',
    address: '愛知県名古屋市中区栄5-6-7',
    email: 'hello@green-living.jp',
    website_url: 'https://green-living.jp',
    phone: '052-1111-2222',
    fax_number: '052-1111-2223',
    qualified_invoice_number: 'T3456789012345',
    admin_name: '鈴木 一郎',
    max_accounts: 10,
    current_accounts: 5,
    is_public: false,
    created_at: '2023-09-01T00:00:00Z',
  },
  {
    id: 'company-004',
    cst_number: '40004',
    place_code: 'PLC-40004',
    name: 'モダン建築設計',
    postal_code: '810-0001',
    address: '福岡県福岡市中央区天神7-8-9',
    email: 'info@modern-architects.com',
    website_url: 'https://modern-architects.com',
    phone: '092-3333-4444',
    fax_number: '092-3333-4445',
    qualified_invoice_number: 'T4567890123456',
    admin_name: '高橋 次郎',
    max_accounts: 20,
    current_accounts: 12,
    is_public: true,
    created_at: '2023-11-10T00:00:00Z',
  },
  {
    id: 'company-005',
    cst_number: '50005',
    place_code: 'PLC-50005',
    name: 'ファミリーホームズ',
    postal_code: '060-0001',
    address: '北海道札幌市中央区北1条西10-11-12',
    email: 'support@family-homes.co.jp',
    website_url: 'https://family-homes.co.jp',
    phone: '011-5555-6666',
    fax_number: '011-5555-6667',
    qualified_invoice_number: 'T5678901234567',
    admin_name: '田中 美咲',
    max_accounts: 10,
    current_accounts: 7,
    is_public: true,
    created_at: '2023-04-05T00:00:00Z',
  },
];

// デフォルトの会社IDを取得
export function getDefaultCompanyId(): string {
  if (typeof window !== 'undefined') {
    const savedCompanyId = localStorage.getItem('demo_company_id');
    if (savedCompanyId && demoCompanies.some(c => c.id === savedCompanyId)) {
      return savedCompanyId;
    }
  }
  return demoCompanies[0].id;
}

// 会社IDから会社情報を取得
export function getCompanyById(companyId: string): Company | undefined {
  // localStorageに保存された編集内容を確認
  if (typeof window !== 'undefined') {
    const savedCompanies = localStorage.getItem('demo_companies_edits');
    if (savedCompanies) {
      try {
        const edits = JSON.parse(savedCompanies);
        if (edits[companyId]) {
          // 編集内容をマージして返す
          const originalCompany = demoCompanies.find(c => c.id === companyId);
          if (originalCompany) {
            return { ...originalCompany, ...edits[companyId] };
          }
        }
      } catch (e) {
        console.error('Failed to parse company edits:', e);
      }
    }
  }
  return demoCompanies.find(c => c.id === companyId);
}

// 会社情報を保存（デモモード用）
export function saveCompany(company: Company): void {
  if (typeof window !== 'undefined') {
    try {
      const savedCompanies = localStorage.getItem('demo_companies_edits');
      const edits = savedCompanies ? JSON.parse(savedCompanies) : {};
      edits[company.id] = company;
      localStorage.setItem('demo_companies_edits', JSON.stringify(edits));
    } catch (e) {
      console.error('Failed to save company:', e);
    }
  }
}

// 選択中の会社を保存
export function setCurrentCompany(companyId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo_company_id', companyId);
  }
}

// デモユーザープロファイル
export const demoUserProfiles: UserProfile[] = [
  // company-001 (デモ工務店) のアカウント
  {
    id: 'user-001',
    company_id: 'company-001',
    display_name: '山田 太郎',
    role: 'admin',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-002',
    company_id: 'company-001',
    display_name: '田中 花子',
    role: 'editor',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user-003',
    company_id: 'company-001',
    display_name: '佐藤 次郎',
    role: 'viewer',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
  },

  // company-002 (さくらハウス株式会社) のアカウント
  {
    id: 'user-004',
    company_id: 'company-002',
    display_name: '佐藤 花子',
    role: 'admin',
    created_at: '2023-06-20T00:00:00Z',
    updated_at: '2023-06-20T00:00:00Z',
  },
  {
    id: 'user-005',
    company_id: 'company-002',
    display_name: '鈴木 一郎',
    role: 'admin',
    created_at: '2023-07-01T00:00:00Z',
    updated_at: '2023-07-01T00:00:00Z',
  },
  {
    id: 'user-006',
    company_id: 'company-002',
    display_name: '高橋 美咲',
    role: 'editor',
    created_at: '2023-08-15T00:00:00Z',
    updated_at: '2023-08-15T00:00:00Z',
  },
  {
    id: 'user-007',
    company_id: 'company-002',
    display_name: '伊藤 健太',
    role: 'editor',
    created_at: '2023-09-01T00:00:00Z',
    updated_at: '2023-09-01T00:00:00Z',
  },
  {
    id: 'user-008',
    company_id: 'company-002',
    display_name: '渡辺 由美',
    role: 'editor',
    created_at: '2023-10-10T00:00:00Z',
    updated_at: '2023-10-10T00:00:00Z',
  },
  {
    id: 'user-009',
    company_id: 'company-002',
    display_name: '中村 太一',
    role: 'viewer',
    created_at: '2023-11-05T00:00:00Z',
    updated_at: '2023-11-05T00:00:00Z',
  },
  {
    id: 'user-010',
    company_id: 'company-002',
    display_name: '小林 真理',
    role: 'viewer',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
  },
  {
    id: 'user-011',
    company_id: 'company-002',
    display_name: '加藤 大輔',
    role: 'viewer',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },

  // company-003 (グリーンリビング) のアカウント
  {
    id: 'user-012',
    company_id: 'company-003',
    display_name: '鈴木 一郎',
    role: 'admin',
    created_at: '2023-09-01T00:00:00Z',
    updated_at: '2023-09-01T00:00:00Z',
  },
  {
    id: 'user-013',
    company_id: 'company-003',
    display_name: '山本 美紀',
    role: 'editor',
    created_at: '2023-10-01T00:00:00Z',
    updated_at: '2023-10-01T00:00:00Z',
  },
  {
    id: 'user-014',
    company_id: 'company-003',
    display_name: '吉田 大地',
    role: 'editor',
    created_at: '2023-11-01T00:00:00Z',
    updated_at: '2023-11-01T00:00:00Z',
  },
  {
    id: 'user-015',
    company_id: 'company-003',
    display_name: '松本 さくら',
    role: 'viewer',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-016',
    company_id: 'company-003',
    display_name: '井上 隆',
    role: 'viewer',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },

  // company-004 (モダン建築設計) のアカウント
  {
    id: 'user-017',
    company_id: 'company-004',
    display_name: '高橋 次郎',
    role: 'admin',
    created_at: '2023-11-10T00:00:00Z',
    updated_at: '2023-11-10T00:00:00Z',
  },
  {
    id: 'user-018',
    company_id: 'company-004',
    display_name: '木村 拓也',
    role: 'admin',
    created_at: '2023-11-15T00:00:00Z',
    updated_at: '2023-11-15T00:00:00Z',
  },
  {
    id: 'user-019',
    company_id: 'company-004',
    display_name: '林 明子',
    role: 'editor',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
  },
  {
    id: 'user-020',
    company_id: 'company-004',
    display_name: '清水 健一',
    role: 'editor',
    created_at: '2023-12-15T00:00:00Z',
    updated_at: '2023-12-15T00:00:00Z',
  },
  {
    id: 'user-021',
    company_id: 'company-004',
    display_name: '山崎 麻衣',
    role: 'editor',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
  },
  {
    id: 'user-022',
    company_id: 'company-004',
    display_name: '森 大樹',
    role: 'editor',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'user-023',
    company_id: 'company-004',
    display_name: '池田 優子',
    role: 'editor',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user-024',
    company_id: 'company-004',
    display_name: '橋本 誠',
    role: 'viewer',
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z',
  },
  {
    id: 'user-025',
    company_id: 'company-004',
    display_name: '前田 奈々',
    role: 'viewer',
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z',
  },
  {
    id: 'user-026',
    company_id: 'company-004',
    display_name: '藤田 和也',
    role: 'viewer',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'user-027',
    company_id: 'company-004',
    display_name: '岡田 真由美',
    role: 'viewer',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
  },
  {
    id: 'user-028',
    company_id: 'company-004',
    display_name: '石川 龍一',
    role: 'viewer',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
  },

  // company-005 (ファミリーホームズ) のアカウント
  {
    id: 'user-029',
    company_id: 'company-005',
    display_name: '田中 美咲',
    role: 'admin',
    created_at: '2023-04-05T00:00:00Z',
    updated_at: '2023-04-05T00:00:00Z',
  },
  {
    id: 'user-030',
    company_id: 'company-005',
    display_name: '斉藤 勇',
    role: 'editor',
    created_at: '2023-05-01T00:00:00Z',
    updated_at: '2023-05-01T00:00:00Z',
  },
  {
    id: 'user-031',
    company_id: 'company-005',
    display_name: '遠藤 理恵',
    role: 'editor',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z',
  },
  {
    id: 'user-032',
    company_id: 'company-005',
    display_name: '村田 健二',
    role: 'editor',
    created_at: '2023-07-01T00:00:00Z',
    updated_at: '2023-07-01T00:00:00Z',
  },
  {
    id: 'user-033',
    company_id: 'company-005',
    display_name: '後藤 あゆみ',
    role: 'viewer',
    created_at: '2023-08-01T00:00:00Z',
    updated_at: '2023-08-01T00:00:00Z',
  },
  {
    id: 'user-034',
    company_id: 'company-005',
    display_name: '青木 正樹',
    role: 'viewer',
    created_at: '2023-09-01T00:00:00Z',
    updated_at: '2023-09-01T00:00:00Z',
  },
  {
    id: 'user-035',
    company_id: 'company-005',
    display_name: '坂本 千佳',
    role: 'viewer',
    created_at: '2023-10-01T00:00:00Z',
    updated_at: '2023-10-01T00:00:00Z',
  },
];

// 会社IDからユーザープロファイルを取得
export function getUserProfilesByCompanyId(companyId: string): UserProfile[] {
  return demoUserProfiles.filter(profile => profile.company_id === companyId);
}

// ロール名を日本語に変換
export function getRoleLabel(role: 'admin' | 'editor' | 'viewer'): string {
  const roleLabels = {
    admin: '管理者',
    editor: '編集者',
    viewer: '閲覧者',
  };
  return roleLabels[role];
}

// 月ごとの利用状況（デモデータ）
// 過去6ヶ月分のデータを生成
export const demoMonthlyUsages: MonthlyUsage[] = (() => {
  const usages: MonthlyUsage[] = [];
  const now = new Date();

  // 各ユーザーの過去6ヶ月分のデータを生成
  demoUserProfiles.forEach(user => {
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;

      // ユーザーの作成日より前のデータは作成しない
      const userCreatedAt = new Date(user.created_at);
      if (targetDate < userCreatedAt) {
        continue;
      }

      // ロールに応じて利用数を変動させる（管理者・編集者は多め、閲覧者は少なめ）
      let planMultiplier = 0;
      let sitePlanMultiplier = 0;

      if (user.role === 'admin') {
        planMultiplier = 2;
        sitePlanMultiplier = 3;
      } else if (user.role === 'editor') {
        planMultiplier = 3;
        sitePlanMultiplier = 5;
      } else {
        planMultiplier = 0;
        sitePlanMultiplier = 1;
      }

      const planRegistrations = Math.floor(Math.random() * 10) * planMultiplier;
      const sitePlanRegistrations = Math.floor(Math.random() * 8) * sitePlanMultiplier;

      usages.push({
        id: `usage-${user.id}-${year}-${month}`,
        user_id: user.id,
        company_id: user.company_id!,
        year,
        month,
        plan_registrations: planRegistrations,
        site_plan_registrations: sitePlanRegistrations,
        created_at: new Date(year, month - 1, 1).toISOString(),
        updated_at: new Date(year, month - 1, 1).toISOString(),
      });
    }
  });

  return usages;
})();

// ユーザーIDから月ごとの利用状況を取得
export function getMonthlyUsagesByUserId(userId: string): MonthlyUsage[] {
  return demoMonthlyUsages.filter(usage => usage.user_id === userId);
}

// 会社IDから月ごとの利用状況を取得
export function getMonthlyUsagesByCompanyId(companyId: string): MonthlyUsage[] {
  return demoMonthlyUsages.filter(usage => usage.company_id === companyId);
}

// ユーザーIDと期間から利用状況を取得
export function getMonthlyUsagesByUserIdAndPeriod(
  userId: string,
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): MonthlyUsage[] {
  return demoMonthlyUsages.filter(usage => {
    if (usage.user_id !== userId) return false;

    const usageDate = usage.year * 12 + usage.month;
    const startDate = startYear * 12 + startMonth;
    const endDate = endYear * 12 + endMonth;

    return usageDate >= startDate && usageDate <= endDate;
  });
}

// 会社の全ユーザーの利用状況を集計
export function getCompanyUsageSummary(companyId: string): {
  totalPlans: number;
  totalSitePlans: number;
  monthlyTotals: { year: number; month: number; plans: number; sitePlans: number }[];
} {
  const usages = getMonthlyUsagesByCompanyId(companyId);

  const totalPlans = usages.reduce((sum, usage) => sum + usage.plan_registrations, 0);
  const totalSitePlans = usages.reduce((sum, usage) => sum + usage.site_plan_registrations, 0);

  // 月ごとに集計
  const monthlyMap = new Map<string, { year: number; month: number; plans: number; sitePlans: number }>();

  usages.forEach(usage => {
    const key = `${usage.year}-${usage.month}`;
    if (monthlyMap.has(key)) {
      const existing = monthlyMap.get(key)!;
      existing.plans += usage.plan_registrations;
      existing.sitePlans += usage.site_plan_registrations;
    } else {
      monthlyMap.set(key, {
        year: usage.year,
        month: usage.month,
        plans: usage.plan_registrations,
        sitePlans: usage.site_plan_registrations,
      });
    }
  });

  const monthlyTotals = Array.from(monthlyMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return { totalPlans, totalSitePlans, monthlyTotals };
}
