import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- AUTH FUNCTIONS ---

export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    if (profile) {
      const userInfo = { ...profile };
      delete userInfo.password;
      localStorage.setItem('supabase_user', JSON.stringify(userInfo));
      return { user: userInfo, error: null };
    } else {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert([
          {
            auth_id: data.user.id,
            name: data.user.user_metadata?.name || 'Traveler',
            email: data.user.email,
            plan: 'free',
            role: 'user',
            is_admin: false
          }
        ])
        .select()
        .maybeSingle();

      if (createError) {
        console.error('Profile creation error:', createError);
        throw createError;
      }

      const userInfo = { ...newProfile };
      delete userInfo.password;
      localStorage.setItem('supabase_user', JSON.stringify(userInfo));
      return { user: userInfo, error: null };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: error.message };
  }
};

export const registerUser = async (name, email, password) => {
  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('No user returned from signup');
    }

    // Wait for the trigger to create the user profile
    let retries = 0;
    let userData = null;
    
    while (retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', data.user.id)
        .maybeSingle();

      if (profile) {
        userData = profile;
        break;
      }
      retries++;
    }

    // If profile still doesn't exist, create it manually
    if (!userData) {
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert([
          {
            auth_id: data.user.id,
            name: name,
            email: email,
            plan: 'free',
            role: 'user',
            is_admin: false
          }
        ])
        .select()
        .maybeSingle();

      if (createError) {
        console.error('Manual profile creation error:', createError);
        throw createError;
      }
      userData = newProfile;
    }

    const userInfo = { ...userData };
    delete userInfo.password;
    
    // ✅ Auto-login: Store user in localStorage
    localStorage.setItem('supabase_user', JSON.stringify(userInfo));

    return { user: userInfo, error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
  localStorage.removeItem('supabase_user');
  return { error: null };
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('supabase_user');
  return user ? JSON.parse(user) : null;
};

export const onAuthStateChanged = (callback) => {
  const currentUser = getCurrentUser();
  if (currentUser) callback(currentUser);

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Profile fetch error:', error);
          return;
        }

        if (profile) {
          const userInfo = { ...profile };
          delete userInfo.password;
          localStorage.setItem('supabase_user', JSON.stringify(userInfo));
          callback(userInfo);
        }
      } else {
        localStorage.removeItem('supabase_user');
        callback(null);
      }
    }
  );

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
    }
  };
};

// --- USER PROFILE FUNCTIONS ---

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    
    const userData = { ...data };
    delete userData.password;
    return { data: userData, error: null };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    
    const userData = { ...data };
    delete userData.password;
    localStorage.setItem('supabase_user', JSON.stringify(userData));
    
    return { data: userData, error: null };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { data: null, error: error.message };
  }
};

export const updateUserPlan = async (userId, plan) => {
  return updateUserProfile(userId, { plan });
};

// --- ADMIN FUNCTIONS ---

export const isUserAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return { isAdmin: data?.is_admin || data?.role === 'admin', error: null };
  } catch (error) {
    return { isAdmin: false, error: error.message };
  }
};

export const makeUserAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: true, role: 'admin' })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    
    const userData = { ...data };
    delete userData.password;
    localStorage.setItem('supabase_user', JSON.stringify(userData));
    
    return { data: userData, error: null };
  } catch (error) {
    console.error('Make admin error:', error);
    return { data: null, error: error.message };
  }
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const usersWithoutPasswords = data.map(({ password, ...rest }) => rest);
    return { users: usersWithoutPasswords, error: null };
  } catch (error) {
    return { users: [], error: error.message };
  }
};

export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// --- TRIP FUNCTIONS ---

export const saveTrip = async (userId, tripData) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .insert([{ user_id: userId, ...tripData }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return { id: data.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getUserTrips = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { trips: data, error: null };
  } catch (error) {
    return { trips: [], error: error.message };
  }
};

export const deleteTrip = async (tripId) => {
  try {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// --- SAFARI BOOKING FUNCTIONS ---

export const bookSafari = async (userId, bookingData) => {
  try {
    const { data, error } = await supabase
      .from('safari_bookings')
      .insert([{ user_id: userId, ...bookingData }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return { id: data.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getUserSafariBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('safari_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return { bookings: data, error: null };
  } catch (error) {
    return { bookings: [], error: error.message };
  }
};

export const getAllBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('safari_bookings')
      .select('*, users(name, email)')
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return { bookings: data, error: null };
  } catch (error) {
    return { bookings: [], error: error.message };
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('safari_bookings')
      .update({ status, updated_at: new Date() })
      .eq('id', bookingId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// --- MESSAGE FUNCTIONS ---

export const saveMessage = async (userId, messageData) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ user_id: userId, ...messageData }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return { id: data.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getUserMessages = async (userId, limitCount = 50) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;
    return { messages: data.reverse(), error: null };
  } catch (error) {
    return { messages: [], error: error.message };
  }
};

// --- FAVORITE FUNCTIONS ---

export const saveFavoriteDestination = async (userId, destination) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('favorites')
      .eq('id', userId)
      .maybeSingle();

    if (userError) throw userError;

    const currentFavorites = user.favorites || [];
    if (currentFavorites.includes(destination)) {
      return { error: null };
    }

    const { data, error } = await supabase
      .from('users')
      .update({ favorites: [...currentFavorites, destination] })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const removeFavoriteDestination = async (userId, destination) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('favorites')
      .eq('id', userId)
      .maybeSingle();

    if (userError) throw userError;

    const currentFavorites = user.favorites || [];
    const updatedFavorites = currentFavorites.filter(f => f !== destination);

    const { data, error } = await supabase
      .from('users')
      .update({ favorites: updatedFavorites })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const auth = {
  currentUser: getCurrentUser()
};