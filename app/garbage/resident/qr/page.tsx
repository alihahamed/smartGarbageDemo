'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Smartphone, ShieldCheck } from 'lucide-react';
import { fetchResidents, House } from '@/lib/api/garbage';
import QRCode from 'qrcode';
import Skeleton from '@/components/Skeleton';

export default function ResidentQr() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userHouse, setUserHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!loading && userHouse && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        userHouse.houseNo,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000', // Base Background (Dark)
            light: '#F0FDF4' // Snow (Light text)
          }
        },
        (error) => {
          if (error) console.error('Failed to generate QR Code:', error);
        }
      );
    }
  }, [loading, userHouse]);

  if (loading) {
    return (
      <div className="space-y-4 py-2 text-center">
        <Skeleton variant="card" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Back to resident */}
      <div>
        <Link 
          href="/garbage/resident" 
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Portal</span>
        </Link>
      </div>

      {/* Main QR Card */}
      <div className="w-full rounded-2xl glass-panel p-6 border border-brand-accent/25 flex flex-col items-center space-y-6 text-center">
        <div className="space-y-1">
          <h2 className="text-base font-medium text-brand-text">Resident Collection Pass</h2>
          <p className="text-xs font-light text-brand-text-muted">
            Display this QR to the collector Rajesh Kumar to verify your monthly check-in.
          </p>
        </div>

        {/* QR Container Canvas */}
        <div className="p-4 rounded-2xl bg-[#F0FDF4] shadow-xl shadow-black/25 flex items-center justify-center">
          <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
        </div>

        {userHouse && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-brand-accent uppercase tracking-wider block">
              House {userHouse.houseNo}
            </span>
            <p className="text-[10px] font-light text-brand-text-muted leading-relaxed max-w-[240px] mx-auto">
              {userHouse.address}
            </p>
          </div>
        )}
      </div>

      {/* Verification Instructions */}
      <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 flex items-start gap-3">
        <ShieldCheck className="text-brand-accent shrink-0 mt-0.5" size={15} />
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-medium text-brand-text">Anti-Fraud Protection</h4>
          <p className="text-[9px] font-light text-brand-text-muted leading-relaxed">
            The collector must be within 15 meters of your household GPS marker to log verification of this QR pass.
          </p>
        </div>
      </div>
    </div>
  );
}
