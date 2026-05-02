-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Allow public to upload payment proofs
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'payments');

-- Policy: Allow public to read payment proofs
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'payments');
