# Fix GitHub Push Authentication

## Problem
You're logged in as `saikumar5234` but trying to push to `nagachaitanyabaddala` repository.

## Solution: Use Personal Access Token

### Step 1: Create Personal Access Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note**: `Saini Web App Push`
   - **Expiration**: Choose your preference (90 days recommended)
   - **Select scopes**: Check **`repo`** (this gives full access to repositories)
4. Click **"Generate token"**
5. **IMPORTANT**: Copy the token immediately (it looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`)

### Step 2: Update Remote URL with Token

Run this command (replace `YOUR_TOKEN` with the token you copied):

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/nagachaitanyabaddala/saini-dryfruits-web.git
```

**OR** use your GitHub username instead:

```bash
git remote set-url origin https://nagachaitanyabaddala@github.com/nagachaitanyabaddala/saini-dryfruits-web.git
```

### Step 3: Push to GitHub

```bash
git push -u origin main
```

When prompted:
- **Username**: `nagachaitanyabaddala`
- **Password**: Paste your **Personal Access Token** (not your GitHub password)

---

## Alternative: Use GitHub Desktop or VS Code

If you have GitHub Desktop or VS Code with GitHub extension:
1. Open the repository in GitHub Desktop/VS Code
2. Sign in with the `nagachaitanyabaddala` account
3. Push from there

---

## Verify After Push

After successful push, check:
- https://github.com/nagachaitanyabaddala/saini-dryfruits-web

You should see all your files there!

