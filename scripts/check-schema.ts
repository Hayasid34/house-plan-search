import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.localを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('Checking plans table schema...\n');

  // plansテーブルから1件取得してカラムを確認
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching plans:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Plans table columns:');
    Object.keys(data[0]).forEach(column => {
      console.log(`  - ${column}`);
    });
  } else {
    console.log('No data in plans table. Checking if thumbnail_url column exists...');

    // テーブルが空の場合は、ダミーデータを使ってカラムをチェック
    const { error: insertError } = await supabase
      .from('plans')
      .select('thumbnail_url')
      .limit(1);

    if (insertError) {
      console.error('thumbnail_url column check error:', insertError);
    } else {
      console.log('thumbnail_url column exists');
    }
  }
}

checkSchema().catch(console.error);
