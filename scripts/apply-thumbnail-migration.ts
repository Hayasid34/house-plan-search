import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// .env.localを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying thumbnail_url migration...\n');

  // マイグレーションファイルを読み込む
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/002_add_thumbnail_url.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('Migration SQL:');
  console.log(migrationSQL);
  console.log('\nExecuting...\n');

  // SQLを実行（service roleキーが必要）
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

  if (error) {
    console.error('Migration failed:', error);

    // 直接実行を試みる（コメント行を削除）
    console.log('\nTrying alternative approach...\n');

    const commands = [
      'ALTER TABLE plans ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;',
      'CREATE INDEX IF NOT EXISTS idx_plans_thumbnail_url ON plans(thumbnail_url);'
    ];

    for (const cmd of commands) {
      console.log(`Executing: ${cmd}`);
      const { error: cmdError } = await supabase.rpc('exec_sql', { sql: cmd });
      if (cmdError) {
        console.error(`Error: ${cmdError.message}`);
      } else {
        console.log('✓ Success');
      }
    }
  } else {
    console.log('✓ Migration applied successfully');
  }

  // 確認
  console.log('\nVerifying schema...');
  const { data: plans, error: selectError } = await supabase
    .from('plans')
    .select('*')
    .limit(1);

  if (selectError) {
    console.error('Verification failed:', selectError);
  } else if (plans && plans.length > 0) {
    console.log('\nCurrent columns:');
    Object.keys(plans[0]).forEach(col => {
      console.log(`  - ${col}`);
    });
  } else {
    console.log('No data to verify, but migration should have applied');
  }
}

applyMigration().catch(console.error);
