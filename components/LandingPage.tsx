
import React, { useState } from 'react';
import { UserRole } from '../types';
import { firebaseLoginUser, firebaseRegisterUser, firebaseLoginAsGuest, firebaseSendPasswordReset } from '../services/firebaseAuthService';
import { Shield, User as UserIcon, AlertTriangle, Lock, Mail, Phone, MapPin, Building, Home, Hash, ArrowLeft, Loader2, CheckCircle, KeyRound } from 'lucide-react';
import { UI_TEXT as t } from '../constants';
import { INDIAN_LOCATIONS, STATES } from '../locationData';
import MarketingLanding from './MarketingLanding';

interface LandingPageProps {
  onLoginSuccess: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.CITIZEN);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobile: '', altMobile: '',
    state: '', district: '', taluk: '', village: '', landmark: '', pincode: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabSwitch = (role: UserRole) => {
    setActiveTab(role);
    setError(null);
  };

  const handleGuestLogin = () => {
    firebaseLoginAsGuest(activeTab);
    onLoginSuccess();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setResetEmailSent(false);
    
    try {
      if (!formData.email.trim()) {
        throw new Error('Please enter your email address.');
      }
      await firebaseSendPasswordReset(formData.email);
      setResetEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (authMode === 'login') {
        await firebaseLoginUser(formData.email, formData.password, activeTab);
        onLoginSuccess();
      } else {
        if (!formData.name || !formData.email || !formData.password || !formData.mobile || !formData.state || !formData.district || !formData.taluk || !formData.village || !formData.landmark || !formData.pincode) {
          throw new Error("All fields marked with * are mandatory.");
        }
        await firebaseRegisterUser({ ...formData, role: activeTab });
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showAuth) {
    return <MarketingLanding onGetStarted={() => setShowAuth(true)} />;
  }

  const availableDistricts = formData.state ? INDIAN_LOCATIONS[formData.state].sort() : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 font-inter">
      <header className="fixed w-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md z-50 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
           <div className="flex items-center space-x-2">
              <img src="/ReptileGuardLogo.png" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
              <span className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">{t.appTitle}</span>
           </div>
           <button 
            onClick={() => setShowAuth(false)}
            className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-all flex items-center gap-1.5 sm:gap-2"
           >
             <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Back to</span> Features
           </button>
        </div>
      </header>

      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-stone-100 mb-3 sm:mb-4">{authMode === 'login' ? t.welcomeBack : t.joinTheMission}</h2>
            <p className="text-sm sm:text-lg text-stone-500 dark:text-stone-400 font-medium">{t.heroSub}</p>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-[40px] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
             <div className="flex p-1.5 sm:p-2 bg-stone-50 dark:bg-stone-800/50 border-b dark:border-stone-700">
               <button 
                 onClick={() => handleTabSwitch(UserRole.CITIZEN)} 
                 className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all ${activeTab === UserRole.CITIZEN ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-sm' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
               >
                 {t.citizenMode}
               </button>
               <button 
                 onClick={() => handleTabSwitch(UserRole.WILDLIFE_OFFICER)} 
                 className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all ${activeTab === UserRole.WILDLIFE_OFFICER ? 'bg-white dark:bg-stone-900 text-amber-600 shadow-sm' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
               >
                 {t.officerMode}
               </button>
             </div>

             <div className="p-4 sm:p-8 lg:p-14">
               {error && (
                 <div className="mb-6 sm:mb-8 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-4 sm:p-5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black border border-red-100 dark:border-red-800 flex flex-col sm:flex-row items-start sm:items-center gap-2 animate-shake">
                   <div className="flex items-center">
                     <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 shrink-0" />
                     <span>{error}</span>
                   </div>
                   {(error.includes("create an account") || error.includes("register")) && authMode === 'login' && (
                     <button 
                       onClick={() => { setAuthMode('signup'); setError(null); }}
                       className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700 dark:hover:text-emerald-300 sm:ml-auto whitespace-nowrap"
                     >
                       Create Account
                     </button>
                   )}
                 </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                 {authMode === 'signup' ? (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                     <div className="space-y-4 sm:space-y-5">
                        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-700 pb-2">Identity & Contact</h4>
                        <InputField name="name" label="Full Name *" icon={<UserIcon className="w-4 h-4" />} value={formData.name} onChange={handleInputChange} placeholder="Ex: Rajesh Kumar" />
                        <InputField name="email" label="Email Address *" icon={<Mail className="w-4 h-4" />} type="email" value={formData.email} onChange={handleInputChange} placeholder="Ex: name@example.in" />
                        <InputField name="password" label="Password *" icon={<Lock className="w-4 h-4" />} type="password" value={formData.password} onChange={handleInputChange} placeholder="Minimum 6 characters" />
                        <InputField name="mobile" label="Mobile Number *" icon={<Phone className="w-4 h-4" />} value={formData.mobile} onChange={handleInputChange} placeholder="10-digit Mobile (e.g., 98765 43210)" />
                        <InputField name="altMobile" label="Alternate Mobile" icon={<Phone className="w-4 h-4" />} value={formData.altMobile} onChange={handleInputChange} placeholder="Optional" />
                     </div>
                     <div className="space-y-4 sm:space-y-5">
                        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-700 pb-2">Location Jurisdiction</h4>
                        <div className="space-y-1.5">
                          <label className="text-[9px] sm:text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 ml-1">State *</label>
                          <select name="state" value={formData.state} onChange={handleInputChange} className="w-full p-3 sm:p-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-stone-100 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all">
                             <option value="">Select State</option>
                             {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] sm:text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 ml-1">District *</label>
                          <select name="district" value={formData.district} onChange={handleInputChange} disabled={!formData.state} className="w-full p-3 sm:p-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-stone-100 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all disabled:opacity-50">
                             <option value="">Select District</option>
                             {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <InputField name="taluk" label="Taluk / Block *" icon={<Building className="w-4 h-4" />} value={formData.taluk} onChange={handleInputChange} placeholder="Your local Taluk" />
                        <InputField name="village" label="Village / Ward / Area *" icon={<Home className="w-4 h-4" />} value={formData.village} onChange={handleInputChange} placeholder="Locality Name" />
                        <InputField name="landmark" label="Nearby Landmark *" icon={<MapPin className="w-4 h-4" />} value={formData.landmark} onChange={handleInputChange} placeholder="Ex: Near Temple" />
                        <InputField name="pincode" label="Pincode *" icon={<Hash className="w-4 h-4" />} value={formData.pincode} onChange={handleInputChange} placeholder="6-digit Pincode" />
                     </div>
                   </div>
                 ) : (
                   <div className="max-w-md mx-auto space-y-5 sm:space-y-6">
                     {authMode === 'forgot' ? (
                       // Forgot Password Form
                       <>
                         <div className="text-center mb-6 sm:mb-8">
                           <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse-glow">
                             <KeyRound className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 dark:text-amber-400" />
                           </div>
                           <h3 className="text-lg sm:text-xl font-black text-stone-800 dark:text-stone-100 mb-2">Reset Your Password</h3>
                           <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">Enter your registered email and we'll send you a reset link</p>
                         </div>
                         
                         {resetEmailSent ? (
                           <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center animate-scale-in">
                             <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-3 sm:mb-4" />
                             <h4 className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300 mb-2">Reset Link Sent!</h4>
                             <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-3 sm:mb-4">
                               We've sent a password reset link to <span className="font-black">{formData.email}</span>
                             </p>
                             <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-500 mb-5 sm:mb-6">
                               Check your inbox and spam folder. The link expires in 1 hour.
                             </p>
                             <button 
                               onClick={() => { setAuthMode('login'); setResetEmailSent(false); setError(null); }}
                               className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:from-emerald-700 hover:to-emerald-600 transition-all"
                             >
                               Back to Login
                             </button>
                           </div>
                         ) : (
                           <>
                             <InputField name="email" label="Email Address" icon={<Mail className="w-4 h-4" />} type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your registered email" />
                             
                             <button 
                               type="button"
                               onClick={handleForgotPassword}
                               disabled={isLoading} 
                               className="w-full py-4 sm:py-5 rounded-xl sm:rounded-[2rem] bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl shadow-amber-600/30 transition-all flex justify-center items-center disabled:opacity-50 active:scale-95"
                             >
                               {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : "Send Reset Link"}
                             </button>
                             
                             <button 
                               type="button"
                               onClick={() => { setAuthMode('login'); setError(null); }}
                               className="w-full py-3.5 sm:py-4 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                             >
                               Back to Login
                             </button>
                           </>
                         )}
                       </>
                     ) : (
                       // Normal Login Form
                       <>
                         <div className="text-center mb-6 sm:mb-8">
                           <p className="text-[9px] sm:text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">Login to {activeTab === UserRole.CITIZEN ? 'Citizen Portal' : 'Officer Command'}</p>
                         </div>
                         <InputField name="email" label="Email" icon={<Mail className="w-4 h-4" />} value={formData.email} onChange={handleInputChange} placeholder="Your registered email" />
                         <InputField name="password" label="Password" icon={<Lock className="w-4 h-4" />} type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" />
                         
                         <div className="text-right">
                           <button 
                             type="button"
                             onClick={() => { setAuthMode('forgot'); setError(null); setResetEmailSent(false); }}
                             className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                           >
                             Forgot Password?
                           </button>
                         </div>
                       </>
                     )}
                   </div>
                 )}

                 {authMode !== 'forgot' && (
                   <button 
                     type="submit" 
                     disabled={isLoading} 
                     className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-[2rem] text-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl transition-all flex justify-center items-center ${activeTab === UserRole.CITIZEN ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-600/30' : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-amber-600/30'} disabled:opacity-50 active:scale-95`}
                   >
                      {isLoading ? "Verifying..." : (authMode === 'login' ? "Sign In Now" : "Register and Continue")}
                   </button>
                 )}
               </form>

               {authMode === 'login' && (
                 <button 
                   onClick={handleGuestLogin} 
                   className="w-full mt-4 sm:mt-5 py-4 sm:py-5 bg-gradient-to-r from-stone-900 to-stone-800 dark:from-stone-700 dark:to-stone-600 text-white rounded-xl sm:rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:from-stone-800 hover:to-stone-700 transition-all shadow-xl active:scale-95"
                 >
                   Instant Guest {activeTab === UserRole.CITIZEN ? 'Citizen' : 'Officer'} Access
                 </button>
               )}

               {authMode !== 'forgot' && (
                 <p className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
                   {authMode === 'login' ? "Don't have an account?" : "Already a member?"}
                   <button 
                     onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(null); }} 
                     className={`ml-2 font-black border-b-2 transition-all ${activeTab === UserRole.CITIZEN ? 'text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 hover:border-emerald-600' : 'text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800 hover:border-amber-600'}`}
                   >
                     {authMode === 'login' ? "Register Account" : "Login Now"}
                   </button>
                 </p>
               )}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const InputField: React.FC<any> = ({ label, icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">{icon}</div>
      <input className="w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-stone-100 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600 placeholder:font-medium" {...props} />
    </div>
  </div>
);

export default LandingPage;
