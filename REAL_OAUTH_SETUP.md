# Real OAuth Setup Guide

## Step 1: Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create new project or select existing

2. **Enable APIs**
   - Go to "APIs & Services" > "Library"
   - Enable "Google+ API" and "People API"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:5173` (for dev)
     - `https://yourdomain.com` (for production)

4. **Copy Client ID**
   - Copy the client ID (ends with `.apps.googleusercontent.com`)

## Step 2: Microsoft OAuth Setup

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com/
   - Navigate to "Azure Active Directory"

2. **Register Application**
   - Go to "App registrations" > "New registration"
   - Name: "HomeBudget App"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `http://localhost:5173` (Web)

3. **Configure Authentication**
   - Go to "Authentication" in your app
   - Add platform: "Single-page application"
   - Add redirect URIs:
     - `http://localhost:5173`
     - `https://yourdomain.com`
   - Enable "Access tokens" and "ID tokens"

4. **Copy Application ID**
   - Go to "Overview" and copy "Application (client) ID"

## Step 3: Update Environment Variables

1. **Edit `.env` file:**
```
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
VITE_MICROSOFT_CLIENT_ID=your-actual-microsoft-client-id
```

2. **Restart your dev server:**
```bash
npm run dev
```

## Step 4: Test Real Login

1. Click "Continue with Google" - should open Google login popup
2. Click "Continue with Microsoft" - should open Microsoft login popup
3. Real user data will be fetched and synced

## Important Notes

- **Never commit real client IDs to public repos**
- **Use environment variables in production**
- **Test with real Google/Microsoft accounts**
- **HTTPS required for production**

## Troubleshooting

**Google Login Issues:**
- Check client ID is correct
- Verify authorized origins include your domain
- Clear browser cache

**Microsoft Login Issues:**
- Check application ID is correct
- Verify redirect URIs are configured
- Ensure SPA platform is added

**Both:**
- Check browser console for errors
- Verify environment variables are loaded
- Test in incognito mode