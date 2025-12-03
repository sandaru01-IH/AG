# Database Cleanup Instructions

## Overview
These scripts help you remove dummy/test data from your database while preserving:
- ✅ Co-founder user accounts (Sandaruwan and Samith)
- ✅ Database schema and structure
- ✅ RLS policies and indexes
- ✅ System configurations (optional)

## Available Scripts

### 1. `CLEANUP-DUMMY-DATA.sql` (Recommended)
**Use this for standard cleanup**

**What it removes:**
- ✅ All income records
- ✅ All expense records
- ✅ All projects and worker assignments
- ✅ All assets
- ✅ All worker payments
- ✅ All activity logs
- ✅ All salary history
- ✅ All worker management approvals
- ✅ All non-co-founder users

**What it keeps:**
- ✅ Co-founder accounts (Sandaruwan, Samith)
- ✅ Income sources (you can uncomment to delete if needed)
- ✅ Company settings (you can uncomment to delete if needed)

### 2. `CLEANUP-ALL-DATA.sql` (Complete Cleanup)
**Use this for a complete fresh start**

**What it removes:**
- ✅ Everything from the standard cleanup
- ✅ Income sources
- ✅ Company settings

**What it keeps:**
- ✅ Only co-founder accounts
- ✅ Database structure

## How to Use

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Choose Your Script
- For **standard cleanup**: Copy and paste `CLEANUP-DUMMY-DATA.sql`
- For **complete cleanup**: Copy and paste `CLEANUP-ALL-DATA.sql`

### Step 3: Review the Script
- Read through the script to understand what will be deleted
- If using `CLEANUP-DUMMY-DATA.sql`, decide if you want to:
  - Delete income sources (uncomment line in STEP 10)
  - Delete company settings (uncomment line in STEP 11)

### Step 4: Run the Script
1. Click **Run** or press `Ctrl+Enter`
2. Wait for the script to complete
3. Check for any errors

### Step 5: Verify Cleanup
Run these verification queries in the SQL Editor:

```sql
-- Check remaining users (should only show co-founders)
SELECT id, email, full_name, username, role, is_active 
FROM public.users;

-- Check record counts (should all be 0)
SELECT 
  (SELECT COUNT(*) FROM public.income_records) as income_records,
  (SELECT COUNT(*) FROM public.expense_records) as expense_records,
  (SELECT COUNT(*) FROM public.projects) as projects,
  (SELECT COUNT(*) FROM public.assets) as assets,
  (SELECT COUNT(*) FROM public.worker_payments) as worker_payments,
  (SELECT COUNT(*) FROM public.activity_logs) as activity_logs;
```

## Important Notes

⚠️ **WARNING**: These scripts are **irreversible**. Once you delete data, it cannot be recovered unless you have backups.

✅ **Safe**: The scripts only delete data, not the database structure. Your schema, RLS policies, and indexes remain intact.

✅ **Co-founders Protected**: Co-founder accounts are automatically preserved.

## After Cleanup

Once cleanup is complete:
1. ✅ Your database will be fresh and ready for new data
2. ✅ Co-founder accounts will still be able to log in
3. ✅ You can start creating new income sources, projects, workers, etc.
4. ✅ All system functionality will work normally

## Troubleshooting

**If you get foreign key constraint errors:**
- Make sure you're running the scripts in order
- The scripts are designed to delete in the correct order to avoid constraint violations

**If co-founders are deleted:**
- Check that your co-founders have `role = 'co_founder'` in the database
- The script uses `WHERE role != 'co_founder'` to protect them

**If you want to keep specific data:**
- Comment out the DELETE statements for tables you want to preserve
- Or manually delete specific records using WHERE clauses

