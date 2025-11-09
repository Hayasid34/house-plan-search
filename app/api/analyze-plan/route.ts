import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { readFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  const tempPdfPath = '';

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // API keyの存在確認と検証
    if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'ANTHROPIC_API_KEYが正しく設定されていません',
          details: 'プロジェクトルートの.env.localファイルに実際のAnthropic API keyを設定してください。',
          setupInstructions: [
            '1. https://console.anthropic.com/settings/keys でAPI keyを取得',
            '2. .env.localファイルを開く',
            '3. ANTHROPIC_API_KEY=your_api_key_here を実際のAPI keyに置き換える',
            '4. 開発サーバーを再起動する (npm run dev)'
          ]
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが必要です' },
        { status: 400 }
      );
    }

    // PDFをバッファとして読み込み
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // PDFをBase64エンコード
    const base64Pdf = buffer.toString('base64');

    // Anthropic APIクライアントを初期化
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Claude APIでPDFを直接解析
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              type: 'text',
              text: `この住宅プランのPDFから以下の情報を抽出してください。

**重要な抽出ルール:**
1. 建物面積: 「1階床面積」「2階床面積」「建築床面積」「延床面積」などから合計を坪数で抽出
   - ㎡の場合は坪に変換（1坪 = 3.30579㎡）
   - 小数点第2位まで
2. 敷地面積: 配置図から敷地面積を坪数で抽出（㎡の場合は坪に変換）
3. 間取り: 平面図から部屋数を数えて判定（LDK + 寝室・洋室の数）
   - **必ず「数字+LDK」の形式で返す（例: 2LDK, 3LDK, 4LDK, 5LDK, 6LDK）**
   - LDKを除く個室（寝室、洋室、和室など）の数を数える
   - 例: LDK + 洋室2部屋 + 主寝室1部屋 = 4LDK
   - 例: LDK + 洋室1部屋 + 主寝室1部屋 = 3LDK
4. 階数: 「1階平面図」「2階平面図」の存在や、図面のタイトルから判定
5. 進入方向: 配置図の方位記号と道路の位置関係から判定
6. 特徴: 図面・平面図から以下の特徴を抽出
   - WIC, SIC は「ウォークインクローゼット」「シューズクローク」として抽出
   - パントリー、ランドリールーム、和室などの部屋名から判定
   - 吹き抜けは図面の表記から判定
   - 階段の位置がリビング内にあれば「リビング階段」
   - キッチンの形状から「アイランドキッチン」「対面キッチン」を判定

**特徴の候補リスト:**
吹き抜け, ロフト, スキップフロア, 中庭（パティオ）, 回遊動線, 家事動線, アイランドキッチン／アイランド動線, 玄関土間, シューズクローク, パントリー, ランドリールーム（脱衣分離含む）, ファミリースペース／スタディコーナー, リビング階段, セカンドリビング, ウォークインクローゼット, 対面キッチン, 2階リビング, 和室, サンルーム, 駐車1台, 駐車2台, 駐車3台, 駐車4台

必ず以下のJSON形式で返答してください（他の文章は含めないでください）：

{
  "layout": "間取り（2LDK, 3LDK, 4LDK, 5LDK, 6LDK のいずれか）または null",
  "floors": "階数（平屋, 2階建て, 3階建て のいずれか）または null",
  "totalArea": 建物坪数（数値）または null,
  "siteArea": 敷地面積の坪数（数値）または null,
  "direction": "進入方向（北, 南, 東, 西, 北東, 北西, 南東, 南西 のいずれか）または null",
  "features": ["特徴の配列（該当する特徴をリストから選択）"],
  "confidence": {
    "layout": 0-100の信頼度（整数）,
    "floors": 0-100の信頼度（整数）,
    "totalArea": 0-100の信頼度（整数）,
    "siteArea": 0-100の信頼度（整数）,
    "direction": 0-100の信頼度（整数）,
    "features": 0-100の信頼度（整数）,
    "overall": 0-100の全体信頼度（整数）
  }
}`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // JSONを抽出（```json ``` で囲まれている場合に対応）
    let jsonText = responseText.trim();
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    } else {
      // { } で囲まれた部分を抽出
      const objectMatch = responseText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonText = objectMatch[0];
      }
    }

    const analysis = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      analysis: {
        layout: analysis.layout || '-',
        floors: analysis.floors || '-',
        totalArea: Number(analysis.totalArea) || 0,
        siteArea: Number(analysis.siteArea) || 0,
        direction: analysis.direction || '-',
        features: Array.isArray(analysis.features) ? analysis.features : [],
        confidence: analysis.confidence || {
          layout: 0,
          floors: 0,
          totalArea: 0,
          siteArea: 0,
          direction: 0,
          features: 0,
          overall: 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Plan analysis error:', error);

    // エラーの詳細を返す
    if (error.status === 401 || error.message?.includes('authentication')) {
      return NextResponse.json(
        {
          success: false,
          error: '認証エラー',
          details: 'APIキーが無効です。正しいAnthropic APIキーを設定してください。',
          setupInstructions: [
            '1. https://console.anthropic.com/settings/keys でAPIキーを確認',
            '2. .env.localファイルのANTHROPIC_API_KEYを更新',
            '3. 開発サーバーを再起動'
          ],
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '図面の解析中にエラーが発生しました',
        details: error.message || '不明なエラー',
      },
      { status: 500 }
    );
  }
}
