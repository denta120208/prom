-- Initial schema for Prom Night 2026

-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  ticket_count INTEGER NOT NULL DEFAULT 1,
  total_amount INTEGER NOT NULL,
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diterima', 'ditolak')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL UNIQUE,
  holder_name TEXT NOT NULL,
  email TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 4. Policies for registrations
DROP POLICY IF EXISTS "Allow public insert" ON registrations;
CREATE POLICY "Allow public insert" ON registrations
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read own" ON registrations;
CREATE POLICY "Allow public read own" ON registrations
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow admin all" ON registrations;
CREATE POLICY "Allow admin all" ON registrations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Policies for tickets
DROP POLICY IF EXISTS "Allow public read scan" ON tickets;
CREATE POLICY "Allow public read scan" ON tickets
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow admin all tickets" ON tickets;
CREATE POLICY "Allow admin all tickets" ON tickets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
