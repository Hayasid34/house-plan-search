const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccounts() {
  console.log('Supabase URL:', supabaseUrl);
  console.log('\n=== アカウント情報を確認中 ===\n');

  // アカウントデータを取得
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*');

  if (accountsError) {
    console.error('アカウント取得エラー:', accountsError);
  } else {
    console.log('アカウント一覧:');
    console.log(accounts);
  }

  // 会社データを取得
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*');

  if (companiesError) {
    console.error('会社取得エラー:', companiesError);
  } else {
    console.log('\n会社一覧:');
    console.log(companies);
  }
}

checkAccounts();
