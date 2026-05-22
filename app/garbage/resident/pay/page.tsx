'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchResidents, logPayment, House } from '@/lib/api/garbage';
import Toast from '@/components/Toast';
import Skeleton from '@/components/Skeleton';

export default function ResidentPay() {
  const router = useRouter();
  const [userHouse, setUserHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paying, setPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');

  useEffect(() => {
    async function loadData() {
      try {
        const userIdStr = localStorage.getItem('sgcs_userId') || '1';
        const userId = Number(userIdStr);
        const list = await fetchResidents();
        
        if (list.length > 0) {
          const idx = userId % list.length;
          setUserHouse(list[idx]);
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
      setToastMessage('Monthly fee is already paid.');
      setToastType('warning');
      return;
    }

    setPaying(true);
    setToastMessage('Redirecting to Kerala Civic Gateway...');
    
    // Simulate payment transaction delays
    setTimeout(async () => {
      try {
        await logPayment(userHouse.id, 15, `Online (${paymentMode.toUpperCase()})`);
        
        // Refresh local house state
        const list = await fetchResidents();
        const idx = (Number(localStorage.getItem('sgcs_userId')) || 1) % list.length;
        setUserHouse(list[idx]);
        
        setToastMessage('Payment successful! Receipt generated.');
        setToastType('success');
        setPaying(false);
        
        setTimeout(() => {
          router.push('/garbage/resident/receipts');
        }, 1500);
      } catch (err) {
        setToastMessage('Payment processing failed.');
        setToastType('warning');
        setPaying(false);
      }
    }, 1800);
  };

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <Skeleton variant="card" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Header link */}
      <div>
        <Link 
          href="/garbage/resident" 
          className="inline-flex items-center gap-1 text-[12px] text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Portal</span>
        </Link>
      </div>

      {/* Main Billing Card */}
      <div className="w-full rounded-2xl glass-panel p-6 border border-brand-accent/25 flex flex-col space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-[16px] font-medium text-brand-text">Municipal Sanitation Fee</h2>
          <p className="text-[12px] font-light text-brand-text-muted">
            Monthly service fee for household waste collection.
          </p>
        </div>

        {/* Amount Box */}
        <div className="bg-brand-surface-alt/45 p-6 rounded-xl border border-brand-accent/15 text-center space-y-1">
          <span className="text-[12px] font-medium text-brand-text-muted uppercase tracking-wider block">
            Amount Outstanding
          </span>
          <span className="text-[30px] font-medium text-brand-accent block">
            {userHouse?.status === 'done' ? '₹0.00' : '₹15.00'}
          </span>
          <span className="text-[12px] font-light text-brand-text-muted block">
            {userHouse?.status === 'done' ? 'All dues settled' : 'Due date: End of Month'}
          </span>
        </div>

        {userHouse?.status !== 'done' ? (
          <div className="space-y-4">
            {/* Pay methods list */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-brand-text uppercase tracking-wider block">
                Select Payment Mode
              </label>

              {([
                { id: 'upi', label: 'BHIM UPI / GPAY', desc: 'Instant bank transfer' },
                { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, MasterCard, RuPay' },
                { id: 'netbanking', label: 'Net Banking', desc: 'Kerala State Co-op & others' }
              ] as const).map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMode(method.id)}
                  className={`w-full py-[13px] px-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                    paymentMode === method.id
                      ? 'border-brand-accent bg-brand-accent/5'
                      : 'border-brand-surface-alt bg-brand-bg/40 hover:bg-brand-surface-alt/20'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[12px] font-medium text-brand-text">{method.label}</span>
                    <p className="text-[12px] font-light text-brand-text-muted">{method.desc}</p>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMode === method.id ? 'border-brand-accent' : 'border-brand-text-muted/30'
                  }`}>
                    {paymentMode === method.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Submit button (Reskinned, Royal Blue bg, Cream icon wrapper) */}
            <div className="flex justify-center w-full pt-2">
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex items-center gap-3 pl-6 pr-1.5 py-[7px] rounded-full bg-[#014BAA] text-white text-[16px] font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
              >
                <span>{paying ? 'Processing Gateway...' : 'Pay Fee Online'}</span>
                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF6F3] text-[#014BAA] min-h-[56px] min-w-[56px]">
                  <CreditCard size={22} />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-[17px] px-4 rounded-xl border border-brand-success/20 bg-brand-success/5 text-center space-y-1.5">
            <CheckCircle2 className="text-brand-success mx-auto" size={20} />
            <h4 className="text-[12px] font-medium text-brand-text">Fee Settled Successfully</h4>
            <p className="text-[12px] font-light text-brand-text-muted">
              Thank you! Your payment receipt has been recorded in your portal logs.
            </p>
          </div>
        )}
      </div>

      {/* Trust seal */}
      <div className="flex items-center justify-center gap-1.5 text-[12px] font-light text-brand-text-muted">
        <ShieldCheck size={12} className="text-brand-accent" />
        <span>Secured by Kerala Municipal Financial Services Gateway</span>
      </div>
    </div>
  );
}
