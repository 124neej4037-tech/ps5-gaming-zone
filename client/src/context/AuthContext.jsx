import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider,
  hasRealFirebaseConfig,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  signInWithPopup,
  onAuthStateChanged
} from '../firebase/config.js';
import { api, setAuthToken } from '../services/api.js';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token and profile to backend Firestore
  const syncProfile = async (firebaseUser, customDetails = {}) => {
    try {
      let token = 'demo-token-' + (firebaseUser?.uid || 'user');
      if (firebaseUser && typeof firebaseUser.getIdToken === 'function') {
        token = await firebaseUser.getIdToken();
      }

      setAuthToken(token);
      localStorage.setItem('bandhilki_auth_token', token);

      const res = await api.syncUser({
        phone: customDetails.phone || '',
        preferredName: customDetails.displayName || firebaseUser.displayName || ''
      });

      if (res.success && res.user) {
        setUserProfile(res.user);
        return res.user;
      }
    } catch (err) {
      console.warn('Profile sync notice:', err.message);
      // Fallback profile if server is briefly initializing
      const fallback = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || customDetails.displayName || 'Gamer',
        role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
        loyaltyPoints: 100
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    // Check if there was a saved demo login
    const savedDemo = localStorage.getItem('bandhilki_demo_user');
    if (savedDemo && !hasRealFirebaseConfig) {
      try {
        const parsed = JSON.parse(savedDemo);
        setCurrentUser(parsed);
        setUserProfile(parsed);
        setAuthToken(parsed.role === 'admin' ? 'demo-admin-token' : 'demo-token-gamer');
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('bandhilki_demo_user');
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await syncProfile(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setAuthToken(null);
        localStorage.removeItem('bandhilki_auth_token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Standard Email/Password Signup
  const signup = async (email, password, displayName, phone) => {
    const trimmedEmail = (email || '').trim().toLowerCase();

    // Prevent regular users from registering as the reserved admin email
    if (trimmedEmail === 'admin@gmail.com') {
      throw new Error('admin@gmail.com is reserved for Administrator login. Please go to Login.');
    }

    if (!hasRealFirebaseConfig) {
      // In development mode without credentials
      const demoUser = {
        uid: 'user-' + Date.now().toString(36),
        email: trimmedEmail,
        displayName: displayName || trimmedEmail.split('@')[0],
        phone: phone || '',
        role: 'user', // strictly regular user
        loyaltyPoints: 100
      };
      setCurrentUser(demoUser);
      setUserProfile(demoUser);
      const token = 'demo-token-' + demoUser.uid;
      setAuthToken(token);
      localStorage.setItem('bandhilki_demo_user', JSON.stringify(demoUser));
      localStorage.setItem('bandhilki_auth_token', token);
      await api.syncUser({ preferredName: displayName, phone });
      return demoUser;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await syncProfile(cred.user, { displayName, phone });
    return profile;
  };

  // Standard Email/Password Login
  const login = async (email, password) => {
    const trimmedEmail = (email || '').trim().toLowerCase();

    // Special check for Administrator: admin@gmail.com / admin123
    if (trimmedEmail === 'admin@gmail.com') {
      if (password !== 'admin123') {
        throw new Error('Incorrect password for Administrator. Use password: admin123');
      }
      const adminUser = {
        uid: 'admin-demo-id',
        email: 'admin@gmail.com',
        displayName: 'Bandhilki Administrator (Boss)',
        role: 'admin',
        loyaltyPoints: 1000
      };
      setCurrentUser(adminUser);
      setUserProfile(adminUser);
      const token = 'demo-admin-token';
      setAuthToken(token);
      localStorage.setItem('bandhilki_demo_user', JSON.stringify(adminUser));
      localStorage.setItem('bandhilki_auth_token', token);
      await api.syncUser({ preferredName: 'Bandhilki Administrator', phone: '+91 8180807208' });
      return adminUser;
    }

    if (!hasRealFirebaseConfig) {
      if (!password || password.length < 4) {
        throw new Error('Password must be at least 4 characters.');
      }
      // Regular user account (role: user)
      const regularUser = {
        uid: 'user-' + trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_'),
        email: trimmedEmail,
        displayName: trimmedEmail.split('@')[0],
        role: 'user', // strictly regular user
        loyaltyPoints: 200
      };
      setCurrentUser(regularUser);
      setUserProfile(regularUser);
      const token = 'demo-token-' + regularUser.uid;
      setAuthToken(token);
      localStorage.setItem('bandhilki_demo_user', JSON.stringify(regularUser));
      localStorage.setItem('bandhilki_auth_token', token);
      await api.syncUser({ preferredName: regularUser.displayName, phone: '' });
      return regularUser;
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await syncProfile(cred.user);
    return profile;
  };

  // Google Sign-In
  const loginWithGoogle = async () => {
    if (!hasRealFirebaseConfig) {
      return login('gamer@gmail.com', 'password123');
    }
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await syncProfile(cred.user);
    return profile;
  };

  // Password Reset
  const resetPassword = async (email) => {
    if (!hasRealFirebaseConfig) {
      return { success: true, message: 'Password reset link sent (Demo Mode simulated).' };
    }
    return sendPasswordResetEmail(auth, email);
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem('bandhilki_demo_user');
    localStorage.removeItem('bandhilki_auth_token');
    setAuthToken(null);
    setCurrentUser(null);
    setUserProfile(null);
    if (auth && hasRealFirebaseConfig) {
      await signOut(auth);
    }
  };

  // Quick Demo Login for instant testing
  const loginAsDemo = (asAdmin = false) => {
    const demoUser = asAdmin ? {
      uid: 'admin-demo-id',
      email: 'admin@gmail.com',
      displayName: 'Bandhilki Administrator (Boss)',
      role: 'admin',
      loyaltyPoints: 1000
    } : {
      uid: 'demo-user-1',
      email: 'gamer@gmail.com',
      displayName: 'Aditya Patil',
      role: 'user',
      loyaltyPoints: 200
    };

    setCurrentUser(demoUser);
    setUserProfile(demoUser);
    const token = asAdmin ? 'demo-admin-token' : 'demo-token-gamer';
    setAuthToken(token);
    localStorage.setItem('bandhilki_demo_user', JSON.stringify(demoUser));
    localStorage.setItem('bandhilki_auth_token', token);
    return demoUser;
  };

  const isAdmin = userProfile?.role === 'admin';

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    signup,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
    loginAsDemo,
    refreshProfile: () => currentUser && syncProfile(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
