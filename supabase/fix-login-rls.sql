-- Fix RLS policy for login: Allow public access to query username/email for authentication
-- 
-- PROBLEM: The RLS policies block queries to users table when user is not authenticated.
-- SOLUTION: Create a SECURITY DEFINER function that bypasses RLS for login purposes.

-- Create a function that can be called by unauthenticated users to get email by username
-- This function bypasses RLS because it's marked as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_email_by_username(username_param TEXT)
RETURNS TABLE(email TEXT, username TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.email::TEXT, u.username::TEXT
  FROM public.users u
  WHERE u.username = username_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO anon, authenticated;

-- ALTERNATIVE FIX (if you prefer a simpler approach):
-- You can also add a policy that allows public read access to username/email:
-- 
-- CREATE POLICY "Public can query username for login" ON public.users
--   FOR SELECT USING (true);
--
-- However, this exposes all user data. The function approach is more secure.

