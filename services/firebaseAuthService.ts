import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole } from '../types';

// Firestore collection name for users
const USERS_COLLECTION = 'users';

/**
 * Register a new user with Firebase Auth and store profile in Firestore
 */
export const firebaseRegisterUser = async (
  userData: Partial<User> & { password: string }
): Promise<User> => {
  const normalizedEmail = userData.email?.trim().toLowerCase();
  const trimmedPassword = userData.password.trim();

  if (!normalizedEmail) throw new Error("Email is mandatory for registration.");
  if (trimmedPassword.length < 6) throw new Error("Password must be at least 6 characters.");

  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, trimmedPassword);
    const firebaseUser = userCredential.user;

    // Create user profile document in Firestore
    // Remove undefined values as Firestore doesn't accept them
    const userProfile: User = {
      id: firebaseUser.uid,
      name: userData.name!.trim(),
      email: normalizedEmail,
      role: userData.role!,
      state: userData.state!,
      district: userData.district!,
      taluk: userData.taluk!,
      village: userData.village!,
      landmark: userData.landmark!,
      pincode: userData.pincode!,
      mobile: userData.mobile!.trim(),
      altMobile: userData.altMobile?.trim() || '',
      designation: userData.designation || '',
      isGuest: false
    };

    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userProfile);

    return userProfile;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error(`The email "${normalizedEmail}" is already registered. Please sign in.`);
    }
    throw new Error(error.message || "Registration failed. Please try again.");
  }
};

/**
 * Delete user account from Firestore and Firebase Auth
 */
export const firebaseDeleteAccount = async (password: string): Promise<void> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("No user logged in.");
  }
  
  try {
    if (!user.email) {
      throw new Error("Missing user email.");
    }
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteDoc(doc(db, USERS_COLLECTION, user.uid));
    await deleteUser(user);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("For security, please sign out and sign in again before deleting your account.");
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error("Incorrect password.");
    }
    throw new Error(error.message || "Failed to delete account. Please try again.");
  }
};


/**
 * Login user with Firebase Auth and verify role
 */
export const firebaseLoginUser = async (
  email: string, 
  password: string, 
  role: UserRole
): Promise<User> => {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const trimmedPassword = (password || "").trim();

  if (!normalizedEmail) throw new Error("Please enter your email.");
  if (!trimmedPassword) throw new Error("Please enter your password.");

  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, trimmedPassword);
    const firebaseUser = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
    
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("User profile not found. Please register again.");
    }

    const userProfile = userDoc.data() as User;

    // Verify role matches
    if (userProfile.role !== role) {
      await signOut(auth);
      const roleName = userProfile.role === UserRole.CITIZEN ? 'Citizen' : 'Wildlife Officer';
      throw new Error(`This account is registered as a ${roleName}. Please switch to the correct tab.`);
    }

    return userProfile;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error(`Account not found for "${normalizedEmail}". Please create an account.`);
    }
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      // Note: newer firebase versions might return invalid-credential for user-not-found too
      // We can try to be helpful but vague for security, or specific if we prefer usability
      throw new Error("Incorrect email or password. If you don't have an account, please register.");
    }
    throw new Error(error.message || "Login failed. Please try again.");
  }
};

/**
 * Login as guest (no Firebase Auth, just local session)
 */
export const firebaseLoginAsGuest = (role: UserRole): User => {
  const isOfficer = role === UserRole.WILDLIFE_OFFICER;
  const guestUser: User = {
    id: `guest-${role}-${Date.now()}`,
    name: isOfficer ? "Guest Officer" : "Guest Citizen",
    email: isOfficer ? "guest-officer@reptileguard.com" : "guest@reptileguard.com",
    role: role,
    isGuest: true,
    mobile: "0000000000",
    state: "Karnataka",
    district: "Bengaluru Urban",
    taluk: isOfficer ? "Aranya Bhavan" : "N/A",
    village: isOfficer ? "Malleshwaram" : "N/A",
    landmark: "Forest HQ",
    pincode: "560001",
    designation: isOfficer ? "Temporary Guest Officer" : undefined
  };
  // Store in localStorage for guest sessions
  localStorage.setItem('REPTILE_GUARD_GUEST_USER', JSON.stringify(guestUser));
  return guestUser;
};

/**
 * Logout user from Firebase Auth
 */
export const firebaseLogoutUser = async (): Promise<void> => {
  localStorage.removeItem('REPTILE_GUARD_GUEST_USER');
  await signOut(auth);
};

/**
 * Get current authenticated user profile from Firestore
 */
export const firebaseGetCurrentUser = async (): Promise<User | null> => {
  // Check for guest user first
  const guestData = localStorage.getItem('REPTILE_GUARD_GUEST_USER');
  if (guestData) {
    return JSON.parse(guestData);
  }

  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
  if (!userDoc.exists()) return null;

  return userDoc.data() as User;
};

/**
 * Update user profile in Firestore
 */
export const firebaseUpdateUserProfile = async (
  userId: string, 
  updates: Partial<User>
): Promise<User> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error("User not found.");
  }

  await updateDoc(userRef, updates);
  
  const updatedDoc = await getDoc(userRef);
  return updatedDoc.data() as User;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    try {
      // Check for guest user
      const guestData = localStorage.getItem('REPTILE_GUARD_GUEST_USER');
      if (guestData) {
        callback(JSON.parse(guestData));
        return;
      }

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data() as User);
          } else {
            callback(null);
          }
        } catch (firestoreError) {
          console.error('Error fetching user profile:', firestoreError);
          callback(null);
        }
      } else {
        callback(null);
      }
    } catch (error) {
      console.error('Auth state change error:', error);
      callback(null);
    }
  });
};

/**
 * Seed default test accounts (for development)
 */
export const seedDefaultAccounts = async (): Promise<void> => {
  const defaultAccounts = [
    {
      email: "citizen@reptileguard.com",
      password: "password123",
      name: "Default Citizen",
      role: UserRole.CITIZEN,
      mobile: "9876543210",
      state: "Karnataka",
      district: "Bengaluru Urban",
      taluk: "Bengaluru North",
      village: "Sample Village",
      landmark: "Near Forest Office",
      pincode: "560001"
    },
    {
      email: "officer@reptileguard.com",
      password: "password123",
      name: "Head Wildlife Officer",
      role: UserRole.WILDLIFE_OFFICER,
      mobile: "9988776655",
      state: "Karnataka",
      district: "Bengaluru Urban",
      taluk: "Aranya Bhavan",
      village: "Malleshwaram",
      landmark: "Forest Dept HQ",
      pincode: "560003",
      designation: "Chief Conservator"
    }
  ];

  for (const account of defaultAccounts) {
    try {
      await firebaseRegisterUser(account);
      console.log(`Seeded account: ${account.email}`);
    } catch (error: any) {
      // Account likely already exists
      console.log(`Account exists: ${account.email}`);
    }
  }
};

/**
 * Send password reset email to user
 */
export const firebaseSendPasswordReset = async (email: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!normalizedEmail) {
    throw new Error('Please enter your email address.');
  }
  
  try {
    await sendPasswordResetEmail(auth, normalizedEmail);
  } catch (error: any) {
    // Handle specific Firebase errors
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email address.');
      case 'auth/invalid-email':
        throw new Error('Please enter a valid email address.');
      case 'auth/too-many-requests':
        throw new Error('Too many requests. Please try again later.');
      default:
        throw new Error('Failed to send reset email. Please try again.');
    }
  }
};
