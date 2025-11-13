# Deploying SpendWise-RURAL on Render

This guide will help you deploy your SpendWise-RURAL application on Render.

## Prerequisites

1. A GitHub account with your repository pushed
2. A Render account (sign up at https://render.com)
3. Supabase credentials (URL and Publishable Key)

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

1. **Sign in to Render**
   - Go to https://dashboard.render.com
   - Sign in with your GitHub account

2. **Create a New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository: `amukta14/SpendWise-RURAL`
   - Select the repository and click "Connect"

3. **Configure the Service**
   - **Name**: `spendwise-rural` (or any name you prefer)
   - **Environment**: `Node`
   - **Region**: Choose the closest region to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `./` if needed)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   Click "Advanced" and add these environment variables:
   - `NODE_ENV` = `production`
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your Supabase anon/public key

   To find your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the "Project URL" for `VITE_SUPABASE_URL`
   - Copy the "anon public" key for `VITE_SUPABASE_PUBLISHABLE_KEY`

5. **Select Plan**
   - Choose "Free" plan (or upgrade if needed)

6. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Wait for the build to complete (usually 2-5 minutes)

7. **Access Your App**
   - Once deployed, you'll get a URL like: `https://spendwise-rural.onrender.com`
   - Your app will be live at this URL!

### Option 2: Using Static Site (Alternative)

If you prefer a static site deployment (simpler, but requires different setup):

1. **Create a Static Site**
   - Click "New +" > "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
   - Add environment variables (same as above)
   - Deploy

## Environment Variables

Make sure to set these in Render dashboard:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
NODE_ENV=production
```

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### App Not Loading
- Check that environment variables are set correctly
- Verify Supabase credentials are valid
- Check browser console for errors

### Environment Variables Not Working
- Remember: Vite requires `VITE_` prefix for environment variables
- Restart the service after adding environment variables
- Clear browser cache if needed

## Updating Your App

1. Push changes to your GitHub repository
2. Render will automatically detect the changes
3. A new deployment will start automatically
4. Your app will update once the build completes

## Custom Domain (Optional)

1. Go to your service settings in Render
2. Click "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com

