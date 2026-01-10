import emailjs from '@emailjs/browser';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { User, UserRole, ReptileData } from '../types';

// EmailJS Configuration - FREE TIER (200 emails/month)
// Sign up at https://www.emailjs.com/ and add these values to your .env file
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Firestore collection name for users
const USERS_COLLECTION = 'users';

interface OfficerInfo {
  id: string;
  name: string;
  email: string;
  mobile: string;
  district: string;
  state: string;
}

/**
 * Get wildlife officers by district, fallback to state if none found
 */
export const getOfficersForNotification = async (
  district: string,
  state: string
): Promise<OfficerInfo[]> => {
  try {
    // First, try to find officers in the same district
    const districtQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', UserRole.WILDLIFE_OFFICER),
      where('district', '==', district),
      where('isGuest', '==', false)
    );
    
    const districtSnapshot = await getDocs(districtQuery);
    
    if (!districtSnapshot.empty) {
      return districtSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          district: data.district,
          state: data.state
        };
      }).filter(officer => officer.email); // Only include officers with email
    }
    
    // If no officers in district, try state level
    const stateQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', UserRole.WILDLIFE_OFFICER),
      where('state', '==', state),
      where('isGuest', '==', false)
    );
    
    const stateSnapshot = await getDocs(stateQuery);
    
    if (!stateSnapshot.empty) {
      return stateSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          district: data.district,
          state: data.state
        };
      }).filter(officer => officer.email); // Only include officers with email
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching officers for notification:', error);
    return [];
  }
};

/**
 * Send email notification to wildlife officers about a new sighting
 */
export const sendSightingNotificationEmail = async (
  officers: OfficerInfo[],
  reporterInfo: {
    name: string;
    mobile: string;
    email?: string;
  },
  reptileData: ReptileData,
  location: {
    state: string;
    district: string;
    taluk: string;
    village: string;
    landmark: string;
    pincode: string;
    locationType: string;
  },
  riskLevel: string,
  sightingTime: string
): Promise<{ success: boolean; sentCount: number; errors: string[] }> => {
  const results = {
    success: true,
    sentCount: 0,
    errors: [] as string[]
  };

  if (officers.length === 0) {
    results.success = false;
    results.errors.push('No officers found to notify');
    return results;
  }

  // Prepare email content
  const dangerEmoji = reptileData.dangerLevel === 'Critical' ? '🔴' : 
                      reptileData.dangerLevel === 'High' ? '🟠' :
                      reptileData.dangerLevel === 'Medium' ? '🟡' : '🟢';
  
  const venomousStatus = reptileData.isVenomous ? '⚠️ VENOMOUS' : '✅ Non-Venomous';

  for (const officer of officers) {
    try {
      const templateParams = {
        to_name: officer.name,
        to_email: officer.email,
        officer_district: officer.district,
        
        // Reporter Info
        reporter_name: reporterInfo.name,
        reporter_mobile: reporterInfo.mobile,
        reporter_email: reporterInfo.email || 'Not provided',
        
        // Reptile Info
        reptile_name: reptileData.name,
        scientific_name: reptileData.scientificName,
        danger_level: `${dangerEmoji} ${reptileData.dangerLevel}`,
        venomous_status: venomousStatus,
        reptile_description: reptileData.description,
        
        // Location Info
        location_type: location.locationType,
        village: location.village,
        taluk: location.taluk,
        district: location.district,
        state: location.state,
        landmark: location.landmark,
        pincode: location.pincode,
        full_address: `${location.village}, ${location.taluk}, ${location.district}, ${location.state} - ${location.pincode}`,
        
        // Risk & Time
        risk_level: riskLevel,
        sighting_time: sightingTime,
        report_date: new Date().toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        
        // App Info
        app_name: 'ReptileGuard',
        app_url: window.location.origin
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      results.sentCount++;
      console.log(`✅ Email sent to officer: ${officer.name} (${officer.email})`);
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${officer.email}:`, error);
      results.errors.push(`Failed to notify ${officer.name}: ${error.message || 'Unknown error'}`);
    }
  }

  results.success = results.sentCount > 0;
  return results;
};

/**
 * Main function to notify officers about a new sighting report
 * Call this when a citizen submits a report
 */
export const notifyOfficersAboutSighting = async (
  reporter: User,
  reptileData: ReptileData,
  location: {
    state: string;
    district: string;
    taluk: string;
    village: string;
    landmark: string;
    pincode: string;
    locationType: string;
  },
  riskLevel: string,
  sightingTime: string
): Promise<{ success: boolean; notifiedCount: number; message: string }> => {
  try {
    // Get officers to notify (district first, then state)
    const officers = await getOfficersForNotification(location.district, location.state);
    
    if (officers.length === 0) {
      console.log('⚠️ No registered officers found for notification');
      return {
        success: false,
        notifiedCount: 0,
        message: 'No wildlife officers registered in your area. Report saved for when officers register.'
      };
    }

    console.log(`📧 Found ${officers.length} officer(s) to notify in ${officers[0].district === location.district ? 'district' : 'state'}`);

    // Send emails to all officers
    const emailResult = await sendSightingNotificationEmail(
      officers,
      {
        name: reporter.name,
        mobile: reporter.mobile,
        email: reporter.email
      },
      reptileData,
      location,
      riskLevel,
      sightingTime
    );

    return {
      success: emailResult.success,
      notifiedCount: emailResult.sentCount,
      message: emailResult.success 
        ? `${emailResult.sentCount} wildlife officer(s) have been notified via email.`
        : `Notification partially failed. ${emailResult.sentCount} of ${officers.length} officers notified.`
    };
  } catch (error: any) {
    console.error('Error notifying officers:', error);
    return {
      success: false,
      notifiedCount: 0,
      message: 'Failed to send notifications. Report has been saved.'
    };
  }
};
