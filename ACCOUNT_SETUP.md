# テストアカウント作成手順

## Supabaseダッシュボードでアカウントを作成する

### 手順

#### 1. Supabaseダッシュボードにアクセス
1. https://supabase.com にアクセス
2. ログインする
3. プロジェクト `zmojbbvpavnqhekitild` を開く

#### 2. テスト会社を作成

1. 左メニューから「Table Editor」を選択
2. `companies` テーブルを開く
3. 「Insert」→「Insert row」をクリック
4. 以下の情報を入力:
   - name: `テスト株式会社`
   - cst_number: `CST001`
   - address: `東京都渋谷区`
   - phone: `03-1234-5678`
   - email: `test@example.com`
   - contract_account_limit: `10`
5. 「Save」をクリック
6. **作成された会社のID（UUID）をコピー** してメモ

#### 3. 認証ユーザーを作成

1. 左メニューから「Authentication」を選択
2. 「Users」タブを開く
3. 「Add user」→「Create new user」をクリック
4. 以下の情報を入力:
   - Email: `admin@test.com`
   - Password: `password123`
   - Auto Confirm User: **チェックを入れる**（重要！）
5. 「Create user」をクリック
6. **作成されたユーザーのID（UUID）をコピー** してメモ

#### 4. アカウント情報を登録

1. 「Table Editor」に戻る
2. `accounts` テーブルを開く
3. 「Insert」→「Insert row」をクリック
4. 以下の情報を入力:
   - id: **手順3でコピーしたユーザーのUUID** を貼り付け
   - user_id: `admin@test.com`
   - name: `テスト管理者`
   - phone: `03-1234-5678`
   - company_id: **手順2でコピーした会社のUUID** を貼り付け
   - role: `admin`
5. 「Save」をクリック

#### 5. ログイン

http://localhost:3000 にアクセスして、以下の情報でログイン:

- **ユーザー名（メールアドレス）**: `admin@test.com`
- **パスワード**: `password123`

---

## より簡単な方法: SQLで一括作成

Supabaseダッシュボードの「SQL Editor」で以下のSQLを実行してください:

```sql
-- 1. 会社を作成
INSERT INTO companies (name, cst_number, address, phone, email, contract_account_limit)
VALUES ('テスト株式会社', 'CST001', '東京都渋谷区', '03-1234-5678', 'test@example.com', 10)
ON CONFLICT (cst_number) DO NOTHING
RETURNING id;

-- 上記で返されたIDをメモしてください（例: 12345678-1234-1234-1234-123456789012）
```

次に、Authenticationページでユーザーを手動作成:
- Email: `admin@test.com`
- Password: `password123`
- Auto Confirm User: チェックを入れる

作成されたユーザーIDをメモして、以下のSQLを実行:

```sql
-- 2. アカウント情報を登録（UUIDを実際の値に置き換える）
INSERT INTO accounts (id, user_id, name, phone, company_id, role)
VALUES (
  'ここにユーザーID',  -- 認証ユーザーのUUID
  'admin@test.com',
  'テスト管理者',
  '03-1234-5678',
  'ここに会社ID',  -- 会社のUUID
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  company_id = EXCLUDED.company_id,
  role = EXCLUDED.role;
```

---

## トラブルシューティング

### 「ユーザー名またはパスワードが正しくありません」エラー

- ユーザー名は**メールアドレス**である必要があります（例: `admin@test.com`）
- ユーザー名に`admin`のような単純な文字列は使えません
- 「Auto Confirm User」にチェックを入れたか確認してください

### アカウント情報の取得に失敗

- `accounts`テーブルにレコードが登録されているか確認
- `id`が認証ユーザーのUUIDと一致しているか確認
- `company_id`が有効な会社のUUIDを指しているか確認
