import { 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { SightingReport } from '../types';

/**
 * Export data to CSV format
 */
const convertToCSV = (data: any[], columns: string[]): string => {
  const header = columns.join(',');
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col];
      
      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value).replace(/,/g, ';');
      }
      
      // Handle undefined/null
      if (value === undefined || value === null) {
        value = '';
      }
      
      // Escape quotes and wrap in quotes if contains comma
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

/**
 * Download CSV file
 */
const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export all users to CSV
 */
export const exportUsersToCSV = async (): Promise<void> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const columns = [
      'id', 'name', 'email', 'mobile', 'altMobile', 'role',
      'state', 'district', 'taluk', 'village', 'landmark', 'pincode',
      'designation', 'isGuest'
    ];
    
    const csv = convertToCSV(users, columns);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `reptileguard_users_${date}.csv`);
    
    console.log(`Exported ${users.length} users`);
  } catch (error) {
    console.error('Error exporting users:', error);
    throw error;
  }
};

/**
 * Export all reports to CSV
 */
export const exportReportsToCSV = async (): Promise<void> => {
  try {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id || doc.id,
        firestoreId: doc.id,
        userId: data.userId,
        userName: data.userName,
        reporterMobile: data.reporterMobile,
        reporterRole: data.reporterRole,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
        sightingTime: data.sightingTime,
        status: data.status,
        officerNotes: data.officerNotes || '',
        riskLevel: data.riskLevel,
        // Reptile data
        reptileName: data.reptileData?.name,
        scientificName: data.reptileData?.scientificName,
        isVenomous: data.reptileData?.isVenomous,
        dangerLevel: data.reptileData?.dangerLevel,
        // Location data
        state: data.location?.state,
        district: data.location?.district,
        taluk: data.location?.taluk,
        village: data.location?.village,
        landmark: data.location?.landmark,
        pincode: data.location?.pincode,
        locationType: data.location?.locationType,
        // Image count (not actual images to keep file small)
        imageCount: data.imageUrls?.length || 0,
        rescueImageCount: data.rescueImageUrls?.length || 0
      };
    });
    
    const columns = [
      'id', 'userName', 'reporterMobile', 'reporterRole', 'timestamp', 'sightingTime',
      'status', 'officerNotes', 'riskLevel',
      'reptileName', 'scientificName', 'isVenomous', 'dangerLevel',
      'state', 'district', 'taluk', 'village', 'landmark', 'pincode', 'locationType',
      'imageCount', 'rescueImageCount'
    ];
    
    const csv = convertToCSV(reports, columns);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `reptileguard_reports_${date}.csv`);
    
    console.log(`Exported ${reports.length} reports`);
  } catch (error) {
    console.error('Error exporting reports:', error);
    throw error;
  }
};

export const exportReportsToCSVFiltered = (reports: SightingReport[]): void => {
  const mapped = reports.map((data: any) => {
    const ts = typeof data.timestamp === 'number' ? new Date(data.timestamp).toISOString() : data.timestamp?.toDate?.()?.toISOString() || data.timestamp;
    return {
      id: data.id,
      firestoreId: data.firestoreId,
      userId: data.userId,
      userName: data.userName,
      reporterMobile: data.reporterMobile,
      reporterRole: data.reporterRole,
      timestamp: ts,
      sightingTime: data.sightingTime,
      status: data.status,
      officerNotes: data.officerNotes || '',
      riskLevel: data.riskLevel,
      reptileName: data.reptileData?.name,
      scientificName: data.reptileData?.scientificName,
      isVenomous: data.reptileData?.isVenomous,
      dangerLevel: data.reptileData?.dangerLevel,
      state: data.location?.state,
      district: data.location?.district,
      taluk: data.location?.taluk,
      village: data.location?.village,
      landmark: data.location?.landmark,
      pincode: data.location?.pincode,
      locationType: data.location?.locationType,
      imageCount: data.imageUrls?.length || 0,
      rescueImageCount: data.rescueImageUrls?.length || 0
    };
  });
  const columns = [
    'id', 'userName', 'reporterMobile', 'reporterRole', 'timestamp', 'sightingTime',
    'status', 'officerNotes', 'riskLevel',
    'reptileName', 'scientificName', 'isVenomous', 'dangerLevel',
    'state', 'district', 'taluk', 'village', 'landmark', 'pincode', 'locationType',
    'imageCount', 'rescueImageCount'
  ];
  const csv = convertToCSV(mapped, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `reptileguard_reports_filtered_${date}.csv`);
};

export const exportUsersToCSVFiltered = (users: any[]): void => {
  const columns = [
    'id', 'name', 'email', 'mobile', 'altMobile', 'role',
    'state', 'district', 'taluk', 'village', 'landmark', 'pincode',
    'designation', 'isGuest'
  ];
  const csv = convertToCSV(users, columns);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `reptileguard_users_filtered_${date}.csv`);
};

/**
 * Export both users and reports
 */
export const exportAllDataToCSV = async (): Promise<void> => {
  await exportUsersToCSV();
  await exportReportsToCSV();
};
