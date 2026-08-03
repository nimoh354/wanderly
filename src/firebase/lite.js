// src/firebase/lite.js
// Use Firebase Lite for smaller bundle
let appInstance = null;
let authInstance = null;

const getFirebaseApp = async () => {
  if (!appInstance) {
    // Use lite versions
    const { initializeApp } = await import('firebase/app');
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    appInstance = initializeApp(config);
  }
  return appInstance;
};

export const getAuth = async () => {
  if (!authInstance) {
    const app = await getFirebaseApp();
    // Use lite auth
    const { getAuth: getAuthFn } = await import('firebase/auth/lite');
    authInstance = getAuthFn(app);
  }
  return authInstance;
};

// Export only what you need
export { getFirebaseApp };