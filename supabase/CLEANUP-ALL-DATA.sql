-- ============================================
-- COMPLETE DATABASE CLEANUP (INCLUDING INCOME SOURCES)
-- This is a more aggressive cleanup that removes everything
-- except co-founder accounts and database structure
-- ============================================

-- ============================================
-- STEP 1: Delete Activity Logs
-- ============================================
DELETE FROM public.activity_logs;

-- ============================================
-- STEP 2: Delete Monthly Salary History
-- ============================================
DELETE FROM public.monthly_salary_history;

-- ============================================
-- STEP 3: Delete Worker Management Approvals
-- ============================================
DELETE FROM public.worker_management_approvals;

-- ============================================
-- STEP 4: Delete Worker Payments
-- ============================================
DELETE FROM public.worker_payments;

-- ============================================
-- STEP 5: Delete Project Workers (Junction Table)
-- ============================================
DELETE FROM public.project_workers;

-- ============================================
-- STEP 6: Delete Projects
-- ============================================
DELETE FROM public.projects;

-- ============================================
-- STEP 7: Delete Assets
-- ============================================
DELETE FROM public.assets;

-- ============================================
-- STEP 8: Delete Expense Records
-- ============================================
DELETE FROM public.expense_records;

-- ============================================
-- STEP 9: Delete Income Records
-- ============================================
DELETE FROM public.income_records;

-- ============================================
-- STEP 10: Delete Income Sources
-- ============================================
DELETE FROM public.income_sources;

-- ============================================
-- STEP 11: Delete Company Settings
-- ============================================
DELETE FROM public.company_settings;

-- ============================================
-- STEP 12: Delete Non-Co-Founder Users
-- ============================================
DELETE FROM public.users
WHERE role != 'co_founder';

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, all tables should be empty except users (co-founders only)
-- Run these queries to verify:

-- SELECT COUNT(*) as total_users FROM public.users;
-- SELECT COUNT(*) as income_sources FROM public.income_sources;
-- SELECT COUNT(*) as income_records FROM public.income_records;
-- SELECT COUNT(*) as expense_records FROM public.expense_records;
-- SELECT COUNT(*) as projects FROM public.projects;
-- SELECT COUNT(*) as assets FROM public.assets;

