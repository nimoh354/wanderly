import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Your Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth, db, and onAuthStateChanged
export { auth, db, onAuthStateChanged };

// --- Auth Functions ---
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: error.message };
  }
};

export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: name,
      email: email,
      plan: 'free',
      createdAt: serverTimestamp(),
      tripsPlanned: 0,
      destinationsVisited: 0,
      reviews: 0,
      preferences: {
        currency: 'USD',
        notifications: true,
        darkMode: true
      },
      favorites: []
    });
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: error.message };
  }
};

export const updateUserEmail = async (newEmail) => {
  try {
    await updateEmail(auth.currentUser, newEmail);
    return { error: null };
  } catch (error) {
    console.error('Update email error:', error);
    return { error: error.message };
  }
};

export const updateUserPassword = async (newPassword) => {
  try {
    await updatePassword(auth.currentUser, newPassword);
    return { error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: error.message };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// --- Firestore Functions ---
export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: { id: uid, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: 'User not found' };
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return { error: null };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { error: error.message };
  }
};

export const updateUserPlan = async (uid, plan) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { plan, updatedAt: serverTimestamp() });
    return { error: null };
  } catch (error) {
    console.error('Update user plan error:', error);
    return { error: error.message };
  }
};

export const saveTrip = async (userId, tripData) => {
  try {
    const docRef = await addDoc(collection(db, 'trips'), {
      userId: userId,
      ...tripData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Save trip error:', error);
    return { id: null, error: error.message };
  }
};

export const getUserTrips = async (userId) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return { trips, error: null };
  } catch (error) {
    console.error('Get user trips error:', error);
    return { trips: [], error: error.message };
  }
};

export const deleteTrip = async (tripId) => {
  try {
    await deleteDoc(doc(db, 'trips', tripId));
    return { error: null };
  } catch (error) {
    console.error('Delete trip error:', error);
    return { error: error.message };
  }
};

export const bookSafari = async (userId, bookingData) => {
  try {
    const docRef = await addDoc(collection(db, 'safari_bookings'), {
      userId: userId,
      ...bookingData,
      status: 'pending',
      bookingDate: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Book safari error:', error);
    return { id: null, error: error.message };
  }
};

export const getUserSafariBookings = async (userId) => {
  try {
    const q = query(
      collection(db, 'safari_bookings'),
      where('userId', '==', userId),
      orderBy('bookingDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return { bookings, error: null };
  } catch (error) {
    console.error('Get safari bookings error:', error);
    return { bookings: [], error: error.message };
  }
};

export const updateSafariBooking = async (bookingId, status) => {
  try {
    const docRef = doc(db, 'safari_bookings', bookingId);
    await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    return { error: null };
  } catch (error) {
    console.error('Update safari booking error:', error);
    return { error: error.message };
  }
};

export const saveMessage = async (userId, messageData) => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      userId: userId,
      ...messageData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Save message error:', error);
    return { id: null, error: error.message };
  }
};

export const getUserMessages = async (userId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return { messages: messages.reverse(), error: null };
  } catch (error) {
    console.error('Get user messages error:', error);
    return { messages: [], error: error.message };
  }
};

export const saveFavoriteDestination = async (userId, destination) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      favorites: arrayUnion(destination),
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Save favorite error:', error);
    return { error: error.message };
  }
};

export const removeFavoriteDestination = async (userId, destination) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      favorites: arrayRemove(destination),
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Remove favorite error:', error);
    return { error: error.message };
  }
};