
export enum UserRole {
  CITIZEN = 'CITIZEN',
  WILDLIFE_OFFICER = 'WILDLIFE_OFFICER'
}

export enum RescueStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  RESCUED = 'RESCUED',
  RELEASED = 'RELEASED',
  FALSE_ALARM = 'FALSE_ALARM'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isGuest: boolean;
  mobile: string;
  altMobile?: string;
  contact?: string;
  designation?: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  landmark: string;
  pincode: string;
}

export interface ReptileData {
  name: string;
  scientificName: string;
  description: string;
  isVenomous: boolean;
  dangerLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  precautions: string[];
  habitat?: string;
}

export interface SightingReport {
  id: string;
  userId: string;
  userName: string;
  reporterRole: UserRole;
  reporterMobile: string;
  reporterAltMobile?: string;
  reporterEmail?: string;
  timestamp: number;
  sightingTime: string;
  reptileData: ReptileData;
  location: {
    state: string;
    district: string;
    taluk: string;
    village: string;
    landmark: string;
    pincode: string;
    locationType: 'House' | 'Farm' | 'Road' | 'School' | 'Water body' | 'Forest edge';
  };
  riskLevel: 'Immediate danger' | 'Non-aggressive' | 'Injured animal';
  imageUrls: string[];
  rescueImageUrls?: string[];
  status: RescueStatus;
  officerNotes?: string;
  // Officer who updated the status
  updatedByOfficer?: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    designation?: string;
    updatedAt: number;
  };
}
