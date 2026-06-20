import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  getDocFromServer 
} from "firebase/firestore";
import { DailyEntry } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

// Check if Firebase configuration is a placeholder or legitimate
export const isMockFirebase = firebaseConfig.apiKey.startsWith("AIzaSyMock");

// Initialize Firebase with persistent local cache for flawless offline operations
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({})
  })
}, firebaseConfig.firestoreDatabaseId);

// 3. Firestore Error Handlers according to standard required FirestoreErrorInfo interface
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  // JSON.stringify(errInfo) contains full user contextual debug data
  throw new Error(JSON.stringify(errInfo));
}

// Local Storage Fallback Key
const LOCAL_STORAGE_KEY = "carbonmate_entries_v2";
const LOCAL_USER_PROFILE_KEY = "carbonmate_user_profile";

// --- CLIENT REPOSITORY FOR USER PROFILES ---
export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  commutePref: string;
  dietPref: string;
  acPref: string;
  onboarded: boolean;
  createdAt: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isMockFirebase) {
    const raw = localStorage.getItem(LOCAL_USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, "users", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      // Cache copy to local storage
      localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(data));
      return data;
    }
    // If doc doesn't exist on server, check if we have dynamic local profile as backup
    const raw = localStorage.getItem(LOCAL_USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error: any) {
    console.warn("Firestore profile fetch failed, using local cached profile details:", error);
    const raw = localStorage.getItem(LOCAL_USER_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    const isOffline = error instanceof Error && (
      error.message.includes("offline") || 
      error.message.includes("unavailable") || 
      error.message.includes("Could not reach") ||
      error.message.includes("Failed to get document")
    );
    if (!isOffline) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  // Always cache locally to ensure instantly responsive UI
  localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(profile));

  if (isMockFirebase) {
    return;
  }

  const path = `users/${profile.userId}`;
  try {
    const docRef = doc(db, "users", profile.userId);
    await setDoc(docRef, profile);
  } catch (error: any) {
    console.warn("Firestore profile save failed (saved to persistent local storage):", error);
    const isOffline = error instanceof Error && (
      error.message.includes("offline") || 
      error.message.includes("unavailable") || 
      error.message.includes("Could not reach")
    );
    if (!isOffline) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

// --- CLIENT REPOSITORY FOR ACTIVITY LOGS ---
export const getStoredEntries = (): DailyEntry[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    // Fail silently or fallback
  }
  return [];
};

export const saveStoredEntries = (entries: DailyEntry[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    // Fail silently
  }
};

// Cloud synced Firestore database getters and setters
export async function getFirestoreEntries(userId: string): Promise<DailyEntry[]> {
  if (isMockFirebase) {
    return getStoredEntries();
  }

  const path = `users/${userId}/entries`;
  try {
    const colRef = collection(db, "users", userId, "entries");
    const q = query(colRef, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const results: DailyEntry[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as DailyEntry);
    });
    // Save/Sync local copy to match
    if (results.length > 0) {
      saveStoredEntries(results);
    }
    return results;
  } catch (error: any) {
    console.warn("Firestore entries fetch failed, utilizing locally cached activity logs:", error);
    const local = getStoredEntries();
    if (local.length > 0) {
      return local;
    }
    const isOffline = error instanceof Error && (
      error.message.includes("offline") || 
      error.message.includes("unavailable") || 
      error.message.includes("Could not reach") ||
      error.message.includes("Failed to get document")
    );
    if (!isOffline) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    return [];
  }
}

export async function saveFirestoreEntry(userId: string, entry: DailyEntry): Promise<void> {
  // Always save locally to support offline first & fallback persistence
  const local = getStoredEntries();
  const index = local.findIndex(item => item.id === entry.id);
  if (index >= 0) {
    local[index] = entry;
  } else {
    local.unshift(entry);
  }
  saveStoredEntries(local);

  if (isMockFirebase) return;

  const path = `users/${userId}/entries/${entry.id}`;
  try {
    const docRef = doc(db, "users", userId, "entries", entry.id);
    await setDoc(docRef, entry);
  } catch (error: any) {
    console.warn("Firestore entry save failed (saved to persistent local storage):", error);
    const isOffline = error instanceof Error && (
      error.message.includes("offline") || 
      error.message.includes("unavailable") || 
      error.message.includes("Could not reach")
    );
    if (!isOffline) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function deleteFirestoreEntry(userId: string, entryId: string): Promise<void> {
  // Erase locally
  const local = getStoredEntries().filter(e => e.id !== entryId);
  saveStoredEntries(local);

  if (isMockFirebase) return;

  const path = `users/${userId}/entries/${entryId}`;
  try {
    const docRef = doc(db, "users", userId, "entries", entryId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.warn("Firestore entry deletion failed (erased from local storage):", error);
    const isOffline = error instanceof Error && (
      error.message.includes("offline") || 
      error.message.includes("unavailable") || 
      error.message.includes("Could not reach")
    );
    if (!isOffline) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export async function purgeAllUserData(userId: string): Promise<void> {
  // Clear local storage completely
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(LOCAL_USER_PROFILE_KEY);

  if (isMockFirebase) return;

  try {
    // Delete entries
    const entries = await getFirestoreEntries(userId);
    for (const entry of entries) {
      await deleteDoc(doc(db, "users", userId, "entries", entry.id));
    }
    // Delete profile
    await deleteDoc(doc(db, "users", userId));
  } catch (error) {
    throw error;
  }
}

// Test live connection server side
export async function validateConnection() {
  if (isMockFirebase) return true;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Client database connection failed: Client is currently offline.");
    }
    return false;
  }
}

// Resilient request execution with retry backoff pattern
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

