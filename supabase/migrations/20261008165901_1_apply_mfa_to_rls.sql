-- "fully verified" -> If the user has 2FA enabled:
--                       An only password verified session cannot do DB operations (must have 2FA verified on session as well)
--                  -> Else:
--                       A password verified session can do DB operations
CREATE OR REPLACE FUNCTION internal.is_fully_verified()
RETURNS boolean
AS $$
DECLARE
  cur_aal_status text;
  has_mfa_factors boolean;
BEGIN
  cur_aal_status := auth.jwt() ->> 'aal';

  SELECT EXISTS (
    SELECT 1
      FROM auth.mfa_factors
      WHERE mfa_factors.user_id = auth.uid() AND mfa_factors.status = 'verified'
  ) INTO has_mfa_factors;

  IF has_mfa_factors THEN
    RETURN cur_aal_status = 'aal2';
  ELSE
    RETURN cur_aal_status IN ('aal1', 'aal2');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION internal.is_fully_verified() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION internal.is_fully_verified() TO authenticated, service_role;

DROP POLICY IF EXISTS mfa_enforcement ON profiles;
CREATE POLICY mfa_enforcement ON profiles
  AS RESTRICTIVE
  TO authenticated
  USING (internal.is_fully_verified());

-- DROP POLICY IF EXISTS mfa_enforcement ON foos;
-- CREATE POLICY mfa_enforcement ON foos
--   AS RESTRICTIVE
--   TO authenticated
--   USING (internal.is_fully_verified());

DROP POLICY IF EXISTS mfa_enforcement ON files;
CREATE POLICY mfa_enforcement ON files
  AS RESTRICTIVE
  TO authenticated
  USING (internal.is_fully_verified());

