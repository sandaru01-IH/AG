-- FIX INFINITE RECURSION IN USERS TABLE RLS POLICIES
-- This is the critical fix - run this FIRST

-- ============================================
-- STEP 1: Drop all existing users policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Public can query username for login" ON public.users;

-- ============================================
-- STEP 2: Create SECURITY DEFINER function to check role
-- This bypasses RLS to avoid recursion
-- ============================================
CREATE OR REPLACE FUNCTION public.is_user_co_founder()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role directly from users table, bypassing RLS
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN user_role = 'co_founder';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_user_co_founder() TO authenticated, anon;

-- ============================================
-- STEP 3: Create new policies using the function
-- ============================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Co-founders can view all users (using function to avoid recursion)
CREATE POLICY "Co-founders can view all users" ON public.users
  FOR SELECT USING (public.is_user_co_founder());

-- ============================================
-- STEP 4: Fix all other tables that reference users table
-- ============================================

-- Fix Income Records
DROP POLICY IF EXISTS "Admins can view all income records" ON public.income_records;
CREATE POLICY "Admins can view all income records" ON public.income_records
  FOR SELECT USING (public.is_user_co_founder() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'permanent_partner'
  ));

-- Fix Expense Records  
DROP POLICY IF EXISTS "Admins can view all expense records" ON public.expense_records;
CREATE POLICY "Admins can view all expense records" ON public.expense_records
  FOR SELECT USING (public.is_user_co_founder() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'permanent_partner'
  ));

-- Fix Assets
DROP POLICY IF EXISTS "Admins can view all assets" ON public.assets;
CREATE POLICY "Admins can view all assets" ON public.assets
  FOR SELECT USING (public.is_user_co_founder() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'permanent_partner'
  ));

-- Fix Projects
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (public.is_user_co_founder() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'permanent_partner'
  ));

-- Fix Project Workers
DROP POLICY IF EXISTS "Admins can manage project workers" ON public.project_workers;
CREATE POLICY "Admins can manage project workers" ON public.project_workers
  FOR ALL USING (public.is_user_co_founder() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'permanent_partner'
  ));

-- Fix Worker Payments
DROP POLICY IF EXISTS "Admins can view all worker payments" ON public.worker_payments;
CREATE POLICY "Admins can view all worker payments" ON public.worker_payments
  FOR SELECT USING (public.is_user_co_founder() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'permanent_partner'
  ));

DROP POLICY IF EXISTS "Admins can create worker payments" ON public.worker_payments;
CREATE POLICY "Admins can create worker payments" ON public.worker_payments
  FOR INSERT WITH CHECK (public.is_user_co_founder() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'permanent_partner'
  ));

DROP POLICY IF EXISTS "Admins can update worker payments" ON public.worker_payments;
CREATE POLICY "Admins can update worker payments" ON public.worker_payments
  FOR UPDATE USING (public.is_user_co_founder());

-- Fix Monthly Salary History
DROP POLICY IF EXISTS "Admins can view all salary history" ON public.monthly_salary_history;
CREATE POLICY "Admins can view all salary history" ON public.monthly_salary_history
  FOR SELECT USING (public.is_user_co_founder());

DROP POLICY IF EXISTS "Admins can manage salary history" ON public.monthly_salary_history;
CREATE POLICY "Admins can manage salary history" ON public.monthly_salary_history
  FOR ALL USING (public.is_user_co_founder());

-- Fix Worker Management Approvals
DROP POLICY IF EXISTS "Admins can view worker management approvals" ON public.worker_management_approvals;
CREATE POLICY "Admins can view worker management approvals" ON public.worker_management_approvals
  FOR SELECT USING (public.is_user_co_founder());

DROP POLICY IF EXISTS "Admins can create worker management approvals" ON public.worker_management_approvals;
CREATE POLICY "Admins can create worker management approvals" ON public.worker_management_approvals
  FOR INSERT WITH CHECK (public.is_user_co_founder());

DROP POLICY IF EXISTS "Admins can update worker management approvals" ON public.worker_management_approvals;
CREATE POLICY "Admins can update worker management approvals" ON public.worker_management_approvals
  FOR UPDATE USING (public.is_user_co_founder());

-- Fix Company Settings
DROP POLICY IF EXISTS "Admins can manage company settings" ON public.company_settings;
CREATE POLICY "Admins can manage company settings" ON public.company_settings
  FOR ALL USING (public.is_user_co_founder());

-- Fix Income Sources
DROP POLICY IF EXISTS "Admins can manage income sources" ON public.income_sources;
CREATE POLICY "Admins can manage income sources" ON public.income_sources
  FOR ALL USING (public.is_user_co_founder() OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'permanent_partner'
  ));

-- Fix Income Records Update
DROP POLICY IF EXISTS "Admins can update income records" ON public.income_records;
CREATE POLICY "Admins can update income records" ON public.income_records
  FOR UPDATE USING (public.is_user_co_founder());

-- Fix Expense Records Update
DROP POLICY IF EXISTS "Admins can update expense records" ON public.expense_records;
CREATE POLICY "Admins can update expense records" ON public.expense_records
  FOR UPDATE USING (public.is_user_co_founder());

-- Fix Assets Update
DROP POLICY IF EXISTS "Admins can update assets" ON public.assets;
CREATE POLICY "Admins can update assets" ON public.assets
  FOR UPDATE USING (public.is_user_co_founder());

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, test with:
-- SELECT * FROM public.users WHERE id = auth.uid();
-- Should work without recursion errors

