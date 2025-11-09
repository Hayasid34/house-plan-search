import { NextRequest, NextResponse } from 'next/server';
import { addPhotoToPlan, removePhotoFromPlan, getPlan } from '@/lib/plansData';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { Photo } from '@/lib/plansData';

// 写真を追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const formData = await request.formData();

    const file = formData.get('file') as File;

    if (!file) {
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

    const photoId = `photo_${Date.now()}`;
    const fileExtension = file.name.split('.').pop();
    const filename = `${photoId}.${fileExtension}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'photos');
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

    // 写真情報を作成
    const photo: Photo = {
      id: photoId,
      filePath: `/photos/${filename}`,
      originalFilename: file.name,
      uploadedAt: new Date().toISOString(),
    };

    // プランに写真を追加
    const updatedPlan = await addPhotoToPlan(planId, photo);

    if (!updatedPlan) {
      return NextResponse.json(
        { error: '写真の追加に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photo,
      message: '写真を追加しました',
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: '写真のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 写真を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { error: '写真IDが指定されていません' },
        { status: 400 }
      );
    }

    // プランを取得して写真のファイルパスを確認
    const plan = await getPlan(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    const photo = plan.photos?.find(p => p.id === photoId);
    if (!photo) {
      return NextResponse.json(
        { error: '写真が見つかりません' },
        { status: 404 }
      );
    }

    // ファイルを削除
    try {
      const photoPath = path.join(process.cwd(), 'public', photo.filePath);
      await unlink(photoPath);
    } catch (error) {
      console.error('Photo file deletion error:', error);
    }

    // データベースから削除
    const updatedPlan = await removePhotoFromPlan(planId, photoId);

    if (!updatedPlan) {
      return NextResponse.json(
        { error: '写真の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '写真を削除しました',
    });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json(
      { error: '写真の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
