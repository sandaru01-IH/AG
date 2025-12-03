-- ============================================
-- CLEANUP DUMMY/TEST DATA FROM DATABASE
-- This script removes all test data while keeping:
-- - Co-founder user accounts
-- - Database schema and structure
-- - RLS policies
-- 
-- OPTIONAL: You can choose to keep income sources and company settings
-- ============================================

-- ============================================
-- STEP 1: Delete Activity Logs
-- ============================================
DELETE FROM public.activity_logs;
-- Reset any sequences if needed
-- (Activity logs don't use sequences, but keeping for reference)

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
-- STEP 10: Delete Income Sources (OPTIONAL)
-- Uncomment the line below if you want to remove income sources too
-- ============================================
-- DELETE FROM public.income_sources;

-- ============================================
-- STEP 11: Delete Company Settings (OPTIONAL)
-- Uncomment the line below if you want to remove company settings too
-- ============================================
-- DELETE FROM public.company_settings;

-- ============================================
-- STEP 12: Delete Non-Co-Founder Users
-- This keeps only co-founder accounts
-- ============================================
-- First, get the list of co-founder user IDs to keep
-- Then delete all other users (this will cascade to related records)

-- Delete users who are NOT co-founders
-- Note: This will also delete their auth.users entries due to CASCADE
DELETE FROM public.users
WHERE role != 'co_founder';

-- ============================================
-- VERIFICATION QUERIES (Run these after cleanup to verify)
-- ============================================

-- Check remaining users (should only show co-founders)
-- SELECT id, email, full_name, username, role, is_active FROM public.users;

-- Check remaining records (should all be 0 or empty)
-- SELECT 
--   (SELECT COUNT(*) FROM public.income_records) as income_records_count,
--   (SELECT COUNT(*) FROM public.expense_records) as expense_records_count,
--   (SELECT COUNT(*) FROM public.projects) as projects_count,
--   (SELECT COUNT(*) FROM public.assets) as assets_count,
--   (SELECT COUNT(*) FROM public.worker_payments) as worker_payments_count,
--   (SELECT COUNT(*) FROM public.activity_logs) as activity_logs_count,
--   (SELECT COUNT(*) FROM public.monthly_salary_history) as salary_history_count,
--   (SELECT COUNT(*) FROM public.worker_management_approvals) as worker_approvals_count;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Co-founder accounts are preserved
-- 2. All financial records (income, expenses) are deleted
-- 3. All projects and worker assignments are deleted
-- 4. All assets are deleted
-- 5. All activity logs are cleared
-- 6. Income sources are kept by default (uncomment to delete)
-- 7. Company settings are kept by default (uncomment to delete)
-- 8. The database schema, RLS policies, and indexes remain intact
--
-- After running this script, your database will be clean and ready
-- for fresh data entry while maintaining all system configurations.

