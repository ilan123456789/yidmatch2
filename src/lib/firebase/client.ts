import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig, isFirebaseConfigured } from "./config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let db: any = null;
let storage: any = null;

if (typeof window !== "undefined" && isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn("Firebase client initialization error:", err);
  }
}

// Lazy-loaded on client to prevent Cloudflare Worker SSR EvalError (protobufjs new Function)
export async function getClientFirestore() {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return null;
  if (!db) {
    try {
      const { getFirestore } = await import("firebase/firestore");
      if (!app) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      }
      db = getFirestore(app);
    } catch (e) {
      console.warn("Failed to load client Firestore:", e);
    }
  }
  return db;
}

export async function getClientStorage() {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return null;
  if (!storage) {
    try {
      const { getStorage } = await import("firebase/storage");
      if (!app) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      }
      storage = getStorage(app);
    } catch (e) {
      console.warn("Failed to load client Storage:", e);
    }
  }
  return storage;
}

export { app, auth, db, storage, googleProvider };
