# Google OAuth Setup Guide

## Quick Fixes

### Error 403: access_denied - App in Testing Mode
If you see "GasLog has not completed the Google verification process", you need to add yourself as a test user.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** > **OAuth consent screen**
3. Scroll down to **Test users** section
4. Click **+ ADD USERS**
5. Add your email address: `edwardchoi330@gmail.com`
6. Click **ADD**
7. Try signing in again

### Error 400: redirect_uri_mismatch

If you're seeing `Error 400: redirect_uri_mismatch`, you need to add the correct redirect URIs to your Google OAuth credentials.

## Step-by-Step Instructions

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create a new one)

2. **Navigate to OAuth Credentials**
   - Go to: APIs & Services > Credentials
   - Find your OAuth 2.0 Client ID (or create a new one)

3. **Edit the OAuth Client**
   - Click on your OAuth 2.0 Client ID to edit it
   - Scroll down to "Authorized redirect URIs"

4. **Add Redirect URIs**
   Add these exact URIs (one per line):
   ```
   http://localhost:5173
   http://localhost:5173/
   ```
   
   If you're using a different port, check your terminal output when running `npm run dev` and use that port instead.

5. **Also Add Authorized JavaScript Origins**
   In the "Authorized JavaScript origins" section, add:
   ```
   http://localhost:5173
   ```

6. **Save Changes**
   - Click "Save" at the bottom
   - Wait a few seconds for changes to propagate

7. **Try Again**
   - Refresh your app in the browser
   - Try signing in again

## Common Issues

### Still Getting the Error?
- Make sure you saved the changes in Google Cloud Console
- Wait 1-2 minutes for changes to propagate
- Clear your browser cache and cookies
- Make sure the port in the redirect URI matches exactly what Vite is using (check terminal output)

### Different Port?
If Vite is running on a different port (not 5173), check the terminal output when you run `npm run dev`. It will show something like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```
Use whatever port is shown there.

### Production Deployment
When deploying to GitHub Pages or another host, add those URLs to your OAuth credentials as well:
- Authorized JavaScript origins: `https://yourusername.github.io`
- Authorized redirect URIs: `https://yourusername.github.io`

## Testing

After adding the redirect URIs:
1. Save the changes in Google Cloud Console
2. Wait 1-2 minutes
3. Refresh your app
4. Try signing in again

The error should be resolved!

