const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

class MicrosoftAuth {
  constructor() {
    this.msalInstance = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized || !MICROSOFT_CLIENT_ID) return;

    if (!window.msal) {
      await this.loadMSAL();
    }

    const msalConfig = {
      auth: {
        clientId: MICROSOFT_CLIENT_ID,
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
      },
      cache: {
        cacheLocation: 'localStorage'
      }
    };

    this.msalInstance = new window.msal.PublicClientApplication(msalConfig);
    await this.msalInstance.initialize();
    this.isInitialized = true;
  }

  async loadMSAL() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://alcdn.msauth.net/browser/2.38.0/js/msal-browser.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn() {
    if (!MICROSOFT_CLIENT_ID) {
      throw new Error('Please add VITE_MICROSOFT_CLIENT_ID to .env file. See QUICK_OAUTH_SETUP.md');
    }
    
    await this.initialize();

    const loginRequest = {
      scopes: ['openid', 'profile', 'email']
    };

    const response = await this.msalInstance.loginPopup(loginRequest);
    return {
      id: response.account.homeAccountId,
      email: response.account.username,
      name: response.account.name,
      provider: 'Microsoft'
    };
  }

  async signOut() {
    if (!this.isInitialized) return;

    const logoutRequest = {
      account: this.msalInstance.getActiveAccount()
    };

    await this.msalInstance.logoutPopup(logoutRequest);
  }

  getCurrentUser() {
    if (!this.isInitialized) return null;

    const account = this.msalInstance.getActiveAccount();
    if (!account) return null;

    return {
      id: account.homeAccountId,
      email: account.username,
      name: account.name,
      provider: 'Microsoft'
    };
  }
}

export const microsoftAuth = new MicrosoftAuth();
export default microsoftAuth;