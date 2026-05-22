'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Camera, MapPin, Route, RefreshCw, Star, LogOut, ArrowRight, Clock, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchComplaints, Complaint } from '@/lib/api/complaints';
import Skeleton from '@/components/Skeleton';
import Toast from '@/components/Toast';

// Premium Civic Index Gauge Component (Differentiation Anchor)
const CivicHealthGauge = ({ percentage }: { percentage: number }) => {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        {/* Background track ring */}
        <path
          className="text-white/10"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        {/* Active progress ring with premium animation */}
        <path
          className="text-[#FAF6F3] transition-all duration-1000 ease-out"
          strokeWidth="3.5"
          strokeDasharray={`${percentage}, 100`}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      {/* Percentage Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[20px] font-medium text-white leading-none">{percentage}%</span>
        <span className="text-[11px] font-light text-white/80 tracking-wider mt-0.5 uppercase">Solved</span>
      </div>
    </div>
  );
};

// Tactical Progressive Status Tracker for Grievances
const ProgressiveTracker = ({ currentStatus }: { currentStatus: string }) => {
  const steps = ['Filed', 'Assigned', 'Progress', 'Resolved'];
  
  // Map API status to step indices
  const getActiveIndex = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 3;
      case 'In Progress':
        return 2;
      case 'Assigned':
        return 1;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveIndex(currentStatus);

  return (
    <div className="w-full pt-2">
      {/* Timeline track line */}
      <div className="relative flex items-center justify-between w-full">
        <div className="absolute left-0 right-0 h-[2px] bg-slate-200 top-[6px] -z-10" />
        <div 
          className="absolute left-0 h-[2px] bg-[#EF4444] top-[6px] -z-10 transition-all duration-500" 
          style={{ width: `${(activeIndex / 3) * 100}%` }}
        />
        
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          const isActive = idx === activeIndex;
          
          return (
            <div key={idx} className="flex flex-col items-center space-y-1">
              <div 
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-[#EF4444] border-[#EF4444] scale-110 shadow-sm shadow-[#EF4444]/20' 
                    : 'bg-white border-slate-300'
                }`}
              >
                {isCompleted && (
                  <span className="w-1 h-1 rounded-full bg-white" />
                )}
              </div>
              <span 
                className={`text-[9px] tracking-tight ${
                  isActive 
                    ? 'font-medium text-[#EF4444]' 
                    : isCompleted 
                      ? 'font-light text-slate-700' 
                      : 'font-light text-slate-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ComplaintsDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Citizen');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('complaints_username');
      if (!stored) {
        router.push('/complaints/login');
      } else {
        setUsername(stored);
      }
    }
  }, [router]);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await fetchComplaints();
        setComplaints(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('complaints_username');
    setToastMessage('Signed out successfully.');
    setTimeout(() => {
      router.push('/complaints');
    }, 1000);
  };

  const getStatusBadgeClass = (status: Complaint['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/50';
      case 'In Progress':
        return 'bg-amber-50 text-amber-600 border-amber-200/50';
      case 'Assigned':
        return 'bg-blue-50 text-blue-600 border-blue-200/50';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200/50';
    }
  };

  // Compute live resolution rate
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const featureCallouts = [
    { icon: <Camera size={20} className="text-[#EF4444]" />, label: 'GPS Photo', desc: 'Secure upload' },
    { icon: <MapPin size={20} className="text-[#EF4444]" />, label: 'Geo-Tag', desc: 'Auto stamp' },
    { icon: <Route size={20} className="text-[#EF4444]" />, label: 'Smart Route', desc: 'Dept assign' },
    { icon: <RefreshCw size={20} className="text-[#EF4444]" />, label: 'Live Logs', desc: 'Realtime feed' },
    { icon: <Star size={20} className="text-[#EF4444]" />, label: 'Feedback', desc: 'Direct rating' },
    { icon: <LogOut size={20} className="text-slate-500 group-hover:text-rose-500 transition-colors" />, label: 'Sign Out', desc: 'Exit session', onClick: handleSignOut, isAction: true },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6 select-none">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="info" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Top curved brand banner */}
      <div className="-mx-4 -mt-8 px-4 pt-8 pb-7 rounded-b-[40px] bg-gradient-to-b from-[#EF4444] via-[#EF4444] to-[#B91C1C] shadow-lg shadow-[#EF4444]/15 flex flex-col space-y-5">
        
        {/* Profile header row */}
        <div className="flex items-center py-1 text-white">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center font-medium text-white text-[18px]">
              {username ? username.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="space-y-0.5">
              <p className="text-[14px] font-light text-white/80">Welcome back,</p>
              <h2 className="text-[24px] font-medium text-white tracking-tight leading-tight">{username}</h2>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Radar Card inside banner */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between text-white">
          <div className="space-y-1.5">
            <span className="text-[12px] font-medium uppercase tracking-widest text-white/80 block">
              Grievance Index
            </span>
            <div className="space-y-0.5">
              <span className="text-[28px] font-medium leading-none">{resolvedCount} / {totalCount}</span>
              <p className="text-[13px] font-light text-white/80">
                Grievances successfully resolved in Ward
              </p>
            </div>
          </div>
          <CivicHealthGauge percentage={resolutionRate} />
        </div>
      </div>

      {/* Prominent File Complaint CTA (design.md rounded pill + custom wrapper) */}
      <div className="px-1 pt-1">
        <Link
          href="/complaints/file"
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#EF4444]/15 bg-[#FAF6F3] hover:bg-[#FAF6F3]/80 transition-all text-left shadow-md shadow-[#EF4444]/5 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <Plus size={22} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[17px] font-medium text-slate-800 transition-colors">
                File New Grievance
              </span>
              <p className="text-[13px] font-light text-slate-500 leading-tight">
                Submit live photos, auto-stamp GPS location, and assign to ward office.
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border border-slate-700 bg-white flex items-center justify-center text-black group-hover:text-[#EF4444] group-hover:border-[#EF4444]/25 shrink-0 transition-all">
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Complaints List Section */}
      <div className="flex-1 space-y-3.5 min-h-0 flex flex-col px-1">
        <h3 className="text-[18px] font-medium text-slate-800 flex items-center gap-2 shrink-0">
          <Clock size={20} className="text-slate-400" />
          <span>Recent Filings ({complaints.length})</span>
        </h3>

        <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-4">
                <Skeleton variant="list" count={2} />
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-[12px] font-light text-slate-400 flex flex-col items-center justify-center h-full space-y-2">
                <ShieldCheck size={32} className="text-emerald-500" />
                <div className="space-y-0.5">
                  <p className="font-medium text-slate-700">No active grievances</p>
                  <p className="max-w-[200px] text-[13px]">Your neighborhood is clean! Use the panel above if any issues occur.</p>
                </div>
              </div>
            ) : (
              complaints.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/complaints/track/${c.id}`)}
                  className="w-full p-4 flex flex-col space-y-3 hover:bg-[#FAF6F3]/30 text-left transition-colors group cursor-pointer"
                >
                  {/* Top line category & status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[17px] font-medium text-slate-800 group-hover:text-[#EF4444] transition-colors">
                          {c.category}
                        </span>
                        <span className="text-[13px] font-light text-slate-400">
                          #{c.id}
                        </span>
                      </div>
                      <p className="text-[13px] font-light text-slate-700">
                        Filed {c.date} • {c.department}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[13px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                      {c.rating && (
                        <div className="flex items-center gap-0.5 text-amber-500 text-[12px] font-medium">
                          <Star size={16} fill="currentColor" />
                          <span>{c.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grievance description */}
                  <p className="text-[13px] font-light text-slate-800 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Horizontal progressive tracker component */}
                  <ProgressiveTracker currentStatus={c.status} />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Touch-First Toolbox Strip at Bottom */}
      <div className="space-y-3 pt-3 shrink-0 border-t border-slate-200/60 px-1">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-slate-800 uppercase tracking-widest block">
            Citizen Toolbox
          </span>
          <span className="text-[12px] font-light text-slate-700">
            Swipe for more
          </span>
        </div>
        <div className="flex items-center justify-between gap-3.5 overflow-x-auto pb-2 scrollbar-thin">
          {featureCallouts.map((f, idx) => {
            const Component = f.onClick ? 'button' : 'div';
            return (
              <Component
                key={idx}
                onClick={f.onClick}
                className={`flex-1 min-w-[112px] min-h-[108px] p-4 text-center flex flex-col items-center justify-center space-y-2 transition-all duration-300 ease-out select-none rounded-2xl border ${
                  f.isAction
                    ? 'bg-slate-50 hover:bg-rose-50/40 border-slate-200/85 hover:border-rose-300/40 active:scale-[0.96] shadow-sm cursor-pointer group'
                    : 'bg-[#FAF6F3]/60 border-slate-200/80 hover:bg-white hover:border-[#EF4444]/25 hover:shadow-md hover:shadow-[#EF4444]/2'
                }`}
              >
                <div className={`p-2.5 rounded-full shrink-0 transition-transform duration-300 ${
                  f.isAction
                    ? 'bg-slate-100 group-hover:bg-rose-100/50'
                    : 'bg-[#EF4444]/5 border border-[#EF4444]/10'
                }`}>
                  {f.icon}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-[14px] font-medium leading-tight tracking-tight ${
                    f.isAction ? 'text-slate-700 group-hover:text-rose-600' : 'text-slate-800'
                  }`}>
                    {f.label}
                  </p>
                  <p className="text-[11px] font-light text-slate-400 leading-tight whitespace-nowrap">
                    {f.desc}
                  </p>
                </div>
              </Component>
            );
          })}
        </div>
      </div>
    </div>
  );
}
