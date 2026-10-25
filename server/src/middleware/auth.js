import { auth, db } from '../config/firebase.js';

export async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    }

    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid token format.' });
    }

    // Verify token with Firebase Admin
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({ success: false, message: 'Unauthorized. Token verification failed.' });
    }

    // Lookup user in Firestore to get assigned role & profile
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    let userData = userDoc.exists ? userDoc.data() : null;

    if (!userData) {
      // Only admin@gmail.com or configured INITIAL_ADMIN_EMAIL gets the admin role
      const isAdminEmail = decodedToken.email?.toLowerCase() === 'admin@gmail.com' ||
                           decodedToken.email === process.env.INITIAL_ADMIN_EMAIL;
      userData = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: isAdminEmail ? 'Bandhilki Administrator' : (decodedToken.name || decodedToken.email?.split('@')[0] || 'Gamer'),
        role: isAdminEmail ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };
      await db.collection('users').doc(decodedToken.uid).set(userData, { merge: true });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || userData?.email,
      name: decodedToken.name || userData?.displayName,
      ...userData,
      role: userData?.role || 'user'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Internal server authentication error' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return verifyFirebaseToken(req, res, next);
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.'
    });
  }
  next();
}
