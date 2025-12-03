-- SCHEMA UPDATES FOR NEW FEATURES
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Add fee_percentage to income_sources
-- ============================================
ALTER TABLE public.income_sources 
ADD COLUMN IF NOT EXISTS fee_percentage DECIMAL(5, 2) DEFAULT 0.00;

COMMENT ON COLUMN public.income_sources.fee_percentage IS 'Platform/service fee percentage (e.g., 20 for Fiverr 20% fee)';

-- ============================================
-- 2. Add profile_photo_url to users
-- ============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

COMMENT ON COLUMN public.users.profile_photo_url IS 'URL to user profile photo (stored in Supabase Storage)';

-- ============================================
-- 3. Add receipt fields to expense_records
-- ============================================
ALTER TABLE public.expense_records 
ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS receipt_file_url TEXT,
ADD COLUMN IF NOT EXISTS vendor_name TEXT,
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

COMMENT ON COLUMN public.expense_records.receipt_number IS 'Unique receipt/invoice number';
COMMENT ON COLUMN public.expense_records.receipt_file_url IS 'URL to uploaded receipt file';
COMMENT ON COLUMN public.expense_records.vendor_name IS 'Vendor/supplier name';
COMMENT ON COLUMN public.expense_records.invoice_number IS 'Vendor invoice number';

-- ============================================
-- 4. Add net_amount to income_records (after fee deduction)
-- ============================================
ALTER TABLE public.income_records 
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15, 2);

COMMENT ON COLUMN public.income_records.net_amount IS 'Amount after fee deduction (calculated automatically)';

-- ============================================
-- 5. Create function to calculate net income after fees
-- ============================================
CREATE OR REPLACE FUNCTION calculate_income_net_amount()
RETURNS TRIGGER AS $$
DECLARE
  fee_pct DECIMAL(5, 2);
  gross_amount DECIMAL(15, 2);
BEGIN
  -- Get fee percentage from income source
  SELECT COALESCE(fee_percentage, 0) INTO fee_pct
  FROM public.income_sources
  WHERE id = NEW.income_source_id;
  
  -- Calculate net amount
  gross_amount := NEW.amount;
  NEW.net_amount := gross_amount * (1 - fee_pct / 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate net_amount
DROP TRIGGER IF EXISTS trigger_calculate_income_net ON public.income_records;
CREATE TRIGGER trigger_calculate_income_net
  BEFORE INSERT OR UPDATE ON public.income_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_income_net_amount();

-- ============================================
-- 6. Update existing income_records to calculate net_amount
-- ============================================
UPDATE public.income_records ir
SET net_amount = ir.amount * (1 - COALESCE(income_src.fee_percentage, 0) / 100)
FROM public.income_sources income_src
WHERE ir.income_source_id = income_src.id;

-- Set net_amount = amount for records without income_source
UPDATE public.income_records
SET net_amount = amount
WHERE net_amount IS NULL;

