-- ALLOW NULL EMAIL FOR TEMPORARY WORKERS
-- This updates the users table to allow NULL emails for temporary workers
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Drop the NOT NULL constraint on email column
-- ============================================
ALTER TABLE public.users 
  ALTER COLUMN email DROP NOT NULL;

-- ============================================
-- 2. Add a comment to explain the change
-- ============================================
COMMENT ON COLUMN public.users.email IS 'Email address. Required for permanent partners and co-founders, optional (NULL) for temporary workers.';

-- ============================================
-- 3. Add a check constraint to ensure email is provided for non-temporary workers
-- ============================================
-- First, drop the constraint if it exists
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS email_required_for_non_temp_workers;

-- Add the constraint to ensure permanent partners and co-founders always have an email
ALTER TABLE public.users
  ADD CONSTRAINT email_required_for_non_temp_workers 
  CHECK (
    (role IN ('co_founder', 'permanent_partner') AND email IS NOT NULL) OR
    (role = 'temporary_worker')
  );

