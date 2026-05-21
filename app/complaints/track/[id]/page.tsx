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
    <div className="flex-1 flex flex-col justify-between py-2 space-y-5">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Header Banner */}
      <div className="flex items-center justify-between shrink-0">
        <Link 
          href="/complaints/dashboard" 
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </Link>
        <span className="text-[10px] font-mono text-brand-text-muted">
          ID: {complaint.id}
        </span>
      </div>

      {/* Overview Block */}
      <div className="rounded-2xl glass-panel p-4 border border-brand-accent/20 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <span className="text-[9px] font-medium text-brand-accent uppercase tracking-widest bg-brand-accent/5 px-2.5 py-0.5 rounded-full border border-brand-accent/15">
              {complaint.category} Grievance
            </span>
            <h3 className="text-sm font-medium text-brand-text pt-1">{complaint.category} Issue</h3>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[8px] font-light text-brand-text-muted block">Filed Date</span>
            <span className="text-[10px] font-medium text-brand-text">{complaint.date}</span>
          </div>
        </div>

        <p className="text-xs font-light text-brand-text-muted leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & GPS Info */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-brand-surface-alt/40 border border-brand-surface-alt/60 text-[9px] font-light text-brand-text-muted">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-brand-accent shrink-0" />
            <span>{complaint.latitude.toFixed(4)}° N, {complaint.longitude.toFixed(4)}° E</span>
          </div>
          <span className="text-brand-text-muted/70">Radius validation check: PASS</span>
        </div>

        {/* Photo Record and ETA */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-brand-surface-alt">
            <img 
              src={complaint.photoUrl} 
              alt="Grievance record" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-brand-bg/85 px-1.5 py-0.5 rounded text-[7px] text-brand-accent border border-brand-accent/15">
              Site Photo
            </div>
          </div>
          <div className="flex flex-col justify-center p-3 rounded-lg bg-brand-surface-alt/30 border border-brand-surface-alt/40 text-center space-y-0.5">
            <span className="text-[8px] font-medium text-brand-text-muted uppercase tracking-wider block">Estimated Resolution</span>
            <div className="flex items-center justify-center gap-1">
              <Clock size={11} className="text-brand-accent" />
              <span className="text-xs font-medium text-brand-text">
                {complaint.status === 'Resolved' ? 'Completed' : `${complaint.etaDays} Days Left`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Status Timeline */}
      <div className="rounded-2xl glass-panel p-5 border border-brand-accent/10 space-y-4">
        <h3 className="text-xs font-medium text-brand-text flex items-center gap-1.5">
          <Clock size={13} className="text-brand-accent" />
          <span>Live Resolution Timeline</span>
        </h3>

        <div className="relative pl-6 space-y-5 border-l border-brand-surface-alt">
          {steps.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isActive = idx === activeIndex;
            return (
              <div key={idx} className="relative">
                {/* Timeline node dot */}
                <div 
                  className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-brand-bg border-brand-accent text-brand-accent' 
                      : 'bg-brand-bg border-brand-surface-alt text-brand-text-muted/30'
                  } ${isActive ? 'glow-active' : ''}`}
                >
                  {step.icon}
                </div>

                <div className="space-y-0.5">
                  <h4 
                    className={`text-xs font-medium transition-colors ${
                      isCompleted ? 'text-brand-text' : 'text-brand-text-muted/40'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p 
                    className={`text-[10px] font-light leading-relaxed transition-colors ${
                      isCompleted ? 'text-brand-text-muted' : 'text-brand-text-muted/20'
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

      {/* Rating & Service Resolution Evaluation Panel */}
      <div className="rounded-2xl glass-panel p-5 border border-brand-accent/15 space-y-3 shrink-0">
        <h3 className="text-xs font-medium text-brand-text">Service Quality Feedback</h3>

        {complaint.status !== 'Resolved' ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 text-center justify-center">
            <span className="text-[10px] font-light text-brand-text-muted leading-normal">
              Rating submissions will unlock once the municipal task force marks this grievance as <span className="text-brand-accent font-medium">Resolved</span>.
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] font-light text-brand-text-muted leading-relaxed">
              This grievance has been resolved. Please evaluate the work quality and responsiveness of the department below:
            </p>

            <div className="flex items-center justify-center gap-2">
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
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${
                      complaint.rating !== undefined
                        ? isStarred
                          ? 'border-brand-accent/30 bg-brand-accent/5 text-brand-accent'
                          : 'border-brand-surface-alt bg-brand-bg/50 text-brand-text-muted/30'
                        : isStarred
                          ? 'border-brand-accent/50 bg-brand-accent/10 text-brand-accent scale-105'
                          : 'border-brand-surface-alt bg-brand-surface-alt/20 text-brand-text-muted hover:border-brand-accent/40'
                    }`}
                    aria-label={`Rate ${starValue} stars`}
                    style={{ minWidth: '48px', minHeight: '48px' }} // Touch Target safe area
                  >
                    <Star 
                      size={20} 
                      fill={isStarred ? 'currentColor' : 'none'} 
                      className="transition-transform duration-100 active:scale-125"
                    />
                  </button>
                );
              })}
            </div>

            {complaint.rating !== undefined ? (
              <div className="text-center">
                <span className="text-[9px] font-medium text-brand-success uppercase tracking-wider bg-brand-success/5 border border-brand-success/20 px-3 py-1 rounded-full">
                  Feedback Received ({complaint.rating} / 5 Stars)
                </span>
              </div>
            ) : (
              <div className="text-center text-[9px] font-light text-brand-text-muted">
                {hoverRating ? `Rate ${hoverRating} star${hoverRating > 1 ? 's' : ''}` : 'Tap a star to submit your review'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
