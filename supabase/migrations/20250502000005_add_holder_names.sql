-- Add holder_names column for multiple ticket holders
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS holder_names TEXT[];
