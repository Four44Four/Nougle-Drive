DROP POLICY IF EXISTS mfa_enforcement ON storage.objects;
CREATE POLICY mfa_enforcement ON storage.objects
  AS RESTRICTIVE
  TO authenticated
  USING (internal.is_fully_verified());
