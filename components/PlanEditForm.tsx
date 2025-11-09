'use client';

import { useState } from 'react';
import { Plan } from '@/lib/plansData';

interface PlanEditFormProps {
  plan: Plan;
  onSave: (updates: Partial<Plan>) => void;
  onCancel: () => void;
}

const layoutOptions = ['2LDK', '3LDK', '4LDK', '5LDK', '6LDK', '-'];
const floorsOptions = ['平屋', '2階建て', '3階建て', '-'];
const directionOptions = ['東', '西', '南', '北', '北東', '北西', '南東', '南西', '-'];

const featureOptions = [
  '吹き抜け', 'ロフト', 'スキップフロア', '中庭（パティオ）',
  '回遊動線', '家事動線', 'アイランドキッチン／アイランド動線',
  '玄関土間', 'シューズクローク', 'パントリー',
  'ランドリールーム（脱衣分離含む）', 'ファミリースペース／スタディコーナー',
  'リビング階段', 'セカンドリビング', 'ウォークインクローゼット',
  '対面キッチン', '2階リビング', '和室', 'サンルーム',
  '駐車1台', '駐車2台', '駐車3台', '駐車4台',
];

export default function PlanEditForm({ plan, onSave, onCancel }: PlanEditFormProps) {
  const [formData, setFormData] = useState({
    layout: plan.layout,
    floors: plan.floors,
    totalArea: plan.totalArea,
    direction: plan.direction,
    siteArea: plan.siteArea,
    features: plan.features,
  });

  const toggleFeature = (feature: string) => {
    const features = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature];
    setFormData({ ...formData, features });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-bg-soft rounded-lg">
      <h3 className="text-xl font-bold text-text-primary">プラン情報を編集</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 延床面積 */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            延床面積（坪）
          </label>
          <input
            type="number"
            value={formData.totalArea}
            onChange={(e) => setFormData({ ...formData, totalArea: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-line-dark rounded focus:outline-none focus:ring-2 focus:ring-line-focused"
          />
        </div>

        {/* 間取り */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            間取り
          </label>
          <select
            value={formData.layout}
            onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
            className="w-full px-3 py-2 border border-line-dark rounded focus:outline-none focus:ring-2 focus:ring-line-focused"
          >
            {layoutOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* 階数 */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            階数
          </label>
          <select
            value={formData.floors}
            onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
            className="w-full px-3 py-2 border border-line-dark rounded focus:outline-none focus:ring-2 focus:ring-line-focused"
          >
            {floorsOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* 進入方向 */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            進入方向
          </label>
          <select
            value={formData.direction}
            onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
            className="w-full px-3 py-2 border border-line-dark rounded focus:outline-none focus:ring-2 focus:ring-line-focused"
          >
            {directionOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* 敷地面積 */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            敷地面積（坪）
          </label>
          <input
            type="number"
            value={formData.siteArea}
            onChange={(e) => setFormData({ ...formData, siteArea: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-line-dark rounded focus:outline-none focus:ring-2 focus:ring-line-focused"
          />
        </div>
      </div>

      {/* 特徴 */}
      <div>
        <label className="block text-sm font-medium text-text-sub mb-2">
          特徴（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {featureOptions.map(feature => {
            const isSelected = formData.features.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-dw-blue text-white shadow-md'
                    : 'bg-white text-text-primary border border-line-dark hover:bg-bg-soft'
                }`}
              >
                {feature}
              </button>
            );
          })}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-dw-blue hover:bg-dw-blue-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-line-dark text-text-sub rounded-lg hover:bg-bg-soft transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
