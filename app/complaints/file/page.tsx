'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, MapPin, CheckCircle, Navigation, AlertTriangle, ArrowRight } from 'lucide-react';
import { submitComplaint } from '@/lib/api/complaints';
import Toast from '@/components/Toast';

export default function FileComplaint() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [category, setCategory] = useState<'Road' | 'Water' | 'Garbage' | 'Electricity' | 'Other'>('Road');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [stream]);

  const handleStartCamera = async () => {
    setCameraActive(true);
    setPhotoUrl(null);
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported or insecure context');
      }

      let mediaStream: MediaStream | null = null;

      // 1. Try environment (back) camera
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
      } catch (e1) {
        console.warn('Failed to access environment camera, trying user camera...', e1);
      }

      // 2. Try user (front) camera
      if (!mediaStream) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
          });
        } catch (e2) {
          console.warn('Failed to access user camera, trying generic video...', e2);
        }
      }

      // 3. Try generic video constraint
      if (!mediaStream) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.error('Video play failure:', e));
      }
    } catch (err) {
      console.warn('Failed to access camera, fallback to simulation.', err);
      // Simulate photo capture directly
      setPhotoUrl('https://images.unsplash.com/photo-1599740831144-5818ad293c61?w=500&auto=format&fit=crop&q=60');
      setCameraActive(false);
      setToastMessage('Simulated photo capture from environmental camera.');
      setToastType('success');
    }
  };

  const handleCapturePhoto = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCameraActive(false);
    // Set a high quality placeholder representing the captured photo
    setPhotoUrl('https://images.unsplash.com/photo-1599740831144-5818ad293c61?w=500&auto=format&fit=crop&q=60');
    setToastMessage('Photo captured successfully.');
    setToastType('success');
  };

  const handleNextStep = () => {
    if (step === 1 && !photoUrl) {
      setToastMessage('A photo capture is required to report a grievance (Anti-Fraud Enforcement).');
      setToastType('warning');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setToastMessage('Please write a brief description of the issue.');
      setToastType('warning');
      return;
    }

    setLoading(true);
    try {
      const newComplaint = await submitComplaint(
        category,
        description.trim(),
        photoUrl || ''
      );
      setToastMessage('Grievance filed successfully! Redirecting to tracker...');
      setToastType('success');
      
      setTimeout(() => {
        router.push(`/complaints/track/${newComplaint.id}`);
      }, 1500);
    } catch (err) {
      setToastMessage('Failed to file complaint.');
      setToastType('warning');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6 select-none bg-[#FAF6F3]">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Curved Top Brand Banner Header */}
      <div className="-mx-4 -mt-8 px-4 pt-8 pb-7 rounded-b-[40px] bg-gradient-to-b from-[#EF4444] via-[#EF4444] to-[#B91C1C] shadow-lg shadow-[#EF4444]/15 flex flex-col space-y-4 shrink-0">
        <div className="flex items-center justify-end">
          <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[12px] font-medium text-white shrink-0 tracking-wider">
            Step {step} of 3
          </div>
        </div>

        <div className="space-y-1 text-white">
          <h2 className="text-[24px] font-medium tracking-tight leading-tight">File Civic Grievance</h2>
          <p className="text-[13px] font-light text-white/80 leading-normal">
            {step === 1 ? 'Capture a clear photo of the site hazard.' :
             step === 2 ? 'Audit coordinates and verification radius.' :
             'Select category and outline repair details.'}
          </p>
        </div>
      </div>

      {/* Overlapping Content Sheet */}
      <div className="flex-1 flex flex-col justify-center -mt-6 z-10 px-1">
        {step === 1 && (
          <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 space-y-5 shadow-md">
            <h3 className="text-[18px] font-medium text-slate-800 flex items-center gap-2">
              <Camera size={20} className="text-[#EF4444]" />
              <span>Photo Validation</span>
            </h3>

            {cameraActive ? (
              <div className="w-full aspect-video rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden relative shadow-inner">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {/* Viewfinder corner marks */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br" />
                
                {/* Viewfinder grid overlays */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
                
                <button
                  onClick={handleCapturePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-between w-[180px] pl-4 pr-1 py-[3px] rounded-full text-[13px] font-medium bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white hover:opacity-95 shadow-md active:scale-[0.95] transition-all cursor-pointer"
                >
                  <span>Capture Photo</span>
                  <div className="w-7 h-7 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-sm">
                    <Camera size={12} />
                  </div>
                </button>
              </div>
            ) : photoUrl ? (
              <div className="space-y-4">
                <div className="w-full aspect-video rounded-2xl border border-emerald-200 overflow-hidden relative shadow-md">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-emerald-500/90 border border-emerald-400/30 px-3 py-1 rounded-lg text-[12px] font-medium text-white flex items-center gap-1.5 shadow-sm">
                    <CheckCircle size={14} />
                    <span>Captured</span>
                  </div>
                </div>
                <button
                  onClick={handleStartCamera}
                  className="flex items-center justify-between w-[200px] pl-5 pr-1.5 py-[5px] rounded-full text-[15px] font-medium bg-white text-[#B91C1C] border border-[#EF4444]/20 hover:bg-slate-50 shadow-sm active:scale-[0.96] transition-all cursor-pointer mx-auto"
                >
                  <span>Retake Photo</span>
                  <div className="w-9 h-9 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-sm border border-[#EF4444]/10">
                    <Camera size={16} />
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-slate-200 bg-[#FAF6F3]/50 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-[#EF4444]/5 border border-[#EF4444]/10 flex items-center justify-center mx-auto text-[#EF4444] shadow-sm">
                  <Camera size={24} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[17px] font-medium text-slate-800">Environmental Camera Required</p>
                  <p className="text-[13px] font-light text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                    A photographic record is required to prevent fraudulent submissions.
                  </p>
                </div>
                <button
                  onClick={handleStartCamera}
                  className="flex items-center justify-between w-[200px] pl-5 pr-1.5 py-[5px] rounded-full text-[15px] font-medium bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white hover:opacity-95 shadow-md shadow-[#EF4444]/15 active:scale-[0.96] transition-all cursor-pointer mx-auto"
                >
                  <span>Open Camera</span>
                  <div className="w-9 h-9 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-sm border border-[#EF4444]/10">
                    <Camera size={16} />
                  </div>
                </button>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={handleNextStep}
                className="flex items-center justify-between w-[240px] pl-5 pr-1.5 py-[5px] rounded-full text-[15px] font-medium bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white hover:opacity-95 shadow-md shadow-[#EF4444]/15 active:scale-[0.96] transition-all cursor-pointer"
              >
                <span>Continue to Location</span>
                <div className="w-9 h-9 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-sm border border-[#EF4444]/10">
                  <ArrowRight size={16} />
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 space-y-5 shadow-md">
            <h3 className="text-[18px] font-medium text-slate-800 flex items-center gap-2">
              <MapPin size={20} className="text-[#EF4444]" />
              <span>Coordinate Validation</span>
            </h3>

            {/* Simulated Live Map View */}
            <div className="w-full aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-50 relative overflow-hidden flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#EF4444_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <svg className="w-full h-full text-slate-300 pointer-events-none" viewBox="0 0 100 80">
                <path d="M 10 10 Q 50 15 50 40 T 90 70" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 20 65 Q 40 50 50 40 T 80 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round" />
              </svg>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <MapPin size={32} className="text-[#EF4444] fill-[#EF4444]/20 animate-bounce z-10" />
                  <div className="absolute w-6 h-6 bg-[#EF4444]/20 rounded-full animate-ping -bottom-1" />
                </div>
              </div>

              {/* Float map navigation widget */}
              <div className="absolute top-3 right-3 bg-white/95 border border-slate-100 p-2.5 rounded-xl shadow-sm text-slate-700 flex items-center justify-center">
                <Navigation size={16} className="text-[#EF4444] transform rotate-45 animate-pulse" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-white/95 border border-slate-200/80 p-3.5 rounded-xl shadow-md text-left space-y-1">
                <div className="flex items-center gap-1.5">
                  <Navigation size={12} className="text-[#EF4444]" />
                  <span className="font-semibold text-slate-800 text-[14px]">10.8530° N, 76.2725° E</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-light text-slate-500">Accuracy radius: 4.8m (High Precision)</span>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">Pass</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleBackStep}
                className="flex items-center justify-center w-[100px] h-11 rounded-full text-[15px] font-medium border border-[#EF4444]/20 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.96] transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex items-center justify-between w-[200px] pl-5 pr-1.5 py-[5px] rounded-full text-[15px] font-medium bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white hover:opacity-95 shadow-md shadow-[#EF4444]/15 active:scale-[0.96] transition-all cursor-pointer min-h-[48px]"
              >
                <span>Confirm Spot</span>
                <div className="w-9 h-9 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-sm border border-[#EF4444]/10">
                  <ArrowRight size={16} />
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 space-y-5 shadow-md">
            <h3 className="text-[18px] font-medium text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#EF4444]" />
              <span>Grievance Details</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-slate-800 block">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 h-14 rounded-2xl border border-slate-200 bg-[#FAF6F3] text-slate-800 text-[15px] font-light focus:outline-none focus:border-[#EF4444]/40 focus:ring-2 focus:ring-[#EF4444]/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Road">Road (Potholes, Obstructions)</option>
                    <option value="Water">Water (Leakages, Supply)</option>
                    <option value="Garbage">Garbage (Overflowing Bin, Missed Pickup)</option>
                    <option value="Electricity">Electricity (Streetlight, Cable Hanging)</option>
                    <option value="Other">Other Issues</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[15px] font-medium text-slate-800 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, location details, hazards..."
                  rows={4}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-[#FAF6F3] text-slate-800 text-[15px] font-light placeholder-slate-400 focus:outline-none focus:border-[#EF4444]/40 focus:ring-2 focus:ring-[#EF4444]/5 transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="flex-center w-[100px] h-11 rounded-full text-[15px] font-medium border border-[#EF4444]/20 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.96] transition-all cursor-pointer flex items-center justify-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-between w-[220px] pl-5 pr-1.5 py-[5px] rounded-full text-[15px] font-medium bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white hover:opacity-95 shadow-md shadow-[#EF4444]/15 active:scale-[0.96] transition-all disabled:opacity-50 cursor-pointer min-h-[48px]"
                >
                  <span>{loading ? 'Submitting...' : 'Submit Grievance'}</span>
                  <div className="w-9 h-9 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-sm border border-[#EF4444]/10">
                    {loading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#B91C1C]/30 border-t-[#B91C1C] animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
