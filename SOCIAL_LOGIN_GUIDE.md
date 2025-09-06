# Social Login Implementation Guide

## Overview
The HomeBudget app now includes social login functionality that allows users to:
- Login with device email accounts via a side popup
- Automatically sync data across devices using the same email
- Backup user data to JSON files automatically
- Import/export data for backup and restore

## Features

### 1. Social Login Popup
- Click "Continue with Device Account" on the login page
- Shows a popup with available email accounts from the device
- One-click login with any listed email account

### 2. Automatic Data Sync
- User data is automatically backed up when changes are made
- Sync indicator shows current sync status (bottom-right corner)
- Data is restored when logging in with the same email on different devices

### 3. Data Backup System
- All user data (budgets, expenses, recurring expenses) is backed up
- JSON file format for easy portability
- Automatic versioning and timestamp tracking

## How It Works

### Device Email Detection
Currently uses mock data for demonstration. In a real implementation, you would integrate with:
- **Chrome Identity API** for Chrome extensions
- **Windows.Security.Authentication.Web** for Windows apps
- **OAuth providers** (Google, Microsoft, Apple) for web apps

### Data Synchronization
1. When a user logs in with social login, the system checks for existing backups
2. If backup exists, data is automatically restored to the current session
3. Any changes to budgets/expenses trigger automatic backup creation
4. Sync indicator shows real-time sync status

### Backup Storage
Currently stores backups in localStorage (simulating server storage). In production:
- Use cloud storage (AWS S3, Google Cloud Storage)
- Implement proper API endpoints for backup/restore
- Add encryption for sensitive financial data

## Usage Instructions

### For Users
1. **Login**: Click "Continue with Device Account" on login page
2. **Select Account**: Choose from available email accounts
3. **Automatic Sync**: Data syncs automatically in the background
4. **Cross-Device**: Login with same email on different devices to access your data

### For Developers
1. **Setup**: The system initializes automatically when AuthContext loads
2. **Customization**: Modify `socialAuthHelpers.js` to integrate with real OAuth providers
3. **Backup Service**: Use `backupService.js` for manual backup operations
4. **Styling**: Customize popup appearance in `social-login.css`

## File Structure
```
src/
├── components/
│   ├── SocialLogin.jsx          # Main popup component
│   └── SyncIndicator.jsx        # Sync status indicator
├── utils/
│   ├── socialAuthHelpers.js     # Social auth logic
│   └── backupService.js         # Data backup/restore service
└── social-login.css             # Popup and sync indicator styles
```

## Configuration

### Mock Email Accounts
Edit `getDeviceEmails()` in `socialAuthHelpers.js` to customize demo accounts:
```javascript
const mockDeviceEmails = [
  { email: 'user@gmail.com', name: 'John Doe' },
  { email: 'work@company.com', name: 'John Work' }
];
```

### Backup Settings
Modify `backupService.js` to change backup behavior:
- Storage location
- Backup frequency
- Data encryption
- Version management

## Security Considerations
- Implement proper OAuth flows for production
- Encrypt sensitive financial data before backup
- Use secure API endpoints for data synchronization
- Validate and sanitize all imported data
- Implement rate limiting for backup operations

## Future Enhancements
- Real OAuth provider integration (Google, Microsoft, Apple)
- Cloud storage backend
- Data encryption
- Conflict resolution for simultaneous edits
- Offline sync capabilities
- Backup scheduling options

## Testing
1. Login with different mock email accounts
2. Create budgets and expenses
3. Logout and login with same email to verify data persistence
4. Check sync indicator for real-time status updates
5. Test data export/import functionality