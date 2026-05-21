'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, CheckCircle, Phone, Calendar, ShieldCheck, Award } from 'lucide-react';
import { fetchWorkerById, WorkerProfile } from '@/lib/api/serviceHub';
import Skeleton from '@/components/Skeleton';

export default function WorkerProfileView() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const result = await fetchWorkerById(id);
        setWorker(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <Skeleton variant="profile" />
        <Skeleton variant="text" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs font-light text-brand-text-muted mb-4">Worker profile could not be resolved.</p>
        <Link href="/service-hub" className="text-xs text-brand-accent hover:underline">
          Return to Service Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Back button */}
      <div>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="w-full rounded-2xl glass-panel p-6 border border-brand-accent/25 flex flex-col items-center text-center space-y-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl bg-brand-surface-alt border border-brand-accent/15 flex items-center justify-center text-brand-accent text-3xl font-medium relative">
          {worker.name.split(' ').map(n => n[0]).join('')}
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-success border-2 border-brand-bg flex items-center justify-center text-brand-bg">
            <CheckCircle size={12} />
          </div>
        </div>

        {/* Name and title */}
        <div className="space-y-1">
          <h2 className="text-base font-medium text-brand-text">{worker.name}</h2>
          <p className="text-[10px] font-medium text-brand-accent capitalize tracking-wider uppercase">
            Verified {worker.category}
          </p>
        </div>

        {/* Rating and Distance strip */}
        <div className="flex gap-4 text-xs font-light text-brand-text-muted justify-center py-2 border-y border-brand-surface-alt/45 w-full">
          <span className="flex items-center gap-0.5 font-medium text-brand-text">
            <Star size={12} className="fill-brand-accent text-brand-accent" />
            {worker.rating} Rating
          </span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <MapPin size={12} />
            {worker.distanceKm} km away
          </span>
          <span>•</span>
          <span>{worker.jobsCompleted} jobs</span>
        </div>

        {/* Contact details */}
        <div className="flex items-center gap-2 text-xs font-light text-brand-text-muted bg-brand-bg/40 px-4 py-2.5 rounded-lg border border-brand-surface-alt w-full justify-center">
          <Phone size={12} className="text-brand-accent" />
          <span>Contact: <strong>{worker.phone}</strong></span>
        </div>
      </div>

      {/* Bio / Description */}
      <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 space-y-2">
        <h3 className="text-[10px] font-medium text-brand-text uppercase tracking-wider">
          Professional Biography
        </h3>
        <p className="text-xs font-light text-brand-text-muted leading-relaxed">
          {worker.bio}
        </p>
      </div>

      {/* Municipal verification criteria */}
      <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 space-y-3">
        <h3 className="text-[10px] font-medium text-brand-text uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck size={12} className="text-brand-accent" />
          SV Verification Record
        </h3>
        
        <div className="grid grid-cols-2 gap-2 text-[10px] font-light">
          <div className="flex items-center gap-1.5 p-2 rounded bg-brand-bg/40 border border-brand-surface-alt">
            <Award size={12} className="text-brand-accent shrink-0" />
            <span className="text-brand-text truncate">Identity Verified</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded bg-brand-bg/40 border border-brand-surface-alt">
            <ShieldCheck size={12} className="text-brand-accent shrink-0" />
            <span className="text-brand-text truncate">Police Clearance</span>
          </div>
        </div>
      </div>

      {/* Action scheduling button */}
      <Link
        href={`/service-hub/book/${worker.id}`}
        className="w-full py-3 rounded-lg bg-brand-accent text-brand-bg text-center text-xs font-medium hover:bg-brand-accent/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/15"
      >
        <Calendar size={14} />
        <span>Schedule Appointment Slot</span>
      </Link>
    </div>
  );
}
