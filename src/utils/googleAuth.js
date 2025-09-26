const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISABLE_OAUTH = import.meta.env.VITE_DISABLE_OAUTH === 'true';
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

class GoogleAuth {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized || !GOOGLE_CLIENT_ID || DISABLE_OAUTH) return;

    return new Promise((resolve, reject) => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.isInitialized = true;
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        this.isInitialized = true;
        resolve();
      }
    });
  }

  async signIn() {
    // Mock authentication for development
    if (DISABLE_OAUTH || MOCK_AUTH) {
      const mockUser = {
        id: 'mock_google_user',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://via.placeholder.com/150',
        provider: 'google'
      };
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store mock user and trigger auth change
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('authChange'));
      
      return mockUser;
    }
    
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Please add VITE_GOOGLE_CLIENT_ID to .env file. See QUICK_OAUTH_SETUP.md');
    }
    
    const isProduction = window.location.hostname !== 'localhost';
    const redirectUri = isProduction
      ? 'https://homebudget-app-lo5w.vercel.app/auth/callback'
      : 'http://localhost:5173/auth/callback';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=email profile&` +
      `include_granted_scopes=true`;
    
    window.location.href = authUrl;
  }

  async signOut() {
    // Clear mock auth data
    if (MOCK_AUTH || DISABLE_OAUTH) {
      localStorage.removeItem('currentUser');
      return;
    }
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  isSignedIn() {
    return false;
  }

  getCurrentUser() {
    return null;
  }
}

export const googleAuth = new GoogleAuth();
export default googleAuth;