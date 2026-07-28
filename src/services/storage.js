// src/services/storage.js
// Save and load data from localStorage

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Load error:', error);
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Remove error:', error);
    return false;
  }
};

// Specific functions for travel data
export const saveRecentSearches = (searches) => {
  return saveToStorage('recentSearches', searches);
};

export const loadRecentSearches = () => {
  return loadFromStorage('recentSearches', []);
};

export const saveItineraries = (itineraries) => {
  return saveToStorage('savedItineraries', itineraries);
};

export const loadItineraries = () => {
  return loadFromStorage('savedItineraries', []);
};

export const saveUserPreferences = (preferences) => {
  return saveToStorage('userPreferences', preferences);
};

export const loadUserPreferences = () => {
  return loadFromStorage('userPreferences', {});
};