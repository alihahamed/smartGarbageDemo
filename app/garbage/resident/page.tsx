'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, QrCode, CreditCard, History, MapPin, CheckCircle, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { fetchInbox, fetchResidents, House } from '@/lib/api/garbage';
import Skeleton from '@/components/Skeleton';

export default function ResidentDashboard() {
  const [inbox, setInbox] = useState<string[]>([]);
  const [userHouse, setUserHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Resident');

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

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <Skeleton variant="card" />
        <Skeleton variant="list" count={3} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Title greeting */}
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-brand-text capitalize">
          Welcome back, {username}!
        </h2>
        {userHouse ? (
          <p className="text-xs font-light text-brand-text-muted flex items-center gap-1">
            <MapPin size={12} className="text-brand-accent" />
            <span>Assigned Household: <strong>{userHouse.houseNo}</strong> ({userHouse.address})</span>
          </p>
        ) : (
          <p className="text-xs font-light text-brand-text-muted">Assigned Household: H-101</p>
        )}
      </div>

      {/* Main resident grid options */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/garbage/resident/qr"
          className="p-3 rounded-xl border border-brand-accent/20 bg-brand-accent/5 hover:bg-brand-accent/15 transition-all text-center flex flex-col items-center justify-center space-y-2 group"
        >
          <div className="p-2 rounded-lg bg-brand-accent/10 text-brand-accent group-hover:scale-105 transition-transform">
            <QrCode size={18} />
          </div>
          <span className="text-[10px] font-medium text-brand-text block">Resident Pass</span>
        </Link>

        <Link
          href="/garbage/resident/pay"
          className="p-3 rounded-xl border border-brand-accent/15 bg-brand-surface-alt/45 hover:bg-brand-surface-alt/80 transition-all text-center flex flex-col items-center justify-center space-y-2 group"
        >
          <div className="p-2 rounded-lg bg-brand-surface-alt border border-brand-accent/10 text-brand-accent group-hover:scale-105 transition-transform">
            <CreditCard size={18} />
          </div>
          <span className="text-[10px] font-medium text-brand-text block">Pay Dues</span>
        </Link>

        <Link
          href="/garbage/resident/receipts"
          className="p-3 rounded-xl border border-brand-accent/15 bg-brand-surface-alt/45 hover:bg-brand-surface-alt/80 transition-all text-center flex flex-col items-center justify-center space-y-2 group"
        >
          <div className="p-2 rounded-lg bg-brand-surface-alt border border-brand-accent/10 text-brand-accent group-hover:scale-105 transition-transform">
            <History size={18} />
          </div>
          <span className="text-[10px] font-medium text-brand-text block">Receipts</span>
        </Link>
      </div>

      {/* Household Status Alert Box */}
      {userHouse && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          userHouse.status === 'done'
            ? 'border-brand-success/20 bg-brand-success/5 text-brand-text'
            : userHouse.status === 'attempted'
            ? 'border-brand-warning/20 bg-brand-warning/5 text-brand-text'
            : 'border-brand-surface-alt bg-brand-surface-alt/15 text-brand-text'
        }`}>
          {userHouse.status === 'done' ? (
            <>
              <CheckCircle className="text-brand-success shrink-0 mt-0.5" size={16} />
              <div className="space-y-0.5">
                <span className="text-[10px] font-medium text-brand-success uppercase tracking-wide block">
                  Collection Processed
                </span>
                <p className="text-[9px] font-light text-brand-text-muted leading-normal">
                  Your waste collection was successfully logged at {userHouse.visitTimestamp || 'today'}. Receipt generated.
                </p>
              </div>
            </>
          ) : userHouse.status === 'attempted' ? (
            <>
              <AlertCircle className="text-brand-warning shrink-0 mt-0.5" size={16} />
              <div className="space-y-0.5">
                <span className="text-[10px] font-medium text-brand-warning uppercase tracking-wide block">
                  Collector Attempt Missed
                </span>
                <p className="text-[9px] font-light text-brand-text-muted leading-normal">
                  Rajesh Kumar attempted verification at your door. Please keep your QR pass ready next cycle.
                </p>
              </div>
            </>
          ) : (
            <>
              <Clock className="text-brand-accent shrink-0 mt-0.5 animate-pulse" size={16} />
              <div className="space-y-0.5">
                <span className="text-[10px] font-medium text-brand-accent uppercase tracking-wide block">
                  Pending Collection
                </span>
                <p className="text-[9px] font-light text-brand-text-muted leading-normal">
                   Rajesh Kumar is currently on route. Please ensure waste bins are sorted and QR pass is visible.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Notifications Feed */}
      <div className="flex-1 space-y-3 min-h-0 flex flex-col">
        <h3 className="text-xs font-medium text-brand-text flex items-center gap-1.5 shrink-0">
          <Bell size={13} className="text-brand-text-muted" />
          Inbox & Announcements
        </h3>
        
        <div className="flex-1 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto divide-y divide-brand-surface-alt">
            {inbox.map((msg, index) => (
              <div key={index} className="p-3.5 space-y-1.5 bg-brand-surface-alt/15">
                <div className="flex items-center justify-between text-[8px] font-medium text-brand-accent uppercase tracking-wider">
                  <span>Alert {index + 1}</span>
                  <span className="text-brand-text-muted font-normal lowercase">{index === 0 ? 'now' : 'today'}</span>
                </div>
                <p className="text-[10.5px] font-light text-brand-text leading-relaxed">
                  {msg}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
