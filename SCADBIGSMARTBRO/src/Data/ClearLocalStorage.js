// Utility function to clear all localStorage data
export const clearLocalStorage = () => {
  localStorage.clear();
  console.log('localStorage has been cleared successfully');
};

// Utility function to clear only specific keys from localStorage
export const clearSpecificLocalStorageData = (keys = []) => {
  if (keys.length === 0) {
    console.log('No specific keys provided to clear');
    return;
  }
  
  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed ${key} from localStorage`);
  });
};