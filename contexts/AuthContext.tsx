import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase.ts";
import { Timestamp } from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp;
}

// Add types for favorites and chat history
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
} from "../lib/firestore";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  // Favorites
  getFavorites: () => Promise<string[]>;
  addFavorite: (planId: string) => Promise<void>;
  removeFavorite: (planId: string) => Promise<void>;
  // Chat history
  getChatHistory: () => Promise<any[]>;
  saveChatHistory: (messages: any[]) => Promise<void>;
  clearChatHistory: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = user?.uid || null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch or create user profile in Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // Create profile if it doesn't exist
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            createdAt: Timestamp.now(),
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the user's display name
    await updateProfile(userCredential.user, { displayName: name });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), userProfile);

    setUserProfile(userProfile);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  // Favorites helpers
  const getFavoritesHandler = async () => {
    if (!userId) return [];
    return await getFavorites(userId);
  };
  const addFavoriteHandler = async (planId: string) => {
    if (!userId) return;
    await addFavorite(userId, planId);
  };
  const removeFavoriteHandler = async (planId: string) => {
    if (!userId) return;
    await removeFavorite(userId, planId);
  };

  // Chat history helpers
  const getChatHistoryHandler = async () => {
    if (!userId) return [];
    return await getChatHistory(userId);
  };
  const saveChatHistoryHandler = async (messages: any[]) => {
    if (!userId) return;
    await saveChatHistory(userId, messages);
  };
  const clearChatHistoryHandler = async () => {
    if (!userId) return;
    await clearChatHistory(userId);
  };

  const value = {
    user,
    userProfile,
    loading,
    userId,
    login,
    signup,
    logout,
    getFavorites: getFavoritesHandler,
    addFavorite: addFavoriteHandler,
    removeFavorite: removeFavoriteHandler,
    getChatHistory: getChatHistoryHandler,
    saveChatHistory: saveChatHistoryHandler,
    clearChatHistory: clearChatHistoryHandler,
  };

  if (loading) {
  return <div>Loading...</div>; // or spinner
}

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
