-- RESTRICT PERMANENT WORKERS TO THEIR OWN DATA ONLY
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Update Projects RLS - Workers can only see projects they're assigned to
-- ============================================
DROP POLICY IF EXISTS "Workers can view assigned projects" ON public.projects;
CREATE POLICY "Workers can view assigned projects" ON public.projects
  FOR SELECT USING (
    -- Co-founders can see all
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
    OR
    -- Permanent partners can only see projects they're assigned to
    EXISTS (
      SELECT 1 FROM public.project_workers
      WHERE project_workers.project_id = projects.id
      AND project_workers.worker_id = auth.uid()
    )
  );

-- ============================================
-- 2. Update Project Workers RLS - Workers can only see their own assignments
-- ============================================
DROP POLICY IF EXISTS "Workers can view own assignments" ON public.project_workers;
CREATE POLICY "Workers can view own assignments" ON public.project_workers
  FOR SELECT USING (
    -- Co-founders can see all
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
    OR
    -- Workers can only see their own assignments
    worker_id = auth.uid()
  );

-- ============================================
-- 3. Update Worker Payments RLS - Workers can only see their own payments
-- ============================================
DROP POLICY IF EXISTS "Workers can view own payments" ON public.worker_payments;
CREATE POLICY "Workers can view own payments" ON public.worker_payments
  FOR SELECT USING (
    -- Co-founders can see all
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
    OR
    -- Workers can only see their own payments
    worker_id = auth.uid()
  );

-- ============================================
-- 4. Update Income Records RLS - Workers cannot see income records
-- ============================================
DROP POLICY IF EXISTS "Workers cannot view income records" ON public.income_records;
CREATE POLICY "Workers cannot view income records" ON public.income_records
  FOR SELECT USING (
    -- Only co-founders and permanent partners can view
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

-- ============================================
-- 5. Update Expense Records RLS - Workers cannot see expense records
-- ============================================
DROP POLICY IF EXISTS "Workers cannot view expense records" ON public.expense_records;
CREATE POLICY "Workers cannot view expense records" ON public.expense_records
  FOR SELECT USING (
    -- Only co-founders and permanent partners can view
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

-- ============================================
-- 6. Update Assets RLS - Workers cannot see assets
-- ============================================
DROP POLICY IF EXISTS "Workers cannot view assets" ON public.assets;
CREATE POLICY "Workers cannot view assets" ON public.assets
  FOR SELECT USING (
    -- Only co-founders and permanent partners can view
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

-- ============================================
-- 7. Update Users RLS - Workers cannot see other workers
-- ============================================
-- Ensure we have the SECURITY DEFINER function to avoid recursion
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

-- Ensure users can view their own profile (no recursion)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Co-founders can view all users (using function to avoid recursion)
DROP POLICY IF EXISTS "Co-founders can view all users" ON public.users;
CREATE POLICY "Co-founders can view all users" ON public.users
  FOR SELECT USING (public.is_user_co_founder());

-- ============================================
-- 8. Update Income Sources RLS - Workers cannot see income sources
-- ============================================
DROP POLICY IF EXISTS "Workers cannot view income sources" ON public.income_sources;
CREATE POLICY "Workers cannot view income sources" ON public.income_sources
  FOR SELECT USING (
    -- Only co-founders and permanent partners can view
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

-- ============================================
-- 9. Update Activity Logs RLS - Workers can only see their own activity
-- ============================================
DROP POLICY IF EXISTS "Workers can view own activity" ON public.activity_logs;
CREATE POLICY "Workers can view own activity" ON public.activity_logs
  FOR SELECT USING (
    -- Co-founders can see all
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
    OR
    -- Workers can only see their own activity
    user_id = auth.uid()
  );

