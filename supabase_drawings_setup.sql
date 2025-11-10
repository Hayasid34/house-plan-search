-- drawingsテーブルを作成
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('1階平面図', '2階平面図', '3階平面図', '立面図', '断面図', 'その他')),
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_drawings_plan_id ON drawings(plan_id);
CREATE INDEX IF NOT EXISTS idx_drawings_created_at ON drawings(created_at DESC);

-- 既存のplansテーブルにあるdrawingsカラムを削除（JSONB形式からテーブル形式に移行）
-- ALTER TABLE plans DROP COLUMN IF EXISTS drawings;
