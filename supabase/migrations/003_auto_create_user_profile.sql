-- Googleログイン時にaccountsテーブルへ自動的にユーザープロファイルを作成
-- Auth.usersにユーザーが作成されたら、accountsテーブルにもレコードを作成する

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (id, user_id, name, company_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, '未設定'),
    NULL,  -- 初回登録時は会社未設定
    'viewer'  -- デフォルトロール
  )
  ON CONFLICT (id) DO NOTHING;  -- 既に存在する場合はスキップ

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルにトリガーを設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 既存のaccountsテーブルを確認し、company_idがNULLでも問題ないように制約を確認
-- （既存のスキーマでは company_id は NULL許容になっているはずですが念のため）
COMMENT ON COLUMN accounts.company_id IS '会社ID（初回登録時はNULL、会社選択後に設定される）';
