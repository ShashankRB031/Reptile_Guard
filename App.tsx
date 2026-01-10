
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ReptileIdentifier from './components/ReptileIdentifier';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Settings from './components/Settings';
import DataExport from './components/DataExport';
import { UserRole, ReptileData, User, RescueStatus } from './types';
import { UI_TEXT as t } from './constants';
import { firebaseSaveReport } from './services/firebaseReportService';
import { firebaseGetCurrentUser, firebaseLogoutUser, onAuthChange } from './services/firebaseAuthService';
import { notifyOfficersAboutSighting } from './services/emailService';
import { useTheme } from './contexts/ThemeContext';
import { 
  AlertTriangle, 
  ArrowRight, 
  X, 
  CheckCircle, 
  ShieldAlert, 
  Info, 
  Skull, 
  Heart, 
  Zap, 
  Home, 
  Trees, 
  Wind,
  PhoneCall,
  Navigation,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [view, setView] = useState<'identify' | 'dashboard' | 'export' | 'settings'>('identify');
  const [identifiedData, setIdentifiedData] = useState<ReptileData | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isReporting, setIsReporting] = useState(false);
  const [reportForm, setReportForm] = useState({
    locationType: 'House' as any,
    riskLevel: 'Non-aggressive' as any,
    sightingTime: '',
    description: '',
    taluk: '', village: '', landmark: '', pincode: ''
  });

  const [refreshDashboard, setRefreshDashboard] = useState(0);

  // Listen for auth state changes
  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isAuthLoading) {
        console.log('Auth timeout - showing login page');
        setIsAuthLoading(false);
      }
    }, 5000); // 5 second timeout

    const unsubscribe = onAuthChange((user) => {
      console.log('Auth state changed:', user ? user.email : 'no user');
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        setReportForm(prev => ({ 
          ...prev, 
          taluk: user.taluk, 
          village: user.village, 
          landmark: user.landmark, 
          pincode: user.pincode 
        }));
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const handleLoginSuccess = async () => {
    const user = await firebaseGetCurrentUser();
    setCurrentUser(user);
    if (user) {
      setReportForm(prev => ({ 
        ...prev, 
        taluk: user.taluk, 
        village: user.village, 
        landmark: user.landmark, 
        pincode: user.pincode 
      }));
    }
  };

  const handleLogout = async () => { 
    await firebaseLogoutUser(); 
    setCurrentUser(null); 
    setView('identify'); 
    setIdentifiedData(null); 
  };

  const handleIdentification = (data: ReptileData, images: string[]) => {
    setIdentifiedData(data);
    setCurrentImages(images);
    setActiveImgIdx(0);
    setIsReporting(false);
    setReportForm(prev => ({ ...prev, sightingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
  };

  const handleSubmitReport = async () => {
    if (!identifiedData || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      const locationData = {
        state: currentUser.state, 
        district: currentUser.district, 
        taluk: reportForm.taluk,
        village: reportForm.village, 
        landmark: reportForm.landmark || currentUser.landmark, // Use input landmark or fallback to profile 
        pincode: reportForm.pincode,
        locationType: reportForm.locationType
      };

      // Save the report to Firebase
      await firebaseSaveReport(currentUser, identifiedData, {
        imageUrls: currentImages,
        sightingTime: reportForm.sightingTime,
        riskLevel: reportForm.riskLevel,
        location: locationData
      }, currentImages);
      
      // Send email notification to wildlife officers
      const notificationResult = await notifyOfficersAboutSighting(
        currentUser,
        identifiedData,
        locationData,
        reportForm.riskLevel,
        reportForm.sightingTime
      );
      
      // Show success message with notification status
      if (notificationResult.success) {
        alert(`Report saved successfully! ${notificationResult.message}`);
      } else {
        alert(`Report saved successfully! ${notificationResult.message}`);
      }
      
      setIdentifiedData(null);
      setCurrentImages([]);
      setIsReporting(false);
      setRefreshDashboard(prev => prev + 1);
      setView('dashboard');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'from-red-600 to-red-800 text-white';
      case 'High': return 'from-orange-500 to-orange-700 text-white';
      case 'Medium': return 'from-yellow-400 to-yellow-600 text-stone-900';
      default: return 'from-emerald-400 to-emerald-600 text-white';
    }
  };

  const { isDark } = useTheme();

  // Show loading while checking auth state
  if (isAuthLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-stone-900' : 'bg-[#F8F9FA]'}`}>
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className={`font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Loading ReptileGuard...</p>
      </div>
    );
  }

  if (!currentUser) return <LandingPage onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className={`min-h-screen pb-16 sm:pb-20 font-inter transition-colors ${isDark ? 'bg-stone-900' : 'bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50'}`}>
      <Navbar user={currentUser} onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-10">
        <div className="flex justify-center mb-6 sm:mb-10">
          <div className={`backdrop-blur-xl p-1 sm:p-1.5 rounded-2xl sm:rounded-[2rem] shadow-xl border inline-flex ${isDark ? 'bg-stone-800/90 border-stone-700' : 'bg-white/90 border-white/50'}`}>
            <TabBtn active={view === 'identify'} onClick={() => setView('identify')} label={t.identify} isDark={isDark} />
            <TabBtn active={view === 'dashboard'} onClick={() => setView('dashboard')} label={t.dashboard} isDark={isDark} />
            <TabBtn active={view === 'export'} onClick={() => setView('export')} label={t.dataExport} isDark={isDark} />
            <TabBtn active={view === 'settings'} onClick={() => setView('settings')} label={t.settings} isDark={isDark} />
          </div>
        </div>

        {view === 'identify' && (
          <div className="animate-fade-in-up">
            {!identifiedData ? (
              <ReptileIdentifier onIdentificationComplete={handleIdentification} />
            ) : (
              <div className="max-w-5xl mx-auto">
                <button onClick={() => setIdentifiedData(null)} className={`mb-4 sm:mb-6 flex items-center gap-2 transition-colors font-black text-[9px] sm:text-[10px] uppercase tracking-widest ${isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-900'}`}><ArrowRight className="w-4 h-4 rotate-180" /> Analyze Another</button>
                <div className={`rounded-[2rem] sm:rounded-[3rem] shadow-2xl border overflow-hidden ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-[45%] bg-stone-950 relative min-h-[350px] sm:min-h-[500px] group overflow-hidden">
                      {/* Ambient Backdrop Layers */}
                      <img 
                        src={currentImages[activeImgIdx]} 
                        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125" 
                        alt="Ambient background"
                      />
                      <img 
                        src={currentImages[activeImgIdx]} 
                        alt="Reptile" 
                        className="relative z-10 w-full h-full object-contain p-8 drop-shadow-2xl" 
                      />
                      
                      {currentImages.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-all z-20">
                          <button onClick={() => setActiveImgIdx(p => (p - 1 + currentImages.length) % currentImages.length)} className="p-3 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60"><ChevronLeft /></button>
                          <button onClick={() => setActiveImgIdx(p => (p + 1) % currentImages.length)} className="p-3 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60"><ChevronRight /></button>
                        </div>
                      )}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {currentImages.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeImgIdx ? 'bg-white w-4' : 'bg-white/30'}`} />)}
                      </div>
                      <div className={`absolute top-8 left-8 p-4 rounded-3xl shadow-2xl backdrop-blur-md flex items-center gap-3 border z-30 ${identifiedData.isVenomous ? 'bg-red-500/90 border-red-400' : 'bg-emerald-500/90 border-emerald-400'}`}>
                        {identifiedData.isVenomous ? <Skull className="w-6 h-6 text-white animate-pulse" /> : <Heart className="w-6 h-6 text-white" />}
                        <span className="text-white font-black text-xs uppercase">{identifiedData.isVenomous ? t.venomous : t.nonVenomous}</span>
                      </div>
                    </div>
                    <div className="flex-1 p-10 lg:p-14 space-y-10">
                      <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-4xl font-black text-stone-900 tracking-tighter">{identifiedData.name}</h3>
                            <p className="text-emerald-600 font-bold italic text-lg">{identifiedData.scientificName}</p>
                          </div>
                          <div className={`px-6 py-3 rounded-2xl bg-gradient-to-br shadow-lg ${getDangerColor(identifiedData.dangerLevel)}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{t.dangerLevel}</p>
                            <p className="text-xl font-black uppercase">{identifiedData.dangerLevel}</p>
                          </div>
                        </div>
                        <p className="text-stone-600 text-lg leading-relaxed font-medium">{identifiedData.description}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> {t.precautions}</h4>
                          <ul className="space-y-4">{identifiedData.precautions.map((p, i) => <li key={i} className="flex gap-4 text-sm font-bold text-stone-700"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> {p}</li>)}</ul>
                        </div>
                        <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 flex flex-col justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2"><Trees className="w-4 h-4" /> HABITAT</h4>
                          <p className="text-sm font-bold text-emerald-900 leading-relaxed">{identifiedData.habitat || "Found in various ecological niches."}</p>
                        </div>
                      </div>
                      {!isReporting ? (
                        <button onClick={() => setIsReporting(true)} className="w-full bg-stone-900 hover:bg-emerald-600 text-white p-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-2xl"><span>{t.report}</span><ArrowRight className="w-5 h-5" /></button>
                      ) : (
                        <div className="bg-stone-50 border border-stone-200 p-8 rounded-[3rem] space-y-8">
                          <div className="flex justify-between items-center"><h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> {t.submitReport}</h4><button onClick={() => setIsReporting(false)}><X className="w-5 h-5 text-stone-400" /></button></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-stone-400">ENCOUNTER SETTING</label><div className="grid grid-cols-2 gap-3">{[{id: 'House', icon: <Home />}, {id: 'Farm', icon: <Wind />}, {id: 'Road', icon: <Navigation />}, {id: 'Forest edge', icon: <Trees />}].map(item => <button key={item.id} onClick={() => setReportForm({ ...reportForm, locationType: item.id as any })} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${reportForm.locationType === item.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-white border-stone-100 text-stone-500'}`}>{item.icon}<span className="text-[10px] font-black uppercase">{item.id}</span></button>)}</div></div>
                            <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-stone-400">IMMEDIATE RISK LEVEL</label><select value={reportForm.riskLevel} onChange={e => setReportForm({ ...reportForm, riskLevel: e.target.value as any })} className="w-full p-5 bg-white border-2 border-stone-100 rounded-2xl text-xs font-black outline-none"><option value="Non-aggressive">Non-aggressive / Calm</option><option value="Immediate danger">Immediate Threat to People</option><option value="Injured animal">Injured / Sick Animal</option></select></div>
                            <div className="col-span-1 md:col-span-2 space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">SPECIFIC LANDMARK / LOCATION (OPTIONAL)</label>
                              <input 
                                type="text" 
                                value={reportForm.landmark} 
                                onChange={e => setReportForm({ ...reportForm, landmark: e.target.value })}
                                placeholder={`Default: ${currentUser.landmark || 'Your registered address'}`}
                                className="w-full p-5 bg-white border-2 border-stone-100 rounded-2xl text-xs font-bold outline-none placeholder:font-normal placeholder:text-stone-400 focus:border-emerald-500 transition-colors"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={handleSubmitReport} disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> SAVING...</> : <><PhoneCall className="w-4 h-4" /> SUBMIT REPORT</>}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {view === 'dashboard' && <Dashboard currentUser={currentUser} role={currentUser.role} refreshTrigger={refreshDashboard} />}
        {view === 'export' && <DataExport user={currentUser} />}
        {view === 'settings' && <Settings user={currentUser} onLogout={handleLogout} onProfileUpdate={(u) => setCurrentUser(u)} />}
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, isDark }: any) => (
  <button 
    onClick={onClick} 
    className={`px-4 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl sm:rounded-[1.8rem] text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105' 
        : isDark 
          ? 'text-stone-500 hover:text-stone-300 hover:bg-stone-700/50' 
          : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100/50'
    }`}
  >
    {label}
  </button>
);

export default App;
