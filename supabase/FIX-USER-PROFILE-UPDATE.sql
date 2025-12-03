-- FIX USER PROFILE UPDATE RLS POLICY
-- This allows users to update their own profile (full_name, profile_photo_url)

-- ============================================
-- 1. Create UPDATE policy for users table
-- ============================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. Grant UPDATE permission (if needed)
-- ============================================
-- Note: RLS policies handle permissions, but we ensure authenticated users can update
GRANT UPDATE ON public.users TO authenticated;

