CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(25) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS foos (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE foos ENABLE ROW LEVEL SECURITY;

--CREATE ROLE anon;
--CREATE ROLE authenticated;

-- restrict `authenticated`s to only being able to access their own records

DROP POLICY IF EXISTS user_self_manage ON users;
CREATE POLICY user_self_manage ON users
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS foos_self_manage ON foos;
CREATE POLICY foos_self_manage ON foos
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


REVOKE ALL ON users FROM anon;
REVOKE ALL ON users FROM authenticated;

-- `authenticated`s can do anything to (their own) `foos` records
GRANT SELECT, INSERT, UPDATE, DELETE ON foos TO authenticated;

-- `authenticated`s can do specific things to (their own) `users` records
GRANT SELECT(id, username) ON users TO authenticated;
GRANT UPDATE(username) ON users TO authenticated;
GRANT DELETE ON users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-----------------------------------------------
-- FUNCTIONS
-----------------------------------------------

-- `password_in` must be >= 12 char long, <= 72 char long, have 1 uppercase letter, 1 number, and 1 non-alphanumeric character
CREATE OR REPLACE FUNCTION hash_password(password_in TEXT)
RETURNS TEXT
AS $$
BEGIN
  IF length(password_in) < 12 THEN
    RAISE EXCEPTION 'Password must be at least 12 characters long';
  END IF;

  IF length(password_in) > 72 THEN
    RAISE EXCEPTION 'Password must be 72 or less characters long';
  END IF;

  IF NOT (password_in ~ '[^[:alnum:]]' AND password_in ~ '[[:upper:]]' AND password_in ~ '[[:digit:]]') THEN
    RAISE EXCEPTION 'Password must have an uppercase letter, a numeric digit, and a non alphanumeric character';
  END IF;

  RETURN crypt(password_in, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

-- no outside users can call `hash_password`
REVOKE EXECUTE ON FUNCTION hash_password(TEXT) FROM PUBLIC;

CREATE OR REPLACE FUNCTION add_new_user(username_in TEXT, password_in TEXT)
RETURNS UUID
AS $$
DECLARE
  ret_user_id UUID;
BEGIN
  INSERT INTO users (username, password_hash)
    VALUES (username_in, hash_password(password_in))
    RETURNING id INTO ret_user_id;

  RETURN ret_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- `anon`s can call `add_new_user`
GRANT EXECUTE ON FUNCTION add_new_user(TEXT, TEXT) TO anon;

CREATE OR REPLACE FUNCTION update_self_user_password(target_user_id UUID, password_in TEXT)
RETURNS BOOLEAN 
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Log in to change your password';
  END IF;

  UPDATE users
    SET password_hash = hash_password(password_in)
    WHERE id = auth.uid();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- `authenticated`s can call `update_self_user_password`
GRANT EXECUTE ON FUNCTION update_self_user_password(UUID, TEXT) TO authenticated;
