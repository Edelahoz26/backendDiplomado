const { auth, db } = require("../config/firebase-admin-init");
const admin = require("firebase-admin");
const axios = require("axios");

class AuthService {
  async registerUser(email, password, userData) {
    try {
      const userRecord = await auth.createUser({
        email,
        password,
      });

      await db
        .collection("users")
        .doc(userRecord.uid)
        .set({
          ...userData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return userRecord;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async loginUser(email, password) {
    try {
      const apiKey = process.env.FIREBASE_WEB_API_KEY;

      if (!apiKey) {
        throw new Error("Firebase Web API Key no está definida");
      }

      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          email,
          password,
          returnSecureToken: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.idToken;
    } catch (error) {
      console.error("🔥 Login error:", error.response?.data || error.message);
      const message =
        error.response?.data?.error?.message || "Invalid email or password";
      throw new Error(message);
    }
  }

  async verifyToken(idToken) {
    try {
      return await auth.verifyIdToken(idToken);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

module.exports = new AuthService();
