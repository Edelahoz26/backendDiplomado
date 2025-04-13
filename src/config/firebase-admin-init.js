const admin = require('firebase-admin');

const serviceAccount = require('../../service-account-key.json');

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = {
  admin, 
  db: firebaseApp.firestore(),
  auth: firebaseApp.auth()
};