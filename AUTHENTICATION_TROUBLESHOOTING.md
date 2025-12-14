# Authentication Troubleshooting Guide

## Error: "Invalid authentication credentials"

If you're seeing this error when trying to create a spreadsheet, here are the steps to fix it:

### Step 1: Verify OAuth Configuration

1. **Check Google Cloud Console Settings:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID
   - Make sure it's configured as a **Web application** (not Desktop app)

2. **Verify OAuth Consent Screen:**
   - Go to **APIs & Services** > **OAuth consent screen**
   - Make sure you've added the scope: `https://www.googleapis.com/auth/spreadsheets`
   - Make sure you're listed as a test user (if app is in testing mode)

3. **Check Authorized Redirect URIs:**
   - In your OAuth credentials, make sure you have:
     - `http://localhost:5173` (or whatever port you're using)
     - `http://localhost:5173/` (with trailing slash)

### Step 2: Clear Browser Data and Re-authenticate

1. **Clear session storage:**
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear Session Storage
   - Or simply log out and log back in

2. **Log out and log back in:**
   - Click the logout button in the app
   - Close the browser tab
   - Open a fresh tab and try again

### Step 3: Verify Google Sheets API is Enabled

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Google Sheets API"
4. Make sure it's **ENABLED** (not just added, but actually enabled)

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any error messages
4. Check the Network tab to see the actual API request/response

### Step 5: Verify Token Format

The access token should be a long string. If you see it in the console logs, it should look like:
```
ya29.a0AfH6SMBx...
```

If the token looks wrong or is very short, there's an issue with the OAuth flow.

### Step 6: Test with a Fresh Login

1. **Completely log out:**
   - Click logout in the app
   - Clear browser cache and cookies for localhost
   - Close all browser tabs

2. **Start fresh:**
   - Open a new browser tab
   - Navigate to your app
   - Log in with Google
   - Try creating a vehicle or gas entry

### Common Causes

1. **Token expired:** Access tokens expire after 1 hour. The app should handle this, but if you've been logged in for a while, try logging out and back in.

2. **Wrong OAuth flow:** Make sure your OAuth client is configured as a Web application, not a Desktop app.

3. **Missing scope:** The scope `https://www.googleapis.com/auth/spreadsheets` must be requested and granted.

4. **API not enabled:** Google Sheets API must be enabled in your Google Cloud project.

5. **Test user not added:** If your app is in testing mode, you must be added as a test user.

### Still Not Working?

If none of the above works:

1. **Check the browser console** for detailed error messages
2. **Verify your `.env` file** has the correct `VITE_GOOGLE_CLIENT_ID`
3. **Try creating a new OAuth client** in Google Cloud Console
4. **Make sure you're using the same Google account** that's configured in the OAuth consent screen

### Debug Information

When you see the error, check the browser console for:
- The actual error response from Google
- Whether the token is being sent correctly
- Any CORS or network errors

The app now includes better logging - check the console for messages like:
- "OAuth response received"
- "User profile fetched"
- "Creating new spreadsheet..."
- Any error messages with details

