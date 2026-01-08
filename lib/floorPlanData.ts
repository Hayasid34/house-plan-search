// 間取りプランのデータ定義

const KEN_TO_MM = 1818; // 1間 = 1818mm
const TSUBO_TO_MM2 = 3305785; // 1坪 = 3.30579㎡ = 3305785mm²

export interface FloorPlan {
  id: string;
  name: string;
  description: string;
  widthKen: number;  // 間口（間）
  depthKen: number;  // 奥行（間）
  widthMm: number;   // 間口（mm）
  depthMm: number;   // 奥行（mm）
  tsubo: number;     // 坪数（1階あたり）
  category: '2LDK' | '3LDK' | '4LDK' | 'その他';
  imagePath: string; // 間取り画像のパス
  floors: number;    // 階数
}

// 坪数を計算
const calculateTsubo = (widthMm: number, depthMm: number): number => {
  const areaMm2 = widthMm * depthMm;
  return Math.round((areaMm2 / TSUBO_TO_MM2) * 10) / 10;
};

// 間取りプランのデータ
export const FLOOR_PLANS: FloorPlan[] = [
  {
    id: 'plan-001',
    name: '2階プラン（4×4間）',
    description: 'キッチン、ダイニング、リビング、浴室、洗面室、トイレ、玄関',
    widthKen: 4,
    depthKen: 4,
    widthMm: 4 * KEN_TO_MM,
    depthMm: 4 * KEN_TO_MM,
    tsubo: calculateTsubo(4 * KEN_TO_MM, 4 * KEN_TO_MM),
    category: '3LDK',
    imagePath: '/images/floor-plans/plan-001-1f.png',
    floors: 2,
  },
  {
    id: 'plan-002',
    name: '1階プラン（4×5間）',
    description: '個室1、個室2、マルチクローゼット、脱衣室、浴室、トイレ、洗面室、ホール、ダイニング、リビング、キッチン、ヤード、玄関',
    widthKen: 4,
    depthKen: 5,
    widthMm: 4 * KEN_TO_MM,
    depthMm: 5 * KEN_TO_MM,
    tsubo: calculateTsubo(4 * KEN_TO_MM, 5 * KEN_TO_MM),
    category: '2LDK',
    imagePath: '/images/floor-plans/plan-002-2f.png',
    floors: 1,
  },
];

// IDで間取りプランを取得
export const getFloorPlanById = (id: string): FloorPlan | undefined => {
  return FLOOR_PLANS.find(plan => plan.id === id);
};

// カテゴリで間取りプランを取得
export const getFloorPlansByCategory = (category: string): FloorPlan[] => {
  if (category === 'all') {
    return FLOOR_PLANS;
  }
  return FLOOR_PLANS.filter(plan => plan.category === category);
};

// すべてのカテゴリを取得
export const getAllCategories = (): string[] => {
  return ['all', '2LDK', '3LDK', '4LDK', 'その他'];
};
