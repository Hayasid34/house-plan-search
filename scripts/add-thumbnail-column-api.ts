import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.localを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addThumbnailColumn() {
  console.log('Adding thumbnail_url column to plans table...\n');

  // Service roleを使用してSQL関数を作成し実行
  // まず、DDL実行用の一時的な関数を作成
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION add_thumbnail_column()
    RETURNS void AS $$
    BEGIN
      -- Add column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'plans' AND column_name = 'thumbnail_url'
      ) THEN
        ALTER TABLE plans ADD COLUMN thumbnail_url TEXT;
        CREATE INDEX idx_plans_thumbnail_url ON plans(thumbnail_url);
      END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  console.log('Creating temporary function...');

  const { data: createData, error: createError } = await supabase.rpc('add_thumbnail_column');

  if (createError) {
    console.error('Error:', createError);
    console.log('\nAlternative: Please run this SQL in Supabase Dashboard > SQL Editor:');
    console.log('\nALTER TABLE plans ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;');
    console.log('CREATE INDEX IF NOT EXISTS idx_plans_thumbnail_url ON plans(thumbnail_url);');
    return;
  }

  console.log('✓ Column added successfully!');

  // 確認
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .limit(1);

  if (plans && plans.length > 0) {
    console.log('\nVerified columns:');
    Object.keys(plans[0]).forEach(col => console.log(`  - ${col}`));
  }
}

addThumbnailColumn().catch(console.error);
