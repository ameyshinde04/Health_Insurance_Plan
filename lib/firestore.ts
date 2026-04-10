import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

// ==================== FAVORITES ====================

export interface FavoriteData {
  planIds: string[];
  updatedAt: Date;
}

export const getFavorites = async (userId: string): Promise<string[]> => {
  try {
    const docRef = doc(db, "users", userId, "data", "favorites");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().planIds || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

export const addFavorite = async (
  userId: string,
  planId: string
): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "data", "favorites");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        planIds: arrayUnion(planId),
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(docRef, {
        planIds: [planId],
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

export const removeFavorite = async (
  userId: string,
  planId: string
): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "data", "favorites");
    await updateDoc(docRef, {
      planIds: arrayRemove(planId),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

// ==================== CHAT HISTORY ====================

export interface ChatMessage {
  id?: string;
  role: "user" | "bot";
  text: string;
  isError?: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
  try {
    const docRef = doc(db, "users", userId, "data", "chatHistory");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data.messages || []).map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate?.() || new Date(),
      }));
    }
    return [];
  } catch (error) {
    console.error("Error getting chat history:", error);
    return [];
  }
};

export const saveChatHistory = async (
  userId: string,
  messages: ChatMessage[]
): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "data", "chatHistory");

    // Convert messages to Firestore-compatible format
    const firestoreMessages = messages.map((msg) => ({
      ...msg,
      timestamp: Timestamp.fromDate(
        msg.timestamp instanceof Date ? msg.timestamp : new Date()
      ),
    }));

    await setDoc(docRef, {
      messages: firestoreMessages,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error saving chat history:", error);
    throw error;
  }
};

export const clearChatHistory = async (userId: string): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "data", "chatHistory");
    await setDoc(docRef, {
      messages: [],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw error;
  }
};

// ==================== USER PREFERENCES ====================

export interface UserPreferences {
  theme?: "light" | "dark";
  notifications?: boolean;
  defaultState?: string;
  lastViewedPlans?: string[];
}

export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences> => {
  try {
    const docRef = doc(db, "users", userId, "data", "preferences");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    }
    return {};
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return {};
  }
};

export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId, "data", "preferences");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...preferences,
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(docRef, {
        ...preferences,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};
