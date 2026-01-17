import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 環境変数を読み込む
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addThumbnailColumn() {
  try {
    console.log('Adding thumbnail_url column to plans table...');

    // SQLを実行してカラムを追加
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE plans ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;'
    });

    if (error) {
      // RPC関数が存在しない場合は、直接SQLを試す
      console.log('RPC not available, trying direct query...');

      // PostgreSQL関数を作成
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });

      if (createError) {
        console.error('Cannot create function:', createError);
        console.log('\n⚠️  Please run this SQL manually in Supabase Dashboard → SQL Editor:');
        console.log('\nALTER TABLE plans ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;\n');
        process.exit(1);
      }

      // 再試行
      const { error: retryError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE plans ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;'
      });

      if (retryError) {
        console.error('Error adding column:', retryError);
        process.exit(1);
      }
    }

    console.log('✓ thumbnail_url column added successfully!');

    // 確認
    const { data: columns } = await supabase
      .from('plans')
      .select('*')
      .limit(1);

    console.log('✓ Verification successful');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    console.log('\n⚠️  Please run this SQL manually in Supabase Dashboard → SQL Editor:');
    console.log('\nALTER TABLE plans ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;\n');
    process.exit(1);
  }
}

addThumbnailColumn();
