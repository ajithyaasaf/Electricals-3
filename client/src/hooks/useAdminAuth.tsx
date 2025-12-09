import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAdminAuth() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'admin@copperbear.com') {
        setIsAdminAuthenticated(true);
        setAdminUser(user);
      } else {
        setIsAdminAuthenticated(false);
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminSignOut = async () => {
    try {
      await signOut(auth);
      setIsAdminAuthenticated(false);
      setAdminUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return {
    isAdminAuthenticated,
    loading,
    adminUser,
    adminSignOut,
  };
}