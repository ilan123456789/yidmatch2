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
  sendPasswordResetEmail
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

export const DEMO_EMPLOYER: UserProfile = {
  uid: "emp-demo",
  email: "employer@yidmatch.com",
  name: "Chaim Berkowitz",
  role: "EMPLOYER",
  companyName: "Apex Distribution LLC",
  phone: "(732) 555-0199",
  location: "Lakewood, NJ",
  createdAt: new Date().toISOString(),
};

export const DEMO_SEEKER: UserProfile = {
  uid: "seeker-demo",
  email: "seeker@yidmatch.com",
  name: "Shimon Klein",
  role: "SEEKER",
  phone: "(718) 555-0144",
  location: "Boro Park, NY",
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Check if we have a saved session in localStorage
    const saved = localStorage.getItem("yidmatch_current_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    // If Firebase Auth is initialized, listen to its auth changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch profile from /api/auth/me or initialize profile
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
        }
      });
      setLoading(false);
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    // If Firebase Auth is active
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
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
        console.warn("Firebase signin error, checking local fallback:", err.message);
        // If Firebase error is invalid password or user not found, continue to check API / Demo accounts
      }
    }

    // Local / API fallback check
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim()) {
          const data = JSON.parse(text);
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem("yidmatch_current_user", JSON.stringify(data.user));
            setLoading(false);
            return { success: true };
          }
        }
      }
    } catch (_) {}

    // Demo accounts check
    if (email.toLowerCase() === DEMO_EMPLOYER.email) {
      setUser(DEMO_EMPLOYER);
      localStorage.setItem("yidmatch_current_user", JSON.stringify(DEMO_EMPLOYER));
      setLoading(false);
      return { success: true };
    }
    if (email.toLowerCase() === DEMO_SEEKER.email) {
      setUser(DEMO_SEEKER);
      localStorage.setItem("yidmatch_current_user", JSON.stringify(DEMO_SEEKER));
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: false, error: "Invalid email or password. You can also use the 1-click demo accounts." };
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
    try {
      let uid = "usr-" + Date.now();
      if (auth) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
          uid = cred.user.uid;
        } catch (e: any) {
          console.warn("Firebase signup warning:", e.message);
        }
      }

      let resUser: UserProfile | null = null;
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, uid }),
        });
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim()) {
            const resData = JSON.parse(text);
            if (resData?.user) resUser = resData.user;
          }
        }
      } catch (_) {}

      if (resUser) {
        setUser(resUser);
        localStorage.setItem("yidmatch_current_user", JSON.stringify(resUser));
        setLoading(false);
        return { success: true };
      } else {
        // Fallback local creation
        const newUser: UserProfile = {
          uid,
          email: data.email,
          name: data.name,
          role: data.role,
          companyName: data.companyName,
          phone: data.phone,
          location: data.location,
          createdAt: new Date().toISOString()
        };
        setUser(newUser);
        localStorage.setItem("yidmatch_current_user", JSON.stringify(newUser));
        setLoading(false);
        return { success: true };
      }
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Sign up error" };
    }
  };

  const loginWithGoogle = async (role: UserRole = "SEEKER"): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    if (auth && googleProvider) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const res = await fetch(`/api/auth/me?uid=${cred.user.uid}`);
        if (res.ok) {
          try {
            const text = await res.text();
            if (text && text.trim()) {
              const data = JSON.parse(text);
              if (data?.user) {
                setUser(data.user);
                localStorage.setItem("yidmatch_current_user", JSON.stringify(data.user));
              }
            }
          } catch (_) {}
        } else {
          const profile: UserProfile = {
            uid: cred.user.uid,
            email: cred.user.email || "",
            name: cred.user.displayName || "Google User",
            role: role,
            createdAt: new Date().toISOString()
          };
          await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile)
          });
          setUser(profile);
          localStorage.setItem("yidmatch_current_user", JSON.stringify(profile));
        }
        setLoading(false);
        return { success: true };
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message || "Google sign-in error" };
      }
    } else {
      // Demo Google login when Firebase credentials pending
      const demoUser: UserProfile = {
        uid: "usr-google-" + Date.now(),
        email: "google.user@example.com",
        name: "Google Account User",
        role: role,
        createdAt: new Date().toISOString()
      };
      setUser(demoUser);
      localStorage.setItem("yidmatch_current_user", JSON.stringify(demoUser));
      setLoading(false);
      return { success: true };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to send reset email" };
      }
    } else {
      return { success: true };
    }
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

  const switchDemoRole = (role: UserRole) => {
    const target = role === "EMPLOYER" ? DEMO_EMPLOYER : DEMO_SEEKER;
    setUser(target);
    localStorage.setItem("yidmatch_current_user", JSON.stringify(target));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, resetPassword, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
