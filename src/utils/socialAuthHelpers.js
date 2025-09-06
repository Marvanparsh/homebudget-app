// Social authentication helpers
import { fetchData } from '../helpers';
import { backupService } from './backupService';
import { googleAuth } from './googleAuth';
// import { microsoftAuth } from './microsoftAuth';

// OAuth authentication with providers
export const authenticateWithProvider = async (provider) => {
  try {
    switch (provider) {
      case 'google':
        return await googleAuth.signIn();
      
      // case 'microsoft':
      //   return await microsoftAuth.signIn();
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`${provider} authentication failed:`, error);
    throw new Error(`Failed to authenticate with ${provider}`);
  }
};

// Sync user data from OAuth provider
export const syncUserData = async (email, providerData = {}) => {
  try {
    // Check if user exists locally first
    const existingUser = getUserByEmail(email);
    
    if (existingUser) {
      // Load user's data from backup if available
      await loadUserBackup(existingUser.id);
      return existingUser;
    }
    
    // Create new user if doesn't exist
    const newUser = {
      id: crypto.randomUUID(),
      email: email,
      fullName: providerData.name || email.split('@')[0],
      username: email,
      provider: providerData.provider || 'Social',
      createdAt: Date.now(),
      isSocialLogin: true
    };
    
    // Save user to local storage
    const users = fetchData('users') || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Create backup for new user
    await createUserBackup(newUser.id);
    
    return newUser;
  } catch (error) {
    console.error('Error syncing user data:', error);
    throw error;
  }
};

// Get user by email
const getUserByEmail = (email) => {
  const users = fetchData('users') || [];
  return users.find(user => user.email === email);
};

// Load user backup from backup service
const loadUserBackup = async (userId) => {
  try {
    await backupService.restoreUserBackup(userId);
  } catch (error) {
    console.log('No backup found or error loading backup:', error);
  }
};

// Create/update user backup
export const createUserBackup = async (userId) => {
  try {
    await backupService.createUserBackup(userId);
  } catch (error) {
    console.error('Error creating backup:', error);
  }
};



// Auto-sync data when changes occur
export const autoSyncUserData = () => {
  const currentUser = fetchData('currentUser');
  if (currentUser && currentUser.isSocialLogin) {
    window.dispatchEvent(new Event('userDataSync'));
    backupService.syncUserData(currentUser.id);
  }
};

// Listen for data changes and auto-sync
export const setupAutoSync = () => {
  if (window.autoSyncSetup) return; // Prevent multiple setups
  window.autoSyncSetup = true;
  
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    
    // Auto-sync when user data changes
    if (key.includes('budgets_') || key.includes('expenses_') || key.includes('recurringExpenses_')) {
      setTimeout(() => autoSyncUserData(), 1000); // Debounce
    }
  };
};

// Export backup service functions
export const exportUserData = (userId) => backupService.exportUserData(userId);
export const importUserData = (userId, file) => backupService.importUserData(userId, file);
export const getBackupInfo = (userId) => backupService.getBackupInfo(userId);

// Real OAuth flow
export const performOAuthLogin = async (provider) => {
  const providerData = await authenticateWithProvider(provider);
  return await syncUserData(providerData.email, providerData);
};

// Check if user is already signed in with provider
export const checkExistingAuth = async () => {
  // For demo, we don't auto-login
  return null;
};

// Sign out from all providers
export const signOutFromProviders = async () => {
  try {
    await googleAuth.signOut();
    // await microsoftAuth.signOut();
  } catch (error) {
    console.error('Error signing out from providers:', error);
  }
};