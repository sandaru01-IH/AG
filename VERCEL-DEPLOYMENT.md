# Vercel Deployment Guide

## Pre-Deployment Checklist

### ✅ Fixed Issues
1. **TypeScript Error in Login Page** - Fixed type assertion for RPC response
2. **Import Error in assign-worker-dialog.tsx** - Fixed AlertDialog import path
3. **next-themes Package** - Added to package.json and configured in next.config.js

### Environment Variables Required

Make sure to add these in Vercel Project Settings → Environment Variables:

#### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### How to Get These:
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Supabase Configuration

1. **Update Redirect URLs in Supabase:**
   - Go to **Authentication** → **URL Configuration**
   - Add your Vercel domain to **Redirect URLs**:
     - `https://your-project.vercel.app/**`
     - `https://your-custom-domain.com/**` (if using custom domain)

2. **Storage Bucket:**
   - Ensure the `avatars` bucket exists in Supabase Storage
   - Run `supabase/CREATE-STORAGE-BUCKET.sql` if not already done

### Build Configuration

The project is configured with:
- ✅ Next.js 14.2.0
- ✅ TypeScript strict mode
- ✅ Proper image domain configuration
- ✅ next-themes for dark mode
- ✅ All dependencies in package.json

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix TypeScript errors and prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click **New Project**
   - Import your GitHub repository
   - Add environment variables (see above)
   - Click **Deploy**

3. **Verify Deployment:**
   - Check build logs for any errors
   - Test the deployed application
   - Verify authentication works
   - Test dark mode toggle

### Common Issues & Solutions

#### Build Fails with TypeScript Errors
- ✅ Fixed: Login page RPC type assertion
- ✅ Fixed: AlertDialog import path

#### Build Fails with Module Not Found
- ✅ Fixed: next-themes package added
- ✅ Fixed: All imports verified

#### Authentication Not Working
- Check environment variables are set correctly
- Verify Supabase redirect URLs include your Vercel domain
- Check browser console for errors

#### Images Not Loading
- Verify Supabase Storage bucket exists
- Check image domain configuration in next.config.js
- Ensure images are uploaded to correct bucket path

### Post-Deployment

1. **Test All Features:**
   - Login with co-founder accounts
   - Create income/expense records
   - Test approval workflow
   - Test worker creation
   - Test project management
   - Test dark mode toggle

2. **Monitor:**
   - Check Vercel logs for errors
   - Monitor Supabase logs
   - Test on different devices/browsers

### Support

If deployment fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure Supabase is accessible
4. Check TypeScript compilation locally: `npm run build`

