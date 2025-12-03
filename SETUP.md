# Detailed Setup Guide

## Step-by-Step Setup Instructions

### 1. Database Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for the database to be ready (usually 2-3 minutes)

2. **Run Database Schema**
   - In Supabase Dashboard, go to SQL Editor
   - Open `supabase/schema.sql` from this project
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run" to execute
   - Verify all tables are created (check Table Editor)

3. **Configure Row Level Security**
   - The schema includes RLS policies
   - Verify they're active in Table Editor > each table > RLS enabled

### 2. Authentication Setup

1. **Enable Email Auth**
   - Go to Authentication > Settings
   - Ensure "Enable email confirmations" is configured as needed
   - For development, you can disable email confirmation

2. **Create Co-Founder Accounts**

   **Option A: Via Supabase Dashboard**
   - Go to Authentication > Users
   - Click "Add User" → "Create new user"
   - Create user for Sandaruwan:
     - Email: sandaruwan@alphagrid.com
     - Password: (set temporary password)
     - Auto Confirm User: ✅ (check this)
   - Repeat for Samith

   **Option B: Via SQL (Advanced)**
   ```sql
   -- This requires using Supabase CLI or direct database access
   -- Not recommended for beginners
   ```

3. **Link Auth Users to Users Table**

   After creating auth users, run this SQL:

   ```sql
   -- Get the user IDs first
   SELECT id, email FROM auth.users;
   
   -- Then insert (replace UUIDs with actual values)
   INSERT INTO public.users (id, email, full_name, role, username, is_active)
   VALUES 
     ('<uuid-from-auth-users>', 'sandaruwan@alphagrid.com', 'Sandaruwan', 'co_founder', 'sandaruwan', true),
     ('<uuid-from-auth-users>', 'samith@alphagrid.com', 'Samith', 'co_founder', 'samith', true);
   ```

### 3. Environment Variables

Create `.env.local`:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Optional (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Required for production (worker creation)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)
```

**Where to find:**
- Supabase Dashboard > Settings > API
- Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 4. Install Dependencies

```bash
npm install
```

### 5. Add Company Logo

1. Replace `public/logo-placeholder.png` with your actual logo
2. Recommended size: 200x200px or larger
3. Format: PNG with transparent background preferred

### 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 7. First Login

1. Go to http://localhost:3000/login
2. Login with one of the co-founder accounts:
   - Username: `sandaruwan` or `samith`
   - Password: (the password you set in Supabase)

### 8. Initial Setup Tasks

After logging in:

1. **Create Income Sources**
   - Go to Settings > Income Sources
   - Add: "Freelance Work", "Projects", "Side-hustles", etc.

2. **Test the System**
   - Create an income record (requires approval)
   - Create an expense record (requires approval)
   - Create a project
   - Create a worker account

### 9. Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (for worker creation)
     - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
   - Deploy!

3. **Update Supabase URLs**
   - In Supabase Dashboard > Authentication > URL Configuration
   - Add your Vercel URL to "Redirect URLs"
   - Add your Vercel URL to "Site URL"

## Troubleshooting

### "Invalid login credentials"
- Verify username exists in `users` table
- Verify email matches in both `auth.users` and `users` table
- Check that password is correct

### "Cannot create worker account"
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables
- Check that you're logged in as a co-founder
- Check browser console for detailed error

### "Approval not working"
- Ensure both co-founders have `role = 'co_founder'` in users table
- Verify the record wasn't created by the same user trying to approve
- Check approval_status is 'pending'

### Database connection errors
- Verify environment variables are correct
- Check Supabase project is active
- Verify network connectivity

## Security Notes

- **Never commit** `.env.local` to git
- **Never expose** `SUPABASE_SERVICE_ROLE_KEY` publicly
- Use environment variables in Vercel, not in code
- Regularly rotate API keys
- Enable 2FA on Supabase account

## Next Steps

- Customize the logo
- Set up email notifications (optional)
- Configure custom income source formulas
- Set up automated salary calculations
- Add more workers as needed

