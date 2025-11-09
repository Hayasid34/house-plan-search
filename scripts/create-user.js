const { createClient } = require('@supabase/supabase-js');

// 環境変数から読み込み
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // これが必要

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '設定済み' : '未設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  console.log('ユーザーを作成中...');

  // 既存のユーザーを削除
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === 'test@example.com');

  if (existingUser) {
    console.log('既存のユーザーを削除中...');
    await supabase.auth.admin.deleteUser(existingUser.id);
    // accountsテーブルからも削除
    await supabase.from('accounts').delete().eq('user_id', 'test@example.com');
  }

  // 新しいユーザーを作成
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: 'test@example.com',
    password: 'Test1234!',
    email_confirm: true
  });

  if (createError) {
    console.error('ユーザー作成エラー:', createError);
    process.exit(1);
  }

  console.log('ユーザー作成成功:', newUser.user.id);

  // companiesテーブルから会社IDを取得
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
    .single();

  if (!company) {
    console.error('会社が見つかりません');
    process.exit(1);
  }

  // accountsテーブルにレコードを作成
  const { error: accountError } = await supabase
    .from('accounts')
    .insert({
      id: newUser.user.id,
      user_id: 'test@example.com',
      name: 'テストユーザー',
      phone: '000-0000-0000',
      company_id: company.id,
      role: 'admin'
    });

  if (accountError) {
    console.error('アカウント作成エラー:', accountError);
    process.exit(1);
  }

  console.log('✅ ユーザーとアカウントの作成が完了しました');
  console.log('Email: test@example.com');
  console.log('Password: Test1234!');
  console.log('User ID:', newUser.user.id);
}

createUser().catch(console.error);
