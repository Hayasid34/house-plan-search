/**
 * 既存のPDFプランのサムネイルを一括生成するスクリプト
 *
 * 使用方法:
 * npx ts-node scripts/generate-thumbnails.ts
 */

import { createClient } from '@supabase/supabase-js';
import { generateThumbnailFromURL } from '../lib/pdfThumbnail';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

async function generateThumbnails() {
  console.log('🚀 サムネイル一括生成を開始します...\n');

  // Supabaseクライアントを作成（サービスロールキー使用）
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // thumbnail_urlがnullのプランを取得
    console.log('📋 サムネイルが未生成のプランを取得中...');
    const { data: plans, error: fetchError } = await supabase
      .from('plans')
      .select('id, title, pdf_path, thumbnail_url')
      .is('thumbnail_url', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!plans || plans.length === 0) {
      console.log('✅ サムネイルが未生成のプランはありません');
      return;
    }

    console.log(`📊 ${plans.length}件のプランにサムネイルを生成します\n`);

    let successCount = 0;
    let errorCount = 0;

    // 各プランに対してサムネイルを生成
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      console.log(`[${i + 1}/${plans.length}] ${plan.title || plan.id} の処理中...`);

      try {
        if (!plan.pdf_path) {
          console.log(`  ⚠️  PDF URLが見つかりません。スキップします。`);
          errorCount++;
          continue;
        }

        // サムネイルを生成
        console.log(`  📸 サムネイル生成中...`);
        const thumbnailBuffer = await generateThumbnailFromURL(plan.pdf_path, { width: 400 });

        // ファイル名を生成
        const timestamp = Date.now();
        const thumbnailFileName = `${timestamp}_${plan.id}_thumb.png`;

        // Supabase Storageにアップロード
        console.log(`  ⬆️  アップロード中...`);
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

        // 公開URLを取得
        const { data: { publicUrl } } = supabase
          .storage
          .from('plan-thumbnails')
          .getPublicUrl(thumbnailFileName);

        // プランテーブルを更新
        console.log(`  💾 データベース更新中...`);
        const { error: updateError } = await supabase
          .from('plans')
          .update({ thumbnail_url: publicUrl })
          .eq('id', plan.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`  ✅ 成功: ${publicUrl}\n`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ エラー: ${error}\n`);
        errorCount++;
      }

      // レート制限を避けるため、少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 結果を表示
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 処理結果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`合計: ${plans.length}件`);
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${errorCount}件`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
generateThumbnails()
  .then(() => {
    console.log('🎉 サムネイル一括生成が完了しました！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 予期しないエラー:', error);
    process.exit(1);
  });
