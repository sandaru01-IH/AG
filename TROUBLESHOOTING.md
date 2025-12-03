# Troubleshooting Guide

## Records Not Showing in Frontend

If you've manually entered records in Supabase but they're not showing in the frontend, follow these steps:

### Step 1: Run RLS Policies Fix

**CRITICAL**: You must run the RLS policies SQL file in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase/fix-all-rls-policies.sql`
3. Paste and click "Run"
4. Verify all policies were created (check for errors)

### Step 2: Verify Your User Role

Make sure your account has the correct role:

```sql
SELECT id, email, username, role FROM public.users WHERE email = 'your-email@alphagrid.com';
```

Your role should be `co_founder` to see all records.

### Step 3: Check RLS Policies Status

In Supabase Dashboard → Table Editor → Select your table → Check "RLS policies" button

You should see policies like:
- "Admins can view all [table_name]" 
- "Users can view approved [table_name]"

### Step 4: Verify Data Exists

Check if data actually exists in the table:

```sql
SELECT COUNT(*) FROM public.assets;
SELECT COUNT(*) FROM public.income_records;
SELECT COUNT(*) FROM public.expense_records;
```

### Step 5: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for red error messages
4. Common errors:
   - "permission denied" → RLS policies not set up
   - "relation does not exist" → Table not created
   - "invalid input syntax" → Data type mismatch

### Step 6: Test Query Directly

Test if you can query the data with your user:

```sql
-- This should work if RLS is set up correctly
-- Replace 'your-user-id' with your actual user ID from auth.users
SET request.jwt.claim.sub = 'your-user-id';
SELECT * FROM public.assets;
```

### Common Issues

#### Issue: "No assets found" but data exists in table

**Solution**: 
- Run `supabase/fix-all-rls-policies.sql` in Supabase SQL Editor
- Verify your user role is `co_founder`
- Check browser console for errors

#### Issue: "Permission denied" errors

**Solution**:
- RLS policies are blocking access
- Run the RLS policies fix SQL
- Make sure you're logged in as a co-founder

#### Issue: Empty arrays returned

**Solution**:
- Check if `approval_status` is set correctly
- Co-founders should see all records (pending + approved)
- Regular users only see approved records

#### Issue: Data shows in Supabase but not in frontend

**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify RLS policies are active
4. Check network tab in DevTools for failed requests

### Quick Fix Checklist

- [ ] Ran `supabase/fix-all-rls-policies.sql` in Supabase
- [ ] User role is `co_founder` in `users` table
- [ ] Data exists in the table (verified in Supabase Table Editor)
- [ ] Browser console shows no errors
- [ ] Hard refreshed the page (Ctrl+Shift+R)
- [ ] Checked Network tab for failed API calls

### Still Not Working?

1. Check the browser console for specific error messages
2. Verify your Supabase project URL and keys are correct in `.env.local`
3. Make sure you're logged in (check if `auth.uid()` returns your user ID)
4. Try logging out and logging back in

