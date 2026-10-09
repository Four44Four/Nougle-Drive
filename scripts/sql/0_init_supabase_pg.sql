CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(25) UNIQUE NOT NULL
);

CREATE SCHEMA IF NOT EXISTS internal;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_self_manage ON profiles;
CREATE POLICY profiles_self_manage ON profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

REVOKE ALL ON profiles FROM anon;
REVOKE ALL ON profiles FROM authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- `authenticated`s can change the username of + read (their own) `profiles` records
GRANT SELECT, UPDATE (username) ON profiles TO authenticated;

CREATE OR REPLACE FUNCTION get_all_users()
RETURNS SETOF profiles 
AS $$
  SELECT * FROM profiles;
$$ LANGUAGE sql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION get_all_users() FROM PUBLIC;
-- `authenticated`s can call `get_all_users`
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;


-- hook into after inserting into `auth` table
--      to create a profile too
CREATE OR REPLACE FUNCTION internal.create_new_profile()
RETURNS TRIGGER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION internal.create_new_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION internal.create_new_profile() TO service_role, supabase_auth_admin;

CREATE OR REPLACE TRIGGER on_auth_register
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION internal.create_new_profile()
