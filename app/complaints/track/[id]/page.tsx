'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, CheckCircle, AlertCircle, Star, ShieldCheck, Hammer, Activity } from 'lucide-react';
import { fetchComplaintById, rateComplaint, Complaint } from '@/lib/api/complaints';
import Skeleton from '@/components/Skeleton';
import Toast from '@/components/Toast';

export default function ComplaintTracker() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    async function loadComplaint() {
      try {
        const data = await fetchComplaintById(id);
        if (data) {
          setComplaint(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadComplaint();
    }
  }, [id]);

  const handleRate = async (ratingValue: number) => {
    if (!complaint || complaint.status !== 'Resolved' || ratingLoading) return;

    setRatingLoading(true);
    try {
      const updated = await rateComplaint(complaint.id, ratingValue);
      setComplaint(updated);
      setToastMessage(`Thank you for rating this service ${ratingValue} stars!`);
      setToastType('success');
    } catch (err) {
      setToastMessage('Failed to save rating.');
      setToastType('warning');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-start py-4 space-y-6">
        <div className="flex items-center justify-between shrink-0">
          <div className="w-24 h-6 bg-brand-surface-alt/60 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-brand-surface-alt/60 rounded animate-pulse"></div>
        </div>
        <Skeleton variant="card" count={1} />
        <Skeleton variant="list" count={1} />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle size={40} className="text-brand-warning/80" />
        <div className="space-y-1">
          <h2 className="text-base font-medium text-brand-text">Complaint Not Found</h2>
          <p className="text-xs font-light text-brand-text-muted">
            The grievance ticket ID <span className="font-mono text-brand-accent">{id}</span> does not exist or has been removed.
          </p>
        </div>
        <Link
          href="/complaints/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-surface-alt border border-brand-accent/20 text-xs text-brand-accent hover:bg-brand-surface-alt/60"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Define steps for status timeline
  const steps: { status: Complaint['status']; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      status: 'Submitted',
      label: 'Submitted',
      desc: 'Logged with geo-tagged coordinate validation and anti-fraud visual check.',
      icon: <CheckCircle size={14} />
    },
    {
      status: 'Assigned',
      label: 'Assigned & Routed',
      desc: `Assigned to department: ${complaint.department}`,
      icon: <ShieldCheck size={14} />
    },
    {
      status: 'In Progress',
      label: 'In Progress',
      desc: 'Work order dispatched. Maintenance team heading to site.',
      icon: <Hammer size={14} />
    },
    {
      status: 'Resolved',
      label: 'Resolved',
      desc: 'Remediation completed. Site inspection approved by Ward Member.',
      icon: <Activity size={14} />
    }
  ];

  const getStatusIndex = (status: Complaint['status']) => {
    switch (status) {
      case 'Resolved': return 3;
      case 'In Progress': return 2;
      case 'Assigned': return 1;
      case 'Submitted':
      default:
        return 0;
    }
  };

  const activeIndex = getStatusIndex(complaint.status);

  return (
    <div className="fixed inset-0 w-full max-w-[480px] mx-auto z-40 bg-[#FAF6F3] overflow-y-auto flex flex-col select-none no-scrollbar">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Curved Top Brand Banner Header (No top back button) */}
      <div className="w-full px-5 pt-8 pb-8 bg-gradient-to-b from-[#EF4444] via-[#EF4444] to-[#B91C1C] text-white flex flex-col relative shadow-lg shadow-[#EF4444]/15 shrink-0 rounded-b-[40px] space-y-6">
        {/* Header Title + ID Badge Row */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-[24px] font-medium leading-none tracking-tight">Grievance Status</h2>
          <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-white shrink-0 tracking-wider">
            ID: {complaint.id}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[13px] font-light text-white/80 leading-normal">
            Real-time resolution updates and municipal routing log.
          </p>
        </div>

        {/* Overview Card nested inside the red banner */}
        <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm text-slate-800">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-[#EF4444]/8 text-[#B91C1C] border border-[#EF4444]/15 uppercase tracking-wider">
                {complaint.category}
              </span>
              <h3 className="text-[18px] font-medium text-slate-800 pt-0.5">{complaint.category} Issue</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-light text-slate-400 block uppercase tracking-wider">Filed Date</span>
              <span className="text-[13px] font-medium text-slate-800">{complaint.date}</span>
            </div>
          </div>

          <p className="text-[15px] font-light text-slate-600 leading-relaxed">
            {complaint.description}
          </p>

          {/* Location details */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F3] border border-slate-200/60 text-[13px] font-light text-slate-600 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#EF4444] shrink-0" />
              <span className="font-medium text-slate-700">{complaint.latitude.toFixed(4)}° N, {complaint.longitude.toFixed(4)}° E</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">PASS</span>
          </div>

          {/* Photo and ETA Grid */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <img 
                src={complaint.photoUrl} 
                alt="Grievance record" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] text-white border border-white/10 font-medium">
                Verified Photo
              </div>
            </div>
            
            <div className="flex flex-col justify-center p-4 rounded-2xl bg-[#FAF6F3] border border-slate-200/60 text-center space-y-1 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Estimated Resolution</span>
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                <Clock size={16} className="text-[#EF4444]" />
                <span className="text-[15px] font-medium text-slate-800">
                  {complaint.status === 'Resolved' ? 'Completed' : `${complaint.etaDays} Days Left`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content (Timeline and Feedback) */}
      <div className="w-full px-5 pt-6 pb-28 flex-1 flex flex-col space-y-6 relative z-10">
        
        {/* Live Timeline Card */}
        <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 space-y-5 shadow-sm">
          <h3 className="text-[18px] font-medium text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-[#EF4444]" />
            <span>Resolution Timeline</span>
          </h3>

          <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-2.5">
            {steps.map((step, idx) => {
              const isCompleted = idx <= activeIndex;
              const isActive = idx === activeIndex;
              return (
                <div key={idx} className="relative">
                  {/* Node Circle */}
                  <div 
                    className={`absolute -left-[35px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-white ${
                      isCompleted 
                        ? 'border-[#EF4444] text-[#B91C1C] shadow-sm' 
                        : 'border-slate-200 text-slate-300'
                    } ${isActive ? 'ring-4 ring-[#EF4444]/15' : ''}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-[#EF4444]' : 'bg-transparent'}`} />
                  </div>

                  <div className="space-y-0.5">
                    <h4 
                      className={`text-[15px] font-medium transition-colors ${
                        isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p 
                      className={`text-[13px] font-light leading-relaxed transition-colors ${
                        isCompleted ? 'text-slate-500' : 'text-slate-300/40'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Feedback Card */}
        <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <h3 className="text-[18px] font-medium text-slate-800">Service Feedback</h3>

          {complaint.status !== 'Resolved' ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#EF4444]/10 bg-[#EF4444]/5 text-center justify-center">
              <span className="text-[13px] font-light text-slate-600 leading-relaxed">
                Rating submissions will unlock once the municipal task force marks this grievance as <span className="text-[#B91C1C] font-medium">Resolved</span>.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] font-light text-slate-500 leading-relaxed">
                This grievance has been resolved. Please evaluate the work quality and responsiveness of the department below:
              </p>

              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isStarred = complaint.rating 
                    ? starValue <= complaint.rating
                    : starValue <= (hoverRating ?? 0);
                  
                  return (
                    <button
                      key={starValue}
                      onClick={() => handleRate(starValue)}
                      onMouseEnter={() => !complaint.rating && setHoverRating(starValue)}
                      onMouseLeave={() => !complaint.rating && setHoverRating(null)}
                      disabled={complaint.rating !== undefined || ratingLoading}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${
                        complaint.rating !== undefined
                          ? isStarred
                            ? 'border-[#EF4444]/30 bg-[#EF4444]/5 text-[#B91C1C]'
                            : 'border-slate-200 bg-[#FAF6F3]/50 text-slate-300'
                          : isStarred
                            ? 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#B91C1C] scale-105'
                            : 'border-slate-200 bg-[#FAF6F3] text-slate-400 hover:border-[#EF4444]/40 hover:bg-slate-50'
                      } active:scale-95 cursor-pointer shadow-sm`}
                      aria-label={`Rate ${starValue} stars`}
                    >
                      <Star 
                        size={22} 
                        fill={isStarred ? 'currentColor' : 'none'} 
                        className="transition-transform duration-100"
                      />
                    </button>
                  );
                })}
              </div>

              {complaint.rating !== undefined ? (
                <div className="text-center pt-1">
                  <span className="inline-block text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    Feedback Received ({complaint.rating} / 5 Stars)
                  </span>
                </div>
              ) : (
                <div className="text-center text-[12px] font-light text-slate-400">
                  {hoverRating ? `Rate ${hoverRating} star${hoverRating > 1 ? 's' : ''}` : 'Tap a star to submit your review'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back to Dashboard CTA (design.md primary button) */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => router.push('/complaints/dashboard')}
            className="flex items-center justify-between w-[240px] pl-5 pr-1.5 py-[5px] rounded-full text-[15px] font-medium bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white hover:opacity-95 shadow-md shadow-[#EF4444]/15 active:scale-[0.96] transition-all cursor-pointer min-h-[48px]"
          >
            <span>Back to Dashboard</span>
            <div className="w-9 h-9 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-sm border border-[#EF4444]/10">
              <ArrowLeft size={16} />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
