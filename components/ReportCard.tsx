
import React, { useState, useRef } from 'react';
import { SightingReport, UserRole, RescueStatus } from '../types';
import { UI_TEXT as t } from '../constants';
import { 
  Download, 
  Edit, 
  X, 
  Camera, 
  ShieldCheck, 
  Phone, 
  AlertCircle,
  Skull,
  Zap,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Building,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { generateReportPDF } from '../services/pdfService';

interface ReportCardProps {
  report: SightingReport;
  role: UserRole;
  onUpdateStatus: (id: string, status: RescueStatus, notes: string, rescueImgs?: string[]) => void;
  onDeleteReport?: (id: string, reason: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, role, onUpdateStatus, onDeleteReport }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [newStatus, setNewStatus] = useState(report.status);
  const [notes, setNotes] = useState(report.officerNotes || '');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOfficer = role === UserRole.WILDLIFE_OFFICER;
  const needsProof = newStatus === RescueStatus.RESCUED || newStatus === RescueStatus.RELEASED;
  const isFalseAlarm = newStatus === RescueStatus.FALSE_ALARM;

  const currentProofImgs = report.rescueImageUrls || [];
  const isSubmitDisabled = (needsProof && proofImages.length === 0 && currentProofImgs.length === 0) || (isFalseAlarm && !notes.trim());

  const handleSave = () => {
    if (needsProof && proofImages.length === 0 && currentProofImgs.length === 0) {
      setError("At least one evidence photo is required.");
      return;
    }
    onUpdateStatus(report.id, newStatus, notes, proofImages.length > 0 ? proofImages : undefined);
    setIsEditing(false);
    setProofImages([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const readers = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(results => setProofImages(prev => [...prev, ...results]));
    }
  };

  const getStatusStyles = (status: RescueStatus) => {
    switch (status) {
      case RescueStatus.PENDING: return 'bg-red-50 text-red-700 border-red-100';
      case RescueStatus.ASSIGNED: return 'bg-amber-50 text-amber-700 border-amber-100';
      case RescueStatus.RESCUED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case RescueStatus.RELEASED: return 'bg-blue-50 text-blue-700 border-blue-100';
      case RescueStatus.FALSE_ALARM: return 'bg-stone-100 text-stone-500 border-stone-200';
      default: return 'bg-stone-50 text-stone-600 border-stone-100';
    }
  };

  const imagesToShow = report.imageUrls || [];

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up`}>
      {/* Image Section with Ambient Backdrop */}
      <div className="lg:w-[350px] xl:w-[400px] bg-stone-950 h-[280px] sm:h-[350px] lg:h-auto flex items-center justify-center relative group overflow-hidden shrink-0">
        {imagesToShow.length > 0 ? (
          <>
            {/* Blurred Background Layer */}
            <img 
              src={imagesToShow[activeImgIdx]} 
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110" 
              alt="Blurred Background"
            />
            {/* Main Sharp Image Layer */}
            <img 
              src={imagesToShow[activeImgIdx]} 
              alt="Sighting" 
              className="relative z-10 w-full h-full object-contain transition-all duration-700 drop-shadow-2xl p-4" 
            />
            
            {imagesToShow.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => setActiveImgIdx(prev => (prev - 1 + imagesToShow.length) % imagesToShow.length)} className="p-2 sm:p-3 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 transition-all hover:scale-110"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                <button onClick={() => setActiveImgIdx(prev => (prev + 1) % imagesToShow.length)} className="p-2 sm:p-3 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 transition-all hover:scale-110"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {imagesToShow.map((_, i) => (
                <button key={i} onClick={() => setActiveImgIdx(i)} className={`h-1.5 rounded-full transition-all ${i === activeImgIdx ? 'bg-white w-5' : 'bg-white/30 w-1.5 hover:bg-white/50'}`} />
              ))}
            </div>
          </>
        ) : (
          <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-stone-800" />
        )}
        <div className={`absolute top-4 sm:top-6 left-4 sm:left-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(report.status)} shadow-2xl backdrop-blur-md z-30`}>
          {report.status}
        </div>
      </div>

      <div className="flex-1 p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-10">
        <div className="flex flex-col gap-4 sm:gap-8">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
              <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 sm:px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">ID: {report.id}</span>
              <span className={`px-2 sm:px-4 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase border ${report.riskLevel === 'Immediate danger' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600'}`}>
                {report.riskLevel}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 dark:text-white tracking-tight leading-tight">{report.reptileData.name}</h3>
            <p className="text-stone-400 italic font-bold text-sm sm:text-lg mt-1">{report.reptileData.scientificName}</p>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase text-stone-300 tracking-widest mb-1">Encountered</p>
              <p className="text-sm font-black text-stone-900">{report.sightingTime}</p>
            </div>
          </div>
        </div>

        {/* Reporter Info Section */}
        <div className="flex flex-wrap gap-4 bg-amber-50 p-5 rounded-[2rem] border border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-amber-200 shadow-sm">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Reported By</p>
              <p className="text-sm font-black text-stone-800">{report.userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-amber-200 shadow-sm">
              <Phone className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Contact</p>
              <p className="text-sm font-black text-stone-800">{report.reporterMobile}</p>
              {report.reporterAltMobile && <p className="text-xs text-stone-500">{report.reporterAltMobile}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-stone-50 p-6 rounded-[2.5rem] border border-stone-100">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-stone-200 shrink-0 shadow-sm"><Building className="w-6 h-6 text-blue-600" /></div>
            <div>
               <p className="text-[10px] font-black uppercase text-stone-400 mb-1 tracking-widest">State & District</p>
               <p className="text-[13px] font-black text-stone-800">{report.location.state}</p>
               <p className="text-[12px] font-bold text-stone-600">{report.location.district}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-stone-200 shrink-0 shadow-sm"><MapPin className="w-6 h-6 text-emerald-600" /></div>
            <div>
               <p className="text-[10px] font-black uppercase text-stone-400 mb-1 tracking-widest">Location Details</p>
               <p className="text-[13px] font-black text-stone-800">{report.location.village}, {report.location.taluk}</p>
               <p className="text-[11px] text-stone-500 font-bold">Near: {report.location.landmark}</p>
               {report.location.pincode && <p className="text-[10px] text-stone-400 font-bold">PIN: {report.location.pincode}</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-stone-200 shrink-0 shadow-sm"><Zap className="w-6 h-6 text-amber-500" /></div>
            <div>
               <p className="text-[10px] font-black uppercase text-stone-400 mb-1 tracking-widest">Environment</p>
               <p className="text-[13px] font-black text-stone-800">{report.location.locationType}</p>
            </div>
          </div>
        </div>

        {(report.officerNotes || (report.rescueImageUrls && report.rescueImageUrls.length > 0)) && (
          <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
             <div className="flex items-center gap-4 mb-6 relative z-10">
               <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md"><ShieldCheck className="w-6 h-6 text-emerald-400" /></div>
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Official Deployment Log</h4>
             </div>
             <div className="flex flex-col gap-6 relative z-10">
                {report.rescueImageUrls && report.rescueImageUrls.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {report.rescueImageUrls.map((url, i) => (
                      <div key={i} className="w-32 h-32 rounded-[1.5rem] overflow-hidden border-4 border-emerald-500/20 shrink-0 shadow-2xl bg-black">
                        <img src={url} alt={`Evidence ${i+1}`} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-sm font-bold text-emerald-50/90 leading-relaxed italic border-l-4 border-emerald-500 pl-6 py-1">
                    "{report.officerNotes || 'No detailed remarks provided.'}"
                  </p>
                </div>
             </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-4 border-t border-stone-100">
           <button onClick={() => generateReportPDF(report)} className="flex-1 min-w-[200px] px-8 py-5 bg-white border-2 border-stone-200 text-stone-900 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-stone-50 transition-all"><Download className="w-5 h-5" /> Download Report</button>
           {isOfficer && !isEditing && !isDeleting && (
             <>
               <button onClick={() => setIsEditing(true)} className="flex-1 min-w-[150px] bg-stone-900 hover:bg-emerald-600 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl py-5"><Edit className="w-5 h-5" /> Update Status</button>
               <button onClick={() => setIsDeleting(true)} className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl py-5 px-6"><Trash2 className="w-5 h-5" /> Delete</button>
             </>
           )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className="mt-8 p-8 bg-red-50 rounded-[3rem] space-y-6 animate-in slide-in-from-bottom-6 border-2 border-red-200">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-4"><AlertTriangle className="w-5 h-5" /> DELETE REPORT</h4>
              <button onClick={() => { setIsDeleting(false); setDeleteReason(''); }} className="p-3 bg-white rounded-full text-stone-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="bg-red-100 p-4 rounded-2xl border border-red-200">
              <p className="text-xs font-bold text-red-700">⚠️ Warning: This action cannot be undone. The report will be permanently deleted.</p>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-red-600 ml-2">REASON FOR DELETION (Required)</label>
              <textarea 
                value={deleteReason} 
                onChange={e => setDeleteReason(e.target.value)} 
                placeholder="Please provide a detailed reason for deleting this report..." 
                className="w-full p-6 bg-white border-2 border-red-200 rounded-2xl text-sm font-medium min-h-[120px] outline-none focus:border-red-400" 
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => { setIsDeleting(false); setDeleteReason(''); }} 
                className="flex-1 py-5 bg-white text-stone-600 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest border-2 border-stone-200 hover:bg-stone-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (deleteReason.trim() && onDeleteReport) {
                    onDeleteReport(report.id, deleteReason);
                  }
                }} 
                disabled={!deleteReason.trim()}
                className={`flex-1 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                  deleteReason.trim() 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl cursor-pointer' 
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" /> Confirm Delete
              </button>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="mt-12 p-8 bg-stone-50 rounded-[3rem] space-y-10 animate-in slide-in-from-bottom-6 border border-stone-100 shadow-inner">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 flex items-center gap-4"><AlertCircle className="w-5 h-5" /> FIELD UPDATE INTERFACE</h4>
              <button onClick={() => setIsEditing(false)} className="p-3 bg-white rounded-full text-stone-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">RESCUE OPERATION STATUS</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="w-full p-5 bg-white border-2 border-stone-100 rounded-2xl text-xs font-black outline-none focus:border-emerald-500 shadow-sm">
                  {Object.values(RescueStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">FIELD PHOTOGRAPHS (EVIDENCE)</label>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {proofImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 shrink-0 bg-stone-950 rounded-xl overflow-hidden shadow-md">
                      <img src={img} className="w-full h-full object-contain" />
                      <button onClick={() => setProofImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {proofImages.length < 3 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 bg-white border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:border-emerald-300 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[8px] font-black mt-1">ADD</span>
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">FIELD OBSERVATIONS</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Detail the situation..." className="w-full p-8 bg-white border-2 border-stone-100 rounded-[2.5rem] text-sm font-medium min-h-[160px] outline-none focus:border-emerald-500 shadow-sm" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
            )}

            <button 
              onClick={handleSave}
              disabled={isSubmitDisabled}
              className={`w-full py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all ${isSubmitDisabled ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'}`}
            >
              Verify and Update Official Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
