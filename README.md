# Gas Log - Fuel Expense Tracker

A beautiful, cross-platform web application to track your gas expenses with Google Sheets as the backend.

## Features

- 🔐 Google SSO Authentication
- 📊 Beautiful analytics dashboard with charts
- 📝 Easy gas entry form with auto-calculations
- 📜 Complete transaction history
- 🚗 Multi-vehicle support
- 📈 Advanced metrics including driving efficiency score

## Prerequisites

- Node.js 14.18+ or 16+ (LTS recommended)
- npm or yarn

If you're using nvm (Node Version Manager), the project includes a `.nvmrc` file:
```bash
nvm install
nvm use
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select an existing one)
   - Enable **Google Sheets API**:
     - Navigate to "APIs & Services" > "Library"
     - Search for "Google Sheets API" and enable it
   - Configure OAuth consent screen first:
     - Go to "APIs & Services" > "OAuth consent screen"
     - Choose "External" user type (unless you have a Google Workspace)
     - Fill in required fields:
       - App name: "Gas Log" (or any name)
       - User support email: Your email
       - Developer contact: Your email
     - Click "Save and Continue"
     - Add scopes: Click "Add or Remove Scopes"
       - Search for and add: `https://www.googleapis.com/auth/spreadsheets`
       - Click "Update" then "Save and Continue"
     - Add test users (IMPORTANT for testing):
       - Click "+ ADD USERS"
       - Add your email address
       - Click "ADD"
       - Click "Save and Continue"
     - Review and go back to dashboard
   - Create OAuth 2.0 credentials:
     - Go to "APIs & Services" > "Credentials"
     - Click "Create Credentials" > "OAuth client ID"
     - Application type: **Web application**
     - Name: "Gas Log" (or any name)
     - **Authorized JavaScript origins**: Add these URIs:
       - `http://localhost:5173` (for local development)
       - `http://localhost:3000` (if you use a different port)
       - Your production URL if deploying (e.g., `https://yourusername.github.io`)
     - **Authorized redirect URIs**: Add these URIs:
       - `http://localhost:5173` (for local development)
       - `http://localhost:3000` (if you use a different port)
       - Your production URL if deploying
     - Click "Create" and copy the **Client ID**

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your Google Client ID to `.env`:
```
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

5. Run development server:
```bash
npm run dev
```

## Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

Make sure to update the `base` path in `vite.config.ts` to match your repository name.

