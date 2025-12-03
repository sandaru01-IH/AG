# AlphaGrid Company Management System

A complete, production-ready financial and workforce management system built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Dual Approval System**: All financial entries and worker management require approval from both co-founders
- **Automatic Salary Calculation**: Co-founders receive 1/3 of monthly profit each, paid on the 10th
- **Worker Payment System**: Workers automatically receive 30% of project value when projects are completed
- **Project Management**: Full project lifecycle management with worker assignment
- **Assets Management**: Track company assets with approval workflow
- **Financial Dashboard**: Real-time metrics, pending approvals, and activity logs
- **PDF Reports**: Generate monthly financial summaries and invoices
- **Role-Based Access**: Co-founders, Permanent Partners, and Temporary Workers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Vercel account (for deployment)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your Supabase project dashboard, go to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql` into the SQL Editor
4. Execute the SQL to create all tables and functions
5. Go to Authentication > Settings and enable Email authentication
6. Go to Settings > API to get your project URL and anon key

### 3. Create Initial Co-Founder Accounts

You need to create the two co-founder accounts (Sandaruwan and Samith) manually in Supabase:

1. Go to Authentication > Users in Supabase dashboard
2. Click "Add User" and create accounts for:
   - **Sandaruwan**: 
     - Email: sandaruwan@alphagrid.com (or your preferred email)
     - Password: (choose a temporary password - they can change it later)
   - **Samith**: 
     - Email: samith@alphagrid.com (or your preferred email)
     - Password: (choose a temporary password - they can change it later)

3. After creating the auth users, you need to insert them into the `users` table. Go to SQL Editor and run:

```sql
-- First, get the auth user IDs
SELECT id, email FROM auth.users;

-- Then insert into users table (replace the IDs with actual values from above)
INSERT INTO public.users (id, email, full_name, role, username, is_active)
VALUES 
  ('<sandaruwan-auth-user-id>', 'sandaruwan@alphagrid.com', 'Sandaruwan', 'co_founder', 'sandaruwan', true),
  ('<samith-auth-user-id>', 'samith@alphagrid.com', 'Samith', 'co_founder', 'samith', true);
```

**Important**: Replace `<sandaruwan-auth-user-id>` and `<samith-auth-user-id>` with the actual UUIDs from the `auth.users` table.

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Vercel), also add:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these values in Supabase Dashboard > Settings > API:
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep this secret!)

### 5. Add Your Company Logo

1. Create a `public` folder in the root directory if it doesn't exist
2. Add your company logo as `public/logo.png` (or update the code to use your filename)
3. The logo will be displayed in PDF reports and invoices
4. Recommended: PNG format, 200x200px or larger, transparent background preferred

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Database Schema Overview

- **users**: User accounts with roles
- **income_sources**: Dynamic income source types
- **income_records**: Income transactions (require approval)
- **expense_records**: Expense transactions (require approval)
- **projects**: Project management
- **project_workers**: Worker assignments to projects
- **worker_payments**: Worker payment records (require approval)
- **assets**: Company assets (require approval)
- **monthly_salary_history**: Co-founder salary records
- **worker_management_approvals**: Worker account creation/updates (require approval)
- **activity_logs**: System activity tracking

## Key Features Explained

### Dual Approval System

- Any financial entry (income/expense) created by one co-founder requires approval from the other
- Worker account creation requires approval from the other co-founder
- Asset creation requires approval
- Only approved records affect financial calculations

### Salary Calculation

- Monthly profit = Approved Income - Approved Expenses
- Each co-founder receives 1/3 of the profit
- Salaries are calculated on the 10th of each month
- Use the Salary Calculator in Settings to calculate salaries for any month

### Worker Payments

- When a project is marked as completed, the system automatically:
  1. Calculates 30% of project value for each assigned worker
  2. Creates payment records (pending approval)
  3. After approval, payments are added to worker balance

### Income Sources

- Income sources are dynamic and editable
- Create custom income source types (Freelance, Projects, Side-hustles, etc.)
- Each source can have custom allocation formulas (stored as JSON)

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only see their own data unless they're co-founders
- All sensitive operations require authentication
- Approval workflows prevent unauthorized changes

## Troubleshooting

### Can't log in
- Verify your Supabase credentials in `.env.local`
- Check that user accounts exist in both `auth.users` and `public.users`
- Ensure usernames match between auth and users table

### Approval not working
- Ensure both co-founders have accounts with role `co_founder`
- Check that the record wasn't created by the same user trying to approve

### PDF generation not working
- Ensure `jspdf` and `html2canvas` are installed
- Check browser console for errors

## Support

For issues or questions, please check:
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
- Vercel documentation: https://vercel.com/docs

## License

Proprietary - AlphaGrid Company Management System

