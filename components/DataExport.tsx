
import React, { useEffect, useMemo, useState } from 'react';
import { User, UserRole, RescueStatus, SightingReport } from '../types';
import { Download, Users, ClipboardList, Loader2, FileSpreadsheet, Shield, AlertTriangle, ListFilter, Search } from 'lucide-react';
import { exportUsersToCSV, exportReportsToCSV, exportReportsToCSVFiltered, exportUsersToCSVFiltered } from '../services/exportService';
import { useTheme } from '../contexts/ThemeContext';
import { firebaseSubscribeToReports } from '../services/firebaseReportService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

interface DataExportProps {
  user: User;
}

const DataExport: React.FC<DataExportProps> = ({ user }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [reports, setReports] = useState<SightingReport[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | RescueStatus>('ALL');
  const [role, setRole] = useState<'ALL' | UserRole>('ALL');
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState<'ALL' | UserRole>('ALL');
  const { isDark } = useTheme();

  const handleExportUsers = async () => {
    setIsExporting('users');
    try {
      await exportUsersToCSV();
      alert('Users exported successfully! Check your downloads folder.');
    } catch (err) {
      alert('Failed to export users');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportReports = async () => {
    setIsExporting('reports');
    try {
      await exportReportsToCSV();
      alert('Reports exported successfully! Check your downloads folder.');
    } catch (err) {
      alert('Failed to export reports');
    } finally {
      setIsExporting(null);
    }
  };

  useEffect(() => {
    const unsub = firebaseSubscribeToReports((r) => setReports(r), undefined, UserRole.WILDLIFE_OFFICER);
    return () => unsub && unsub();
  }, []);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as User[];
      setUsers(list);
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reports.filter((r) => {
      const statusOk = status === 'ALL' ? true : r.status === status;
      const roleOk = role === 'ALL' ? true : r.reporterRole === role;
      if (!term) return statusOk && roleOk;
      const text = [
        r.id,
        r.userName,
        r.reptileData?.name,
        r.reptileData?.scientificName,
        r.location?.state,
        r.location?.district,
        r.location?.taluk,
        r.location?.village,
        r.location?.landmark
      ].filter(Boolean).join(' ').toLowerCase();
      return statusOk && roleOk && text.includes(term);
    });
  }, [reports, search, status, role]);

  const handleDownloadFiltered = () => {
    if (!filtered.length) {
      alert('No data to export for current filters');
      return;
    }
    exportReportsToCSVFiltered(filtered);
  };

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return users.filter(u => {
      const roleOk = userRole === 'ALL' ? true : u.role === userRole;
      if (!term) return roleOk;
      const text = [
        u.name, u.email, u.mobile, u.state, u.district, u.taluk, u.village, u.landmark, u.designation
      ].filter(Boolean).join(' ').toLowerCase();
      return roleOk && text.includes(term);
    });
  }, [users, userSearch, userRole]);

  const handleDownloadFilteredUsers = () => {
    if (!filteredUsers.length) {
      alert('No users to export for current filters');
      return;
    }
    exportUsersToCSVFiltered(filteredUsers as any[]);
  };

  // Check if user has access
  if (user.role !== UserRole.WILDLIFE_OFFICER || user.isGuest) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className={`rounded-2xl sm:rounded-[3rem] shadow-2xl overflow-hidden border ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 sm:p-10 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Access Restricted</h2>
            <p className="text-red-100 text-sm sm:text-base font-medium">This feature is only available for Wildlife Officers</p>
          </div>
          <div className="p-6 sm:p-10 text-center">
            <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Data export functionality requires a verified Wildlife Officer account. 
              Please login with an officer account to access administrative tools.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Header Card */}
      <div className={`rounded-2xl sm:rounded-[3rem] shadow-2xl overflow-hidden border-2 border-amber-200 dark:border-amber-800 ${isDark ? 'bg-stone-900' : 'bg-white'}`}>
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center animate-pulse-glow">
              <Download className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">Data Export Center</h1>
              <p className="text-amber-100 text-sm sm:text-base font-medium">Administrative tools for data management</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          {/* Info Section */}
          <div className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl mb-8 ${isDark ? 'bg-stone-800 border border-stone-700' : 'bg-stone-50 border border-stone-100'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-2.5 sm:p-3 rounded-xl ${isDark ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div>
                <h3 className={`font-black text-sm sm:text-base mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>CSV Export Format</h3>
                <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Export all data to CSV files that can be opened in Microsoft Excel, Google Sheets, LibreOffice Calc, or any spreadsheet application for analysis and reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Export Users Card */}
            <div className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all hover:shadow-xl ${isDark ? 'bg-stone-800 border-stone-700 hover:border-amber-600' : 'bg-white border-stone-100 hover:border-amber-300'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className={`font-black text-base sm:text-lg ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>User Database</h3>
                  <p className={`text-[10px] sm:text-xs font-medium ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>All registered citizens & officers</p>
                </div>
              </div>
              <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Export complete user information including contact details, locations, and registration data.
              </p>
              <button 
                onClick={handleExportUsers}
                disabled={isExporting !== null}
                className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting === 'users' ? (
                  <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Exporting...</>
                ) : (
                  <><Download className="w-4 h-4 sm:w-5 sm:h-5" /> Export All Users</>
                )}
              </button>
            </div>

            {/* Export Reports Card */}
            <div className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all hover:shadow-xl ${isDark ? 'bg-stone-800 border-stone-700 hover:border-orange-600' : 'bg-white border-stone-100 hover:border-orange-300'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className={`font-black text-base sm:text-lg ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Sighting Reports</h3>
                  <p className={`text-[10px] sm:text-xs font-medium ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>All wildlife encounter reports</p>
                </div>
              </div>
              <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Export all sighting reports with species data, locations, danger levels, and rescue status.
              </p>
              <button 
                onClick={handleExportReports}
                disabled={isExporting !== null}
                className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:from-orange-600 hover:to-red-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting === 'reports' ? (
                  <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Exporting...</>
                ) : (
                  <><Download className="w-4 h-4 sm:w-5 sm:h-5" /> Export All Reports</>
                )}
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className={`mt-8 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-start gap-3 ${isDark ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50 border border-emerald-100'}`}>
            <Shield className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <p className={`text-[10px] sm:text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              <span className="font-black">Security Notice:</span> Exported data contains sensitive information. Handle according to your department's data protection policies.
            </p>
          </div>
        </div>
      </div>
      {/* Live Data Section */}
      <div className="mt-6 sm:mt-8">
        <div className={`rounded-2xl sm:rounded-[2rem] shadow-2xl border ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-2">
                <ListFilter className={`w-5 h-5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`} />
                <span className={`font-black text-sm ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Live Data</span>
              </div>
              <div className="flex-1" />
              <button
                onClick={handleDownloadFiltered}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:from-emerald-700 hover:to-emerald-600 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> Download Filtered CSV
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                <Search className={`w-4 h-4 ${isDark ? 'text-stone-300' : 'text-stone-700'}`} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, name, location"
                  className={`w-full bg-transparent text-sm outline-none ${isDark ? 'text-stone-100 placeholder-stone-500' : 'text-stone-800 placeholder-stone-400'}`}
                />
              </div>
              <div className={`px-3 py-2 rounded-xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className={`w-full bg-transparent text-sm outline-none ${isDark ? 'text-stone-100' : 'text-stone-800'}`}
                >
                  <option value="ALL">All Status</option>
                  <option value={RescueStatus.PENDING}>Pending</option>
                  <option value={RescueStatus.ASSIGNED}>Assigned</option>
                  <option value={RescueStatus.RESCUED}>Rescued</option>
                  <option value={RescueStatus.RELEASED}>Released</option>
                  <option value={RescueStatus.FALSE_ALARM}>False Alarm</option>
                </select>
              </div>
              <div className={`px-3 py-2 rounded-xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className={`w-full bg-transparent text-sm outline-none ${isDark ? 'text-stone-100' : 'text-stone-800'}`}
                >
                  <option value="ALL">All Roles</option>
                  <option value={UserRole.CITIZEN}>Citizen</option>
                  <option value={UserRole.WILDLIFE_OFFICER}>Wildlife Officer</option>
                </select>
              </div>
              <div className={`px-3 py-2 rounded-xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                <div className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>Showing {filtered.length} of {reports.length}</div>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
              <table className="min-w-full text-sm">
                <thead className={`${isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'}`}>
                  <tr>
                    <th className="px-3 py-2 text-left font-bold">ID</th>
                    <th className="px-3 py-2 text-left font-bold">Citizen</th>
                    <th className="px-3 py-2 text-left font-bold">Name</th>
                    <th className="px-3 py-2 text-left font-bold">Scientific</th>
                    <th className="px-3 py-2 text-left font-bold">Status</th>
                    <th className="px-3 py-2 text-left font-bold">Risk</th>
                    <th className="px-3 py-2 text-left font-bold">District</th>
                    <th className="px-3 py-2 text-left font-bold">Time</th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-stone-900' : 'bg-white'}`}>
                  {filtered.map((r) => (
                    <tr key={r.id} className={`${isDark ? 'border-stone-800' : 'border-stone-100'} border-t`}>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{r.id}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{r.userName || '-'}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{r.reptileData?.name || '-'}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{r.reptileData?.scientificName || '-'}</td>
                      <td className={`px-3 py-2 font-bold ${r.status === RescueStatus.RESCUED ? 'text-emerald-600' : r.status === RescueStatus.PENDING ? 'text-orange-600' : isDark ? 'text-stone-300' : 'text-stone-700'}`}>{r.status}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{r.riskLevel}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{r.location?.district || '-'}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{typeof r.timestamp === 'number' ? new Date(r.timestamp).toLocaleString() : r.timestamp}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-stone-500 dark:text-stone-400" colSpan={8}>No matching reports</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 sm:mt-8">
        <div className={`rounded-2xl sm:rounded-[2rem] shadow-2xl border ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className={`w-5 h-5 ${isDark ? 'text-stone-300' : 'text-stone-700'}`} />
                <span className={`font-black text-sm ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Stakeholders</span>
              </div>
              <div className="flex-1" />
              <button
                onClick={handleDownloadFilteredUsers}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:from-amber-700 hover:to-orange-600 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> Download Filtered CSV
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                <Search className={`w-4 h-4 ${isDark ? 'text-stone-300' : 'text-stone-700'}`} />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, location"
                  className={`w-full bg-transparent text-sm outline-none ${isDark ? 'text-stone-100 placeholder-stone-500' : 'text-stone-800 placeholder-stone-400'}`}
                />
              </div>
              <div className={`px-3 py-2 rounded-xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className={`w-full bg-transparent text-sm outline-none ${isDark ? 'text-stone-100' : 'text-stone-800'}`}
                >
                  <option value="ALL">All Roles</option>
                  <option value={UserRole.CITIZEN}>Citizen</option>
                  <option value={UserRole.WILDLIFE_OFFICER}>Wildlife Officer</option>
                </select>
              </div>
              <div className={`px-3 py-2 rounded-xl border ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                <div className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>Showing {filteredUsers.length} of {users.length}</div>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
              <table className="min-w-full text-sm">
                <thead className={`${isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'}`}>
                  <tr>
                    <th className="px-3 py-2 text-left font-bold">Name</th>
                    <th className="px-3 py-2 text-left font-bold">Role</th>
                    <th className="px-3 py-2 text-left font-bold">District</th>
                    <th className="px-3 py-2 text-left font-bold">Mobile</th>
                    <th className="px-3 py-2 text-left font-bold">Email</th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-stone-900' : 'bg-white'}`}>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={`${isDark ? 'border-stone-800' : 'border-stone-100'} border-t`}>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{u.name}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{u.role}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{u.district}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{u.mobile}</td>
                      <td className={`px-3 py-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{u.email}</td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-stone-500 dark:text-stone-400" colSpan={5}>No matching stakeholders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
