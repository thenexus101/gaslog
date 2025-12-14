# GitHub Pages Deployment Guide

This guide will help you deploy the Gas Log app to GitHub Pages with a CI/CD pipeline using GitHub Actions.

## Prerequisites

- A GitHub account
- Your repository pushed to GitHub
- Google OAuth credentials set up

## Step 1: Set Up GitHub Repository

1. **Create a new repository on GitHub** (if you haven't already)
   - Go to https://github.com/new
   - Name it `gaslog` (or your preferred name)
   - Make it public (required for free GitHub Pages)
   - Don't initialize with README (if you already have code)

2. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/gaslog.git
   git push -u origin main
   ```

## Step 2: Configure GitHub Secrets

1. **Go to your repository on GitHub**
   - Navigate to: **Settings** > **Secrets and variables** > **Actions**

2. **Add a new repository secret:**
   - Click **New repository secret**
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Value: Your Google OAuth Client ID (from `.env` file)
   - Click **Add secret**

## Step 3: Update Vite Configuration

The `vite.config.ts` should already be configured, but verify it matches your repository name:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/gaslog/', // Change this to match your repository name
})
```

If your repository is named something other than `gaslog`, update the `base` path accordingly.

## Step 4: Create GitHub Actions Workflow

Create the workflow file:

1. **Create the directory:**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create the workflow file** (see `.github/workflows/deploy.yml` below)

## Step 5: Update OAuth Redirect URIs

1. **Go to Google Cloud Console:**
   - Navigate to: **APIs & Services** > **Credentials**
   - Click on your OAuth 2.0 Client ID

2. **Add production redirect URIs:**
   - **Authorized JavaScript origins:**
     - `https://YOUR_USERNAME.github.io`
   - **Authorized redirect URIs:**
     - `https://YOUR_USERNAME.github.io`
     - `https://YOUR_USERNAME.github.io/`

3. **Save changes**

## Step 6: Deploy

1. **Push the workflow file to GitHub:**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add deployment workflow"
   git push
   ```

2. **Trigger the deployment:**
   - Go to your repository on GitHub
   - Click on **Actions** tab
   - You should see the workflow running
   - Wait for it to complete (usually 1-2 minutes)

3. **Enable GitHub Pages:**
   - Go to **Settings** > **Pages**
   - Under **Source**, select **GitHub Actions**
   - The page will be available at: `https://YOUR_USERNAME.github.io/gaslog/`

## Step 7: Verify Deployment

1. **Visit your deployed site:**
   - Go to `https://YOUR_USERNAME.github.io/gaslog/`
   - Try logging in with Google
   - Test creating a vehicle and gas entry

2. **Check for issues:**
   - Open browser DevTools
   - Check Console for any errors
   - Verify the OAuth redirect works

## Troubleshooting

### Build Fails
- Check the **Actions** tab for error messages
- Verify `VITE_GOOGLE_CLIENT_ID` secret is set correctly
- Make sure all dependencies are in `package.json`

### OAuth Not Working
- Verify redirect URIs are added in Google Cloud Console
- Check that the production URL matches exactly
- Make sure you're a test user (if app is in testing mode)

### 404 Errors
- Verify the `base` path in `vite.config.ts` matches your repository name
- Make sure GitHub Pages is using **GitHub Actions** as the source
- Check that the workflow completed successfully

### Environment Variables Not Working
- Verify the secret name is exactly `VITE_GOOGLE_CLIENT_ID`
- Check that the secret is set in **Settings** > **Secrets and variables** > **Actions**
- Re-run the workflow after adding/updating secrets

## Updating the Deployment

Every time you push to the `main` branch, the workflow will automatically:
1. Build the app
2. Deploy to GitHub Pages
3. Update the live site

No manual steps needed!

## Custom Domain (Optional)

If you want to use a custom domain:

1. **Add a CNAME file** in the `public` folder:
   ```
   yourdomain.com
   ```

2. **Configure DNS:**
   - Add a CNAME record pointing to `YOUR_USERNAME.github.io`

3. **Update GitHub Pages settings:**
   - Go to **Settings** > **Pages**
   - Enter your custom domain

4. **Update OAuth redirect URIs** in Google Cloud Console to include your custom domain

