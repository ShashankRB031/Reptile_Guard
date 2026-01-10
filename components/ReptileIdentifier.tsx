
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertTriangle, Loader2, Zap, Info, Smartphone, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import { identifyReptile } from '../services/geminiService';
import { ReptileData } from '../types';
import { UI_TEXT as t } from '../constants';

interface ReptileIdentifierProps {
  onIdentificationComplete: (data: ReptileData, images: string[]) => void;
}

const ReptileIdentifier: React.FC<ReptileIdentifierProps> = ({ onIdentificationComplete }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const deviceInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error("Video play error:", err);
        setError("Could not start video playback.");
      });
    }
  }, [isCameraOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: false 
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err: any) {
      setError("Camera access denied. Please use the 'From Device' option.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        const pixelData = ctx.getImageData(0, 0, 10, 10).data;
        if (!Array.from(pixelData).some(val => val > 0)) {
          setError("Captured frame was empty.");
          return;
        }

        setImages([dataUrl]);
        stopCamera();
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const file = files[0];
      if (file) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        setImages([base64]);
      }
    }
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRunAnalysis = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const base64Datas = images.slice(0, 1).map(img => img.split(',')[1]);
      const data = await identifyReptile(base64Datas);
      onIdentificationComplete(data, images.slice(0, 1));
    } catch (err: any) {
      setError("Analysis failed. Try with a clearer image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerDeviceUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    deviceInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-[3rem] shadow-2xl p-4 sm:p-8 lg:p-12 max-w-2xl mx-auto border border-stone-100 dark:border-stone-800 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-10 gap-3 sm:gap-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl mr-3 sm:mr-4 animate-pulse-glow">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">Species Recognition</h2>
        </div>
        <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-stone-100 dark:border-stone-700">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 tracking-widest">Vision Engine v2.5</span>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="relative group border-4 border-dashed border-stone-100 dark:border-stone-700 rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-4 text-center bg-stone-50 dark:bg-stone-800/50 transition-all min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center overflow-hidden hover:border-emerald-200 dark:hover:border-emerald-700">
          {isCameraOpen ? (
            <div className="relative w-full h-[300px] sm:h-[450px] bg-stone-950 rounded-xl sm:rounded-[2rem] overflow-hidden animate-scale-in">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <button onClick={stopCamera} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all hover:scale-110"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
              <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
                <button onClick={capturePhoto} className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full border-4 border-white/50 active:scale-90 transition-transform hover:scale-105 shadow-lg">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-stone-900 m-auto"></div>
                </button>
              </div>
            </div>
          ) : images.length > 0 ? (
            <div className="w-full flex flex-col items-center animate-fade-in-up">
              <div className="w-full mb-6 sm:mb-8">
                <div className="relative aspect-square bg-stone-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  <img src={images[0]} className="w-full h-full object-cover" alt="Selected" />
                  <button 
                    onClick={() => removeImage(0)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full transition-all hover:bg-red-600 hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center py-8 sm:py-10">
                   <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-emerald-500 mb-3 sm:mb-4" />
                   <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 animate-pulse">Analyzing Image...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:gap-4 w-full px-2 sm:px-4">
                  <button 
                    onClick={handleRunAnalysis}
                    className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:shadow-emerald-500/25 hover:shadow-2xl"
                  >
                    Run Identification (1)
                  </button>
                  <button 
                    onClick={() => setImages([])}
                    className="w-full py-3 sm:py-4 bg-stone-200 dark:bg-stone-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Clear All & Retake
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 sm:py-12 w-full flex flex-col items-center animate-fade-in-up">
              <div className="bg-white dark:bg-stone-800 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-xl mb-6 sm:mb-8 border border-stone-100 dark:border-stone-700 relative animate-float">
                <Smartphone className="h-10 w-10 sm:h-14 sm:w-14 text-emerald-500" />
                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-gradient-to-br from-amber-500 to-orange-500 p-1.5 sm:p-2 rounded-full border-4 border-white dark:border-stone-800 animate-pulse">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
              <h3 className="text-stone-900 dark:text-stone-100 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4">Input Required</h3>
              <p className="text-stone-400 dark:text-stone-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest max-w-[260px] sm:max-w-[280px] leading-relaxed mb-8 sm:mb-10 text-center">Capture one clear photo for identification.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md px-2 sm:px-0">
                <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-stone-900 to-stone-800 dark:from-stone-700 dark:to-stone-600 hover:from-stone-800 hover:to-stone-700 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 hover:shadow-2xl"><Camera className="w-4 h-4 sm:w-5 sm:h-5" /> Capture Photo</button>
                <button onClick={triggerDeviceUpload} className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 hover:shadow-lg"><ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" /> From Device</button>
              </div>
            </div>
          )}
          <input type="file" ref={deviceInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] flex items-center border border-red-100 dark:border-red-800 animate-shake">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 mr-3 sm:mr-4 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold">{error}</span>
          </div>
        )}

        {!images.length && !isCameraOpen && (
          <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-4 sm:p-6 rounded-xl sm:rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800 flex gap-3 sm:gap-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-emerald-100 dark:bg-emerald-800 p-2 sm:p-2.5 rounded-lg sm:rounded-xl h-fit"><Info className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" /></div>
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-900/70 dark:text-emerald-300 italic">Stay safe. Keep 6 feet distance. Use a clear, well-lit photo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default ReptileIdentifier;
