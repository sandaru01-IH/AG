-- FIX LOGIN ISSUE AFTER RESTRICTING PERMANENT WORKERS
-- This fixes the login problem caused by RLS policy recursion

-- ============================================
-- 1. Fix Users Table RLS - Use SECURITY DEFINER function to avoid recursion
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Workers cannot view other workers" ON public.users;

-- Ensure we have the SECURITY DEFINER function (from URGENT-FIX-RECURSION.sql)
CREATE OR REPLACE FUNCTION public.is_user_co_founder()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- This function runs with SECURITY DEFINER, so it bypasses RLS
  -- Get user role directly from users table
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role = 'co_founder', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION public.is_user_co_founder() TO authenticated, anon, public;

-- Ensure users can view their own profile (this should already exist, but ensure it's correct)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Co-founders can view all users (using function to avoid recursion)
DROP POLICY IF EXISTS "Co-founders can view all users" ON public.users;
CREATE POLICY "Co-founders can view all users" ON public.users
  FOR SELECT USING (public.is_user_co_founder());

-- ============================================
-- 2. Ensure login function still works
-- ============================================
-- The get_user_email_by_username function should already exist and work
-- (it's SECURITY DEFINER, so it bypasses RLS)

-- ============================================
-- 3. Keep the other restrictions for permanent workers
-- ============================================
-- The other policies (projects, payments, etc.) should remain as they are
-- They don't affect login, only data access after login

