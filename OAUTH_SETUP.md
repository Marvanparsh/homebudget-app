# OAuth Setup Guide

## Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add your domain to "Authorized JavaScript origins"
   - Add redirect URIs if needed

4. **Update Client ID**
   ```javascript
   // In src/utils/googleAuth.js
   const GOOGLE_CLIENT_ID = 'your-actual-client-id-here';
   ```

## Microsoft OAuth Setup

1. **Register App in Azure**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Click "New registration"

2. **Configure App**
   - Set redirect URI to your domain
   - Under "Authentication", enable "Access tokens" and "ID tokens"
   - Note the "Application (client) ID"

3. **Update Client ID**
   ```javascript
   // In src/utils/microsoftAuth.js
   const MICROSOFT_CLIENT_ID = 'your-actual-client-id-here';
   ```

## Testing Locally

For local development, add these to your OAuth app configurations:

**Google:**
- Authorized JavaScript origins: `http://localhost:3000`

**Microsoft:**
- Redirect URI: `http://localhost:3000`

## Production Setup

1. **Update domains** in OAuth app configurations
2. **Set environment variables** for client IDs
3. **Enable HTTPS** (required for OAuth)
4. **Test thoroughly** before deployment

## Security Notes

- Never commit client IDs to public repositories
- Use environment variables in production
- Implement proper CSRF protection
- Validate tokens on your backend