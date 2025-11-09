import { NextRequest, NextResponse } from 'next/server';
import { deletePlan, getPlan, readPlansData, writePlansData, toggleFavorite } from '@/lib/plansData';
import { getUsernameFromRequest } from '@/lib/auth';
import { getUserByUsername } from '@/lib/users';
import { hasPermission, Permissions } from '@/lib/permissions';
import { unlink } from 'fs/promises';
import path from 'path';

// プラン情報を更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 権限チェック
    const username = getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const user = getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    if (!hasPermission(user.role, Permissions.EDIT_PLANS)) {
      return NextResponse.json(
        { error: 'プランを編集する権限がありません' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const updates = await request.json();

    const plans = await readPlansData();
    const planIndex = plans.findIndex(p => p.id === id);

    if (planIndex === -1) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    // プラン情報を更新
    plans[planIndex] = {
      ...plans[planIndex],
      ...updates,
      // titleを再生成
      title: `${updates.totalArea || plans[planIndex].totalArea}坪 ${updates.layout || plans[planIndex].layout} ${updates.floors || plans[planIndex].floors} ${updates.direction || plans[planIndex].direction}道路`,
      updatedAt: new Date().toISOString(),
    };

    await writePlansData(plans);

    return NextResponse.json({
      success: true,
      plan: plans[planIndex],
    });
  } catch (error) {
    console.error('Plan update error:', error);
    return NextResponse.json(
      { error: 'プランの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 権限チェック
    const username = getUsernameFromRequest(request);
    if (!username) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const user = getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    if (!hasPermission(user.role, Permissions.DELETE_PLANS)) {
      return NextResponse.json(
        { error: 'プランを削除する権限がありません' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // プランを取得してPDFファイルのパスを確認
    const plan = await getPlan(id);

    if (!plan) {
      return NextResponse.json(
        { error: 'プランが見つかりません' },
        { status: 404 }
      );
    }

    // PDFファイルを削除
    try {
      const pdfPath = path.join(process.cwd(), 'public', plan.pdfPath);
      await unlink(pdfPath);
    } catch (error) {
      console.error('PDF file deletion error:', error);
      // ファイルが存在しない場合は続行
    }

    // データベースから削除
    const success = await deletePlan(id);

    if (!success) {
      return NextResponse.json(
        { error: 'プランの削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'プランを削除しました',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: '削除処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
