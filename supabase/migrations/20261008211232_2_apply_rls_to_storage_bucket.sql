DROP POLICY IF EXISTS storage_self_insert ON storage.objects;
CREATE POLICY storage_self_insert ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'main_files'
    AND
    name LIKE (auth.uid()::text || '-%')
  );

DROP POLICY IF EXISTS storage_self_read ON storage.objects;
CREATE POLICY storage_self_read ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'main_files'
    AND
    name LIKE (auth.uid()::text || '-%')
  );


DROP POLICY IF EXISTS storage_self_delete ON storage.objects;
CREATE POLICY storage_self_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'main_files'
    AND
    name LIKE (auth.uid()::text || '-%')
  );

