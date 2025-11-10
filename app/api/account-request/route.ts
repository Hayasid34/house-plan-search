import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, name, email, phone } = body;

    // バリデーション
    if (!companyName || !name || !email || !phone) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // メール送信
    const { data, error } = await resend.emails.send({
      from: 'DandoriFinder <noreply@updates.dandori-work.com>',
      to: ['cs.group@dandori-work.com'],
      replyTo: email,
      subject: '新規アカウント作成依頼',
      html: `
        <h2>新規アカウント作成依頼</h2>
        <p>以下の内容で新規アカウント作成の依頼がありました。</p>
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">会社名</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${companyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">氏名</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">メールアドレス</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">連絡先</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
          </tr>
        </table>
        <p>よろしくお願いいたします。</p>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json(
        { error: 'メール送信に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'アカウント作成依頼を送信しました',
      data,
    });
  } catch (error) {
    console.error('Account request error:', error);
    return NextResponse.json(
      { error: 'リクエストの処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
