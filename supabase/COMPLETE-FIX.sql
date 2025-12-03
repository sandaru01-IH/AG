-- COMPLETE FIX FOR ALL RLS POLICIES AND ISSUES
-- Run this entire file in Supabase SQL Editor to fix all issues

-- ============================================
-- STEP 1: Fix Users Table RLS Policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Public can query username for login" ON public.users;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

-- ============================================
-- STEP 2: Fix Income Sources RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Admins can manage income sources" ON public.income_sources;

CREATE POLICY "Authenticated users can view income sources" ON public.income_sources
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage income sources" ON public.income_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

-- ============================================
-- STEP 3: Fix Income Records RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Users can view approved income records" ON public.income_records;
DROP POLICY IF EXISTS "Admins can view all income records" ON public.income_records;
DROP POLICY IF EXISTS "Users can create income records" ON public.income_records;
DROP POLICY IF EXISTS "Admins can update income records" ON public.income_records;

CREATE POLICY "Users can view approved income records" ON public.income_records
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Admins can view all income records" ON public.income_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

CREATE POLICY "Users can create income records" ON public.income_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update income records" ON public.income_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

-- ============================================
-- STEP 4: Fix Expense Records RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Users can view approved expense records" ON public.expense_records;
DROP POLICY IF EXISTS "Admins can view all expense records" ON public.expense_records;
DROP POLICY IF EXISTS "Users can create expense records" ON public.expense_records;
DROP POLICY IF EXISTS "Admins can update expense records" ON public.expense_records;

CREATE POLICY "Users can view approved expense records" ON public.expense_records
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Admins can view all expense records" ON public.expense_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

CREATE POLICY "Users can create expense records" ON public.expense_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update expense records" ON public.expense_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

-- ============================================
-- STEP 5: Fix Projects RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;

CREATE POLICY "Authenticated users can view projects" ON public.projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

-- ============================================
-- STEP 6: Fix Project Workers RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view project workers" ON public.project_workers;
DROP POLICY IF EXISTS "Admins can manage project workers" ON public.project_workers;

CREATE POLICY "Authenticated users can view project workers" ON public.project_workers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage project workers" ON public.project_workers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

-- ============================================
-- STEP 7: Fix Worker Payments RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Workers can view own payments" ON public.worker_payments;
DROP POLICY IF EXISTS "Admins can view all worker payments" ON public.worker_payments;
DROP POLICY IF EXISTS "Admins can create worker payments" ON public.worker_payments;
DROP POLICY IF EXISTS "Admins can update worker payments" ON public.worker_payments;

CREATE POLICY "Workers can view own payments" ON public.worker_payments
  FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY "Admins can view all worker payments" ON public.worker_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

CREATE POLICY "Admins can create worker payments" ON public.worker_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

CREATE POLICY "Admins can update worker payments" ON public.worker_payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

-- ============================================
-- STEP 8: Fix Assets RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Users can view approved assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can view all assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can create assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can update assets" ON public.assets;

CREATE POLICY "Users can view approved assets" ON public.assets
  FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Admins can view all assets" ON public.assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

CREATE POLICY "Admins can create assets" ON public.assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('co_founder', 'permanent_partner')
    )
  );

CREATE POLICY "Admins can update assets" ON public.assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

-- ============================================
-- STEP 9: Fix Monthly Salary History RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own salary history" ON public.monthly_salary_history;
DROP POLICY IF EXISTS "Admins can view all salary history" ON public.monthly_salary_history;
DROP POLICY IF EXISTS "Admins can manage salary history" ON public.monthly_salary_history;

CREATE POLICY "Users can view own salary history" ON public.monthly_salary_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all salary history" ON public.monthly_salary_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

CREATE POLICY "Admins can manage salary history" ON public.monthly_salary_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

-- ============================================
-- STEP 10: Fix Activity Logs RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_logs;

CREATE POLICY "Authenticated users can view activity logs" ON public.activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- STEP 11: Fix Worker Management Approvals RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Admins can view worker management approvals" ON public.worker_management_approvals;
DROP POLICY IF EXISTS "Admins can create worker management approvals" ON public.worker_management_approvals;
DROP POLICY IF EXISTS "Admins can update worker management approvals" ON public.worker_management_approvals;

CREATE POLICY "Admins can view worker management approvals" ON public.worker_management_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

CREATE POLICY "Admins can create worker management approvals" ON public.worker_management_approvals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

CREATE POLICY "Admins can update worker management approvals" ON public.worker_management_approvals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

-- ============================================
-- STEP 12: Fix Company Settings RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage company settings" ON public.company_settings;

CREATE POLICY "Admins can manage company settings" ON public.company_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );

-- ============================================
-- STEP 13: Create Login Helper Function (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_email_by_username(username_param TEXT)
RETURNS TABLE(email TEXT, username TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.email::TEXT, u.username::TEXT
  FROM public.users u
  WHERE u.username = username_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO anon, authenticated;

-- ============================================
-- VERIFICATION QUERIES (Run these to test)
-- ============================================
-- Uncomment and run these after setting your user ID:
-- SET request.jwt.claim.sub = 'your-user-id-here';
-- SELECT * FROM public.users WHERE id = auth.uid();
-- SELECT * FROM public.assets LIMIT 5;
-- SELECT * FROM public.income_records LIMIT 5;

