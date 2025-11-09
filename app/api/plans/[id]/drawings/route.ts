import { NextRequest, NextResponse } from 'next/server';
import { addDrawingToPlan, removeDrawingFromPlan, getPlan } from '@/lib/plansData';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { Drawing } from '@/lib/plansData';

// 図面を追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const type = formData.get('type') as Drawing['type'];

    if (!file || !type) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // プランが存在するか確認
    const plan = await getPlan(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    // ファイルを保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const drawingId = `drawing_${Date.now()}`;
    const fileExtension = file.name.split('.').pop();
    const filename = `${drawingId}.${fileExtension}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'drawings');
    const filePath = path.join(uploadsDir, filename);

    // uploadsディレクトリを作成（存在しない場合）
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      // ディレクトリが存在しない場合は作成
      const fs = require('fs');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      await writeFile(filePath, buffer);
    }

    // 図面情報を作成
    const drawing: Drawing = {
      id: drawingId,
      type,
      filePath: `/drawings/${filename}`,
      originalFilename: file.name,
      uploadedAt: new Date().toISOString(),
    };

    // プランに図面を追加
    const updatedPlan = await addDrawingToPlan(planId, drawing);

    if (!updatedPlan) {
      return NextResponse.json(
        { error: '図面の追加に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      drawing,
      message: '図面を追加しました',
    });
  } catch (error) {
    console.error('Drawing upload error:', error);
    return NextResponse.json(
      { error: '図面のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 図面を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const { searchParams } = new URL(request.url);
    const drawingId = searchParams.get('drawingId');

    if (!drawingId) {
      return NextResponse.json(
        { error: '図面IDが指定されていません' },
        { status: 400 }
      );
    }

    // プランを取得して図面のファイルパスを確認
    const plan = await getPlan(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    const drawing = plan.drawings?.find(d => d.id === drawingId);
    if (!drawing) {
      return NextResponse.json(
        { error: '図面が見つかりません' },
        { status: 404 }
      );
    }

    // ファイルを削除
    try {
      const drawingPath = path.join(process.cwd(), 'public', drawing.filePath);
      await unlink(drawingPath);
    } catch (error) {
      console.error('Drawing file deletion error:', error);
    }

    // データベースから削除
    const updatedPlan = await removeDrawingFromPlan(planId, drawingId);

    if (!updatedPlan) {
      return NextResponse.json(
        { error: '図面の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '図面を削除しました',
    });
  } catch (error) {
    console.error('Drawing delete error:', error);
    return NextResponse.json(
      { error: '図面の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
