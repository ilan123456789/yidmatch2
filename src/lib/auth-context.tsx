"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "@/types";
import { auth, googleProvider } from "./firebase/client";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; pass: string; name: string; role: UserRole; companyName?: string; phone?: string; location?: string }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  logout: async () => {},
  switchDemoRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Check if we have a saved session in localStorage
    const saved = typeof window !== "undefined" ? localStorage.getItem("yidmatch_current_user") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out any old temporary demo accounts
        if (parsed?.uid === "emp-demo" || parsed?.uid === "seeker-demo") {
          localStorage.removeItem("yidmatch_current_user");
        } else {
          setUser(parsed);
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    // If Firebase Auth is initialized, listen to its auth changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const res = await fetch(`/api/auth/me?uid=${firebaseUser.uid}`);
            let resUser: UserProfile | null = null;
            if (res.ok) {
              try {
                const text = await res.text();
                if (text && text.trim()) {
                  const data = JSON.parse(text);
                  if (data?.user) resUser = data.user;
                }
              } catch (_) {}
            }
            if (resUser) {
              setUser(resUser);
              localStorage.setItem("yidmatch_current_user", JSON.stringify(resUser));
            } else {
              const profile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "User"),
                role: "SEEKER",
                createdAt: new Date().toISOString()
              };
              setUser(profile);
              localStorage.setItem("yidmatch_current_user", JSON.stringify(profile));
            }
          } catch (err) {
            console.warn("Could not sync with /api/auth/me", err);
          }
        } else {
          // Firebase signed out
          setUser(null);
          localStorage.removeItem("yidmatch_current_user");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    if (!email.trim() || !pass) {
      setLoading(false);
      return { success: false, error: "Please enter your email and password." };
    }

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
        let resUser: UserProfile | null = null;
        try {
          const res = await fetch(`/api/auth/me?uid=${cred.user.uid}`);
          if (res.ok) {
            const text = await res.text();
            if (text && text.trim()) {
              const data = JSON.parse(text);
              if (data?.user) resUser = data.user;
            }
          }
        } catch (_) {}

        if (resUser) {
          setUser(resUser);
          localStorage.setItem("yidmatch_current_user", JSON.stringify(resUser));
          setLoading(false);
          return { success: true };
        } else {
          const profile: UserProfile = {
            uid: cred.user.uid,
            email: cred.user.email || email,
            name: cred.user.displayName || email.split("@")[0],
            role: "SEEKER",
            createdAt: new Date().toISOString()
          };
          setUser(profile);
          localStorage.setItem("yidmatch_current_user", JSON.stringify(profile));
          setLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setLoading(false);
        const code = err?.code || "";
        if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
          return { success: false, error: "Incorrect email or password." };
        }
        if (code === "auth/user-not-found") {
          return { success: false, error: "No account found with this email. Please create an account." };
        }
        if (code === "auth/invalid-email") {
          return { success: false, error: "Please enter a valid email address." };
        }
        if (code === "auth/too-many-requests") {
          return { success: false, error: "Access temporarily blocked due to multiple failed attempts. Please reset password or try later." };
        }
        return { success: false, error: err.message || "Failed to sign in. Please verify your credentials." };
      }
    }

    setLoading(false);
    return { success: false, error: "Authentication service unavailable. Please check your connection." };
  };

  const signup = async (data: {
    email: string;
    pass: string;
    name: string;
    role: UserRole;
    companyName?: string;
    phone?: string;
    location?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    if (!data.email.trim() || !data.pass || !data.name.trim()) {
      setLoading(false);
      return { success: false, error: "Please fill in all required fields." };
    }

    if (data.pass.length < 6) {
      setLoading(false);
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    try {
      let uid = "usr-" + Date.now();
      if (auth) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.pass);
          uid = cred.user.uid;
          if (data.name.trim()) {
            await updateProfile(cred.user, { displayName: data.name.trim() });
          }
        } catch (e: any) {
          setLoading(false);
          const code = e?.code || "";
          if (code === "auth/email-already-in-use") {
            return { success: false, error: "An account with this email address already exists. Please sign in." };
          }
          if (code === "auth/weak-password") {
            return { success: false, error: "Password should be at least 6 characters." };
          }
          if (code === "auth/invalid-email") {
            return { success: false, error: "Invalid email address format." };
          }
          return { success: false, error: e.message || "Could not complete registration." };
        }
      }

      const profile: UserProfile = {
        uid,
        email: data.email.trim(),
        name: data.name.trim(),
        role: data.role,
        companyName: data.companyName?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        location: data.location?.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
      } catch (_) {}

      setUser(profile);
      localStorage.setItem("yidmatch_current_user", JSON.stringify(profile));
      setLoading(false);
      return { success: true };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Failed to create account" };
    }
  };

  const loginWithGoogle = async (role: UserRole = "SEEKER"): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    if (auth && googleProvider) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        let resUser: UserProfile | null = null;
        try {
          const res = await fetch(`/api/auth/me?uid=${cred.user.uid}`);
          if (res.ok) {
            const text = await res.text();
            if (text && text.trim()) {
              const data = JSON.parse(text);
              if (data?.user) resUser = data.user;
            }
          }
        } catch (_) {}

        if (resUser) {
          setUser(resUser);
          localStorage.setItem("yidmatch_current_user", JSON.stringify(resUser));
        } else {
          const profile: UserProfile = {
            uid: cred.user.uid,
            email: cred.user.email || "",
            name: cred.user.displayName || "Google User",
            role: role,
            createdAt: new Date().toISOString()
          };
          try {
            await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(profile)
            });
          } catch (_) {}
          setUser(profile);
          localStorage.setItem("yidmatch_current_user", JSON.stringify(profile));
        }
        setLoading(false);
        return { success: true };
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message || "Google sign-in was cancelled or encountered an error." };
      }
    }

    setLoading(false);
    return { success: false, error: "Google authentication is not available right now." };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim()) {
      return { success: false, error: "Please enter your email address." };
    }
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, email.trim());
        return { success: true };
      } catch (err: any) {
        const code = err?.code || "";
        if (code === "auth/user-not-found") {
          return { success: false, error: "No account found with this email." };
        }
        return { success: false, error: err.message || "Failed to send reset email" };
      }
    }
    return { success: false, error: "Service unavailable." };
  };

  const logout = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    localStorage.removeItem("yidmatch_current_user");
  };

  const switchDemoRole = (_role: UserRole) => {
    // Kept for backward compatibility
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, resetPassword, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
