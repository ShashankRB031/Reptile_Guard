
import { SightingReport, RescueStatus, ReptileData, User, UserRole } from "../types";

const STORAGE_KEY = 'REPTILE_GUARD_REPORTS_STABLE_PROD_V2';

export const getReports = (): SightingReport[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveReport = (
  user: User, 
  reptileData: ReptileData, 
  reportDetails: Partial<SightingReport>
): SightingReport => {
  const reports = getReports();
  const newReport: SightingReport = {
    id: `RPT-${Date.now().toString().slice(-6)}`,
    userId: user.id,
    userName: user.name,
    reporterRole: user.role,
    reporterMobile: user.mobile,
    reporterAltMobile: user.altMobile,
    timestamp: Date.now(),
    sightingTime: reportDetails.sightingTime || new Date().toLocaleTimeString(),
    reptileData,
    location: reportDetails.location as any,
    riskLevel: reportDetails.riskLevel as any,
    imageUrls: reportDetails.imageUrls || [],
    status: RescueStatus.PENDING
  };
  
  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return newReport;
};

export const updateReportStatus = (
  reportId: string, 
  status: RescueStatus, 
  notes?: string, 
  rescueImageUrls?: string[]
): void => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports[index].status = status;
    if (notes) reports[index].officerNotes = notes;
    if (rescueImageUrls && rescueImageUrls.length > 0) {
      reports[index].rescueImageUrls = [
        ...(reports[index].rescueImageUrls || []),
        ...rescueImageUrls
      ];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
};
