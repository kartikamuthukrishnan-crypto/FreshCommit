import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebaseConfig';
import { JobPosting, AdSenseConfig } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Validate connection on boot as instructed by system directives
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_health'));
    return true;
  } catch (error) {
    // Permission or offline handled gracefully
    console.info('Firebase Firestore health check initialized');
    return false;
  }
}

/**
 * Parses raw Firestore REST API values into JS primitive / array / object values
 */
export function parseFirestoreRestVal(v: any): any {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return parseFloat(v.doubleValue);
  if ('arrayValue' in v) {
    const vals = v.arrayValue.values || [];
    return vals.map((val: any) => parseFirestoreRestVal(val));
  }
  if ('mapValue' in v) {
    const fields = v.mapValue.fields || {};
    const obj: Record<string, any> = {};
    for (const k in fields) {
      obj[k] = parseFirestoreRestVal(fields[k]);
    }
    return obj;
  }
  return undefined;
}

/**
 * Fetch a single job by ID from Firestore (SDK first, REST fallback for instant crawler compatibility)
 */
export async function fetchSingleJobFromCloud(jobId: string): Promise<JobPosting | null> {
  if (!jobId) return null;

  // 1. Try direct Firestore SDK getDoc
  try {
    const docRef = doc(db, 'jobs', jobId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...(snap.data() as JobPosting), id: snap.id };
    }
  } catch (sdkErr) {
    console.warn('Firestore SDK single job query error:', sdkErr);
  }

  // 2. Ultra-fast direct REST API fallback
  try {
    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    const restUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${dbId}/documents/jobs/${encodeURIComponent(jobId)}`;
    const res = await fetch(restUrl);
    if (res.ok) {
      const docData = await res.json();
      if (docData && docData.fields) {
        const parsed: Record<string, any> = {};
        for (const k in docData.fields) {
          parsed[k] = parseFirestoreRestVal(docData.fields[k]);
        }
        parsed.id = parsed.id || jobId;
        return parsed as JobPosting;
      }
    }
  } catch (restErr) {
    console.warn('Firestore REST single job fetch failed:', restErr);
  }

  return null;
}

/**
 * Fetch all jobs from Firestore
 */
export async function fetchJobsFromCloud(): Promise<JobPosting[]> {
  try {
    const jobsCol = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCol);
    const jobs: JobPosting[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as JobPosting;
      jobs.push({ ...data, id: docSnap.id });
    });
    return jobs;
  } catch (err) {
    console.error('Failed to fetch jobs from cloud Firestore:', err);
    return [];
  }
}

/**
 * Subscribe to real-time job updates globally
 */
export function subscribeToLiveJobs(onUpdate: (jobs: JobPosting[]) => void): () => void {
  const jobsCol = collection(db, 'jobs');
  const unsubscribe = onSnapshot(
    jobsCol,
    (snapshot) => {
      const liveJobs: JobPosting[] = [];
      snapshot.forEach((docSnap) => {
        liveJobs.push({ ...(docSnap.data() as JobPosting), id: docSnap.id });
      });
      // Sort newest posted date first
      liveJobs.sort((a, b) => new Date(b.datePosted || '').getTime() - new Date(a.datePosted || '').getTime());
      onUpdate(liveJobs);
    },
    (error) => {
      console.warn('Real-time Firestore listener warning:', error);
    }
  );
  return unsubscribe;
}

/**
 * Deeply sanitizes an object before writing to Firestore, removing any keys that are undefined.
 * Firestore strictly forbids `undefined` field values and throws:
 * "Function WriteBatch.set() called with invalid data. Unsupported field value: undefined"
 */
export function cleanJobForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== 'object') return obj;
  try {
    // JSON.stringify by specification completely omits any object key whose value is undefined
    const str = JSON.stringify(obj, (_, v) => (v === undefined ? undefined : v));
    return JSON.parse(str);
  } catch (e) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        cleaned[key] = value.filter((item) => item !== undefined);
      } else if (value !== null && typeof value === 'object') {
        cleaned[key] = cleanJobForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}

/**
 * Save or update a job in Firestore
 */
export async function saveJobToCloud(job: JobPosting): Promise<void> {
  try {
    const docRef = doc(db, 'jobs', job.id);
    const cleaned = cleanJobForFirestore(job);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.error('Error saving job to cloud:', err);
    throw err;
  }
}

/**
 * Batch save multiple jobs (ideal for syncing feeds and seeding)
 */
export async function batchSaveJobsToCloud(jobs: JobPosting[]): Promise<void> {
  if (!jobs || jobs.length === 0) return;
  try {
    // Firestore batches are limited to 500 operations per batch
    const chunks = [];
    for (let i = 0; i < jobs.length; i += 400) {
      chunks.push(jobs.slice(i, i + 400));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const job of chunk) {
        const docRef = doc(db, 'jobs', job.id);
        const cleaned = cleanJobForFirestore(job);
        batch.set(docRef, cleaned, { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    console.error('Batch save to cloud failed:', err);
    throw err;
  }
}

/**
 * Delete a job from Firestore
 */
export async function deleteJobFromCloud(jobId: string): Promise<void> {
  try {
    const docRef = doc(db, 'jobs', jobId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting job from cloud:', err);
    throw err;
  }
}

/**
 * Save AdSense configuration to Cloud
 */
export async function saveAdConfigToCloud(adConfig: AdSenseConfig): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'adsense');
    const cleaned = cleanJobForFirestore(adConfig);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.error('Error saving adConfig to cloud:', err);
  }
}

/**
 * Subscribe to AdSense configuration changes
 */
export function subscribeToAdConfig(onUpdate: (config: AdSenseConfig) => void): () => void {
  const docRef = doc(db, 'settings', 'adsense');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as AdSenseConfig);
      }
    },
    (err) => {
      console.warn('AdConfig listener note:', err);
    }
  );
}
