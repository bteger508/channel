# Supabase Setup Instructions

## Quick Start Guide

### Step 1: Create Supabase Account & Project (5 minutes)

1. Go to **https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Click "New project"
5. Fill in:
   - **Name:** one-way-updates (or your choice)
   - **Database Password:** Choose a strong password and save it
   - **Region:** Choose closest to your users
6. Click "Create new project"
7. Wait ~2 minutes for provisioning

### Step 2: Run Database Schema (2 minutes)

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the file `/supabase/schema.sql` from this project
4. Copy ALL the SQL code
5. Paste into the Supabase SQL Editor
6. Click **RUN** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### Step 3: Get API Credentials (1 minute)

1. In Supabase dashboard, go to **Settings** (⚙️ icon in sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (something like `https://abc123xyz.supabase.co`)
   - **anon public** key (under "Project API keys")
4. Keep this tab open - you'll need these in the next step

### Step 4: Configure Your App (1 minute)

1. In your project root, create a file called `.env.local`
2. Add these two lines (replace with YOUR actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file
4. **IMPORTANT:** `.env.local` is already in `.gitignore` - never commit this file!

### Step 5: Restart Your Dev Server (30 seconds)

1. Stop your current dev server (Ctrl+C in terminal)
2. Start it again:
```bash
npm run dev
```

3. You should see no errors about missing Supabase credentials

## ✅ Testing Your Setup

### Test 1: Create a Page
1. Go to http://localhost:3000
2. Enter a page title (e.g., "Test Page")
3. Click "Create Page"
4. You should be redirected to a new page

### Test 2: Verify in Supabase
1. Go back to your Supabase dashboard
2. Click **Table Editor** (left sidebar)
3. Click on `update_pages` table
4. You should see your test page with the title you entered!

### Test 3: Post an Update
1. On your test page, write an update (e.g., "Hello world!")
2. Click "Post Update"
3. The update should appear in the timeline
4. Check Supabase **Table Editor** > `updates` table
5. You should see your update there!

### Test 4: Add a Reaction
1. Click one of the emoji reaction buttons (❤️ 🙏 👍)
2. The counter should increment immediately
3. Refresh the page - the reaction should persist
4. Check Supabase - the reaction counter in `updates` table should be updated

## 🎉 Success!

If all tests pass, your app is now using Supabase as the backend!

- Data persists across page refreshes
- Multiple users can view the same page
- Updates are stored in the cloud
- You can share links that work for anyone

## 🔧 Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` exists in project root
- Check that the variable names are EXACTLY `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after creating `.env.local`

### Error when creating page: "relation does not exist"
- You forgot to run the schema.sql in Supabase
- Go back to Step 2 and run the entire schema

### Error: "Failed to create page"
- Check browser console (F12) for more details
- Verify your API credentials are correct
- Make sure Row Level Security policies were created (they're in schema.sql)

### Page loads forever / shows loading spinner
- Check browser console for errors
- Verify the page ID in the URL exists in your `update_pages` table
- Try creating a new page from the home screen

## 📊 Viewing Your Data

You can always view your data in Supabase:

1. Go to **Table Editor** in Supabase dashboard
2. Click `update_pages` to see all pages
3. Click `updates` to see all updates
4. You can manually edit/delete data here for testing

## 🚀 Next Steps

Your app now has a fully functional backend! Consider adding:

- **User authentication** - Add owner-only editing
- **URL shortening** - Make share links more friendly
- **Notifications** - Email when new updates are posted
- **Moderation** - Admin tools to manage content
- **Analytics** - Track page views and engagement

## 🔐 Security Note

The current setup allows anyone to:
- Create pages
- Post updates
- Add reactions

This is intentional for the MVP. For production, you may want to:
- Add authentication
- Implement rate limiting
- Add content moderation
- Restrict who can post updates to a page

All of these can be implemented using Supabase Row Level Security (RLS) policies!
