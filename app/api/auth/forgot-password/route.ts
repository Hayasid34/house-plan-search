import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/users';
import { generateResetToken } from '@/lib/resetTokens';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // メールアドレスの検証
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // ユーザーの存在確認
    const user = getUserByEmail(email);
    if (!user) {
      // セキュリティ上、ユーザーが存在しない場合でも成功メッセージを返す
      return NextResponse.json({
        success: true,
        message: 'パスワードリセットのご案内を送信しました',
      });
    }

    // リセットトークンを生成
    const resetToken = generateResetToken(email);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // メール送信のシミュレーション（開発環境用）
    // 本番環境では実際にユーザーのメールアドレスに送信
    console.log('\n==========================================');
    console.log('【ダンドリワーク】パスワード再発行');
    console.log('==========================================');
    console.log(`To: ${user.email}`);
    console.log('Subject: 【ダンドリワーク】パスワード再発行');
    console.log('\n--- メール本文 ---\n');
    console.log('ダンドリワークをご利用いただきありがとうございます。');
    console.log('以下の、ユーザーのパスワード変更を受け付けました。');
    console.log('\n------------------------------------\n');
    console.log(`ユーザー名：${user.email}`);
    console.log(`\n会社ID：${user.companyId}`);
    console.log(`会社名：${user.companyName}`);
    console.log('\n------------------------------------\n');
    console.log('新しいパスワードを設定する場合は、下記のURLをクリックして');
    console.log('新しいパスワードを入力してください。');
    console.log(`\n${resetUrl}`);
    console.log('\n本メールは配信専用の自動メールです。 ご返信なさらぬようお願いいたします。');
    console.log('\n/***********************************************************************/');
    console.log('\nダンドリワークは');
    console.log('株式会社ダンドリワークの施工管理サービスです。');
    console.log('\n【株式会社ダンドリワーク】');
    console.log('URL: https://dandori-work.com/');
    console.log('© dandori work Co., Ltd.');
    console.log('\n/***********************************************************************/');
    console.log('\n==========================================\n');

    // 本番環境での実装例（コメントアウト）:
    /*
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: user.email, // ユーザーのメールアドレスに送信
      subject: '【ダンドリワーク】パスワード再発行',
      html: `
        <p>ダンドリワークをご利用いただきありがとうございます。<br>
        以下の、ユーザーのパスワード変更を受け付けました。</p>

        <p>------------------------------------</p>

        <p>ユーザー名：${user.email}</p>

        <p>会社ID：${user.companyId}<br>
        会社名：${user.companyName}</p>

        <p>------------------------------------</p>

        <p>新しいパスワードを設定する場合は、下記のURLをクリックして<br>
        新しいパスワードを入力してください。</p>

        <p><a href="${resetUrl}">${resetUrl}</a></p>

        <p>本メールは配信専用の自動メールです。 ご返信なさらぬようお願いいたします。</p>

        <hr>

        <p>ダンドリワークは<br>
        株式会社ダンドリワークの施工管理サービスです。</p>

        <p>【株式会社ダンドリワーク】<br>
        URL: <a href="https://dandori-work.com/">https://dandori-work.com/</a><br>
        © dandori work Co., Ltd.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    */

    return NextResponse.json({
      success: true,
      message: 'パスワードリセットのご案内を送信しました',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'パスワードリセットのリクエスト処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
