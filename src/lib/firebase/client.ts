import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { firebaseConfig, isFirebaseConfigured } from "./config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
const db = null;
const storage = null;

if (typeof window !== "undefined" && isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.warn("Firebase client initialization skipped or pending configuration:", err);
  }
}

export { app, auth, db, storage };

