'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Megaphone, Bell, Clock, Download, AlertTriangle, CheckCircle2, PieChart as PieIcon, Settings } from 'lucide-react';
import { fetchBroadcasts, fetchResidents, addBroadcast, Broadcast, House } from '@/lib/api/garbage';
import Toast from '@/components/Toast';
import Skeleton from '@/components/Skeleton';
import gsap from 'gsap';
import { BarChart as RechartsChart, Bar as RechartsBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

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
        <circle cx={92} cy={18} r={3} fill="#EFEAE6" stroke="#000000" strokeWidth={1} />
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
  const [activeTab, setActiveTab] = useState<'overview' | 'ward'>('overview');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('Sajibur Rahman');
  const [avatarUrl, setAvatarUrl] = useState('/avatar.png');

  // Form states for settings
  const [tempName, setTempName] = useState('Sajibur Rahman');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! 🌅';
    if (hour < 17) return 'Good afternoon! ☀️';
    return 'Good evening! 🌙';
  };

  const saveSettings = () => {
    setDisplayName(tempName);
    setIsSettingsOpen(false);
    setToastMessage('Profile settings updated successfully!');
    setToastType('success');
  };

  useEffect(() => {
    const role = localStorage.getItem('sgcs_role');
    if (role === 'ward') {
      setActiveTab('ward');
    }
    const storedName = localStorage.getItem('sgcs_username');
    if (storedName) {
      setDisplayName(storedName);
      setTempName(storedName);
    }
  }, []);

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
  const attemptedCount = houses.filter(h => h.status === 'attempted').length;
  const pendingCount = houses.filter(h => h.status === 'pending').length;
  const totalCount = houses.length;
  const coveragePercent = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  const handleExport = () => {
    setToastMessage('Exporting PDF Sanitation Audit Report for Ward 1...');
    setToastType('success');
    setTimeout(() => {
      setToastMessage('Download initiated! Check your browser downloads.');
      setToastType('success');
    }, 1500);
  };

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

      {/* Top Banner Section with Royal Blue Gradient & Curved Bottom */}
      <div className="-mx-4 -mt-8 px-4 pt-8 pb-6 rounded-b-[40px] bg-gradient-to-b from-[#014BAA] via-[#014BAA] to-[#0A3366] shadow-lg shadow-[#014BAA]/10 flex flex-col space-y-5">
        {/* Profile Header */}
        <div className="flex items-center justify-between py-1 text-white">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
              <img 
                src="/avatar.png" 
                alt="Sajibur Rahman" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-[16px] font-light text-white/80">{getGreeting()}</p>
              <h2 className="text-[24px] font-medium text-white tracking-tight">{displayName}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Settings/Profile Customization Button */}
            <button 
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center w-13 h-13 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 text-white transition-all min-h-[50px] min-w-[50px]"
              aria-label="Profile Customization"
            >
              <Settings size={22} />
            </button>
            {/* Notification Button */}
            <button 
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative flex items-center justify-center w-13 h-13 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 text-white transition-all min-h-[50px] min-w-[50px]"
              aria-label="Notifications"
            >
              <Bell size={22} />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#FF5A36] ring-2 ring-[#014BAA]" />
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
                  <span className="text-[12px] font-medium tracking-wider uppercase text-black">
                    Collection Rate
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-3xl font-medium text-[#0A1C33]">{coveragePercent}%</span>
                    <p className="text-[12px] font-light text-black">
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
                  <span className="text-[12px] font-medium tracking-wider uppercase text-black">
                    Active Route
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-3xl font-medium text-[#0A1C33]">Ward 1</span>
                    <p className="text-[13px] font-light text-black">
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
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === 0 ? 'w-4 bg-white' : 'bg-white/40'}`}
              aria-label="Collection rate stats"
            />
            <button 
              type="button"
              onClick={() => setActiveSlide(1)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === 1 ? 'w-4 bg-white' : 'bg-white/40'}`}
              aria-label="Active route tracking"
            />
          </div>
        </div>

        {/* Dynamic Tab Switcher inside the blue banner */}
        <div className="flex justify-center p-1 bg-white/10 border border-white/15 backdrop-blur-md rounded-full w-[90%] mx-auto shadow-inner mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 px-4 rounded-full text-[16px] transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-[#014BAA] font-medium shadow-md'
                : 'text-white/80 font-light hover:text-white hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ward')}
            className={`flex-1 py-2.5 px-4 rounded-full text-[16px] transition-all cursor-pointer ${
              activeTab === 'ward'
                ? 'bg-white text-[#014BAA] font-medium shadow-md'
                : 'text-white/80 font-light hover:text-white hover:bg-white/5'
            }`}
          >
            Ward Monitor
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Send Notification Broadcast (Taller text area, centered pill CTA button) */}
          <div className="py-6 px-5 rounded-xl glass-panel border border-[#014BAA]/10 space-y-5">
            <h3 className="text-[21px] font-medium text-black flex items-center justify-center gap-1.5">
              <Megaphone size={20} className="text-black mr-2" />
              Broadcast to Ward Residents
            </h3>
            
            <form onSubmit={handleBroadcast} className="space-y-5 flex flex-col">
              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Write announcement (e.g. Collection delayed today due to rain)..."
                className="w-full h-40 p-3 rounded-lg border border-[#014BAA]/12 bg-white text-[#0A1C33] text-[15px] font-light placeholder-[#6B7F96] focus:outline-none focus:border-[#014BAA]/50 transition-colors resize-none"
              />
              <div className="flex justify-center w-full">
                <button
                  type="submit"
                  className="flex items-center gap-3 pl-6 pr-1.5 py-[5px] rounded-full bg-[#014BAA] text-white text-[15px] font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
                >
                  <span>Send Broadcast</span>
                  <span className="flex items-center justify-center w-13 h-13 rounded-full bg-[#FAF6F3] text-[#014BAA] min-h-[50px] min-w-[50px]">
                    <Megaphone size={22} />
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
              <h3 className="text-[18px] font-medium text-[#014BAA] group-hover:text-brand-text transition-colors">
                House Status Dashboard
              </h3>
              <p className="text-[12px] font-light text-black">
                Monitor real-time route checklist status of households.
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#014BAA] border border-[#014BAA]/12 group-hover:bg-[#014BAA] text-white group-hover:text-white transition-all">
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </>
      ) : (
        <>
          {/* Recharts Pie Chart Visual & Numeric stats */}
          <div className="p-5 rounded-2xl glass-panel border border-[#014BAA]/15 flex items-center justify-between gap-6">
            <div className="relative w-[130px] h-[130px] flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Cleaned', value: collectedCount, color: '#10B981' },
                      { name: 'Missed', value: attemptedCount, color: '#EF4444' },
                      { name: 'Pending', value: pendingCount, color: '#6B7F96' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {[
                      { name: 'Cleaned', value: collectedCount, color: '#10B981' },
                      { name: 'Missed', value: attemptedCount, color: '#EF4444' },
                      { name: 'Pending', value: pendingCount, color: '#6B7F96' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF6F3',
                      borderColor: 'rgba(1, 75, 170, 0.15)',
                      borderRadius: '12px',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 500
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5 pointer-events-none">
                <span className="text-[22px] font-medium text-[#0A1C33] leading-none">{coveragePercent}%</span>
                <span className="text-[12px] font-light text-[#0A3366]/60 uppercase tracking-wider">Cleared</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-0.5">
                <h3 className="text-[18px] font-medium text-[#0A1C33]">Coverage Summary</h3>
                <p className="text-[14px] font-light text-[#000000]/60">
                  Daily route tracking index.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[15px]">
                <div className="space-y-0.5 border-l border-[#10B981]/40 pl-2">
                  <span className="text-[#000000]/60 block font-light">Cleaned</span>
                  <span className="text-[#10B981] text-[12px] font-medium block">{collectedCount} Houses</span>
                </div>
                <div className="space-y-0.5 border-l border-[#EF4444]/40 pl-2">
                  <span className="text-[#000000]/60 block font-light">Missed</span>
                  <span className="text-[#EF4444] text-[12px] font-medium block">{attemptedCount} Houses</span>
                </div>
                <div className="space-y-0.5 border-l border-[#6B7F96]/40 col-span-2 pl-2">
                  <span className="text-[#000000]/60 block font-light">Pending</span>
                  <span className="text-[#6B7F96] text-[12px] font-medium block">{pendingCount} Houses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Report Action */}
          <div className="flex justify-center w-full">
            <button
              onClick={handleExport}
              className="flex items-center gap-3 pl-6 pr-1.5 py-[5px] rounded-full bg-[#014BAA] text-white text-[15px] font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150 cursor-pointer"
            >
              <span>Export Ward Audit Report</span>
              <span className="flex items-center justify-center w-13 h-13 rounded-full bg-[#FAF6F3] text-[#014BAA] min-h-[50px] min-w-[50px]">
                <Download size={22} />
              </span>
            </button>
          </div>

          {/* Pending & Missed Houses list */}
          <div className="flex-1 space-y-3 min-h-0 flex flex-col text-black">
            <h3 className="text-[20px] font-medium text-[#0A1C33] flex items-center justify-center gap-1.5 shrink-0">
              <AlertTriangle size={13} className="text-[#EF4444] shrink-0" />
              <span>Pending & Missed Houses ({pendingCount + attemptedCount})</span>
            </h3>

            <div className="flex-1 rounded-xl border border-[#014BAA]/10 bg-[#FAF6F3]/50 overflow-hidden flex flex-col">
              <div className="max-h-[220px] overflow-y-auto divide-y divide-[#014BAA]/8">
                {houses.filter(h => h.status !== 'done').length === 0 ? (
                  <div className="p-8 text-center text-[12px] font-light text-[#000000]/60 flex flex-col items-center justify-center h-full gap-1.5">
                    <CheckCircle2 size={24} className="text-[#10B981]" />
                    <p>100% Ward Coverage Achieved!</p>
                  </div>
                ) : (
                  houses.filter(h => h.status !== 'done').map((h) => (
                    <div key={h.id} className="p-3.5 flex items-start justify-between gap-3 bg-[#FAF6F3]/30">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[18px] font-medium text-[#0A1C33] block">{h.houseNo}</span>
                        <p className="text-[14px] font-light text-[#000000]/60 truncate leading-relaxed">
                          {h.address}
                        </p>
                      </div>
                      <span className={`text-[12px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                        h.status === 'attempted'
                          ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                          : 'bg-[#6B7F96]/10 text-[#6B7F96] border-[#6B7F96]/20'
                      }`}>
                        {h.status === 'attempted' ? 'Missed' : 'Pending'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Settings (Profile Customization) Drawer */}
      <Drawer open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-[#FAF6F3] rounded-t-[32px] p-6 flex flex-col space-y-4 outline-none border-t border-[#014BAA]/10 shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-[#014BAA]/8">
            <h3 className="text-[20px] font-medium text-[#0A1C33]">Profile Settings</h3>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-[12px] font-medium text-slate-500 hover:text-[#014BAA] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#014BAA]/20 shadow-md">
                <img 
                  src={avatarUrl} 
                  alt="Admin Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <p className="text-[12px] font-light text-slate-500">Administrator Profile</p>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1">
              <label className="text-[12px] font-medium uppercase tracking-wider text-[#0A1C33]">Display Name</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#014BAA]/15 bg-white text-[#0A1C33] text-[15px] focus:outline-none focus:border-[#014BAA] focus:ring-2 focus:ring-[#014BAA]/10 transition-all font-light shadow-sm"
                placeholder="e.g. Sajibur Rahman"
              />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1">
              <label className="text-[12px] font-medium uppercase tracking-wider text-[#0A1C33]">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#014BAA]/15 bg-white text-[#0A1C33] text-[15px] focus:outline-none focus:border-[#014BAA] focus:ring-2 focus:ring-[#014BAA]/10 transition-all font-light shadow-sm"
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            {/* Dashboard Auto-Refresh Select */}
            <div className="space-y-1">
              <label className="text-[12px] font-medium uppercase tracking-wider text-[#0A1C33]">Dashboard Refresh</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#014BAA]/15 bg-white text-[#0A1C33] text-[15px] focus:outline-none focus:border-[#014BAA] transition-all font-light shadow-sm cursor-pointer"
              >
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 1 minute</option>
                <option value="300">Every 5 minutes</option>
                <option value="manual">Manual only</option>
              </select>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#014BAA]/8 bg-white shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[14px] font-medium text-[#0A1C33] block">Push Notifications</span>
                <span className="text-[11px] font-light text-slate-400 block">Receive instant desktop alerts</span>
              </div>
              <input 
                type="checkbox" 
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-[#014BAA] focus:ring-[#014BAA]/30 border-[#014BAA]/15 accent-[#014BAA] cursor-pointer"
              />
            </div>

            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#014BAA]/8 bg-white shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[14px] font-medium text-[#0A1C33] block">Email Alerts</span>
                <span className="text-[11px] font-light text-slate-400 block">Receive daily sanitation audits</span>
              </div>
              <input 
                type="checkbox" 
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#014BAA] focus:ring-[#014BAA]/30 border-[#014BAA]/15 accent-[#014BAA] cursor-pointer"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={saveSettings}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-[15px] font-medium bg-[#014BAA] text-white hover:opacity-95 shadow-md shadow-[#014BAA]/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Notifications Drawer */}
      <Drawer open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-[#FAF6F3] rounded-t-[32px] p-6 flex flex-col space-y-4 outline-none border-t border-[#014BAA]/10 shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-[#014BAA]/8">
            <h3 className="text-[20px] font-medium text-[#0A1C33] flex items-center gap-2">
              <Bell size={20} className="text-[#014BAA]" />
              Recent Broadcast Logs
            </h3>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="text-[12px] font-medium text-slate-500 hover:text-[#014BAA] cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div className="rounded-xl border border-[#014BAA]/10 overflow-hidden bg-white">
              <div className="divide-y divide-[#014BAA]/8 max-h-[60vh] overflow-y-auto">
                {broadcasts.length === 0 ? (
                  <div className="p-8 text-center text-[14px] font-light text-black">
                    No announcements broadcasted yet.
                  </div>
                ) : (
                  broadcasts.map((b, idx) => (
                    <div key={idx} className="p-4 flex items-start gap-3 hover:bg-[#FAF6F3]/50 transition-colors">
                      <div className="p-1.5 rounded bg-[#FAF6F3] text-[#014BAA]">
                        <Clock size={18} className="text-[#014BAA]" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center text-[15px]">
                          <span className="font-medium text-[#014BAA]">{b.actor}</span>
                          <span className="text-[12px] font-light text-slate-500">{b.time}</span>
                        </div>
                        <p className="text-[14px] font-light text-[#0A3366] leading-relaxed">
                          {b.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
