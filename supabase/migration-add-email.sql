-- Migration to add email column to existing predictions table
-- Run this ONLY if you already have an existing predictions table without email

-- Add email column (nullable first to allow existing rows)
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS email text;

-- Create unique index on email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS predictions_email_idx
  ON public.predictions (lower(email));

-- After adding email addresses to existing records manually or via backfill,
-- you can make it NOT NULL:
-- ALTER TABLE public.predictions ALTER COLUMN email SET NOT NULL;
