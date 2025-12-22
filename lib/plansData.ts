import { promises as fs } from 'fs';
import path from 'path';

export interface Drawing {
  id: string;
  type: '1階平面図' | '2階平面図' | '3階平面図' | '立面図' | '断面図' | 'その他';
  filePath: string;
  originalFilename: string;
  uploadedAt: string;
}

export interface Photo {
  id: string;
  filePath: string;
  originalFilename: string;
  uploadedAt: string;
}

export interface Plan {
  id: string;
  title: string;
  layout: string;
  floors: string;
  totalArea: number;
  direction: string;
  siteArea: number;
  features: string[];
  pdfPath: string;
  thumbnailPath?: string; // PDFサムネイル画像パス
  originalFilename: string;
  drawings?: Drawing[]; // 追加図面
  photos?: Photo[]; // 写真
  favorite?: boolean; // お気に入り
  createdAt: string;
  updatedAt: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'plans.json');

// データファイルが存在するか確認し、なければ作成
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    // ファイルが存在しない場合、空の配列で初期化
    const dataDir = path.dirname(DATA_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// プランデータを読み込み
export async function readPlansData(): Promise<Plan[]> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// プランデータを書き込み
export async function writePlansData(plans: Plan[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(plans, null, 2), 'utf-8');
}

// プランを追加
export async function addPlan(plan: Plan): Promise<Plan> {
  const plans = await readPlansData();
  plans.push(plan);
  await writePlansData(plans);
  return plan;
}

// プランを取得
export async function getPlan(id: string): Promise<Plan | null> {
  const plans = await readPlansData();
  return plans.find(plan => plan.id === id) || null;
}

// すべてのプランを取得
export async function getAllPlans(): Promise<Plan[]> {
  return await readPlansData();
}

// プランに図面を追加
export async function addDrawingToPlan(
  planId: string,
  drawing: Drawing
): Promise<Plan | null> {
  const plans = await readPlansData();
  const planIndex = plans.findIndex(p => p.id === planId);

  if (planIndex === -1) {
    return null;
  }

  if (!plans[planIndex].drawings) {
    plans[planIndex].drawings = [];
  }

  plans[planIndex].drawings!.push(drawing);
  plans[planIndex].updatedAt = new Date().toISOString();

  await writePlansData(plans);
  return plans[planIndex];
}

// プランから図面を削除
export async function removeDrawingFromPlan(
  planId: string,
  drawingId: string
): Promise<Plan | null> {
  const plans = await readPlansData();
  const planIndex = plans.findIndex(p => p.id === planId);

  if (planIndex === -1) {
    return null;
  }

  if (!plans[planIndex].drawings) {
    return plans[planIndex];
  }

  plans[planIndex].drawings = plans[planIndex].drawings!.filter(
    d => d.id !== drawingId
  );
  plans[planIndex].updatedAt = new Date().toISOString();

  await writePlansData(plans);
  return plans[planIndex];
}

// プランに写真を追加
export async function addPhotoToPlan(
  planId: string,
  photo: Photo
): Promise<Plan | null> {
  const plans = await readPlansData();
  const planIndex = plans.findIndex(p => p.id === planId);

  if (planIndex === -1) {
    return null;
  }

  if (!plans[planIndex].photos) {
    plans[planIndex].photos = [];
  }

  plans[planIndex].photos!.push(photo);
  plans[planIndex].updatedAt = new Date().toISOString();

  await writePlansData(plans);
  return plans[planIndex];
}

// プランから写真を削除
export async function removePhotoFromPlan(
  planId: string,
  photoId: string
): Promise<Plan | null> {
  const plans = await readPlansData();
  const planIndex = plans.findIndex(p => p.id === planId);

  if (planIndex === -1) {
    return null;
  }

  if (!plans[planIndex].photos) {
    return plans[planIndex];
  }

  plans[planIndex].photos = plans[planIndex].photos!.filter(
    p => p.id !== photoId
  );
  plans[planIndex].updatedAt = new Date().toISOString();

  await writePlansData(plans);
  return plans[planIndex];
}

// プランを削除
export async function deletePlan(id: string): Promise<boolean> {
  const plans = await readPlansData();
  const filteredPlans = plans.filter(plan => plan.id !== id);

  if (filteredPlans.length === plans.length) {
    return false; // 削除対象が見つからなかった
  }

  await writePlansData(filteredPlans);
  return true;
}

// お気に入りを切り替え
export async function toggleFavorite(id: string): Promise<Plan | null> {
  const plans = await readPlansData();
  const planIndex = plans.findIndex(p => p.id === id);

  if (planIndex === -1) {
    return null;
  }

  plans[planIndex].favorite = !plans[planIndex].favorite;
  plans[planIndex].updatedAt = new Date().toISOString();

  await writePlansData(plans);
  return plans[planIndex];
}

// プランを検索
export interface SearchFilters {
  layout?: string;
  floors?: string;
  minArea?: number;
  maxArea?: number;
  minSiteArea?: number;
  maxSiteArea?: number;
  direction?: string;
  features?: string[];
  favoriteOnly?: boolean;
}

export async function searchPlans(filters: SearchFilters): Promise<Plan[]> {
  const plans = await readPlansData();

  return plans
    .filter(plan => {
      // 間取りフィルター
      if (filters.layout && plan.layout !== filters.layout) {
        return false;
      }

      // 階数フィルター
      if (filters.floors && plan.floors !== filters.floors) {
        return false;
      }

      // 延床面積フィルター（最小）
      if (filters.minArea !== undefined && plan.totalArea < filters.minArea) {
        return false;
      }

      // 延床面積フィルター（最大）
      if (filters.maxArea !== undefined && plan.totalArea > filters.maxArea) {
        return false;
      }

      // 敷地面積フィルター（最小）
      if (filters.minSiteArea !== undefined && plan.siteArea < filters.minSiteArea) {
        return false;
      }

      // 敷地面積フィルター（最大）
      if (filters.maxSiteArea !== undefined && plan.siteArea > filters.maxSiteArea) {
        return false;
      }

      // 進入方向フィルター
      if (filters.direction && plan.direction !== filters.direction) {
        return false;
      }

      // 特徴フィルター（すべての選択された特徴を含む）
      if (filters.features && filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feature =>
          plan.features.some(f => f.includes(feature) || feature.includes(f))
        );
        if (!hasAllFeatures) {
          return false;
        }
      }

      // お気に入りフィルター
      if (filters.favoriteOnly && !plan.favorite) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // 作成日時の降順でソート（新しいものが先）
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}
