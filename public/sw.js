const CACHE_NAME = 'budget-tracker-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline expense tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  const offlineData = await getOfflineData();
  if (offlineData.length > 0) {
    // Sync offline expenses when back online
    for (const expense of offlineData) {
      try {
        await syncExpense(expense);
      } catch (error) {
        console.error('Failed to sync expense:', error);
      }
    }
    await clearOfflineData();
  }
}

async function getOfflineData() {
  // Get offline data from IndexedDB or localStorage
  return JSON.parse(localStorage.getItem('offlineExpenses') || '[]');
}

async function syncExpense(expense) {
  // Sync expense with server when online
  console.log('Syncing expense:', expense);
}

async function clearOfflineData() {
  localStorage.removeItem('offlineExpenses');
}