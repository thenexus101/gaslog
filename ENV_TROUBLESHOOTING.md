# Environment Variable Troubleshooting

## Issue: VITE_GOOGLE_CLIENT_ID not loading

If you're seeing "Configuration Error" even though `.env` file exists:

### Step 1: Verify .env file location
The `.env` file must be in the **project root** (same directory as `package.json`).

```bash
# Check if .env is in the right place
ls -la .env
# Should show: -rw-r--r-- .env
```

### Step 2: Verify .env file format
The file should contain exactly:
```
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

**Important:**
- No spaces around the `=` sign
- No quotes around the value
- Must start with `VITE_` prefix
- File should end with a newline

### Step 3: Restart the dev server
Vite only loads environment variables when it starts. You **must** restart:

```bash
# Stop the server (Ctrl+C or Cmd+C)
# Then restart:
npm run dev
```

### Step 4: Hard refresh browser
After restarting, hard refresh your browser:
- **Mac**: Cmd + Shift + R
- **Windows/Linux**: Ctrl + Shift + R

### Step 5: Check browser console
Open browser DevTools (F12) and check the console. You should see:
```
Environment check: { clientId: 'SET', ... }
```

If you see `clientId: 'NOT SET'`, the env var is still not loading.

### Step 6: Verify the variable is loaded
In browser console, type:
```javascript
import.meta.env.VITE_GOOGLE_CLIENT_ID
```

If it returns `undefined`, the variable is not being loaded.

### Common Issues:

1. **File in wrong location**: `.env` must be in project root
2. **Server not restarted**: Vite only reads env vars on startup
3. **Browser cache**: Hard refresh needed
4. **Wrong variable name**: Must be exactly `VITE_GOOGLE_CLIENT_ID`
5. **Spaces in .env file**: No spaces around `=`
6. **Multiple .env files**: Check for `.env.local`, `.env.development`, etc.

### Debug Mode:
The app now includes debug logging. Check the browser console for:
- Available VITE_ environment variables
- Current mode (development/production)
- Whether clientId is SET or NOT SET

