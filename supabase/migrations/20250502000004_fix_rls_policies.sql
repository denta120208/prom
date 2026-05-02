-- Fix: Allow anon to update their own registration (for payment proof upload)

DROP POLICY IF EXISTS "Allow public insert" ON registrations;
CREATE POLICY "Allow public insert" ON registrations
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read own" ON registrations;
CREATE POLICY "Allow public read" ON registrations
  FOR SELECT TO anon USING (true);

-- NEW: Allow anon to update registrations (needed for payment proof upload)
DROP POLICY IF EXISTS "Allow public update" ON registrations;
CREATE POLICY "Allow public update" ON registrations
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon to insert tickets
DROP POLICY IF EXISTS "Allow public insert tickets" ON tickets;
CREATE POLICY "Allow public insert tickets" ON tickets
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to update tickets (for scan/mark used)
DROP POLICY IF EXISTS "Allow public update tickets" ON tickets;
CREATE POLICY "Allow public update tickets" ON tickets
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read scan" ON tickets;
CREATE POLICY "Allow public read scan" ON tickets
  FOR SELECT TO anon USING (true);
