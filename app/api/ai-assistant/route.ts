import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAllPlans } from '@/lib/plansData';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEYが設定されていません。.env.localファイルにAPIキーを設定してください。' },
        { status: 500 }
      );
    }

    // 現在登録されているプランを取得
    const plans = await getAllPlans();

    // プラン情報を整形
    const plansInfo = plans.map(plan => ({
      id: plan.id,
      title: plan.title,
      layout: plan.layout,
      floors: plan.floors,
      totalArea: plan.totalArea,
      direction: plan.direction,
      siteArea: plan.siteArea,
      features: plan.features,
    }));

    // Claude APIに送信
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: `あなたはDandoriFinderのAIアシスタントです。
ユーザーの要望を聞いて、登録されているプランの中から最適なものを提案してください。

現在登録されているプラン:
${JSON.stringify(plansInfo, null, 2)}

以下のガイドラインに従ってください:
1. ユーザーの要望を丁寧に聞き、条件に合うプランを提案する
2. プランIDと一緒に、なぜそのプランがおすすめなのか理由を説明する
3. 複数のプランが該当する場合は、比較しながら提案する
4. 該当するプランがない場合は、近い条件のプランを提案する
5. プランの特徴や間取り、面積などの情報を分かりやすく伝える
6. フレンドリーで親しみやすい口調で対応する
7. 「-」や「不明」となっている項目は、情報が登録されていないことを意味する
8. プランIDを提示する際は、「プランID: plan_xxx」のように明確に示す`,
      messages: [
        ...(conversationHistory || []),
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      suggestedPlans: extractPlanIds(assistantMessage, plans),
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'AIアシスタントの処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// メッセージからプランIDを抽出する
function extractPlanIds(message: string, plans: any[]): string[] {
  const planIds: string[] = [];
  plans.forEach(plan => {
    if (message.includes(plan.id)) {
      planIds.push(plan.id);
    }
  });
  return planIds;
}
