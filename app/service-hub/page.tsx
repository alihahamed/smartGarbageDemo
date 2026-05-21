'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, Zap, Hammer, Layers, Calendar, Clock, ChevronRight, UserCheck } from 'lucide-react';
import { fetchBookings, Booking } from '@/lib/api/serviceHub';
import Skeleton from '@/components/Skeleton';

export default function ServiceHubHome() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const activeBookings = await fetchBookings();
        setBookings(activeBookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    {
      id: 'plumber',
      title: 'Plumbers',
      desc: 'Leakages, taps, and water pump installations.',
      icon: <Wrench size={22} className="text-brand-accent shrink-0" />,
      count: '3 Near You'
    },
    {
      id: 'electrician',
      title: 'Electricians',
      desc: 'Inverters, house wiring, and appliance fixes.',
      icon: <Zap size={22} className="text-brand-accent shrink-0" />,
      count: '2 Near You'
    },
    {
      id: 'carpenter',
      title: 'Carpenters',
      desc: 'Furniture repair, door fitting, locks, wardrobes.',
      icon: <Hammer size={22} className="text-brand-accent shrink-0" />,
      count: '2 Near You'
    },
    {
      id: 'mason',
      title: 'Masons',
      desc: 'Brickwork, tiling, compound walls, concrete.',
      icon: <Layers size={22} className="text-brand-accent shrink-0" />,
      count: '2 Near You'
    }
  ];

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Welcome Title */}
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-brand-text">Village Service Hub</h2>
        <p className="text-xs font-light text-brand-text-muted">
          Connect directly with local, municipality-verified service providers.
        </p>
      </div>

      {/* Grid Categories */}
      <div className="space-y-3">
        <span className="text-[10px] font-medium text-brand-text uppercase tracking-wider block">
          Select Service Category
        </span>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/service-hub/${cat.id}`}
              className="p-4 rounded-xl glass-panel border border-brand-accent/15 hover:border-brand-accent/40 flex flex-col justify-between text-left group transition-all"
            >
              <div className="space-y-3">
                <div className="p-2 rounded-lg bg-brand-surface-alt/60 border border-brand-accent/5 w-fit">
                  {cat.icon}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-medium text-brand-text group-hover:text-brand-accent transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[9.5px] font-light text-brand-text-muted leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[9px] font-medium text-brand-accent/80 group-hover:text-brand-accent pt-2 border-t border-brand-surface-alt/20">
                <span>{cat.count}</span>
                <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bookings Tracker */}
      <div className="flex-1 space-y-3 min-h-0 flex flex-col">
        <h3 className="text-xs font-medium text-brand-text flex items-center gap-1.5 shrink-0">
          <Calendar size={13} className="text-brand-text-muted" />
          <span>Active Bookings ({bookings.length})</span>
        </h3>

        <div className="flex-1 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 overflow-hidden flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3">
                <Skeleton variant="list" count={1} />
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center text-xs font-light text-brand-text-muted flex flex-col items-center justify-center h-full space-y-1.5">
                <Clock size={20} className="text-brand-text-muted/40" />
                <p>No active service bookings.</p>
                <p className="text-[9px] max-w-[200px]">Book a technician to see live job scheduling status updates here.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-surface-alt">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3.5 flex items-start justify-between gap-4 bg-brand-surface-alt/25">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-brand-text">{b.workerName}</span>
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-success/15 text-brand-success border border-brand-success/20">
                          <UserCheck size={8} /> Verified
                        </span>
                      </div>
                      <p className="text-[10px] font-light text-brand-text-muted capitalize">
                        {b.workerCategory} • {b.date} at {b.time}
                      </p>
                      <p className="text-[9px] font-light text-brand-accent/80 flex items-center gap-1">
                        <Clock size={10} />
                        <span>ETA: ~{b.etaMinutes} minutes</span>
                      </p>
                    </div>
                    <span className="text-[9px] font-medium uppercase tracking-wide bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded shrink-0">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
