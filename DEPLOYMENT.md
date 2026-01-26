# Deployment Guide - Netlify

This guide explains how to deploy the Saini Mewa Stores web application to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://www.netlify.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your backend API should be live and accessible (currently: `https://api.sainidryfruits.com`)

## Current Backend Configuration

Your app is already configured to use the live backend API:
- **Production Backend URL**: `https://api.sainidryfruits.com`
- This is set as the default in `src/config.js`

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository (GitHub/GitLab/Bitbucket)

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Netlify should auto-detect these from `netlify.toml`

3. **Set Environment Variables** (Optional)
   - Go to Site settings → Environment variables
   - Add if needed: `VITE_BACKEND_URL = https://api.sainidryfruits.com`
   - Note: The default is already set in code, so this is optional

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your app

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

## Environment Variables

### For Different Environments

You can use environment variables to switch between different backend URLs:

1. **Local Development**: Create `.env` file
   ```env
   VITE_BACKEND_URL=http://localhost:8080
   ```

2. **Production (Netlify)**: Set in Netlify Dashboard
   - Site settings → Environment variables
   - Add: `VITE_BACKEND_URL = https://api.sainidryfruits.com`

### Current Setup

- **Default (Production)**: `https://api.sainidryfruits.com` (hardcoded in `config.js`)
- **Override**: Set `VITE_BACKEND_URL` environment variable if needed

## Important Notes

### ✅ What's Already Configured

1. **Backend URL**: Already pointing to live server (`https://api.sainidryfruits.com`)
2. **Build Configuration**: `netlify.toml` is configured
3. **React Router**: Redirect rules set up for SPA routing
4. **Security Headers**: Configured in `netlify.toml`

### 🔧 No Code Changes Needed

Your code is **already ready** for production deployment! The backend URL is set to the live server, so no changes are required.

### 📝 Optional: Environment Variables

If you want to easily switch between environments in the future, you can:

1. Use `.env` for local development
2. Set `VITE_BACKEND_URL` in Netlify dashboard for production

But this is **optional** - the current setup will work as-is.

## Post-Deployment

After deployment:

1. **Test the Application**
   - Visit your Netlify URL
   - Test login, user management, and all features
   - Verify API calls are working

2. **Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add your custom domain

3. **SSL Certificate**
   - Netlify provides free SSL certificates automatically
   - HTTPS will be enabled by default

## Troubleshooting

### API Calls Not Working

- Check browser console for CORS errors
- Verify backend API is accessible: `https://api.sainidryfruits.com`
- Check Netlify function logs if using serverless functions

### Routing Issues

- Ensure `netlify.toml` redirect rules are in place
- All routes should redirect to `/index.html` (already configured)

### Build Failures

- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Netlify uses Node 18 by default)

## Support

For Netlify-specific issues, refer to:
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://answers.netlify.com/)

