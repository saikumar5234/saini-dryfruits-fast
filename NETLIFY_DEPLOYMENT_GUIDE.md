# Netlify Deployment Guide - Step by Step

## ✅ Pre-Deployment Checklist

Your code is already configured correctly:
- ✅ Backend URL: `https://api.sainidryfruits.com` (live backend)
- ✅ Build configuration: `netlify.toml` is ready
- ✅ Code pushed to GitHub: https://github.com/nagachaitanyabaddala/saini-dryfruits-web

## 🚀 Deployment Steps

### Step 1: Sign Up / Login to Netlify

1. Go to: **https://www.netlify.com**
2. Click **"Sign up"** (or **"Log in"** if you have an account)
3. Choose **"Sign up with GitHub"** (recommended - easiest way)

### Step 2: Import Your Repository

1. After logging in, you'll see the Netlify dashboard
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account (if prompted)
5. Find and select: **`nagachaitanyabaddala/saini-dryfruits-web`**

### Step 3: Configure Build Settings

Netlify should auto-detect these from `netlify.toml`, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: (leave empty)

If these are not auto-filled, enter them manually.

### Step 4: Set Environment Variables (Optional)

Your backend URL is already set in code, but you can also set it as an environment variable:

1. Click **"Show advanced"** or **"Environment variables"**
2. Click **"New variable"**
3. Add:
   - **Key**: `VITE_BACKEND_URL`
   - **Value**: `https://api.sainidryfruits.com`
4. Click **"Add variable"**

> **Note**: This is optional since the backend URL is already hardcoded in `config.js`

### Step 5: Deploy!

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 1-3 minutes)
3. You'll see a success message with your site URL

### Step 6: Test Your Live Site

1. Click on your site URL (e.g., `https://random-name-123.netlify.app`)
2. Test the following:
   - ✅ Login functionality
   - ✅ API calls to your backend
   - ✅ User management
   - ✅ All features

## 🔍 Verify Backend Connection

After deployment, check the browser console (F12) to verify:
- API calls are going to: `https://api.sainidryfruits.com`
- No CORS errors
- Data is loading correctly

## 🌐 Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow Netlify's DNS configuration instructions

## 🔄 Future Updates

Every time you push to GitHub:
1. Netlify will automatically detect the push
2. It will rebuild and redeploy your site
3. Your site will update automatically!

## ⚠️ Important Notes

### CORS Configuration

Make sure your backend (`https://api.sainidryfruits.com`) allows requests from your Netlify domain:
- Add your Netlify URL to CORS allowed origins
- Example: `https://your-site.netlify.app`

### Environment Variables

If you need to change the backend URL later:
1. Go to **Site settings** → **Environment variables**
2. Update `VITE_BACKEND_URL`
3. Trigger a new deploy

## 🐛 Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Verify Node.js version (Netlify uses Node 18 by default)
- Ensure all dependencies are in `package.json`

### API Calls Not Working

- Check browser console for errors
- Verify backend URL in Network tab
- Check CORS settings on backend
- Verify backend is accessible: `https://api.sainidryfruits.com`

### Routing Issues (404 on refresh)

- Verify `netlify.toml` has redirect rules (already configured ✅)
- Check that redirect rule is: `from = "/*"` → `to = "/index.html"`

## 📞 Support

- Netlify Docs: https://docs.netlify.com/
- Netlify Community: https://answers.netlify.com/

---

**Your app is ready to deploy! Follow the steps above and your site will be live in minutes! 🎉**

