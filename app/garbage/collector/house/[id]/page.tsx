'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserCheck, UserMinus, ShieldAlert, CheckCircle, Navigation, Camera, Smartphone, AlertTriangle } from 'lucide-react';
import { fetchResidents, updateHouseStatus, logPayment, House } from '@/lib/api/garbage';
import Toast from '@/components/Toast';
import Skeleton from '@/components/Skeleton';
import Modal from '@/components/Modal';

export default function HouseAction() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'none' | 'scanner' | 'payment' | 'photo'>('none');
  
  // Scanner state
  const [scannerStatus, setScannerStatus] = useState('Initializing QR scanner...');
  const [scannerMessage, setScannerMessage] = useState('Waiting for QR validation...');
  const [scannerSuccess, setScannerSuccess] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Photo state
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Payment form state
  const [cashAmount, setCashAmount] = useState('15');
  const [showCashInput, setShowCashInput] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');

  useEffect(() => {
    async function loadData() {
      try {
        const list = await fetchResidents();
        const found = list.find(h => h.id === id);
        if (found) {
          setHouse(found);
        } else {
          setToastMessage('Household not found.');
          setToastType('warning');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  // Clean up camera stream if active
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <Skeleton variant="profile" />
        <Skeleton variant="text" />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={24} className="text-brand-warning mb-2" />
        <p className="text-xs font-light text-brand-text-muted mb-4">Household records could not be resolved.</p>
        <Link href="/garbage/collector/map" className="text-xs text-brand-accent hover:underline">
          Return to Checklist
        </Link>
      </div>
    );
  }

  // Action paths
  const handleSomeoneHome = () => {
    setActiveModal('scanner');
    setScannerStatus('Searching for QR code...');
    setScannerMessage('Aim camera at the resident pass...');
    setScannerSuccess(false);

    // Simulate scanning and 15m GPS radius check
    timerRef.current = setTimeout(() => {
      setScannerStatus('Gps coordinates matched.');
      setScannerMessage(`Successfully validated Resident Pass ${house.houseNo}`);
      setScannerSuccess(true);

      timerRef.current = setTimeout(() => {
        setActiveModal('payment');
      }, 1000);
    }, 1800);
  };

  const handleNoOneHome = async () => {
    setActiveModal('photo');
    setPhotoCaptured(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Failed to access camera for door photo, using simulation.', err);
    }
  };

  const handleCaptureDoorPhoto = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setPhotoCaptured(true);
    
    // Log household as attempted
    const updated = await updateHouseStatus(house.id, 'attempted', {
      photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60'
    });
    setHouse(updated.find(h => h.id === house.id) || null);
    
    setToastMessage(`${house.houseNo} logged as ATTEMPTED. Photo stamp saved.`);
    setToastType('info');
    
    setTimeout(() => {
      setActiveModal('none');
    }, 1200);
  };

  const handleLogPayment = async (mode: 'Cash' | 'Online') => {
    const amountVal = Number(cashAmount);
    if (mode === 'Cash' && (!amountVal || amountVal <= 0)) {
      setToastMessage('Enter a valid collection amount.');
      setToastType('warning');
      return;
    }

    try {
      await logPayment(house.id, mode === 'Cash' ? amountVal : 15, mode);
      const list = await fetchResidents();
      setHouse(list.find(h => h.id === house.id) || null);
      
      setToastMessage(`${house.houseNo} marked DONE with ${mode} payment.`);
      setToastType('success');
      setActiveModal('none');
      
      setTimeout(() => {
        router.push('/garbage/collector/map');
      }, 1500);
    } catch (err) {
      setToastMessage('Failed to complete collection log.');
      setToastType('warning');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType === 'success' ? 'success' : 'warning'} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Back button */}
      <div>
        <Link 
          href="/garbage/collector/map" 
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Checklist</span>
        </Link>
      </div>

      {/* House Profile Header */}
      <div className="p-4 rounded-xl glass-panel border border-brand-accent/20 flex gap-4 items-center">
        <div className="w-12 h-12 rounded-xl bg-brand-accent/5 border border-brand-accent/20 flex items-center justify-center text-brand-accent text-lg font-medium shrink-0">
          {house.houseNo}
        </div>
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-sm font-medium text-brand-text truncate">{house.address}</h3>
          <div className="flex items-center gap-1.5 text-[11px] font-light text-brand-text-muted">
            <Navigation size={9} />
            <span>Ward 1 Route • Latitude Stamp 10.85"</span>
          </div>
        </div>
      </div>

      {/* House Collection Status Details */}
      <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 space-y-3">
        <h4 className="text-[11px] font-medium text-brand-text-muted uppercase tracking-wider">
          Household Audit Log
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-light">
            <span className="text-brand-text-muted">Status</span>
            <span className={`font-medium capitalize ${
              house.status === 'done' ? 'text-brand-success' :
              house.status === 'attempted' ? 'text-brand-warning' : 'text-brand-text'
            }`}>{house.status}</span>
          </div>
          {house.visitTimestamp && (
            <div className="flex justify-between text-xs font-light">
              <span className="text-brand-text-muted">Visit Checked</span>
              <span className="text-brand-text">{house.visitTimestamp}</span>
            </div>
          )}
          {house.paymentMode && (
            <div className="flex justify-between text-xs font-light">
              <span className="text-brand-text-muted">Payment Type</span>
              <span className="text-brand-text">{house.paymentMode}</span>
            </div>
          )}
          {house.amount && (
            <div className="flex justify-between text-xs font-light">
              <span className="text-brand-text-muted">Amount Settled</span>
              <span className="text-brand-accent font-medium">₹{house.amount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Actions Flow */}
      {house.status === 'pending' ? (
        <div className="space-y-3">
          <button
            onClick={handleSomeoneHome}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-brand-accent/20 bg-brand-accent/5 hover:bg-brand-accent/10 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-accent/10 text-brand-accent">
                <UserCheck size={16} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-brand-text">Someone Home</span>
                <p className="text-[11px] font-light text-brand-text-muted">Verify Resident QR & log payment.</p>
              </div>
            </div>
            <span className="text-brand-accent text-xs font-medium">Verify Pass →</span>
          </button>

          <button
            onClick={handleNoOneHome}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-brand-surface-alt bg-brand-bg hover:bg-brand-surface-alt/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-surface-alt text-brand-text-muted">
                <UserMinus size={16} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-brand-text">No One Home</span>
                <p className="text-[11px] font-light text-brand-text-muted">Log attendance attempt with photo.</p>
              </div>
            </div>
            <span className="text-brand-text-muted text-xs">Upload Photo →</span>
          </button>
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-brand-success/15 bg-brand-success/5 text-center space-y-2">
          <CheckCircle className="text-brand-success mx-auto" size={24} />
          <h3 className="text-xs font-medium text-brand-text">Household Processed</h3>
          <p className="text-[11px] font-light text-brand-text-muted max-w-[240px] mx-auto leading-relaxed">
            This residence is already logged for today's collection cycle.
          </p>
        </div>
      )}

      {/* 1. Modal: QR Scanner Simulator */}
      <Modal
        isOpen={activeModal === 'scanner'}
        onClose={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          setActiveModal('none');
        }}
        title="Validating Resident Pass"
        subtitle={house.houseNo}
      >
        <div className="flex flex-col items-center justify-center p-4 space-y-5 text-center">
          {/* Animated Glowing Scan Reticle */}
          <div className="w-40 h-40 rounded-xl border-2 border-brand-accent/40 bg-brand-surface-alt/35 flex items-center justify-center relative overflow-hidden">
            <Smartphone size={40} className="text-brand-accent/50 animate-bounce" />
            <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-accent shadow-[0_0_10px_#FF5A36] animate-[pulse_1.5s_infinite]" />
          </div>

          <div className="space-y-1">
            <p className={`text-xs font-medium ${scannerSuccess ? 'text-brand-success' : 'text-brand-text'}`}>
              {scannerStatus}
            </p>
            <p className="text-[11px] font-light text-brand-text-muted">
              {scannerMessage}
            </p>
          </div>
        </div>
      </Modal>

      {/* 2. Modal: Payment Selector */}
      <Modal
        isOpen={activeModal === 'payment'}
        onClose={() => setActiveModal('none')}
        title="Settle Collection Fee"
        subtitle={`${house.houseNo} • Monthly Fee: ₹15`}
      >
        <div className="space-y-4">
          <p className="text-xs font-light text-brand-text-muted leading-relaxed">
            Resident details match. Select a collection method to issue receipts and close route point.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleLogPayment('Online')}
              className="py-3 px-4 rounded-lg bg-brand-accent/10 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20 transition-all text-center flex flex-col items-center gap-1.5"
            >
              <Smartphone size={16} />
              <span className="text-xs font-medium">Online Paid</span>
              <span className="text-[11px] font-light opacity-80">Pre-settled online</span>
            </button>

            <button
              onClick={() => setShowCashInput(!showCashInput)}
              className="py-3 px-4 rounded-lg bg-brand-bg border border-brand-surface-alt text-brand-text hover:bg-brand-surface-alt/40 transition-all text-center flex flex-col items-center gap-1.5"
            >
              <UserCheck size={16} className="text-brand-text-muted" />
              <span className="text-xs font-medium">Collect Cash</span>
              <span className="text-[11px] font-light opacity-80">Collect at doorstep</span>
            </button>
          </div>

          {showCashInput && (
            <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-bg/40 space-y-3 animate-fade-in">
              <label className="text-[11px] font-medium text-brand-text uppercase tracking-wider block">
                Enter Cash Amount Collected (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-brand-surface-alt bg-brand-bg text-brand-text text-xs focus:outline-none focus:border-brand-accent/40"
                  placeholder="e.g. 15"
                />
                <button
                  onClick={() => handleLogPayment('Cash')}
                  className="px-4 bg-[#014BAA] hover:opacity-90 text-white text-xs font-medium rounded-lg"
                >
                  Confirm Cash
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 3. Modal: Door Photo Capture */}
      <Modal
        isOpen={activeModal === 'photo'}
        onClose={() => {
          if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
          setActiveModal('none');
        }}
        title="Unreachable Household Check-in"
        subtitle="Log door photo to verify location status"
      >
        <div className="space-y-4 text-center">
          <div className="w-full aspect-video rounded-xl border border-brand-surface-alt bg-black overflow-hidden relative flex items-center justify-center">
            {cameraStream ? (
              <video ref={videoRef} className="w-full h-full object-cover" playsInline />
            ) : (
              <div className="space-y-1">
                <Camera size={24} className="text-brand-text-muted mx-auto" />
                <span className="text-[11px] font-light text-brand-text-muted block">Simulating Camera Feed</span>
              </div>
            )}
          </div>

          <p className="text-[11px] font-light text-brand-text-muted leading-normal max-w-[300px] mx-auto">
            Ensure the locked house gate/door is fully visible in frame. GPS location stamp will be permanently locked on log.
          </p>

          <div className="flex justify-center w-full">
            <button
              onClick={handleCaptureDoorPhoto}
              className="flex items-center gap-3 pl-6 pr-1.5 py-1.5 rounded-full bg-[#014BAA] text-white text-xs font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
            >
              <span>Capture Photo & Log Attempt</span>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#FAF6F3] text-[#014BAA]">
                <Camera size={12} />
              </span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
