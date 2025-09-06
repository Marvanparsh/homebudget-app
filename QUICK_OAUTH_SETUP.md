# Quick OAuth Setup (2 minutes)

## Google Setup

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Click**: "Create Credentials" → "OAuth client ID"
3. **Choose**: "Web application"
4. **Add authorized origins**: `http://localhost:5173`
5. **Copy the Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

## Microsoft Setup

1. **Go to**: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
2. **Click**: "New registration"
3. **Name**: "HomeBudget"
4. **Redirect URI**: `http://localhost:5173` (Single-page application)
5. **Copy Application ID** from Overview page

## Update .env file

```env
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
VITE_MICROSOFT_CLIENT_ID=your-actual-microsoft-client-id
```

## Restart server

```bash
npm run dev
```

That's it! Real OAuth will work.