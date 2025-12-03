-- Fix all RLS policies to ensure data is accessible
-- This script adds missing RLS policies for all tables

-- ============================================
-- INCOME SOURCES POLICIES (Fix first - needed for settings page)
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
-- EXPENSE RECORDS POLICIES
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
-- INCOME RECORDS POLICIES (Fix existing)
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
-- PROJECTS POLICIES
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
-- PROJECT WORKERS POLICIES
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
-- WORKER PAYMENTS POLICIES
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
-- ASSETS POLICIES
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
-- MONTHLY SALARY HISTORY POLICIES
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
-- ACTIVITY LOGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_logs;

CREATE POLICY "Authenticated users can view activity logs" ON public.activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- WORKER MANAGEMENT APPROVALS POLICIES
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
-- COMPANY SETTINGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Admins can manage company settings" ON public.company_settings;

CREATE POLICY "Admins can manage company settings" ON public.company_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'co_founder'
    )
  );
