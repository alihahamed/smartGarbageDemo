'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Play, Square, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Toast from '@/components/Toast';

export default function CollectorShift() {
  const router = useRouter();
  const [shiftStarted, setShiftStarted] = useState(false);
  const [gpsStamped, setGpsStamped] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync state with localStorage to persist across navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedShift = localStorage.getItem('sgcs_shift_started') === 'true';
      const storedGps = localStorage.getItem('sgcs_gps_stamped') === 'true';
      setShiftStarted(storedShift);
      setGpsStamped(storedGps);
    }
  }, []);

  const handleStartShift = async () => {
    try {
      setCameraActive(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setToastMessage('Webcam feed active. Take a check-in selfie to start shift.');
      setToastType('info');
    } catch (err) {
      console.warn('Camera access denied, using simulated checklist check-in.', err);
      // Fallback: mock starting the shift directly
      setShiftStarted(true);
      localStorage.setItem('sgcs_shift_started', 'true');
      setToastMessage('Simulated check-in successful. Shift started.');
      setToastType('success');
    }
  };

  const handleCaptureSelfie = () => {
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setShiftStarted(true);
    localStorage.setItem('sgcs_shift_started', 'true');
    setToastMessage('Selfie verified. Shift started successfully.');
    setToastType('success');
  };

  const handleStampGps = () => {
    if (!shiftStarted) {
      setToastMessage('Please start your shift first.');
      setToastType('warning');
      return;
    }
    setGpsStamped(true);
    localStorage.setItem('sgcs_gps_stamped', 'true');
    setToastMessage('GPS location stamped at Ward 1 boundary.');
    setToastType('success');
  };

  const handleEndShift = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setShiftStarted(false);
    setGpsStamped(false);
    localStorage.setItem('sgcs_shift_started', 'false');
    localStorage.setItem('sgcs_gps_stamped', 'false');
    setToastMessage('Shift ended. Daily summary logged.');
    setToastType('info');
  };

  return (
    <div className="flex-1 flex flex-col justify-start py-2 space-y-5">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType === 'success' ? 'success' : toastType === 'warning' ? 'warning' : 'info'} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Top Banner Section with Coral Orange Gradient & Curved Bottom */}
      <div className="-mx-4 -mt-8 px-8 pt-8 pb-6 rounded-b-[55px] bg-gradient-to-tr from-[#014BAA] via-[#014BAA] to-[#0A3366] shadow-lg shadow-[#FF5A36]/10 flex flex-col space-y-4">
        {/* Profile Header */}
        <div className="flex items-center justify-between gap-8 py-1 text-white">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
              <img 
                src="/avatar.png" 
                alt="Rajesh Kumar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-[16px] font-light text-white/80">Good morning!</p>
              <h2 className="text-[24px] font-medium text-white tracking-tight leading-none">Rajesh Kumar</h2>
            </div>
          </div>
          
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[12px] font-medium tracking-wider uppercase text-white/70">COLLECTOR ID</span>
            <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[12px] font-medium mt-1">
              #C042
            </span>
          </div>
        </div>

        {/* Shift Status Quick Indicator */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${shiftStarted ? 'bg-[#10B981] animate-ping' : 'bg-white/60'}`}></span>
            <span className="text-[14px] font-medium">
              {shiftStarted ? 'Shift In Progress' : 'Shift Not Started'}
            </span>
          </div>
          <span className="text-[14px] font-light text-white/80">Ward 1 • Route Crew</span>
        </div>

        {/* Main Action Hub */}
        <div className="w-full rounded-2xl glass-panel border border-white/10 overflow-hidden relative">
          {/* Camera Stream Overlay */}
          {cameraActive && (
            <div className="absolute inset-0 w-full h-full z-10 bg-black">
              <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline />
              <button
                onClick={handleCaptureSelfie}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-[#014BAA] shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150 cursor-pointer hover:opacity-95 z-20"
                aria-label="Verify Check-in Selfie"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#014BAA]">
                  <Camera size={16} />
                </span>
              </button>
            </div>
          )}

          {/* Card Content (always rendered to stabilize card height, invisible when camera is active) */}
          <div className={`p-5 flex flex-col space-y-5 text-brand-text ${cameraActive ? 'invisible pointer-events-none' : ''}`}>
            {!shiftStarted && (
              <div className="p-8 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/25 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-accent/5 flex items-center justify-center mx-auto text-brand-accent">
                  <Camera size={18} />
                </div>
                <p className="text-[14px] font-light text-brand-text-muted">
                  Start your shift by logging your selfie check-in and GPS coordinates.
                </p>
              </div>
            )}

            {shiftStarted && (
              <div className="p-8 rounded-xl border border-brand-success/20 bg-brand-success/5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-brand-success/15 flex items-center justify-center mx-auto text-brand-success">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-[20px] font-medium text-brand-text">Active Shift Checklist</p>
                <p className="text-[14px] font-light text-brand-text-muted">
                  Verified: Selfie Checked In • GPS Logged
                </p>
              </div>
            )}

            {/* Action Controls */}
            {!shiftStarted && (
              <div className="flex justify-center">
                <button
                  onClick={handleStartShift}
                  className="flex items-center gap-3 pl-6 pr-1.5 py-[3px] rounded-full bg-[#014BAA] text-white text-[15px] font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
                >
                  <span>Start Shift</span>
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF6F3] text-[#014BAA] min-h-[44px] min-w-[44px]">
                    <Play size={18} />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls for Active Shift (outside the white card, inside orange coral background) */}
        {shiftStarted && !cameraActive && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleStampGps}
              disabled={gpsStamped}
              className={`flex items-center justify-center gap-1.5 px-3 py-[11px] rounded-xl border text-[12px] font-medium transition-all ${
                gpsStamped
                  ? 'border-[#10B981]/30 bg-[#10B981]/25 text-white/90'
                  : 'border-white/20 bg-white/10 hover:bg-white/20 text-white active:scale-[0.98]'
              }`}
            >
              <MapPin size={16} />
              <span>{gpsStamped ? 'GPS Stamped' : 'Stamp GPS'}</span>
            </button>
            <button
              onClick={handleEndShift}
              className="flex items-center justify-center gap-1.5 px-3 py-[11px] rounded-xl border border-white/20 bg-white/10 text-white hover:bg-red-500/30 transition-all active:scale-[0.98] text-[12px] font-medium"
            >
              <Square size={16} />
              <span>End Shift</span>
            </button>
          </div>
        )}
      </div>

      {/* Below the banner */}
      {shiftStarted ? (
        <button
          onClick={() => router.push('/garbage/collector/map')}
          className="w-full relative overflow-hidden h-42 flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#014BAA]/12 shadow-sm hover:border-[#014BAA]/30 transition-all text-left group"
        >
          <div className="flex flex-col h-full justify-between z-10">
            <span className="text-[20px] font-medium text-black group-hover:underline">
              Daily Checklist & Map Route
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-[8px] rounded-full bg-[#014BAA] text-white text-[12px] font-medium transition-all group-hover:bg-[#0A3366] w-fit shadow-sm shadow-[#014BAA]/10">
              <span>Go to checklist</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
          
          {/* Route Map Icon in the bottom right */}
          <div className="absolute -bottom-6 -right-4 w-44 h-44 pointer-events-none group-hover:scale-105 transition-transform duration-300">
            <img src="/map-icon.png" alt="Map Route" className="w-full h-full object-contain" />
          </div>
        </button>
      ) : (
        /* Skeuomorphic Note for Municipal Anti-Fraud System */
        <div className="px-4 py-2 flex flex-col items-center">
          <div className="w-full max-w-[380px] bg-[#FCF7E6] border border-[#E5D7B5] rounded-lg shadow-[0_12px_24px_rgba(202,180,139,0.25)] p-6 relative rotate-[-1.5deg] hover:rotate-0 transition-all duration-300">
            {/* Skeuomorphic Tape Effect */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-white/40 backdrop-blur-[1px] border border-white/20 shadow-[0_2px_4px_rgba(0,0,0,0.02)] rotate-[1deg] z-10 flex items-center justify-center">
              <div className="w-full h-full border-x border-dashed border-black/5" />
            </div>

            {/* Note content */}
            <div className="space-y-4 text-[#5D4E37]">
              <div className="flex items-center justify-between border-b border-[#E5D7B5]/60 pb-2">
                <span className="text-[12px] font-medium tracking-wider uppercase opacity-80">
                  Municipal Notice
                </span>
                <span className="text-[12px] font-light opacity-60">
                  REF: #GCS-809
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-[16px] font-medium tracking-tight">
                  Anti-Fraud System Active
                </h4>
                <p className="text-[12px] font-light leading-relaxed">
                  Scanning resident household QR codes requires validation of collector coordinates matching a 15-meter range of the registered household address.
                </p>
                <p className="text-[12px] font-light leading-relaxed">
                  All GPS stamp checks are enforced in real-time. Discrepancies will be automatically flagged for administrative review.
                </p>
              </div>

              <div className="border-t border-[#E5D7B5]/60 pt-2 flex justify-between items-center text-[12px] font-light opacity-75">
                <span>Verification Authority</span>
                <span className="font-medium">Kerala GCS Dept.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
