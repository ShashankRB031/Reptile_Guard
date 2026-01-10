
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import { UI_TEXT as t } from '../constants';
import { Shield, User as UserIcon, LogOut, Bell, ShieldAlert, FileText, Edit3, Phone, Briefcase, Eye, Lock, Loader2, Moon, Sun, Mail, CheckCircle, X, KeyRound, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { firebaseUpdateUserProfile, firebaseSendPasswordReset, firebaseDeleteAccount } from '../services/firebaseAuthService';
import { useTheme } from '../contexts/ThemeContext';
import { INDIAN_LOCATIONS, STATES } from '../locationData';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  onProfileUpdate: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privateLocation, setPrivateLocation] = useState(false);
  
  // Reset Password States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState(user.email || '');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const { theme, toggleTheme, isDark } = useTheme();

  // Profile Form States
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [contact, setContact] = useState(user.mobile || '');
  const [altMobile, setAltMobile] = useState(user.altMobile || '');
  const [designation, setDesignation] = useState(user.designation || '');
  
  // Location States
  const [state, setState] = useState(user.state || '');
  const [district, setDistrict] = useState(user.district || '');
  const [taluk, setTaluk] = useState(user.taluk || '');
  const [village, setVillage] = useState(user.village || '');
  const [landmark, setLandmark] = useState(user.landmark || '');
  const [pincode, setPincode] = useState(user.pincode || '');

  const availableDistricts = useMemo(() => {
    return state ? INDIAN_LOCATIONS[state] || [] : [];
  }, [state]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
    setDistrict(''); // Reset district when state changes
  };

  const handleSaveProfile = async () => {
    if (user.isGuest) {
      alert("Guest users cannot update their profile.");
      return;
    }
    
    setIsSaving(true);
    try {
      const updated = await firebaseUpdateUserProfile(user.id, {
        name,
        email,
        mobile: contact,
        altMobile,
        designation,
        state,
        district,
        taluk,
        village,
        landmark,
        pincode
      });
      onProfileUpdate(updated);
      setIsEditing(false);
      
      // If email was changed, show a success message
      if (updated.email !== user.email) {
        alert("Profile updated successfully. Please use your new email for future logins.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address');
      return;
    }
    
    setIsResetting(true);
    setResetError(null);
    
    try {
      await firebaseSendPasswordReset(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (user.isGuest) {
      alert("Guest accounts cannot be deleted.");
      return;
    }

    setIsDeleting(true);
    try {
      setDeleteError(null);
      if (!deletePassword.trim()) {
        setDeleteError('Please enter your password to confirm.');
        setIsDeleting(false);
        return;
      }
      await firebaseDeleteAccount(deletePassword);
      onLogout(); // Log out after deletion
    } catch (error: any) {
      setDeleteError(error.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetSuccess(false);
    setResetError(null);
    setResetEmail(user.email || '');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in-up">
          <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-premium-lg max-w-md w-full overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 relative">
              <button 
                onClick={closeResetModal}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <KeyRound className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Reset Password</h3>
                  <p className="text-amber-100 text-sm font-medium">We'll send you a reset link</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              {resetSuccess ? (
                <div className="text-center py-6 animate-scale-in">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h4 className="text-xl font-black text-stone-800 dark:text-white mb-3">Check Your Email!</h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400 font-medium mb-2">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-sm font-black text-emerald-600 mb-4">{resetEmail}</p>
                  <p className="text-xs text-stone-400 mb-6">
                    Check your inbox and spam folder. The link expires in 1 hour.
                  </p>
                  <button 
                    onClick={closeResetModal}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all btn-press"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {resetError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl text-sm font-bold text-red-600 animate-shake">
                      {resetError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input 
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl text-sm font-bold outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      💡 Enter the email associated with your account. We'll send you a secure link to reset your password.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={closeResetModal}
                      className="flex-1 py-4 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleResetPassword}
                      disabled={isResetting}
                      className="flex-[2] py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isResetting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in-up">
          <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-premium-lg max-w-md w-full overflow-hidden animate-scale-in">
            <div className="bg-red-600 p-6 relative">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Delete Account</h3>
                  <p className="text-red-100 text-sm font-medium">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">Are you absolutely sure?</h4>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    This will permanently delete your profile, reports, and all associated data. You cannot recover this account.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-2xl text-xs font-bold text-red-600">
                  {deleteError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl text-sm font-bold outline-none focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                  ) : (
                    'Yes, Delete My Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-premium-lg border border-stone-100 dark:border-stone-800 overflow-hidden hover-lift transition-premium">
        
        <div className={`p-8 sm:p-12 ${user.role === UserRole.CITIZEN ? 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950' : 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900'} text-white relative overflow-hidden transition-colors`}>
           <Shield className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12 animate-spin-slow" />
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6 sm:gap-8">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 ${user.role === UserRole.CITIZEN ? 'bg-emerald-700/50 border-emerald-500/50' : 'bg-amber-700/50 border-amber-500/50'} rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-2xl border-2 overflow-hidden font-black text-2xl sm:text-3xl backdrop-blur-sm animate-float`}>
                   {user.isGuest ? 'G' : user.name.charAt(0)}
                </div>
                <div>
                   <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name}</h2>
                   <p className={`${user.role === UserRole.CITIZEN ? 'text-emerald-300' : 'text-amber-300'} font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] mt-1`}>
                     {user.role === UserRole.CITIZEN ? 'CITIZEN PROTECTOR' : (user.designation || 'CONSERVATION OFFICER')}
                   </p>
                </div>
              </div>
              
              {!user.isGuest && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 sm:px-6 py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/20 backdrop-blur-md btn-press"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
           </div>
        </div>

        <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
           <div className="space-y-6 animate-fade-in-up delay-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 px-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Account Details
              </h3>
              
              {isEditing ? (
                 <div className="space-y-6 bg-stone-50 dark:bg-stone-800 p-6 sm:p-8 rounded-[2rem] border border-stone-200 dark:border-stone-700 animate-scale-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="md:col-span-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2"><UserIcon className="w-3 h-3" /> Identity & Contact</h4>
                      </div>
                      <InputField label="Full Name" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Ex: Rajesh Kumar" />
                      <InputField label="Email Address" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="Ex: name@example.in" />
                      <InputField label="Mobile Number" value={contact} onChange={(e: any) => setContact(e.target.value)} placeholder="10-digit Mobile (e.g., 98765 43210)" />
                      <InputField label="Alternate Mobile" value={altMobile} onChange={(e: any) => setAltMobile(e.target.value)} placeholder="Optional" />
                      {user.role === UserRole.WILDLIFE_OFFICER && (
                        <div className="md:col-span-2">
                           <InputField label="Designation" value={designation} onChange={(e: any) => setDesignation(e.target.value)} />
                        </div>
                      )}

                      <div className="md:col-span-2 mt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2"><MapPin className="w-3 h-3" /> Location & Jurisdiction</h4>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">State</label>
                        <div className="relative">
                          <select 
                            value={state}
                            onChange={handleStateChange}
                            className="w-full px-4 py-3 sm:py-3.5 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-600 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all appearance-none"
                          >
                            <option value="">Select State</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">▼</div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">District</label>
                        <div className="relative">
                          <select 
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            disabled={!state}
                            className="w-full px-4 py-3 sm:py-3.5 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-600 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all appearance-none disabled:opacity-50"
                          >
                            <option value="">Select District</option>
                            {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">▼</div>
                        </div>
                      </div>

                      <InputField label="Taluk / Block" value={taluk} onChange={(e: any) => setTaluk(e.target.value)} />
                      <InputField label="Village / Area" value={village} onChange={(e: any) => setVillage(e.target.value)} />
                      <InputField label="Nearby Landmark" value={landmark} onChange={(e: any) => setLandmark(e.target.value)} />
                      <InputField label="Pincode" value={pincode} onChange={(e: any) => setPincode(e.target.value)} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                      <button onClick={() => setIsEditing(false)} className="sm:flex-1 py-4 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-stone-300 dark:hover:bg-stone-600 btn-press">Cancel</button>
                      <button onClick={handleSaveProfile} disabled={isSaving} className="sm:flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-emerald transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Updates'}
                      </button>
                    </div>
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                   <SettingsItem icon={<UserIcon className="w-5 h-5" />} label="Name" value={user.name} />
                   <SettingsItem icon={<FileText className="w-5 h-5" />} label="Email" value={user.email || 'N/A'} />
                   <SettingsItem icon={<Phone className="w-5 h-5" />} label="Mobile" value={user.mobile || 'N/A'} />
                   {user.altMobile && <SettingsItem icon={<Phone className="w-5 h-5" />} label="Alt Mobile" value={user.altMobile} />}
                   <SettingsItem icon={<ShieldAlert className="w-5 h-5" />} label="Role" value={user.role} />
                   <div className="sm:col-span-2 mt-2">
                     <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-start gap-3">
                       <MapPin className="w-5 h-5 text-stone-400 mt-0.5" />
                       <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Registered Location</p>
                         <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                           {user.landmark}, {user.village}<br/>
                           {user.taluk}, {user.district}<br/>
                           {user.state} - {user.pincode}
                         </p>
                       </div>
                     </div>
                   </div>
                </div>
              )}
           </div>

           <div className="space-y-6 animate-fade-in-up delay-200">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 px-2 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Privacy & App Behavior
              </h3>
              <div className="bg-stone-50 dark:bg-stone-800 p-4 sm:p-6 rounded-[2rem] border border-stone-200 dark:border-stone-700 space-y-3 sm:space-y-4">
                 <ToggleItem 
                   icon={isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} 
                   label="Dark Mode" 
                   active={isDark} 
                   onToggle={toggleTheme} 
                 />
                 <ToggleItem 
                   icon={<Bell className="w-4 h-4" />} 
                   label="Safety Alerts" 
                   active={notifications} 
                   onToggle={() => setNotifications(!notifications)} 
                 />
                 <ToggleItem 
                   icon={<Eye className="w-4 h-4" />} 
                   label="Anonymous Sightings" 
                   active={privateLocation} 
                   onToggle={() => setPrivateLocation(!privateLocation)} 
                 />
              </div>
           </div>

           <div className="flex flex-col gap-3 sm:gap-4 animate-fade-in-up delay-300">
             <button 
               onClick={() => setShowResetModal(true)}
               disabled={user.isGuest}
               className="w-full py-5 sm:py-6 bg-gradient-to-r from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700 text-stone-700 dark:text-stone-300 rounded-[1.5rem] sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:from-stone-200 hover:to-stone-300 dark:hover:from-stone-700 dark:hover:to-stone-600 transition-all flex items-center justify-center gap-3 border border-stone-300 dark:border-stone-600 btn-press disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Lock className="w-4 h-4" /> Reset Password
             </button>
             <button 
               onClick={onLogout} 
               className="w-full py-5 sm:py-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 text-red-600 rounded-[1.5rem] sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:from-red-600 hover:to-red-700 hover:text-white transition-all shadow-xl shadow-red-900/5 flex items-center justify-center gap-3 group border border-red-200 dark:border-red-900 btn-press"
             >
               <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
             </button>
             
             {!user.isGuest && (
               <button 
                 onClick={() => setShowDeleteModal(true)}
                 className="w-full py-4 text-red-400 hover:text-red-600 dark:text-red-500/50 dark:hover:text-red-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-4"
               >
                 <Trash2 className="w-3 h-3" /> Delete Account Permanently
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">{label}</label>
    <input className="w-full px-4 py-3 sm:py-3.5 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-600 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all" {...props} />
  </div>
);

const SettingsItem = ({ icon, label, value }: any) => (
  <div className="flex flex-col p-4 sm:p-6 bg-stone-50 dark:bg-stone-800 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700 hover-lift transition-premium">
    <div className="flex items-center gap-2 sm:gap-3 mb-2">
      <div className="p-1.5 bg-white dark:bg-stone-900 rounded-lg shadow-sm text-emerald-600">{icon}</div>
      <span className="text-[8px] sm:text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-xs font-black text-stone-800 dark:text-stone-200 truncate">{value}</span>
  </div>
);

const ToggleItem = ({ icon, label, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700 transition-premium hover:shadow-md">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`p-1.5 sm:p-2 rounded-lg transition-all ${active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`}>
        {icon}
      </div>
      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">{label}</span>
    </div>
    <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${active ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-stone-300 dark:bg-stone-600'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export default Settings;
