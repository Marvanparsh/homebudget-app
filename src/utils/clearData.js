// Clear all localStorage data for the current user
export const clearAllUserData = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;
  
  const user = JSON.parse(currentUser);
  const userId = user.id;
  
  // Clear all user-specific data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(`_${userId}`)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('Cleared all user data');
};

// Clear specific data type
export const clearDataType = (dataType) => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;
  
  const user = JSON.parse(currentUser);
  const userId = user.id;
  const key = `${dataType}_${userId}`;
  
  localStorage.removeItem(key);
  console.log(`Cleared ${dataType} data`);
};