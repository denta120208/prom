-- Fix RLS: Ensure both anon and authenticated can insert/read/update registrations

-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow public insert" ON registrations;
DROP POLICY IF EXISTS "Allow public read" ON registrations;
DROP POLICY IF EXISTS "Allow public update" ON registrations;
DROP POLICY IF EXISTS "Allow admin all" ON registrations;

-- Registrations policies
CREATE POLICY "Allow anon insert" ON registrations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select" ON registrations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon update" ON registrations
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated all" ON registrations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tickets policies
DROP POLICY IF EXISTS "Allow public insert tickets" ON tickets;
DROP POLICY IF EXISTS "Allow public update tickets" ON tickets;
DROP POLICY IF EXISTS "Allow public read scan" ON tickets;
DROP POLICY IF EXISTS "Allow admin all tickets" ON tickets;

CREATE POLICY "Allow anon insert tickets" ON tickets
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select tickets" ON tickets
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon update tickets" ON tickets
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated all tickets" ON tickets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
