// カスタム間取りプランの管理

import { FloorPlan } from './floorPlanData';

const CUSTOM_PLANS_KEY = 'customFloorPlans';

// カスタムプランをlocalStorageから取得
export const getCustomFloorPlans = (): FloorPlan[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CUSTOM_PLANS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('カスタムプランの読み込みエラー:', error);
    return [];
  }
};

// カスタムプランを保存
export const saveCustomFloorPlan = (plan: FloorPlan): void => {
  if (typeof window === 'undefined') return;

  try {
    const plans = getCustomFloorPlans();
    plans.push(plan);
    localStorage.setItem(CUSTOM_PLANS_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error('カスタムプランの保存エラー:', error);
    throw error;
  }
};

// カスタムプランを削除
export const deleteCustomFloorPlan = (id: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const plans = getCustomFloorPlans();
    const filteredPlans = plans.filter(plan => plan.id !== id);
    localStorage.setItem(CUSTOM_PLANS_KEY, JSON.stringify(filteredPlans));
  } catch (error) {
    console.error('カスタムプランの削除エラー:', error);
    throw error;
  }
};

// 画像ファイルをBase64に変換
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
