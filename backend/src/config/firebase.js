const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure to add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env
// Only initialize if we have actual keys (not placeholders)
const hasKeys = process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('REPLACE_WITH');

if (hasKeys) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[Firebase] Admin SDK initialized');
  } catch (error) {
    console.error('[Firebase] Failed to initialize Admin SDK:', error.message);
  }
} else {
  console.log('[Firebase] Admin SDK skipped (missing or placeholder keys in .env)');
}

module.exports = admin;
