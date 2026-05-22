'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { UserCheck, UserMinus, CheckCircle, Navigation, Camera, Smartphone, AlertTriangle, Clock, MapPin, CreditCard, QrCode } from 'lucide-react';
import { fetchResidents, updateHouseStatus, logPayment, House } from '@/lib/api/garbage';
import Toast from '@/components/Toast';
import Skeleton from '@/components/Skeleton';
import Modal from '@/components/Modal';
import { Field, FieldLabel } from '@/components/ui/field';

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
        <p className="text-[13px] font-light text-brand-text-muted mb-4">Household records could not be resolved.</p>
        <Link href="/garbage/collector/map" className="text-[13px] text-brand-accent hover:underline">
          Return to Checklist
        </Link>
      </div>
    );
  }

  // Status helpers
  const statusConfig = {
    pending: { label: 'Pending', color: '#94A3B8', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
    done: { label: 'Collected', color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    attempted: { label: 'Attempted', color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  };
  const sc = statusConfig[house.status];

  // Action paths
  const handleSomeoneHome = () => {
    setActiveModal('scanner');
    setScannerStatus('Searching for QR code...');
    setScannerMessage('Aim camera at the resident pass...');
    setScannerSuccess(false);

    timerRef.current = setTimeout(() => {
      setScannerStatus('GPS coordinates matched.');
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
    <div className="flex-1 flex flex-col justify-start py-2 space-y-4">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType === 'success' ? 'success' : 'warning'} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* ── Blue Header Banner ── */}
      <div className="-mx-4 -mt-8 px-6 pt-8 pb-5 rounded-b-[40px] bg-gradient-to-br from-[#014BAA] via-[#014BAA] to-[#0A3366] shadow-lg shadow-[#014BAA]/10">
        {/* House number + status row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* House icon */}
            <div className="flex items-center justify-center overflow-hidden">
              <img src="/home-icon.png" alt="Home" className="w-15 h-15 object-contain" />
            </div>
            <div>
              <h2 className="text-[26px] font-medium text-white tracking-tight leading-none">{house.houseNo}</h2>
              <p className="text-[13px] font-light text-white/70 mt-0.5">Ward 1 Route</p>
            </div>
          </div>

          {/* Status pill */}
          <span className={`px-3 py-1.5 rounded-full text-[14px] font-medium ${sc.bg} ${sc.text} ${sc.border} border`}>
            {sc.label}
          </span>
        </div>

        {/* Address card */}
        <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1.5">
          <p className="text-[18px] font-medium text-white leading-snug">{house.address}</p>
          <div className="flex items-center gap-3 text-[12px] text-white/60">
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              Lat 10.85°N
            </span>
            <span className="flex items-center gap-1">
              <Navigation size={10} />
              GPS Verified
            </span>
          </div>
        </div>
      </div>

      {/* ── Audit Log (compact inline) ── */}
      <div className="p-4 rounded-xl border border-[#014BAA]/8 bg-white space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[16px] font-medium text-brand-text-muted uppercase tracking-wider">Collection Log</h4>
          {house.visitTimestamp && (
            <span className="text-[16px] font-light text-brand-text-muted flex items-center gap-1">
              <Clock size={10} />
              {house.visitTimestamp}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Status chip */}
          <div className={`flex-1 p-3 rounded-lg ${sc.bg} ${sc.border} border text-center`}>
            <div className={`text-[14px] font-medium ${sc.text} capitalize`}>{house.status}</div>
            <div className="text-[11px] font-light text-brand-text-muted mt-0.5">Status</div>
          </div>

          {/* Payment chip */}
          <div className="flex-1 p-3 rounded-lg bg-brand-surface-alt/30 border border-brand-surface-alt text-center">
            <div className="text-[14px] font-medium text-brand-text">
              {house.paymentMode || '—'}
            </div>
            <div className="text-[11px] font-light text-brand-text-muted mt-0.5">Payment</div>
          </div>

          {/* Amount chip */}
          <div className="flex-1 p-3 rounded-lg bg-brand-surface-alt/30 border border-brand-surface-alt text-center">
            <div className="text-[14px] font-medium text-[#014BAA]">
              {house.amount ? `₹${house.amount}` : '—'}
            </div>
            <div className="text-[11px] font-light text-brand-text-muted mt-0.5">Amount</div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      {house.status === 'pending' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Someone Home — QR scan card */}
            <button
              onClick={handleSomeoneHome}
              className="aspect-square rounded-2xl bg-gradient-to-br from-[#014BAA] to-[#0A3366] flex flex-col items-center justify-between p-5 transition-all hover:shadow-lg hover:shadow-[#014BAA]/20 active:scale-[0.97] group"
            >
              <div className="flex-1 flex items-center justify-center">
                <QrCode size={95} className="text-white/90 group-hover:scale-105 transition-transform" />
              </div>
              <span className="text-[14px] font-medium text-white">Someone Home</span>
            </button>

            {/* No One Home — camera card */}
            <button
              onClick={handleNoOneHome}
              className="aspect-square rounded-2xl bg-white border border-brand-surface-alt flex flex-col items-center justify-between p-5 transition-all hover:border-[#014BAA]/20 hover:shadow-sm active:scale-[0.97] group"
            >
              <div className="flex-1 flex items-center justify-center">
                <Camera size={95} className="text-black group-hover:text-brand-text-muted group-hover:scale-105 transition-all" />
              </div>
              <span className="text-[14px] font-medium text-brand-text">No One Home</span>
            </button>
          </div>

          {/* Anti-fraud note */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50/60 border border-amber-200/40">
            <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[14px] font-light text-amber-700 leading-relaxed">
              GPS coordinates must match within 15m of registered address. Discrepancies are flagged automatically.
            </p>
          </div>
        </div>
      ) : (
        /* Completed state */
        <div className="p-5 rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="text-emerald-500" size={22} />
          </div>
          <h3 className="text-[18px] font-medium text-brand-text">Household Processed</h3>
          <p className="text-[14px] font-light text-brand-text-muted max-w-[260px] mx-auto leading-relaxed">
            This residence has been logged for today&apos;s collection cycle.
          </p>
          {house.receiptId && (
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[12px] font-medium">
              Receipt: {house.receiptId}
            </span>
          )}
        </div>
      )}

      {/* ── Modals ── */}

      {/* 1. QR Scanner */}
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
          <div className="w-40 h-40 rounded-xl border-2 border-[#014BAA]/30 bg-[#014BAA]/5 flex items-center justify-center relative overflow-hidden">
            <QrCode size={40} className="text-[#014BAA]/40 animate-pulse" />
            <div className="absolute inset-x-0 top-0 h-0.5 bg-[#014BAA] shadow-[0_0_10px_#014BAA] animate-[pulse_1.5s_infinite]" />
          </div>

          <div className="space-y-1">
            <p className={`text-[13px] font-medium ${scannerSuccess ? 'text-brand-success' : 'text-brand-text'}`}>
              {scannerStatus}
            </p>
            <p className="text-[12px] font-light text-brand-text-muted">
              {scannerMessage}
            </p>
          </div>
        </div>
      </Modal>

      {/* 2. Payment Selector */}
      <Modal
        isOpen={activeModal === 'payment'}
        onClose={() => setActiveModal('none')}
        title="Settle Collection Fee"
        subtitle={`${house.houseNo} • Monthly Fee: ₹15`}
      >
        <div className="space-y-4">
          <p className="text-[13px] font-light text-brand-text-muted leading-relaxed">
            Resident verified. Select payment method to issue receipt.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleLogPayment('Online')}
              className="py-4 px-4 rounded-xl bg-[#014BAA]/5 border border-[#014BAA]/15 text-[#014BAA] hover:bg-[#014BAA]/10 transition-all text-center flex flex-col items-center gap-2"
            >
              <Smartphone size={20} />
              <span className="text-[13px] font-medium">Online Paid</span>
              <span className="text-[11px] font-light opacity-70">Pre-settled</span>
            </button>

            <button
              onClick={() => setShowCashInput(!showCashInput)}
              className="py-4 px-4 rounded-xl bg-white border border-brand-surface-alt text-brand-text hover:bg-brand-surface-alt/30 transition-all text-center flex flex-col items-center gap-2"
            >
              <CreditCard size={20} className="text-brand-text-muted" />
              <span className="text-[13px] font-medium">Collect Cash</span>
              <span className="text-[11px] font-light opacity-70">At doorstep</span>
            </button>
          </div>

          {showCashInput && (
            <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-bg/40 space-y-3 animate-fade-in">
              <Field className="space-y-1">
                <FieldLabel className="text-[12px] font-medium text-brand-text uppercase tracking-wider block">
                  Cash Amount (₹)
                </FieldLabel>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg border border-brand-surface-alt bg-brand-bg text-brand-text text-[14px] focus:outline-none focus:border-[#014BAA]/40"
                    placeholder="e.g. 15"
                  />
                  <button
                    onClick={() => handleLogPayment('Cash')}
                    className="px-4 py-[9px] bg-[#014BAA] hover:opacity-90 text-white text-[13px] font-medium rounded-lg"
                  >
                    Confirm
                  </button>
                </div>
              </Field>
            </div>
          )}
        </div>
      </Modal>

      {/* 3. Door Photo */}
      <Modal
        isOpen={activeModal === 'photo'}
        onClose={() => {
          if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
          setActiveModal('none');
        }}
        title="Absent Household Log"
        subtitle="GPS-stamped photo evidence"
      >
        <div className="space-y-4 text-center">
          <div className="w-full aspect-video rounded-xl border border-brand-surface-alt bg-black overflow-hidden relative flex items-center justify-center">
            {cameraStream ? (
              <video ref={videoRef} className="w-full h-full object-cover" playsInline />
            ) : (
              <div className="space-y-1">
                <Camera size={24} className="text-brand-text-muted mx-auto" />
                <span className="text-[12px] font-light text-brand-text-muted block">Simulating Camera Feed</span>
              </div>
            )}
          </div>

          <p className="text-[12px] font-light text-brand-text-muted leading-normal max-w-[300px] mx-auto">
            Ensure the house gate/door is fully visible. GPS stamp will be locked permanently.
          </p>

          <div className="flex justify-center w-full">
            <button
              onClick={handleCaptureDoorPhoto}
              className="flex items-center gap-3 pl-6 pr-1.5 py-[3px] rounded-full bg-[#014BAA] text-white text-[15px] font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
            >
              <span>Capture & Log</span>
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF6F3] text-[#014BAA] min-h-[44px] min-w-[44px]">
                <Camera size={18} />
              </span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
