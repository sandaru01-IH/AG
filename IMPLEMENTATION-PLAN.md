# Implementation Plan for System Enhancements

## Database Schema Updates (Run First)
1. ✅ Created `supabase/SCHEMA-UPDATES.sql` with:
   - `fee_percentage` column for income_sources
   - `profile_photo_url` for users
   - Receipt fields for expense_records
   - `net_amount` for income_records
   - Auto-calculation trigger for net_amount

## Priority 1: Critical Fixes
1. **Restore financial.ts** - Add all missing functions
2. **Fix worker creation** - Debug and fix the issue
3. **Remove co-founder salary section** from dashboard

## Priority 2: Dashboard Enhancements
1. **Add profit visualization chart** with income method breakdown
2. **Update getMonthlyProfit** to use net_amount (after fees)
3. **Add income breakdown by source** visualization

## Priority 3: User Profile
1. **Show user-specific stats**:
   - Payments received this month
   - Expenses related to user
   - Personal financial summary
2. **Add profile editing**:
   - Name, photo upload
   - Personal details

## Priority 4: Features
1. **CSV/Excel export** functionality
2. **Receipt/invoice generation** for expenses
3. **Project worker assignment** with auto-add prompt
4. **Enhanced reports** (annual, monthly, invoices)
5. **User photo in header**

## Implementation Order
1. Schema updates (SQL)
2. Restore financial.ts completely
3. Dashboard updates (remove salary, add chart)
4. User profile updates
5. Export functionality
6. Receipt generation
7. Project enhancements
8. Reports expansion
9. Photo upload

