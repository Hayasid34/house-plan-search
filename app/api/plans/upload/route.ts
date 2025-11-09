import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { readPlansData, writePlansData, Plan } from '@/lib/plansData';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const layout = formData.get('layout') as string;
    const floors = formData.get('floors') as string;
    const totalArea = parseFloat(formData.get('totalArea') as string);
    const direction = formData.get('direction') as string;
    const siteArea = parseFloat(formData.get('siteArea') as string);
    const featuresStr = formData.get('features') as string;
    const features = JSON.parse(featuresStr || '[]');

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // アップロードディレクトリを確保
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // ファイルを保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ユニークなファイル名を生成（タイムスタンプ付き）
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    // データベースに保存（今回はJSONファイル）
    const plans = await readPlansData();
    const newPlan: Plan = {
      id: `plan_${timestamp}`,
      title,
      layout,
      floors,
      totalArea,
      direction,
      siteArea,
      features,
      pdfPath: `/uploads/${fileName}`,
      originalFilename: file.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    plans.push(newPlan);
    await writePlansData(plans);

    return NextResponse.json({
      success: true,
      plan: newPlan,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'アップロード処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ファイルサイズ制限を設定（50MB）
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};
