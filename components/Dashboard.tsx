
import React, { useEffect, useState, useMemo } from 'react';
import { UserRole, SightingReport, RescueStatus, User } from '../types';
import { firebaseGetAllReports, firebaseGetUserReports, firebaseUpdateReportStatus, firebaseSubscribeToReports, firebaseDeleteReport } from '../services/firebaseReportService';
import ReportCard from './ReportCard';
import { UI_TEXT as t } from '../constants';
import { Inbox, ListFilter, AlertTriangle, Calendar, MapPin, ChevronDown, ChevronUp, Filter, Loader2 } from 'lucide-react';
import { INDIAN_LOCATIONS, STATES } from '../locationData';

interface DashboardProps {
  currentUser: User;
  role: UserRole;
  refreshTrigger: number;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, role, refreshTrigger }) => {
  const [reports, setReports] = useState<SightingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filterState, setFilterState] = useState(currentUser.state || '');
  const [filterDistrict, setFilterDistrict] = useState(role === UserRole.WILDLIFE_OFFICER ? currentUser.district : '');
  const [filterStatus, setFilterStatus] = useState<RescueStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'MY' | 'REGION'>(role === UserRole.WILDLIFE_OFFICER ? 'REGION' : 'MY');

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    setIsLoading(true);

    let timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    (async () => {
      try {
        const initial = role === UserRole.WILDLIFE_OFFICER
          ? await firebaseGetAllReports()
          : await firebaseGetUserReports(currentUser.id);
        setReports(initial);
        setIsLoading(false);
      } catch (e) {
        console.error(e);
      }
    })();

    const unsubscribe = firebaseSubscribeToReports(
      (updatedReports) => {
        setReports(updatedReports);
        setIsLoading(false);
      },
      currentUser.id,
      role,
      (error) => {
        console.error('Realtime subscription error:', error);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [currentUser.id, role, refreshTrigger]);

  const availableDistricts = useMemo(() => {
    return filterState ? INDIAN_LOCATIONS[filterState].sort() : [];
  }, [filterState]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (role === UserRole.CITIZEN) {
        if (r.userId !== currentUser.id) return false;
      } else {
        if (viewMode === 'MY' && r.userId !== currentUser.id) return false;
        if (viewMode === 'REGION') {
          if (filterState && r.location.state !== filterState) return false;
          if (filterDistrict && r.location.district !== filterDistrict) return false;
        }
      }
      if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
      const reportDate = new Date(r.timestamp);
      reportDate.setHours(0, 0, 0, 0);
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        if (reportDate < sDate) return false;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(0, 0, 0, 0);
        if (reportDate > eDate) return false;
      }
      return true;
    });
  }, [reports, role, currentUser.id, viewMode, filterState, filterDistrict, filterStatus, startDate, endDate]);

  const clearFilters = () => {
    setFilterState(currentUser.state);
    setFilterDistrict(role === UserRole.WILDLIFE_OFFICER ? currentUser.district : '');
    setFilterStatus('ALL');
    setStartDate('');
    setEndDate('');
  };

  const handleUpdateStatus = async (reportId: string, status: RescueStatus, notes?: string, rescueImages?: string[]) => {
    try {
      await firebaseUpdateReportStatus(reportId, status, notes, rescueImages, currentUser);
      // Real-time subscription will auto-update the reports
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleDeleteReport = async (reportId: string, reason: string) => {
    try {
      await firebaseDeleteReport(reportId, reason, currentUser);
      // Real-time subscription will auto-update the reports
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-40 animate-fade-in-up">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-stone-500 dark:text-stone-400 font-medium text-sm sm:text-base">Loading reports from cloud...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up">
      <div className="bg-white dark:bg-stone-800 p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border border-stone-100 dark:border-stone-700 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8">
        <div className="flex items-center gap-4 sm:gap-6">
           <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-4 sm:p-5 rounded-xl sm:rounded-[2rem] shadow-2xl">
              <ListFilter className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
           </div>
           <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
                {role === UserRole.WILDLIFE_OFFICER 
                  ? (viewMode === 'REGION' ? `Jurisdiction Oversight` : `Assigned Deployments`) 
                  : `Incident Dashboard`}
              </h2>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-stone-400 mt-1">
                {filteredReports.length} {filteredReports.length === 1 ? 'Report' : 'Reports'} Registered
              </p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {role === UserRole.WILDLIFE_OFFICER && (
            <div className="bg-stone-100 dark:bg-stone-700 p-1 sm:p-2 rounded-xl sm:rounded-2xl flex border border-stone-200 dark:border-stone-600 shadow-inner">
              <button 
                onClick={() => { setViewMode('REGION'); setFilterState(currentUser.state); setFilterDistrict(currentUser.district); }} 
                className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'REGION' ? 'bg-white dark:bg-stone-800 shadow-lg text-emerald-600' : 'text-stone-400'}`}
              >
                Global
              </button>
              <button 
                onClick={() => setViewMode('MY')} 
                className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'MY' ? 'bg-white dark:bg-stone-800 shadow-lg text-emerald-600' : 'text-stone-400'}`}
              >
                Personal
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center gap-2 sm:gap-3 ${showFilters ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-600' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'}`}
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hidden sm:inline">Refine</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-stone-800 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-stone-100 dark:border-stone-700 shadow-2xl animate-fade-in-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {role === UserRole.WILDLIFE_OFFICER && viewMode === 'REGION' && (
              <div className="space-y-4 md:col-span-3 pb-6 sm:pb-8 border-b border-stone-100 dark:border-stone-700">
                <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> REGIONAL FILTERS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[8px] sm:text-[9px] font-black uppercase text-stone-400 ml-1">Select State</label>
                    <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setFilterDistrict(''); }} className="w-full p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 rounded-xl text-xs font-bold outline-none">
                      <option value="">All Regions</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] sm:text-[9px] font-black uppercase text-stone-400 ml-1">Select District</label>
                    <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} disabled={!filterState} className="w-full p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 rounded-xl text-xs font-bold outline-none disabled:opacity-50">
                      <option value="">All Districts</option>
                      {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> CASE STATUS
              </h4>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-full p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 rounded-xl text-xs font-bold outline-none">
                <option value="ALL">All Categories</option>
                {Object.values(RescueStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> DATE RANGE
              </h4>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 rounded-xl text-xs font-bold outline-none" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 rounded-xl text-xs font-bold outline-none" />
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-stone-100 dark:border-stone-700 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
             <button onClick={clearFilters} className="px-6 sm:px-8 py-3 sm:py-4 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-stone-600 transition-all">Reset View</button>
             <button onClick={() => setShowFilters(false)} className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/20 hover:from-emerald-600 hover:to-emerald-700 transition-all">Apply Configuration</button>
          </div>
        </div>
      )}

      {filteredReports.length === 0 ? (
        <div className="text-center py-20 sm:py-40 bg-white dark:bg-stone-800 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-stone-700 animate-fade-in-up">
          <Inbox className="w-12 h-12 sm:w-16 sm:h-16 text-stone-200 dark:text-stone-600 mx-auto mb-4 sm:mb-6" />
          <h3 className="text-xl sm:text-2xl font-black text-stone-800 dark:text-stone-200">No Incidents Found</h3>
          <p className="text-stone-400 text-xs sm:text-sm mt-2 sm:mt-3 font-medium">No reports match your current configuration.</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {filteredReports.map((r, index) => (
            <div key={r.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in-up">
              <ReportCard 
                report={r} 
                role={role} 
                onUpdateStatus={handleUpdateStatus}
                onDeleteReport={handleDeleteReport}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
