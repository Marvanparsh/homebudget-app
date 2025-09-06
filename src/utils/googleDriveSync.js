// Google Drive sync for budget data
import { fetchUserData, setUserData, fetchData } from '../helpers';

const FOLDER_NAME = 'HomeBudget';
const DATA_FILE_NAME = 'budget-data.json';

// Initialize Google Drive API
const initGoogleDrive = () => {
  return new Promise((resolve) => {
    if (window.gapi) {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          scope: 'https://www.googleapis.com/auth/drive.file'
        }).then(resolve);
      });
    }
  });
};

// Find or create HomeBudget folder
const getOrCreateFolder = async () => {
  const response = await window.gapi.client.drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`,
    fields: 'files(id, name)'
  });

  if (response.result.files.length > 0) {
    return response.result.files[0].id;
  }

  // Create folder
  const folderResponse = await window.gapi.client.drive.files.create({
    resource: {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    }
  });

  return folderResponse.result.id;
};

// Upload data to Google Drive
export const syncToGoogleDrive = async () => {
  try {
    await initGoogleDrive();
    
    if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      await window.gapi.auth2.getAuthInstance().signIn();
    }

    const folderId = await getOrCreateFolder();
    const budgets = fetchUserData('budgets') || [];
    const expenses = fetchUserData('expenses') || [];
    
    const data = {
      budgets,
      expenses,
      lastSync: new Date().toISOString(),
      version: '1.0'
    };

    // Check if file exists
    const existingFiles = await window.gapi.client.drive.files.list({
      q: `name='${DATA_FILE_NAME}' and parents in '${folderId}'`,
      fields: 'files(id)'
    });

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: DATA_FILE_NAME,
      parents: [folderId]
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(data, null, 2) +
      close_delim;

    const request = window.gapi.client.request({
      path: existingFiles.result.files.length > 0 
        ? `/upload/drive/v3/files/${existingFiles.result.files[0].id}`
        : '/upload/drive/v3/files',
      method: existingFiles.result.files.length > 0 ? 'PATCH' : 'POST',
      params: { uploadType: 'multipart' },
      headers: { 'Content-Type': `multipart/related; boundary="${boundary}"` },
      body: multipartRequestBody
    });

    await request;
    return true;
  } catch (error) {
    console.error('Google Drive sync failed:', error);
    return false;
  }
};

// Download data from Google Drive
export const syncFromGoogleDrive = async () => {
  try {
    await initGoogleDrive();
    
    if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      return false;
    }

    const folderId = await getOrCreateFolder();
    
    const files = await window.gapi.client.drive.files.list({
      q: `name='${DATA_FILE_NAME}' and parents in '${folderId}'`,
      fields: 'files(id)'
    });

    if (files.result.files.length === 0) {
      return false;
    }

    const fileId = files.result.files[0].id;
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    const data = JSON.parse(response.body);
    
    if (data.budgets) setUserData('budgets', data.budgets);
    if (data.expenses) setUserData('expenses', data.expenses);
    
    return true;
  } catch (error) {
    console.error('Google Drive sync failed:', error);
    return false;
  }
};

// Auto-sync on data changes
export const enableAutoSync = () => {
  let syncTimeout;
  
  const autoSync = () => {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncToGoogleDrive();
    }, 5000); // Sync 5 seconds after last change
  };

  // Override setUserData to trigger auto-sync
  const originalSetUserData = window.setUserData || setUserData;
  window.setUserData = (key, data) => {
    const result = originalSetUserData(key, data);
    autoSync();
    return result;
  };
};