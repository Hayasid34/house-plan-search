const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Service Role Keyを使用（管理者権限）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAccount() {
  console.log('=== テストアカウント作成 ===\n');

  const testEmail = 'admin@test.com';
  const testPassword = 'password123';

  // 1. まず会社を作成
  console.log('1. テスト会社を作成中...');
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: 'テスト株式会社',
      cst_number: 'CST001',
      address: '東京都渋谷区',
      phone: '03-1234-5678',
      email: 'test@example.com',
      contract_account_limit: 10
    })
    .select()
    .single();

  if (companyError) {
    console.error('会社作成エラー:', companyError);
    // 既に存在する場合は取得
    const { data: existingCompany } = await supabase
      .from('companies')
      .select()
      .eq('cst_number', 'CST001')
      .single();

    if (existingCompany) {
      console.log('既存の会社を使用:', existingCompany);
      var companyId = existingCompany.id;
    } else {
      process.exit(1);
    }
  } else {
    console.log('会社を作成しました:', company);
    var companyId = company.id;
  }

  // 2. Supabase Authでユーザーを作成
  console.log('\n2. 認証ユーザーを作成中...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });

  if (authError) {
    console.error('認証ユーザー作成エラー:', authError);
    // 既に存在する場合は取得
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('ユーザー一覧取得エラー:', listError);
      process.exit(1);
    }

    const existingUser = users.find(u => u.email === testEmail);
    if (existingUser) {
      console.log('既存のユーザーを使用:', existingUser.id);
      var userId = existingUser.id;

      // パスワードをリセット
      console.log('パスワードをリセット中...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: testPassword }
      );

      if (updateError) {
        console.error('パスワードリセットエラー:', updateError);
      } else {
        console.log('✓ パスワードをリセットしました');
      }
    } else {
      process.exit(1);
    }
  } else {
    console.log('認証ユーザーを作成しました:', authData.user.id);
    var userId = authData.user.id;
  }

  // 3. accountsテーブルにレコードを作成
  console.log('\n3. アカウント情報を登録中...');
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({
      id: userId,
      user_id: testEmail,
      name: 'テスト管理者',
      phone: '03-1234-5678',
      company_id: companyId,
      role: 'admin'
    })
    .select()
    .single();

  if (accountError) {
    console.error('アカウント登録エラー:', accountError);

    // 既に存在する場合は更新
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        user_id: testEmail,
        name: 'テスト管理者',
        phone: '03-1234-5678',
        company_id: companyId,
        role: 'admin'
      })
      .eq('id', userId);

    if (updateError) {
      console.error('アカウント更新エラー:', updateError);
    } else {
      console.log('✓ アカウント情報を更新しました');
    }
  } else {
    console.log('アカウントを登録しました:', account);
  }

  console.log('\n=== 完了 ===');
  console.log('ログイン情報:');
  console.log('  ユーザー名: ' + testEmail);
  console.log('  パスワード: ' + testPassword);
  console.log('\nhttp://localhost:3000 でログインしてください。');
}

createTestAccount().catch(console.error);
