"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "@/types";
import { auth } from "./firebase/client";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from "firebase/auth";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; pass: string; name: string; role: UserRole; companyName?: string; phone?: string; location?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  switchDemoRole: () => {},
});

const DEMO_EMPLOYER: UserProfile = {
  uid: "emp-demo",
  email: "employer@yidmatch.com",
  name: "Chaim Berkowitz",
  role: "EMPLOYER",
  companyName: "Apex Distribution LLC",
  phone: "(732) 555-0199",
  location: "Lakewood, NJ",
  createdAt: new Date().toISOString(),
};

const DEMO_SEEKER: UserProfile = {
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
    } else {
      // Default initial view: let's start as guest or easy seeker preview
      setUser(DEMO_SEEKER);
      localStorage.setItem("yidmatch_current_user", JSON.stringify(DEMO_SEEKER));
    }

    // If Firebase Auth is initialized, listen to its auth changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch profile from /api/auth/me or Firestore
          try {
            const res = await fetch(`/api/auth/me?uid=${firebaseUser.uid}`);
            if (res.ok) {
              const data = await res.json();
              if (data.user) {
                setUser(data.user);
                localStorage.setItem("yidmatch_current_user", JSON.stringify(data.user));
              }
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
        const res = await fetch(`/api/auth/me?uid=${cred.user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("yidmatch_current_user", JSON.stringify(data.user));
          setLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn("Firebase signin error, checking local accounts:", err);
      }
    }

    // Local / API fallback check
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("yidmatch_current_user", JSON.stringify(data.user));
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.error || "Invalid email or password" };
      }
    } catch (e: any) {
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
      return { success: false, error: e.message || "Failed to log in" };
    }
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
        } catch (e) {
          console.warn("Firebase signup error, saving via API:", e);
        }
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, uid }),
      });

      const resData = await res.json();
      if (res.ok && resData.user) {
        setUser(resData.user);
        localStorage.setItem("yidmatch_current_user", JSON.stringify(resData.user));
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: resData.error || "Failed to create account" };
      }
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || "Sign up error" };
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
    <AuthContext.Provider value={{ user, loading, login, signup, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
