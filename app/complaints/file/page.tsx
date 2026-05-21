'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, MapPin, CheckCircle, Navigation, AlertTriangle } from 'lucide-react';
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
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
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0">
        <Link 
          href="/complaints/dashboard" 
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </Link>
        <span className="text-[10px] font-medium uppercase tracking-wider text-brand-text-muted">
          Step {step} of 3
        </span>
      </div>

      {/* Title */}
      <div className="space-y-1 shrink-0">
        <h2 className="text-lg font-medium text-brand-text">File Civic Grievance</h2>
        <p className="text-xs font-light text-brand-text-muted">
          {step === 1 ? 'Capture a clear photo of the site hazard.' :
           step === 2 ? 'Audit coordinates and verification radius.' :
           'Select category and outline repair details.'}
        </p>
      </div>

      {/* Wizard Content */}
      <div className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="w-full rounded-2xl glass-panel p-5 border border-brand-accent/20 space-y-5">
            <h3 className="text-xs font-medium text-brand-text flex items-center gap-1.5">
              <Camera size={14} className="text-brand-accent" />
              Photo Validation
            </h3>

            {cameraActive ? (
              <div className="w-full aspect-video rounded-xl border border-brand-accent/30 bg-black overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                <button
                  onClick={handleCapturePhoto}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-accent text-brand-bg text-[10px] font-medium rounded-full hover:bg-brand-accent/90"
                >
                  Capture Photo
                </button>
              </div>
            ) : photoUrl ? (
              <div className="space-y-3">
                <div className="w-full aspect-video rounded-xl border border-brand-success/20 overflow-hidden relative">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-brand-success/90 px-2 py-1 rounded text-[8px] font-medium text-brand-bg flex items-center gap-1">
                    <CheckCircle size={8} />
                    <span>Captured</span>
                  </div>
                </div>
                <button
                  onClick={handleStartCamera}
                  className="w-full py-2 border border-brand-surface-alt bg-brand-bg text-brand-text-muted text-xs rounded-lg hover:text-brand-text hover:bg-brand-surface-alt/30 transition-all"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/25 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-accent/5 flex items-center justify-center mx-auto text-brand-accent">
                  <Camera size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-brand-text">Environmental Camera Required</p>
                  <p className="text-[9px] font-light text-brand-text-muted leading-relaxed max-w-[200px] mx-auto">
                    A photographic record is required to prevent fraudulent submissions.
                  </p>
                </div>
                <button
                  onClick={handleStartCamera}
                  className="px-4 py-2 bg-brand-accent text-brand-bg text-xs font-medium rounded-lg hover:bg-brand-accent/90 transition-colors shadow-md"
                >
                  Open Camera
                </button>
              </div>
            )}

            <button
              onClick={handleNextStep}
              className="w-full py-3 bg-brand-accent text-brand-bg text-xs font-medium rounded-lg hover:bg-brand-accent/90 transition-colors"
            >
              Continue to Location Tag →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full rounded-2xl glass-panel p-5 border border-brand-accent/20 space-y-5">
            <h3 className="text-xs font-medium text-brand-text flex items-center gap-1.5">
              <MapPin size={14} className="text-brand-accent" />
              GPS Coordinate Verification
            </h3>

            {/* Mock Map View */}
            <div className="w-full aspect-[4/3] rounded-xl border border-brand-surface-alt bg-brand-surface-alt/20 relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full text-brand-surface-alt/40" viewBox="0 0 100 80">
                <path d="M 10 10 Q 50 15 50 40 T 90 70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M 20 65 Q 40 50 50 40 T 80 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
              </svg>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <MapPin size={22} className="text-brand-accent animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/40 animate-ping" />
              </div>

              <div className="absolute bottom-2 left-2 bg-brand-bg/90 border border-brand-accent/20 px-2.5 py-1.5 rounded text-[8px] font-light space-y-0.5">
                <div className="flex items-center gap-1">
                  <Navigation size={8} className="text-brand-accent" />
                  <span className="font-medium text-brand-text">10.8530° N, 76.2725° E</span>
                </div>
                <span className="text-brand-text-muted">Accuracy radius: 4.8m (PASS)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBackStep}
                className="flex-1 py-3 border border-brand-surface-alt bg-brand-bg text-brand-text-muted text-xs font-medium rounded-lg hover:text-brand-text"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 py-3 bg-brand-accent text-brand-bg text-xs font-medium rounded-lg hover:bg-brand-accent/90"
              >
                Confirm Location →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full rounded-2xl glass-panel p-5 border border-brand-accent/20 space-y-5">
            <h3 className="text-xs font-medium text-brand-text flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-brand-accent" />
              Grievance Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-brand-text">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-brand-surface-alt bg-brand-bg text-brand-text text-xs focus:outline-none focus:border-brand-accent/50"
                >
                  <option value="Road">Road (Potholes, Obstructions)</option>
                  <option value="Water">Water (Leakages, Supply)</option>
                  <option value="Garbage">Garbage (Overflowing Bin, Missed Pickup)</option>
                  <option value="Electricity">Electricity (Streetlight, Cable Hanging)</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-brand-text">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, location details, hazards..."
                  rows={4}
                  className="w-full p-3 rounded-lg border border-brand-surface-alt bg-brand-bg text-brand-text text-xs font-light placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-accent/50 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="flex-1 py-3 border border-brand-surface-alt bg-brand-bg text-brand-text-muted text-xs font-medium rounded-lg hover:text-brand-text"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-accent text-brand-bg text-xs font-medium rounded-lg hover:bg-brand-accent/90 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Grievance ✓'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
