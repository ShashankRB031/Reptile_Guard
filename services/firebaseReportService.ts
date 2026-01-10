import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  Timestamp,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { SightingReport, RescueStatus, ReptileData, User, UserRole } from '../types';

// Firestore collection name for reports
const REPORTS_COLLECTION = 'reports';

/**
 * Save a new sighting report to Firestore
 */
export const firebaseSaveReport = async (
  user: User, 
  reptileData: ReptileData, 
  reportDetails: Partial<SightingReport>,
  imageUrls: string[] = []
): Promise<SightingReport> => {
  const reportData = {
    userId: user.id,
    userName: user.name,
    reporterRole: user.role,
    reporterMobile: user.mobile,
    reporterAltMobile: user.altMobile || null,
    reporterEmail: user.email || null,
    timestamp: Timestamp.now(),
    sightingTime: reportDetails.sightingTime || new Date().toLocaleTimeString(),
    reptileData,
    location: reportDetails.location,
    riskLevel: reportDetails.riskLevel,
    imageUrls: imageUrls,
    rescueImageUrls: [],
    status: RescueStatus.PENDING,
    officerNotes: null
  };

  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), reportData);
  
  // Generate a readable ID
  const reportId = `RPT-${docRef.id.slice(-6).toUpperCase()}`;
  await updateDoc(docRef, { id: reportId, firestoreId: docRef.id });

  return {
    ...reportData,
    id: reportId,
    timestamp: Date.now(),
  } as SightingReport;
};

/**
 * Get all reports from Firestore (for officers)
 */
export const firebaseGetAllReports = async (): Promise<SightingReport[]> => {
  const q = query(
    collection(db, REPORTS_COLLECTION), 
    orderBy('timestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    
    // Handle updatedByOfficer timestamp conversion
    let updatedByOfficer = data.updatedByOfficer;
    if (updatedByOfficer && updatedByOfficer.updatedAt) {
      updatedByOfficer = {
        ...updatedByOfficer,
        updatedAt: updatedByOfficer.updatedAt?.toMillis?.() || updatedByOfficer.updatedAt
      };
    }
    
    return {
      ...data,
      timestamp: data.timestamp?.toMillis?.() || data.timestamp,
      updatedByOfficer
    } as SightingReport;
  });
};

/**
 * Get reports by user ID (for citizens to see their own reports)
 */
export const firebaseGetUserReports = async (userId: string): Promise<SightingReport[]> => {
  const q = query(collection(db, REPORTS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    let updatedByOfficer = data.updatedByOfficer;
    if (updatedByOfficer && updatedByOfficer.updatedAt) {
      updatedByOfficer = {
        ...updatedByOfficer,
        updatedAt: updatedByOfficer.updatedAt?.toMillis?.() || updatedByOfficer.updatedAt,
      };
    }
    return {
      ...data,
      timestamp: data.timestamp?.toMillis?.() || data.timestamp,
      updatedByOfficer,
    } as SightingReport;
  });
  return results.sort((a, b) => (b.timestamp as number) - (a.timestamp as number));
};

/**
 * Get reports by status
 */
export const firebaseGetReportsByStatus = async (status: RescueStatus): Promise<SightingReport[]> => {
  const q = query(
    collection(db, REPORTS_COLLECTION), 
    where('status', '==', status),
    orderBy('timestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    
    // Handle updatedByOfficer timestamp conversion
    let updatedByOfficer = data.updatedByOfficer;
    if (updatedByOfficer && updatedByOfficer.updatedAt) {
      updatedByOfficer = {
        ...updatedByOfficer,
        updatedAt: updatedByOfficer.updatedAt?.toMillis?.() || updatedByOfficer.updatedAt
      };
    }
    
    return {
      ...data,
      timestamp: data.timestamp?.toMillis?.() || data.timestamp,
      updatedByOfficer
    } as SightingReport;
  });
};

/**
 * Update report status (for officers)
 */
export const firebaseUpdateReportStatus = async (
  reportId: string, 
  status: RescueStatus, 
  notes?: string, 
  rescueImageUrls?: string[],
  officer?: User
): Promise<void> => {
  // Find the document by reportId field
  const q = query(
    collection(db, REPORTS_COLLECTION), 
    where('id', '==', reportId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error(`Report ${reportId} not found`);
  }

  const docRef = querySnapshot.docs[0].ref;
  const currentData = querySnapshot.docs[0].data();
  
  const updates: any = { status };
  
  if (notes) {
    updates.officerNotes = notes;
  }
  
  if (rescueImageUrls && rescueImageUrls.length > 0) {
    updates.rescueImageUrls = [
      ...(currentData.rescueImageUrls || []),
      ...rescueImageUrls
    ];
  }

  // Add officer update info
  if (officer) {
    updates.updatedByOfficer = {
      id: officer.id,
      name: officer.name,
      email: officer.email,
      mobile: officer.mobile,
      designation: officer.designation || 'Wildlife Officer',
      updatedAt: Date.now()
    };
  }

  await updateDoc(docRef, updates);
};

/**
 * Get a single report by ID
 */
export const firebaseGetReportById = async (reportId: string): Promise<SightingReport | null> => {
  const q = query(
    collection(db, REPORTS_COLLECTION), 
    where('id', '==', reportId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const data = querySnapshot.docs[0].data();
  
  // Handle updatedByOfficer timestamp conversion
  let updatedByOfficer = data.updatedByOfficer;
  if (updatedByOfficer && updatedByOfficer.updatedAt) {
    updatedByOfficer = {
      ...updatedByOfficer,
      updatedAt: updatedByOfficer.updatedAt?.toMillis?.() || updatedByOfficer.updatedAt
    };
  }
  
  return {
    ...data,
    timestamp: data.timestamp?.toMillis?.() || data.timestamp,
    updatedByOfficer
  } as SightingReport;
};

/**
 * Subscribe to real-time report updates
 */
export const firebaseSubscribeToReports = (
  callback: (reports: SightingReport[]) => void,
  userId?: string,
  role?: UserRole,
  onError?: (error: any) => void
): (() => void) => {
  let q;
  if (role === UserRole.WILDLIFE_OFFICER) {
    q = query(collection(db, REPORTS_COLLECTION), orderBy('timestamp', 'desc'));
  } else if (userId) {
    // Avoid composite index requirement by removing orderBy here.
    // We will sort client-side after fetching.
    q = query(collection(db, REPORTS_COLLECTION), where('userId', '==', userId));
  } else {
    q = query(collection(db, REPORTS_COLLECTION), orderBy('timestamp', 'desc'));
  }

  try {
    return onSnapshot(
      q,
      (querySnapshot) => {
        let reports = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          let updatedByOfficer = data.updatedByOfficer;
          if (updatedByOfficer && updatedByOfficer.updatedAt) {
            updatedByOfficer = {
              ...updatedByOfficer,
              updatedAt:
                updatedByOfficer.updatedAt?.toMillis?.() ||
                updatedByOfficer.updatedAt,
            };
          }
          return {
            ...data,
            timestamp: data.timestamp?.toMillis?.() || data.timestamp,
            updatedByOfficer,
          } as SightingReport;
        });
        // Sort client-side when we cannot orderBy in Firestore (citizen view)
        reports = reports.sort((a, b) => (b.timestamp as number) - (a.timestamp as number));
        callback(reports);
      },
      (error) => {
        // Reduce noisy logs; still provide callback for UI handling.
        if (onError) onError(error);
      }
    );
  } catch (error) {
    if (onError) onError(error);
    (async () => {
      try {
        const fallback =
          role === UserRole.WILDLIFE_OFFICER
            ? await firebaseGetAllReports()
            : userId
            ? await firebaseGetUserReports(userId)
            : await firebaseGetAllReports();
        callback(fallback);
      } catch (fetchError) {
        console.error('Fallback fetch failed', fetchError);
        callback([]);
      }
    })();
    return () => {};
  }
};

/**
 * Delete a report (wildlife officer function)
 * Logs the deletion reason and officer info to a separate collection before deleting
 */
export const firebaseDeleteReport = async (reportId: string, reason: string, officer: User): Promise<void> => {
  const q = query(
    collection(db, REPORTS_COLLECTION), 
    where('id', '==', reportId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const reportDoc = querySnapshot.docs[0];
    const reportData = reportDoc.data();
    
    // Log deletion to a separate collection for audit trail
    await addDoc(collection(db, 'deleted_reports'), {
      originalReportId: reportId,
      reportData: reportData,
      deletedBy: {
        id: officer.id,
        name: officer.name,
        email: officer.email,
        mobile: officer.mobile,
        designation: officer.designation || 'Wildlife Officer'
      },
      deletionReason: reason,
      deletedAt: serverTimestamp()
    });
    
    // Now delete the original report
    await deleteDoc(reportDoc.ref);
  }
};

/**
 * Get report statistics
 */
export const firebaseGetReportStats = async (): Promise<{
  total: number;
  pending: number;
  rescued: number;
  released: number;
}> => {
  const allReports = await firebaseGetAllReports();
  
  return {
    total: allReports.length,
    pending: allReports.filter(r => r.status === RescueStatus.PENDING).length,
    rescued: allReports.filter(r => r.status === RescueStatus.RESCUED).length,
    released: allReports.filter(r => r.status === RescueStatus.RELEASED).length,
  };
};
