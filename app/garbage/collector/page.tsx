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
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType === 'success' ? 'success' : toastType === 'warning' ? 'warning' : 'info'} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-[16px] font-medium text-brand-text flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${shiftStarted ? 'bg-brand-success animate-ping' : 'bg-brand-warning'}`}></span>
          GCS Collector Console
        </h2>
        <p className="text-[12px] font-light text-brand-text-muted">
          Rajesh Kumar • Daily Route Crew ID #C042
        </p>
      </div>

      {/* Main Action Hub */}
      <div className="w-full rounded-2xl glass-panel p-5 border border-brand-accent/20 flex flex-col space-y-5">
        <h3 className="text-[16px] font-medium text-brand-text flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-brand-accent" />
          Shift Controller
        </h3>

        {/* Video / Camera Placeholder */}
        {cameraActive && (
          <div className="w-full aspect-video rounded-xl border border-brand-accent/30 bg-black overflow-hidden relative">
            <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline />
            <button
              onClick={handleCaptureSelfie}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 pl-6 pr-1.5 py-[7px] rounded-full bg-[#014BAA] text-white text-[12px] font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20"
            >
              <span>Verify Check-in Selfie</span>
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF6F3] text-[#014BAA] min-h-[56px] min-w-[56px]">
                <Camera size={22} />
              </span>
            </button>
          </div>
        )}

        {!cameraActive && !shiftStarted && (
          <div className="p-8 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/25 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-brand-accent/5 flex items-center justify-center mx-auto text-brand-accent">
              <Camera size={18} />
            </div>
            <p className="text-[12px] font-light text-brand-text-muted">
              Start your shift by logging your selfie check-in and GPS coordinates.
            </p>
          </div>
        )}

        {shiftStarted && !cameraActive && (
          <div className="p-8 rounded-xl border border-brand-success/20 bg-brand-success/5 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-brand-success/15 flex items-center justify-center mx-auto text-brand-success">
              <ShieldCheck size={18} />
            </div>
            <p className="text-[16px] font-medium text-brand-text">Active Shift Checklist</p>
            <p className="text-[12px] font-light text-brand-text-muted">
              Verified: Selfie Checked In • GPS Logged
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3">
          {!shiftStarted ? (
            <div className="col-span-2 flex justify-center">
              <button
                onClick={handleStartShift}
                className="flex items-center gap-3 pl-6 pr-1.5 py-[7px] rounded-full bg-[#014BAA] text-white text-[16px] font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
              >
                <span>Start Shift</span>
                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF6F3] text-[#014BAA] min-h-[56px] min-w-[56px]">
                  <Play size={22} />
                </span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleStampGps}
                disabled={gpsStamped}
                className={`flex items-center justify-center gap-1.5 px-3 py-[11px] rounded-lg border text-[12px] font-medium transition-colors ${
                  gpsStamped
                    ? 'border-brand-success/30 bg-brand-success/10 text-brand-success'
                    : 'border-brand-accent/20 bg-brand-bg text-brand-accent hover:bg-brand-surface-alt'
                }`}
              >
                <MapPin size={16} />
                <span>{gpsStamped ? 'GPS Stamped' : 'Stamp GPS'}</span>
              </button>
              <button
                onClick={handleEndShift}
                className="flex items-center justify-center gap-1.5 px-3 py-[11px] rounded-lg border border-brand-warning/20 bg-brand-bg text-brand-warning text-[12px] font-medium hover:bg-brand-warning/10 transition-colors"
              >
                <Square size={16} />
                <span>End Shift</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* GPS Warning Box */}
      <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 flex items-start gap-3">
        <AlertCircle className="text-brand-accent shrink-0 mt-0.5" size={15} />
        <div className="space-y-0.5">
          <h4 className="text-[12px] font-medium text-brand-text">Municipal Anti-Fraud System</h4>
          <p className="text-[12px] font-light text-brand-text-muted leading-relaxed">
            Scanning resident houses requires validation of collector coordinates matching a 15-meter range of the household address.
          </p>
        </div>
      </div>

      {/* Proceed to map grid link */}
      {shiftStarted && (
        <button
          onClick={() => router.push('/garbage/collector/map')}
          className="w-full flex items-center justify-between py-[17px] px-4 rounded-xl glass-panel border border-brand-accent/25 hover:border-brand-accent/50 group transition-all text-left"
        >
          <div className="space-y-0.5">
            <span className="text-[16px] font-medium text-brand-accent group-hover:underline">
              Daily Checklist & Map Route
            </span>
            <p className="text-[12px] font-light text-brand-text-muted">
              Access the 20 pending households on today's route.
            </p>
          </div>
          <ArrowRight size={14} className="text-brand-accent group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
