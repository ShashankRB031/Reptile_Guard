// Firebase Core
export { auth, db, storage, analytics } from './firebase';

// Authentication Services
export {
  firebaseRegisterUser,
  firebaseLoginUser,
  firebaseLoginAsGuest,
  firebaseLogoutUser,
  firebaseGetCurrentUser,
  firebaseUpdateUserProfile,
  onAuthChange,
  seedDefaultAccounts
} from './firebaseAuthService';

// Report/Firestore Services
export {
  firebaseSaveReport,
  firebaseGetAllReports,
  firebaseGetUserReports,
  firebaseGetReportsByStatus,
  firebaseUpdateReportStatus,
  firebaseGetReportById,
  firebaseSubscribeToReports,
  firebaseDeleteReport,
  firebaseGetReportStats
} from './firebaseReportService';

// Storage Services
export {
  uploadImage,
  uploadMultipleImages,
  uploadReportImages,
  uploadRescueImages,
  deleteImage,
  deleteReportImages,
  fileToBase64,
  compressAndConvertToBase64
} from './firebaseStorageService';
