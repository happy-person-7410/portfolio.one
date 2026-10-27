import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

// Dynamically resolve configuration with import.meta.env overriding bundled values
const env = typeof import.meta !== 'undefined' ? import.meta.env : ({} as Record<string, string>);

export const resolvedFirebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || 'portfolio-58191.firebaseapp.com',
  projectId: env?.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId || 'portfolio-58191',
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || 'portfolio-58191.firebasestorage.app',
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: env?.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: env?.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(resolvedFirebaseConfig) : getApp();

// Use default Firestore database instance (or env override if explicitly customized)
const envDbId = env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
export const db = (envDbId && envDbId !== '(default)' && !envDbId.includes('ai-studio-portfolio'))
  ? getFirestore(app, envDbId)
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Optional Google Analytics 4 (active if measurementId is provided)
export let analytics: Analytics | null = null;
const measurementId = firebaseConfig.measurementId || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID : '');

if (typeof window !== 'undefined' && measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Gracefully ignore if blocked by ad-blocker or unsupported environment
    });
}

export const GENERATED_ADMIN_EMAIL = 'admin@happyperson.studio';
export const GENERATED_ADMIN_PASSWORD = 'HpStudio!2026#SecureAdmin9';

// Error handling conforming to Firebase skill specifications
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test mandated by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection note: client is offline or database unreached.');
    }
  }
}

testConnection();
