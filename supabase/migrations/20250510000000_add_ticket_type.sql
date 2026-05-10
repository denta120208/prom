-- Add ticket_type column to registrations table

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS ticket_type TEXT DEFAULT 'single';

UPDATE registrations SET ticket_type = 'single' WHERE ticket_type IS NULL;
