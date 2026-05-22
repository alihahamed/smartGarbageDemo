'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, QrCode, CreditCard, History, MapPin, CheckCircle, ShieldCheck, Clock, AlertCircle, AlertTriangle, ArrowLeft, User, FileText, CheckCircle2 } from 'lucide-react';
import { fetchInbox, fetchResidents, logPayment, fetchReceipts, House, Receipt } from '@/lib/api/garbage';
import Skeleton from '@/components/Skeleton';
import Toast from '@/components/Toast';
import QRCode from 'qrcode';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

export default function ResidentDashboard() {
  const [inbox, setInbox] = useState<string[]>([]);
  const [userHouse, setUserHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Resident');

  // Multi-drawer states
  const [qrOpen, setQrOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [receiptsOpen, setReceiptsOpen] = useState(false);

  // Pay dues states
  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paying, setPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');

  // Receipts states
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  // Refs and active layout helpers
  const lastDrawnHouse = useRef<string | null>(null);

  const qrCanvasRef = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) {
      lastDrawnHouse.current = null;
      return;
    }
    if (!userHouse) return;
    
    if (lastDrawnHouse.current === userHouse.houseNo) return;
    lastDrawnHouse.current = userHouse.houseNo;

    QRCode.toCanvas(
      canvas,
      userHouse.houseNo,
      {
        width: 170,
        margin: 1,
        color: {
          dark: '#0A1C33',
          light: '#FFFFFF'
        }
      },
      (error) => {
        if (error) {
          console.error('Failed to generate QR Code:', error);
          return;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const size = canvas.width;
          const logoSize = size * 0.22;
          const cx = size / 2;
          const cy = size / 2;

          ctx.beginPath();
          ctx.arc(cx, cy, logoSize / 2, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFC72C';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();

          ctx.save();
          ctx.beginPath();
          const w = logoSize * 0.5;
          const h = logoSize * 0.5;

          ctx.moveTo(cx, cy - h / 2);
          ctx.lineTo(cx - w / 2, cy + h / 6);
          ctx.lineTo(cx - w / 3, cy + h / 6);
          ctx.lineTo(cx - w / 3, cy + h / 2);
          ctx.lineTo(cx + w / 3, cy + h / 2);
          ctx.lineTo(cx + w / 3, cy + h / 6);
          ctx.lineTo(cx + w / 2, cy + h / 6);
          ctx.closePath();

          ctx.fillStyle = '#014BAA';
          ctx.fill();
          ctx.restore();
        }
      }
    );
  };

  const isAnyOpen = qrOpen || payOpen || receiptsOpen;

  useEffect(() => {
    // Notify Navbar to hide dynamically when any drawer is active
    const event = new CustomEvent('qr-drawer-toggle', { detail: { open: isAnyOpen } });
    window.dispatchEvent(event);
  }, [isAnyOpen]);



  // Load receipts dynamically
  useEffect(() => {
    if (receiptsOpen) {
      async function loadReceipts() {
        setReceiptsLoading(true);
        try {
          const list = await fetchReceipts();
          setReceipts(list);
        } catch (err) {
          console.error(err);
        } finally {
          setReceiptsLoading(false);
        }
      }
      loadReceipts();
    }
  }, [receiptsOpen]);

  useEffect(() => {
    async function loadData() {
      try {
        const storedUser = localStorage.getItem('sgcs_username') || 'Resident';
        const userIdStr = localStorage.getItem('sgcs_userId') || '1';
        const userId = Number(userIdStr);
        setUsername(storedUser);

        const [inboxList, houses] = await Promise.all([
          fetchInbox(),
          fetchResidents()
        ]);
        setInbox(inboxList);

        // Assign resident modulo a house or fallback
        if (houses.length > 0) {
          const idx = userId % houses.length;
          setUserHouse(houses[idx]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePay = async () => {
    if (!userHouse) return;
    if (userHouse.status === 'done') {
      setToastMessage('Sanitation fee already paid for this month.');
      setToastType('warning');
      return;
    }

    setPaying(true);
    setToastMessage('Opening civic payment gateway...');
    
    setTimeout(async () => {
      try {
        await logPayment(userHouse.id, 15, `Online (${paymentMode.toUpperCase()})`);
        
        // Refresh local house status
        const list = await fetchResidents();
        const idx = (Number(localStorage.getItem('sgcs_userId')) || 1) % list.length;
        setUserHouse(list[idx]);
        
        setToastMessage('Payment successful! Invoice added to receipts.');
        setToastType('success');
        setPaying(false);
        
        setTimeout(() => {
          setPayOpen(false);
          setReceiptsOpen(true);
        }, 1500);
      } catch (err) {
        setToastMessage('Sanitation payment processing failed.');
        setToastType('warning');
        setPaying(false);
      }
    }, 1800);
  };

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <Skeleton variant="card" />
        <Skeleton variant="list" count={3} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start py-2 space-y-5">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* ── Blue Header Banner ── */}
      <div className="-mx-4 -mt-8 px-6 pt-8 pb-7 rounded-b-[40px] bg-gradient-to-br from-[#014BAA] via-[#014BAA] to-[#0A3366] shadow-lg shadow-[#014BAA]/10 space-y-6">
        {/* Greeting row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Home brand icon */}
            <div className="flex items-center justify-center overflow-hidden">
              <img src="/home-icon.png" alt="Home" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <h2 className="text-[26px] font-medium text-white tracking-tight leading-none">
                {userHouse ? userHouse.houseNo : 'H-101'}
              </h2>
              <p className="text-[15px] font-medium text-white/80 mt-1">Welcome, {username}</p>
            </div>
          </div>

          {/* Status pill based on userHouse status */}
          {userHouse && (
            <span className={`px-3 py-1.5 rounded-full text-[13px] font-medium shadow-sm uppercase tracking-wider ${
              userHouse.status === 'done'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : userHouse.status === 'attempted'
                ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {userHouse.status === 'done' ? 'Collected' : userHouse.status === 'attempted' ? 'Missed' : 'Pending'}
            </span>
          )}
        </div>

        {/* Address card */}
        {userHouse && (
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1.5">
            <p className="text-[18px] font-medium text-white leading-snug">{userHouse.address}</p>
            <div className="flex items-center gap-3 text-[12px] text-white/60">
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                Lat 10.85°N
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-emerald-400" />
                GPS Verified
              </span>
            </div>
          </div>
        )}

        {/* ── Main Resident Grid Options (Inside Blue Banner, colored in Brand Cream) ── */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Resident Pass — Premium QR Card in Brand Cream */}
          <button
            onClick={() => setQrOpen(true)}
            className="aspect-square rounded-2xl bg-[#FAF6F3] border border-[#014BAA]/10 flex flex-col items-center justify-between p-3.5 transition-all hover:bg-white active:scale-[0.97] group shadow-md shadow-black/5 cursor-pointer text-left w-full"
          >
            <div className="flex-1 flex items-center justify-center">
              <QrCode size={32} className="text-[#014BAA] group-hover:scale-105 transition-transform" />
            </div>
            <span className="text-[12px] font-medium text-black text-center w-full block">Resident Pass</span>
          </button>

          {/* Pay Dues — Premium Tactile Card in Brand Cream */}
          <button
            onClick={() => setPayOpen(true)}
            className="aspect-square rounded-2xl bg-[#FAF6F3] border border-[#014BAA]/10 flex flex-col items-center justify-between p-3.5 transition-all hover:bg-white active:scale-[0.97] group shadow-md shadow-black/5 cursor-pointer text-left w-full"
          >
            <div className="flex-1 flex items-center justify-center">
              <CreditCard size={32} className="text-[#014BAA] group-hover:scale-105 transition-transform" />
            </div>
            <span className="text-[12px] font-medium text-black text-center w-full block">Pay Dues</span>
          </button>

          {/* Receipts — Premium Tactile Card in Brand Cream */}
          <button
            onClick={() => setReceiptsOpen(true)}
            className="aspect-square rounded-2xl bg-[#FAF6F3] border border-[#014BAA]/10 flex flex-col items-center justify-between p-3.5 transition-all hover:bg-white active:scale-[0.97] group shadow-md shadow-black/5 cursor-pointer text-left w-full"
          >
            <div className="flex-1 flex items-center justify-center">
              <History size={32} className="text-[#014BAA] group-hover:scale-105 transition-transform" />
            </div>
            <span className="text-[12px] font-medium text-black text-center w-full block">Receipts</span>
          </button>
        </div>
      </div>

      {/* ── Household Status Alert Box ── */}
      {userHouse && (
        <div className={`p-5 rounded-[24px] border flex items-center gap-4 shadow-md shadow-black/5 max-w-[340px] mx-auto w-full ${
          userHouse.status === 'done'
            ? 'border-emerald-100 bg-emerald-50/50 text-brand-text'
            : userHouse.status === 'attempted'
            ? 'border-amber-100 bg-[#FFFDF5] text-brand-text'
            : 'border-[#EAE3DC] bg-[#FAF6F3] text-brand-text'
        }`}>
          {userHouse.status === 'done' ? (
            <>
              <CheckCircle className="text-emerald-500 shrink-0" size={38} />
              <div className="space-y-0.5 flex-1">
                <span className="text-[19px] font-medium text-emerald-600 tracking-tight block leading-snug">
                  Collection Processed
                </span>
                <p className="text-[13px] font-medium text-[#6B7F96] leading-snug mt-0.5">
                  Your waste collection was successfully logged at {userHouse.visitTimestamp || 'today'}. Receipt generated.
                </p>
              </div>
            </>
          ) : userHouse.status === 'attempted' ? (
            <>
              <div className="shrink-0 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
                  <path d="M12 9V13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1.25" fill="white" />
                </svg>
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="text-[19px] font-medium text-slate-800 tracking-tight block leading-snug">
                  Attempt Missed
                </span>
                <p className="text-[13px] font-medium text-[#6B7F96] leading-snug mt-0.5">
                  Collector Rajesh Kumar attempted verification at your door. Please keep your QR pass ready next cycle.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Solid Yellow/Orange Warning Triangle Icon like Reference Image */}
              <div className="shrink-0 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
                  <path d="M12 9V13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1.25" fill="white" />
                </svg>
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="text-[19px] font-medium text-slate-800 tracking-tight block leading-snug">
                  Pending Collection
                </span>
                <p className="text-[13px] font-medium text-[#6B7F96] leading-snug mt-0.5">
                  Collector Rajesh Kumar is currently on route. Please ensure waste bins are sorted and QR pass is visible.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Notifications Feed ── */}
      <div className="flex-1 space-y-3 min-h-0 flex flex-col max-w-[340px] mx-auto w-full">
        <div className="flex items-center justify-between shrink-0 px-1">
          <h3 className="text-[20px] font-medium text-brand-text tracking-tight">
            Inbox & Announcements
          </h3>
          <Bell size={22} className="text-black" />
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[160px]">
          {inbox.map((msg, index) => (
            <div 
              key={index} 
              className="p-4 rounded-xl border border-[#014BAA]/8 bg-white shadow-sm space-y-1.5 transition-all hover:border-[#014BAA]/15 w-full"
            >
              <div className="flex items-center justify-between text-[12px] font-medium text-[#014BAA] uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#014BAA]" />
                  Alert {index + 1}
                </span>
                <span className="text-brand-text-muted font-normal lowercase">{index === 0 ? 'now' : 'today'}</span>
              </div>
              <p className="text-[15px] font-medium text-black leading-relaxed">
                {msg}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sliding Bottom Drawer for Resident Pass ── */}
      <Drawer open={qrOpen} onOpenChange={setQrOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-[#F3F4F6] rounded-t-[32px] p-5 flex flex-col space-y-4 outline-none border-t-0 shadow-2xl max-h-[94vh] data-[vaul-drawer-direction=bottom]:max-h-[94vh]">
          {/* Header */}
          <div className="flex items-center justify-between w-full relative">
            <button 
              onClick={() => setQrOpen(false)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-700 active:scale-90 transition-transform cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="text-[22px] font-medium text-slate-800 absolute left-1/2 -translate-x-1/2">
              Scan QR Code
            </h3>
            <div className="w-10 h-10" />
          </div>

          {/* QR White Card */}
          <div className="w-full rounded-[28px] bg-white p-5 flex flex-col items-center space-y-4 shadow-sm">
            {/* QR Canvas */}
            <div className="p-3 rounded-[24px] bg-white border border-slate-100 shadow-inner flex items-center justify-center">
              <canvas ref={qrCanvasRef} className="w-[170px] h-[170px]" />
            </div>

            {/* User Name Pill */}
            <div className="px-4 py-1.5 rounded-full bg-[#F3F4F6] flex items-center gap-2 text-slate-700 shadow-sm border border-slate-100">
              <User size={14} className="text-slate-500" />
              <span className="text-[13px] font-medium tracking-tight">
                {username}
              </span>
            </div>

            {/* House Details Panel */}
            <div className="w-full pt-3.5 border-t border-slate-100 flex flex-col items-center text-center space-y-1">
              <span className="text-[20px] font-medium text-slate-800 tracking-tight">
                {userHouse ? userHouse.houseNo : 'H-101'}
              </span>
              <span className="text-[13px] font-light text-slate-400 max-w-[280px] leading-relaxed">
                {userHouse ? userHouse.address : 'Green Glen Layout, Sector 4'}
              </span>
            </div>
          </div>

          {/* Anti-Fraud Info Description (No Title, No Icon, Centered) */}
          <p className="text-[12px] font-medium text-slate-500 text-center leading-relaxed px-4">
            The collector must be within 15 meters of your household GPS marker to log verification of this QR pass.
          </p>

          {/* Close Button */}
          <button 
            onClick={() => setQrOpen(false)}
            className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-medium text-[15px] shadow-lg shadow-slate-950/10 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Close Pass
          </button>
        </DrawerContent>
      </Drawer>

      {/* ── Sliding Bottom Drawer for Pay Dues ── */}
      <Drawer open={payOpen} onOpenChange={setPayOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-[#F3F4F6] rounded-t-[32px] p-5 flex flex-col space-y-4 outline-none border-t-0 shadow-2xl max-h-[94vh] data-[vaul-drawer-direction=bottom]:max-h-[94vh]">
          {/* Header */}
          <div className="flex items-center justify-between w-full relative">
            <button 
              onClick={() => setPayOpen(false)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-700 active:scale-90 transition-transform cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="text-[20px] font-medium text-slate-800 absolute left-1/2 -translate-x-1/2">
              Pay Sanitation Fee
            </h3>
            <div className="w-10 h-10" />
          </div>

          {/* Billing Details White Card */}
          <div className="w-full rounded-[28px] bg-white p-5 flex flex-col space-y-4 shadow-sm">
            <div className="text-center space-y-1">
              <h4 className="text-[16px] font-medium text-slate-700">Municipal Sanitation Fee</h4>
              <p className="text-[13px] font-medium text-black">
                Monthly collection service fee for your household.
              </p>
            </div>

            {/* Amount Box */}
            <div className="bg-[#F3F4F6] p-4 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-[13px] font-medium text-slate-800 uppercase tracking-wider block">
                Amount Outstanding
              </span>
              <span className="text-[28px] font-medium text-[#014BAA] block">
                {userHouse?.status === 'done' ? '₹0.00' : '₹15.00'}
              </span>
              <span className="text-[13px] font-medium text-slate-500 block">
                {userHouse?.status === 'done' ? 'All dues settled' : 'Due date: End of Month'}
              </span>
            </div>

            {userHouse?.status !== 'done' ? (
              <div className="space-y-4">
                {/* Payment modes */}
                <div className="space-y-2">
                  <label className="text-[15px] font-medium text-slate-700 uppercase tracking-wider block">
                    Select Payment Mode
                  </label>
                  {([
                    { id: 'upi', label: 'BHIM UPI / GPay', desc: 'Instant bank transfer' },
                    { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, MasterCard, RuPay' },
                    { id: 'netbanking', label: 'Net Banking', desc: 'Kerala State Co-op Banks' }
                  ] as const).map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMode(method.id)}
                      className={`w-full py-2.5 px-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        paymentMode === method.id
                          ? 'border-[#014BAA] bg-[#014BAA]/5'
                          : 'border-slate-100 bg-[#F9FAFB] hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[15px] font-medium text-slate-700">{method.label}</span>
                        <p className="text-[13px] font-light text-slate-700">{method.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMode === method.id ? 'border-[#014BAA]' : 'border-slate-200'
                      }`}>
                        {paymentMode === method.id && <div className="w-2 h-2 rounded-full bg-[#014BAA]" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Action Submit */}
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-medium text-[15px] shadow-lg shadow-slate-950/10 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {paying ? 'Connecting civic gateway...' : 'Pay Fee Online'}
                </button>
              </div>
            ) : (
              <div className="py-4 px-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 text-center space-y-1.5">
                <CheckCircle2 className="text-emerald-500 mx-auto" size={24} />
                <h4 className="text-[14px] font-medium text-emerald-700">Fee Settled Successfully</h4>
                <p className="text-[12px] font-light text-slate-500">
                  Thank you! Your payment receipt has been recorded.
                </p>
              </div>
            )}
          </div>

          {/* Trust Seal */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-light text-slate-400">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Secured by Kerala Municipal Financial Services Gateway</span>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Sliding Bottom Drawer for Receipts ── */}
      <Drawer open={receiptsOpen} onOpenChange={setReceiptsOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-[#F3F4F6] rounded-t-[32px] p-5 flex flex-col space-y-4 outline-none border-t-0 shadow-2xl max-h-[94vh] data-[vaul-drawer-direction=bottom]:max-h-[94vh]">
          {/* Header */}
          <div className="flex items-center justify-between w-full relative">
            <button 
              onClick={() => setReceiptsOpen(false)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-700 active:scale-90 transition-transform cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="text-[18px] font-medium text-slate-800 absolute left-1/2 -translate-x-1/2">
              Tax Receipt Logs
            </h3>
            <div className="w-10 h-10" />
          </div>

          {/* Receipts Scroll Card */}
          <div className="w-full rounded-[28px] bg-white p-4 flex flex-col shadow-sm max-h-[320px] min-h-[200px]">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {receiptsLoading ? (
                <div className="py-4">
                  <Skeleton variant="list" count={3} />
                </div>
              ) : receipts.length === 0 ? (
                <div className="text-center py-10 text-[13px] font-light text-slate-400 space-y-3 flex flex-col items-center justify-center">
                  <FileText size={32} className="text-slate-300" />
                  <p>No sanitation receipt history found.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {receipts.map((rcpt) => (
                    <div key={rcpt.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-slate-700">{rcpt.id}</span>
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {rcpt.status}
                          </span>
                        </div>
                        <p className="text-[12px] font-light text-slate-400">
                          House {rcpt.house} • {rcpt.mode}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[16px] font-medium text-[#014BAA]">₹{rcpt.amount}.00</div>
                        <span className="text-[11px] font-light text-slate-400 block">Verified TAX</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => setReceiptsOpen(false)}
            className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-medium text-[15px] shadow-lg shadow-slate-950/10 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Close Receipts
          </button>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
