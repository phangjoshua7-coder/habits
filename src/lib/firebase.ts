/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "PLACEHOLDER_KEY" &&
  firebaseConfig.apiKey !== "" &&
  !firebaseConfig.projectId.includes("placeholder");

let app: any = null;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    // CRITICAL: The app will break without this line, initialized with multi-tab offline local cache persistence
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    }, firebaseConfig.firestoreDatabaseId);
    
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });

    // Validate connection on boot as mandated
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        console.log("Firebase connection verified: database is online.");
      } catch (error: any) {
        // Gracefully catch and log connectivity warning without disturbing runtime
        console.warn(
          "Firestore is running in Offline Cache mode. Synchronization active. Connectivity status: ",
          error?.message || error
        );
      }
    };
    testConnection();
  } catch (err) {
    console.error("Firebase SDK init error:", err);
  }
} else {
  console.warn("Using Offline LocalStorage state engine: Firebase credentials are in placeholder mode.");
}

// Strictly compliant Firestore Error Handling Schema
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo:
        currentAuth?.currentUser?.providerData?.map((provider: any) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Permission/Access Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { app, db, auth, googleProvider, signInWithPopup, signOut };
