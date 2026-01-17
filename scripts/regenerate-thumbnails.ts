import { createClient } from '@supabase/supabase-js';
import { generatePDFThumbnail } from '../lib/pdfThumbnail';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function regenerateThumbnails() {
  console.log('サムネイルなしのプランを取得中...\n');

  // thumbnail_urlがnullのプランを取得
  const { data: plans, error } = await supabase
    .from('plans')
    .select('id, title, pdf_path, original_filename')
    .is('thumbnail_url', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('エラー:', error);
    return;
  }

  if (!plans || plans.length === 0) {
    console.log('サムネイル未生成のプランが見つかりません');
    return;
  }

  console.log(`${plans.length}件のプランでサムネイルを生成します\n`);

  let successCount = 0;
  let failCount = 0;

  for (const plan of plans) {
    try {
      console.log(`[${successCount + failCount + 1}/${plans.length}] ${plan.title || plan.id}`);
      console.log(`  PDF URL: ${plan.pdf_path}`);

      // PDFをダウンロード
      const response = await fetch(plan.pdf_path);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      const pdfBuffer = await response.arrayBuffer();
      console.log('  PDFダウンロード完了');

      // サムネイルを生成
      const thumbnailBuffer = await generatePDFThumbnail(pdfBuffer, { width: 400 });
      console.log('  サムネイル生成完了');

      // サムネイルファイル名を作成
      const timestamp = Date.now();
      const safeFileName = (plan.original_filename || 'plan.pdf')
        .replace(/[^\w.-]/g, '_')
        .replace(/\s+/g, '_')
        .replace('.pdf', '');
      const thumbnailFileName = `${timestamp}_${safeFileName}_thumb.png`;

      // Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('plan-thumbnails')
        .upload(thumbnailFileName, thumbnailBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }
      console.log('  Storageアップロード完了');

      // 公開URLを取得
      const { data: { publicUrl } } = supabase
        .storage
        .from('plan-thumbnails')
        .getPublicUrl(thumbnailFileName);

      // データベースを更新
      const { error: updateError } = await supabase
        .from('plans')
        .update({ thumbnail_url: publicUrl })
        .eq('id', plan.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`  ✓ 完了: ${publicUrl}\n`);
      successCount++;

    } catch (error: any) {
      console.error(`  ✗ エラー: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('\n=== 完了 ===');
  console.log(`成功: ${successCount}件`);
  console.log(`失敗: ${failCount}件`);
}

regenerateThumbnails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
