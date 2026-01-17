/**
 * BiasBreaker Firestore Utility Functions
 * Provides typed data access layer for the bias analysis platform
 */

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import type { Analysis, College, GlobalStats } from '@/types';

// ============================================================================
// Firebase Initialization
// ============================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (avoid multiple instances)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================================
// Collection References
// ============================================================================

const COLLECTIONS = {
  ANALYSES: 'analyses',
  COLLEGES: 'colleges',
  GLOBAL_STATS: 'globalStats',
} as const;

const GLOBAL_STATS_DOC_ID = 'platform';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts Firestore Timestamp to JavaScript Date
 */
function convertTimestamp(timestamp: Timestamp | Date): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
}

/**
 * Converts Firestore document data to Analysis type
 */
function docToAnalysis(id: string, data: Record<string, unknown>): Analysis {
  return {
    id,
    userId: data.userId as string,
    userEmail: data.userEmail as string,
    collegeName: data.collegeName as string,
    collegeId: data.collegeId as string,
    title: data.title as string,
    text: data.text as string,
    biasScore: data.biasScore as number,
    biasTypes: data.biasTypes as Analysis['biasTypes'],
    detectedPatterns: data.detectedPatterns as Analysis['detectedPatterns'],
    suggestions: data.suggestions as string[],
    timestamp: convertTimestamp(data.timestamp as Timestamp | Date),
    severity: data.severity as Analysis['severity'],
  };
}

/**
 * Converts Firestore document data to College type
 */
function docToCollege(id: string, data: Record<string, unknown>): College {
  return {
    id,
    name: data.name as string,
    totalReports: (data.totalReports ?? data.totalAnalyses ?? 0) as number,
    totalAnalyses: data.totalAnalyses as number | undefined,
    averageBiasScore: data.averageBiasScore as number,
    highSeverityCount: (data.highSeverityCount ?? data.criticalIncidents ?? 0) as number,
    criticalIncidents: data.criticalIncidents as number | undefined,
    lastActivity: convertTimestamp((data.lastActivity ?? data.lastUpdated) as Timestamp | Date),
    lastUpdated: data.lastUpdated ? convertTimestamp(data.lastUpdated as Timestamp | Date) : undefined,
    departments: data.departments as string[],
    commonBiasTypes: data.commonBiasTypes as College['commonBiasTypes'],
  };
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Saves a new analysis to the Firestore 'analyses' collection
 * @param analysis - Analysis data without ID (auto-generated)
 * @returns The saved analysis with generated ID
 * @throws Error if save operation fails
 */
export async function saveAnalysis(
  analysis: Omit<Analysis, 'id'>
): Promise<Analysis> {
  try {
    const analysesRef = collection(db, COLLECTIONS.ANALYSES);
    
    const docData = {
      ...analysis,
      timestamp: serverTimestamp(),
    };
    
    const docRef = await addDoc(analysesRef, docData);
    
    return {
      ...analysis,
      id: docRef.id,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw new Error(
      `Failed to save analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieves all analyses for a specific user, sorted by timestamp descending
 * @param userId - The user's unique identifier
 * @returns Array of user's analyses
 * @throws Error if fetch operation fails
 */
export async function getUserAnalyses(userId: string): Promise<Analysis[]> {
  try {
    const analysesRef = collection(db, COLLECTIONS.ANALYSES);
    const q = query(
      analysesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) =>
      docToAnalysis(doc.id, doc.data() as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Error fetching user analyses:', error);
    throw new Error(
      `Failed to fetch user analyses: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieves all analyses platform-wide (admin only), sorted by timestamp descending
 * @returns Array of all analyses
 * @throws Error if fetch operation fails
 */
export async function getAllAnalyses(): Promise<Analysis[]> {
  try {
    const analysesRef = collection(db, COLLECTIONS.ANALYSES);
    const q = query(analysesRef, orderBy('timestamp', 'desc'));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) =>
      docToAnalysis(doc.id, doc.data() as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Error fetching all analyses:', error);
    throw new Error(
      `Failed to fetch all analyses: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieves a specific analysis by ID
 * @param analysisId - The analysis document ID
 * @returns Analysis data or null if not found
 * @throws Error if fetch operation fails
 */
export async function getAnalysisById(analysisId: string): Promise<Analysis | null> {
  try {
    const analysisRef = doc(db, COLLECTIONS.ANALYSES, analysisId);
    const analysisSnap = await getDoc(analysisRef);
    
    if (!analysisSnap.exists()) {
      return null;
    }
    
    return docToAnalysis(analysisSnap.id, analysisSnap.data() as Record<string, unknown>);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw new Error(
      `Failed to fetch analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Deletes an analysis from Firestore
 * @param analysisId - The analysis document ID to delete
 * @throws Error if delete operation fails
 */
export async function deleteAnalysis(analysisId: string): Promise<void> {
  try {
    const analysisRef = doc(db, COLLECTIONS.ANALYSES, analysisId);
    await deleteDoc(analysisRef);
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw new Error(
      `Failed to delete analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Updates an analysis title
 * @param analysisId - The analysis document ID
 * @param newTitle - The new title for the analysis
 * @throws Error if update operation fails
 */
export async function updateAnalysisTitle(analysisId: string, newTitle: string): Promise<void> {
  try {
    const analysisRef = doc(db, COLLECTIONS.ANALYSES, analysisId);
    await updateDoc(analysisRef, { title: newTitle });
  } catch (error) {
    console.error('Error updating analysis title:', error);
    throw new Error(
      `Failed to update analysis title: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// College Functions
// ============================================================================

/**
 * Updates college statistics after a new analysis
 * Recalculates average bias score and increments analysis count
 * @param collegeId - The college's unique identifier
 * @param biasScore - The new analysis bias score (0-100)
 * @throws Error if update operation fails
 */
export async function updateCollegeStats(
  collegeId: string,
  biasScore: number
): Promise<void> {
  try {
    const collegeRef = doc(db, COLLECTIONS.COLLEGES, collegeId);
    const collegeSnap = await getDoc(collegeRef);
    
    if (!collegeSnap.exists()) {
      throw new Error(`College with ID ${collegeId} not found`);
    }
    
    const currentData = collegeSnap.data();
    const currentTotal = currentData.totalAnalyses as number || 0;
    const currentAverage = currentData.averageBiasScore as number || 0;
    
    // Calculate new average: ((oldAvg * oldCount) + newScore) / newCount
    const newTotal = currentTotal + 1;
    const newAverage = ((currentAverage * currentTotal) + biasScore) / newTotal;
    
    // Determine if this is a critical incident (high severity)
    const isCritical = biasScore >= 70;
    
    await updateDoc(collegeRef, {
      totalAnalyses: increment(1),
      averageBiasScore: Math.round(newAverage * 100) / 100, // Round to 2 decimal places
      criticalIncidents: isCritical ? increment(1) : currentData.criticalIncidents,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating college stats:', error);
    throw new Error(
      `Failed to update college stats: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieves a specific college's data
 * @param collegeId - The college's unique identifier
 * @returns College data or null if not found
 * @throws Error if fetch operation fails
 */
export async function getCollegeData(collegeId: string): Promise<College | null> {
  try {
    const collegeRef = doc(db, COLLECTIONS.COLLEGES, collegeId);
    const collegeSnap = await getDoc(collegeRef);
    
    if (!collegeSnap.exists()) {
      return null;
    }
    
    return docToCollege(collegeSnap.id, collegeSnap.data() as Record<string, unknown>);
  } catch (error) {
    console.error('Error fetching college data:', error);
    throw new Error(
      `Failed to fetch college data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieves all colleges, sorted by average bias score descending
 * @returns Array of all colleges
 * @throws Error if fetch operation fails
 */
export async function getAllColleges(): Promise<College[]> {
  try {
    const collegesRef = collection(db, COLLECTIONS.COLLEGES);
    const q = query(collegesRef, orderBy('averageBiasScore', 'desc'));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) =>
      docToCollege(doc.id, doc.data() as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Error fetching all colleges:', error);
    throw new Error(
      `Failed to fetch all colleges: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// Global Statistics Functions
// ============================================================================

/**
 * Updates platform-wide statistics after a new analysis
 * @param biasScore - The new analysis bias score (0-100)
 * @throws Error if update operation fails
 */
export async function updateGlobalStats(biasScore: number): Promise<void> {
  try {
    const globalStatsRef = doc(db, COLLECTIONS.GLOBAL_STATS, GLOBAL_STATS_DOC_ID);
    const statsSnap = await getDoc(globalStatsRef);
    
    if (!statsSnap.exists()) {
      throw new Error('Global stats document not found');
    }
    
    const currentData = statsSnap.data();
    const currentTotal = currentData.totalAnalyses as number || 0;
    const currentAverage = currentData.averagePlatformBias as number || 0;
    
    // Calculate new platform average
    const newTotal = currentTotal + 1;
    const newAverage = ((currentAverage * currentTotal) + biasScore) / newTotal;
    
    await updateDoc(globalStatsRef, {
      totalAnalyses: increment(1),
      averagePlatformBias: Math.round(newAverage * 100) / 100,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating global stats:', error);
    throw new Error(
      `Failed to update global stats: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieves platform-wide statistics
 * @returns Global statistics or null if not found
 * @throws Error if fetch operation fails
 */
export async function getGlobalStats(): Promise<GlobalStats | null> {
  try {
    const globalStatsRef = doc(db, COLLECTIONS.GLOBAL_STATS, GLOBAL_STATS_DOC_ID);
    const statsSnap = await getDoc(globalStatsRef);
    
    if (!statsSnap.exists()) {
      return null;
    }
    
    const data = statsSnap.data();
    
    return {
      totalUsers: data.totalUsers as number,
      totalColleges: data.totalColleges as number,
      totalAnalyses: data.totalAnalyses as number,
      averagePlatformBias: data.averagePlatformBias as number,
      lastUpdated: convertTimestamp(data.lastUpdated as Timestamp | Date),
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    throw new Error(
      `Failed to fetch global stats: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// Exports
// ============================================================================

export { db };
