-- Fix storage bucket policies for payment proofs

-- Make sure bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'payments';

-- Drop old policies
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- Policy: Allow anon to upload payment proofs
CREATE POLICY "Allow anon upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'payments');

-- Policy: Allow anon to read payment proofs
CREATE POLICY "Allow anon read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'payments');

-- Policy: Allow authenticated to read payment proofs
CREATE POLICY "Allow authenticated read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payments');
