
import { User, UserRole } from "../types";

/** 
 * ULTIMATE STABLE STORAGE KEYS
 * These keys are locked to prevent data loss during application rebuilds.
 */
const USERS_KEY = 'REPTILE_GUARD_MASTER_USERS_DATABASE_V1'; 
const CURRENT_USER_KEY = 'REPTILE_GUARD_ACTIVE_SESSION_V1';

type UserWithPassword = User & { password?: string };

/**
 * Ensures default accounts exist for testing and initial access.
 */
const seedDefaultAccounts = (users: UserWithPassword[]) => {
  const defaultCitizenEmail = "citizen@reptileguard.com";
  const defaultOfficerEmail = "officer@reptileguard.com";
  const defaultPassword = "password123";

  // Add Default Citizen if not exists
  if (!users.find(u => u.email === defaultCitizenEmail)) {
    users.push({
      id: 'def-citizen-001',
      name: 'Default Citizen',
      email: defaultCitizenEmail,
      password: defaultPassword,
      role: UserRole.CITIZEN,
      isGuest: false,
      mobile: '9876543210',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      taluk: 'Bengaluru North',
      village: 'Sample Village',
      landmark: 'Near Forest Office',
      pincode: '560001'
    });
  }

  // Add Default Officer if not exists
  if (!users.find(u => u.email === defaultOfficerEmail)) {
    users.push({
      id: 'def-officer-001',
      name: 'Head Wildlife Officer',
      email: defaultOfficerEmail,
      password: defaultPassword,
      role: UserRole.WILDLIFE_OFFICER,
      isGuest: false,
      mobile: '9988776655',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      taluk: 'Aranya Bhavan',
      village: 'Malleshwaram',
      landmark: 'Forest Dept HQ',
      pincode: '560003',
      designation: 'Chief Conservator'
    });
  }
};

export const getStoredUsers = (): UserWithPassword[] => {
  const data = localStorage.getItem(USERS_KEY);
  let users: UserWithPassword[] = data ? JSON.parse(data) : [];
  
  // Seed defaults on every load to ensure accessibility
  const initialCount = users.length;
  seedDefaultAccounts(users);
  
  if (users.length > initialCount) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  
  return users;
};

export const registerUser = (userData: Partial<UserWithPassword> & { password: string }): User => {
  const users = getStoredUsers();
  
  const normalizedEmail = userData.email?.trim().toLowerCase();
  const trimmedPassword = userData.password.trim();
  
  if (!normalizedEmail) throw new Error("Email is mandatory for registration.");
  if (trimmedPassword.length < 6) throw new Error("Password must be at least 6 characters.");

  const existingUser = users.find(u => u.email === normalizedEmail);
  if (existingUser) {
    throw new Error(`The email "${normalizedEmail}" is already registered. Please sign in.`);
  }

  const newUser: UserWithPassword = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: userData.name!.trim(),
    email: normalizedEmail,
    password: trimmedPassword, 
    role: userData.role!,
    state: userData.state!,
    district: userData.district!,
    taluk: userData.taluk!,
    village: userData.village!,
    landmark: userData.landmark!,
    pincode: userData.pincode!,
    mobile: userData.mobile!.trim(),
    altMobile: userData.altMobile?.trim(),
    isGuest: false
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const { password: _, ...userSafe } = newUser;
  return userSafe as User;
};

export const loginUser = (email: string, password: string, role: UserRole): User => {
  // Ensure we are working with the latest seeded database
  const users = getStoredUsers();
  
  // Clean inputs strictly
  const normalizedEmail = (email || "").trim().toLowerCase();
  const trimmedPassword = (password || "").trim();
  
  if (!normalizedEmail) throw new Error("Please enter your email.");
  if (!trimmedPassword) throw new Error("Please enter your password.");

  // 1. Search for user
  const user = users.find(u => u.email === normalizedEmail);

  if (!user) {
    throw new Error(`Account not found: "${normalizedEmail}". Ensure you have registered this specific email.`);
  }

  // 2. Password Check
  if (user.password !== trimmedPassword) {
    throw new Error("Incorrect password. Please verify your credentials.");
  }

  // 3. Role Check
  if (user.role !== role) {
    const roleName = user.role === UserRole.CITIZEN ? 'Citizen' : 'Wildlife Officer';
    throw new Error(`This account is registered as a ${roleName}. Please switch to the correct tab above.`);
  }

  // Session Management
  const { password: _, ...userSafe } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSafe));
  return userSafe as User;
};

export const loginAsGuest = (role: UserRole): User => {
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
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
  return guestUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const updateUserProfile = (userId: string, updates: Partial<User>): User => {
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) throw new Error("User not found.");
  
  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const { password: _, ...userSafe } = updatedUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSafe));
  return userSafe as User;
}
