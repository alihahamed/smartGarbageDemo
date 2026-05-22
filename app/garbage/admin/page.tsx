'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Megaphone, Bell, Calendar, Clock } from 'lucide-react';
import { fetchBroadcasts, fetchResidents, addBroadcast, Broadcast, House } from '@/lib/api/garbage';
import Toast from '@/components/Toast';
import Skeleton from '@/components/Skeleton';
import gsap from 'gsap';
import { BarChart as RechartsChart, Bar as RechartsBar, ResponsiveContainer } from 'recharts';

// Custom components for Premium SVG data visuals
const BarChart = ({ percentage }: { percentage: number }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    { name: 'Mon', val: 30 },
    { name: 'Tue', val: 45 },
    { name: 'Wed', val: 60 },
    { name: 'Thu', val: 40 },
    { name: 'Fri', val: percentage },
  ];

  if (!mounted) {
    return <div className="w-24 h-14 bg-brand-surface-alt/10 animate-pulse rounded" />;
  }

  return (
    <div className="w-24 h-14 flex items-center justify-center">
      <RechartsChart width={96} height={56} data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
        <RechartsBar 
          dataKey="val" 
          barSize={8}
          radius={[2, 2, 0, 0]}
          shape={(props: any) => {
            const { x, y, width, height, index } = props;
            const isCurrent = index === data.length - 1;
            const barFill = isCurrent ? '#014BAA' : '#EFEAE6';
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={2}
                ry={2}
                fill={barFill}
              />
            );
          }}
        />
      </RechartsChart>
    </div>
  );
};

const RouteIllustration = () => {
  return (
    <div className="relative">
      <svg className="w-24 h-14 overflow-visible" viewBox="0 0 100 50">
        {/* Path line representing the collector route */}
        <path
          d="M 8 35 Q 32 8 50 25 T 92 18"
          fill="none"
          stroke="rgba(1, 75, 170, 0.12)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* Completed part of the route path */}
        <path
          d="M 8 35 Q 32 8 50 25"
          fill="none"
          stroke="#014BAA"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
        {/* Node 1: Start */}
        <circle cx={8} cy={35} r={3} fill="#EFEAE6" stroke="#014BAA" strokeWidth={1} />
        
        {/* Node 2: Intermediate/Current Collector location (pulsing) */}
        <g>
          <circle cx={50} cy={25} r={6} fill="#FF5A36" className="animate-ping opacity-75" />
          <circle cx={50} cy={25} r={3.5} fill="#014BAA" />
        </g>
        
        {/* Node 3: End destination */}
        <circle cx={92} cy={18} r={3} fill="#EFEAE6" stroke="#4A607A" strokeWidth={1} />
      </svg>
    </div>
  );
};

export default function GarbageAdmin() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastText, setBroadcastText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');

  // Carousel control states & references
  const [activeSlide, setActiveSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [bList, rList] = await Promise.all([
          fetchBroadcasts(),
          fetchResidents()
        ]);
        setBroadcasts(bList);
        setHouses(rList);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // GSAP Slide Animation Effect
  useEffect(() => {
    if (trackRef.current) {
      gsap.to(trackRef.current, {
        xPercent: -activeSlide * 100,
        duration: 0.5,
        ease: 'power3.out',
      });
    }
  }, [activeSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (diff > 45) {
      setActiveSlide(1);
    } else if (diff < -45) {
      setActiveSlide(0);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) {
      setToastMessage('Broadcast message cannot be empty.');
      setToastType('warning');
      return;
    }

    try {
      const updated = await addBroadcast(broadcastText.trim());
      setBroadcasts(updated);
      setBroadcastText('');
      setToastMessage('Broadcast notification sent to all residents.');
      setToastType('success');
    } catch (err) {
      setToastMessage('Failed to send broadcast.');
      setToastType('warning');
    }
  };

  const collectedCount = houses.filter(h => h.status === 'done').length;
  const coveragePercent = houses.length > 0 ? Math.round((collectedCount / houses.length) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 py-2">
        <div className="h-6 bg-brand-text-muted/10 rounded w-1/3 animate-pulse"></div>
        <Skeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType === 'success' ? 'success' : 'warning'} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Profile Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <div className="relative w-13 h-13 rounded-full overflow-hidden border border-[#014BAA]/20">
            <img 
              src="/avatar.png" 
              alt="Sajibur Rahman" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-[14px] font-light text-[#4A607A]">Good morning!</p>
            <h2 className="text-[20px] font-medium text-[#0A1C33] tracking-tight">Sajibur Rahman</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Calendar Button */}
          <button 
            type="button"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#014BAA]/12 hover:border-[#014BAA]/30 text-[#4A607A] hover:text-[#014BAA] transition-all min-h-[44px] min-w-[44px]"
            aria-label="Calendar Schedule"
          >
            <Calendar size={16} />
          </button>
          {/* Notification Button */}
          <button 
            type="button"
            className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#014BAA]/12 hover:border-[#014BAA]/30 text-[#4A607A] hover:text-[#014BAA] transition-all min-h-[44px] min-w-[44px]"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#FF5A36]" />
          </button>
        </div>
      </div>

      {/* Horizontal Stats Carousel */}
      <div 
        className="relative w-full overflow-hidden py-1 cursor-grab active:cursor-grabbing select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={trackRef}
          className="flex w-full"
          style={{ transform: 'translateX(0%)' }}
        >
          {/* Slide 1: Collection Rate */}
          <div className="w-full flex-shrink-0 pr-1">
            <div className="p-4 h-32 rounded-xl glass-panel border border-[#014BAA]/10 flex items-center justify-between">
              <div className="flex flex-col justify-between h-full">
                <span className="text-[11px] font-medium tracking-wider uppercase text-[#4A607A]">
                  Collection Rate
                </span>
                <div className="space-y-0.5">
                  <span className="text-3xl font-medium text-[#0A1C33]">{coveragePercent}%</span>
                  <p className="text-[11px] font-light text-[#4A607A]">
                    {collectedCount} of {houses.length} houses logged
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center pl-2">
                <BarChart percentage={coveragePercent} />
              </div>
            </div>
          </div>
          
          {/* Slide 2: Active Route */}
          <div className="w-full flex-shrink-0 pl-1">
            <div className="p-4 h-32 rounded-xl glass-panel border border-[#014BAA]/10 flex items-center justify-between">
              <div className="flex flex-col justify-between h-full">
                <span className="text-[11px] font-medium tracking-wider uppercase text-[#4A607A]">
                  Active Route
                </span>
                <div className="space-y-0.5">
                  <span className="text-3xl font-medium text-[#0A1C33]">Ward 1</span>
                  <p className="text-[11px] font-light text-[#4A607A]">
                    Collector: Rajesh Kumar
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center pl-2">
                <RouteIllustration />
              </div>
            </div>
          </div>
        </div>
        
        {/* Carousel Index Dots */}
        <div className="flex justify-center gap-1.5 mt-2.5">
          <button 
            type="button"
            onClick={() => setActiveSlide(0)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === 0 ? 'w-4 bg-[#014BAA]' : 'bg-[#4A607A]/40'}`}
            aria-label="Collection rate stats"
          />
          <button 
            type="button"
            onClick={() => setActiveSlide(1)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === 1 ? 'w-4 bg-[#014BAA]' : 'bg-[#4A607A]/40'}`}
            aria-label="Active route tracking"
          />
        </div>
      </div>

      {/* Send Notification Broadcast (Taller text area, centered pill CTA button) */}
      <div className="py-6 px-5 rounded-xl glass-panel border border-[#014BAA]/10 space-y-5">
        <h3 className="text-[16px] font-medium text-[#014BAA] flex items-center gap-1.5">
          <Megaphone size={13} className="text-[#014BAA]" />
          Broadcast to Ward Residents
        </h3>
        
        <form onSubmit={handleBroadcast} className="space-y-5 flex flex-col">
          <textarea
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="Write announcement (e.g. Collection delayed today due to rain)..."
            className="w-full h-40 p-3 rounded-lg border border-[#014BAA]/12 bg-white text-[#0A1C33] text-sm font-light placeholder-[#6B7F96] focus:outline-none focus:border-[#014BAA]/50 transition-colors resize-none"
          />
          <div className="flex justify-center w-full">
            <button
              type="submit"
              className="flex items-center gap-3 pl-6 pr-1.5 py-1.5 rounded-full bg-[#014BAA] text-white text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
            >
              <span>Send Broadcast</span>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#FAF6F3] text-[#014BAA]">
                <Megaphone size={12} />
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Navigation Panel */}
      <Link
        href="/garbage/admin/status"
        className="flex items-center justify-between p-4 rounded-xl glass-panel border border-[#014BAA]/10 border-l-[3px] border-l-[#014BAA] hover:border-[#014BAA]/20 hover:shadow-[0_4px_12px_rgba(1,75,170,0.04)] group transition-all"
      >
        <div className="space-y-0.5">
          <h3 className="text-[16px] font-medium text-[#014BAA] group-hover:text-brand-text transition-colors">
            House Status Dashboard
          </h3>
          <p className="text-[12px] font-light text-[#4A607A]">
            Monitor real-time route checklist status of households.
          </p>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#014BAA] border border-[#014BAA]/12 group-hover:bg-[#014BAA] text-white group-hover:text-white transition-all">
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* Broadcast Log (Reduced width and centered) */}
      <div className="flex-1 space-y-3 min-h-0 w-[84%] mx-auto">
        <h3 className="text-xs font-medium text-[#014BAA] flex items-center gap-1.5">
          <Bell size={13} className="text-[#4A607A]" />
          Recent Broadcast Logs
        </h3>

        <div className="rounded-xl border border-[#014BAA]/10 overflow-hidden bg-[#FAF6F3]">
          <div className="max-h-[160px] overflow-y-auto divide-y divide-[#014BAA]/8">
            {broadcasts.length === 0 ? (
              <div className="p-4 text-center text-[11px] font-light text-[#4A607A]">
                No announcements broadcasted yet.
              </div>
            ) : (
              broadcasts.map((b, idx) => (
                <div key={idx} className="p-3 flex items-start gap-3">
                  <div className="p-1.5 rounded bg-[#FAF6F3] text-[#014BAA]">
                    <Clock size={11} className="text-[#014BAA]" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-[#014BAA]">{b.actor}</span>
                      <span className="font-light text-[#4A607A]">{b.time}</span>
                    </div>
                    <p className="text-[11px] font-light text-[#0A3366] leading-relaxed">
                      {b.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
