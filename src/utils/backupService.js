// Backup service for user data synchronization
import { fetchData } from '../helpers';

class BackupService {
  constructor() {
    this.backupEndpoint = '/api/backup'; // In real app, this would be your server endpoint
    this.localBackupKey = 'userBackups';
  }

  // Get all user backups from local storage (simulating server)
  getAllBackups() {
    try {
      return JSON.parse(localStorage.getItem(this.localBackupKey) || '{}');
    } catch (error) {
      console.error('Error reading backups:', error);
      return {};
    }
  }

  // Save backup to local storage (simulating server)
  saveBackup(userId, data) {
    try {
      const backups = this.getAllBackups();
      backups[userId] = {
        ...data,
        lastUpdated: Date.now(),
        version: (backups[userId]?.version || 0) + 1
      };
      localStorage.setItem(this.localBackupKey, JSON.stringify(backups));
      return true;
    } catch (error) {
      console.error('Error saving backup:', error);
      return false;
    }
  }

  // Get user backup
  getUserBackup(userId) {
    const backups = this.getAllBackups();
    return backups[userId] || null;
  }

  // Create comprehensive backup for user
  async createUserBackup(userId) {
    try {
      const backupData = {
        userId,
        budgets: JSON.parse(localStorage.getItem(`budgets_${userId}`) || '[]'),
        expenses: JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]'),
        recurringExpenses: JSON.parse(localStorage.getItem(`recurringExpenses_${userId}`) || '[]'),
        userPreferences: JSON.parse(localStorage.getItem(`preferences_${userId}`) || '{}')
      };

      const success = this.saveBackup(userId, backupData);
      
      if (success) {
        console.log(`Backup created for user ${userId}`);
        return backupData;
      }
      
      throw new Error('Failed to save backup');
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Restore user data from backup
  async restoreUserBackup(userId) {
    try {
      const backup = this.getUserBackup(userId);
      
      if (!backup) {
        console.log(`No backup found for user ${userId}`);
        return false;
      }

      // Restore data to localStorage
      if (backup.budgets) {
        localStorage.setItem(`budgets_${userId}`, JSON.stringify(backup.budgets));
      }
      if (backup.expenses) {
        localStorage.setItem(`expenses_${userId}`, JSON.stringify(backup.expenses));
      }
      if (backup.recurringExpenses) {
        localStorage.setItem(`recurringExpenses_${userId}`, JSON.stringify(backup.recurringExpenses));
      }
      if (backup.userPreferences) {
        localStorage.setItem(`preferences_${userId}`, JSON.stringify(backup.userPreferences));
      }

      console.log(`Data restored for user ${userId} from backup version ${backup.version}`);
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  // Sync user data (backup current state)
  async syncUserData(userId) {
    try {
      await this.createUserBackup(userId);
      return true;
    } catch (error) {
      console.error('Error syncing user data:', error);
      return false;
    }
  }

  // Check if user has existing backup
  hasBackup(userId) {
    const backup = this.getUserBackup(userId);
    return backup !== null;
  }

  // Get backup info
  getBackupInfo(userId) {
    const backup = this.getUserBackup(userId);
    if (!backup) return null;

    return {
      lastUpdated: backup.lastUpdated,
      version: backup.version,
      budgetsCount: backup.budgets?.length || 0,
      expensesCount: backup.expenses?.length || 0,
      recurringExpensesCount: backup.recurringExpenses?.length || 0
    };
  }

  // Export user data as downloadable JSON
  exportUserData(userId) {
    try {
      const backup = this.getUserBackup(userId);
      if (!backup) {
        throw new Error('No backup data found');
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        ...backup
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `homebudget-backup-${userId}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  }

  // Import user data from JSON file
  async importUserData(userId, file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data
      if (!importData.userId || !importData.budgets) {
        throw new Error('Invalid backup file format');
      }

      // Save imported data
      const success = this.saveBackup(userId, {
        budgets: importData.budgets || [],
        expenses: importData.expenses || [],
        recurringExpenses: importData.recurringExpenses || [],
        userPreferences: importData.userPreferences || {}
      });

      if (success) {
        // Restore to current session
        await this.restoreUserBackup(userId);
        return true;
      }

      throw new Error('Failed to import data');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const backupService = new BackupService();
export default backupService;