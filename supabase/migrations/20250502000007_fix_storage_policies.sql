-- Fix storage policies: allow both anon and authenticated to upload/read payment proofs

-- Drop all existing payment policies
DROP POLICY IF EXISTS "Allow anon upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- Make sure bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'payments';

-- Allow anon to upload
CREATE POLICY "payments anon upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'payments');

-- Allow authenticated to upload
CREATE POLICY "payments auth upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payments');

-- Allow anon to read
CREATE POLICY "payments anon read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'payments');

-- Allow authenticated to read
CREATE POLICY "payments auth read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payments');

-- Allow authenticated to update (for upsert)
CREATE POLICY "payments auth update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'payments')
  WITH CHECK (bucket_id = 'payments');
