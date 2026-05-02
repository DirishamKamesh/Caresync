const admin = require('../config/firebase');
const User = require('../models/User');

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check if Firebase is actually initialized
    if (!admin.apps.length) {
      if (process.env.DEV_BYPASS_AUTH === 'true') {
        console.log('[AuthMiddleware] Firebase not initialized, bypassing...');
        req.user = await User.findOne();
        return next();
      }
      return res.status(500).json({ success: false, message: 'Firebase Admin not initialized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decodedToken;

    // Find the corresponding user in MongoDB
    const user = await User.findOne({ uid: decodedToken.uid });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not registered in database' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error.message);
    res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
  }
};

module.exports = { verifyFirebaseToken };
