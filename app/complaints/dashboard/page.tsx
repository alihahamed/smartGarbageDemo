'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Camera, MapPin, Route, RefreshCw, Star, LogOut, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { fetchComplaints, Complaint } from '@/lib/api/complaints';
import Skeleton from '@/components/Skeleton';
import Toast from '@/components/Toast';

export default function ComplaintsDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
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

  const getStatusClass = (status: Complaint['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-brand-success/10 text-brand-success border-brand-success/20';
      case 'In Progress':
        return 'bg-brand-warning/10 text-brand-warning border-brand-warning/20';
      case 'Assigned':
        return 'bg-brand-accent/10 text-brand-accent border-brand-accent/20';
      default:
        return 'bg-brand-text-muted/10 text-brand-text-muted border-brand-text-muted/20';
    }
  };

  const featureCallouts = [
    { icon: <Camera size={14} className="text-brand-accent" />, label: 'Photo Upload', desc: 'Camera or gallery' },
    { icon: <MapPin size={14} className="text-brand-accent" />, label: 'Geo-Tagging', desc: 'Auto GPS capture' },
    { icon: <Route size={14} className="text-brand-accent" />, label: 'Auto Routing', desc: 'Dept assignment' },
    { icon: <RefreshCw size={14} className="text-brand-accent" />, label: 'Live Updates', desc: 'Real-time status' },
    { icon: <Star size={14} className="text-brand-accent" />, label: 'Rating System', desc: 'Service feedback' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="info" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-medium text-brand-text tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
            Citizen Portal
          </h2>
          <p className="text-[10px] font-light text-brand-text-muted">
            Signed in as <span className="font-medium text-brand-accent">{username}</span>
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg border border-brand-surface-alt bg-brand-surface-alt/45 text-brand-text-muted hover:text-brand-warning hover:border-brand-warning/35 transition-colors"
          title="Sign Out"
        >
          <LogOut size={14} />
        </button>
      </div>

      {/* Prominent File Complaint CTA */}
      <Link
        href="/complaints/file"
        className="w-full flex items-center justify-between p-4 rounded-xl border border-brand-accent/20 bg-brand-accent/5 hover:bg-brand-accent/10 transition-all text-left shadow-lg shadow-brand-accent/5 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent">
            <Plus size={18} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-brand-text group-hover:text-brand-accent transition-colors">
              File New Grievance
            </span>
            <p className="text-[10px] font-light text-brand-text-muted">
              Submit photos, auto-stamp GPS, and route to departments.
            </p>
          </div>
        </div>
        <ArrowRight size={14} className="text-brand-accent group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Complaints List Section */}
      <div className="flex-1 space-y-3 min-h-0 flex flex-col">
        <h3 className="text-xs font-medium text-brand-text flex items-center gap-1.5 shrink-0">
          <Clock size={13} className="text-brand-text-muted" />
          <span>Your Recent Complaints ({complaints.length})</span>
        </h3>

        <div className="flex-1 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 overflow-hidden flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3">
                <Skeleton variant="list" count={2} />
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-xs font-light text-brand-text-muted flex flex-col items-center justify-center h-full space-y-1.5">
                <AlertCircle size={20} className="text-brand-text-muted/40" />
                <p>No complaints submitted yet.</p>
                <p className="text-[9px] max-w-[200px]">Use the panel above to file civic issues in your neighborhood.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-surface-alt">
                {complaints.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => router.push(`/complaints/track/${c.id}`)}
                    className="w-full p-3.5 flex items-start justify-between gap-4 bg-brand-surface-alt/25 hover:bg-brand-surface-alt/45 text-left transition-colors group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-brand-text group-hover:text-brand-accent transition-colors">
                          {c.category}
                        </span>
                        <span className="text-[8px] text-brand-text-muted">
                          {c.id}
                        </span>
                      </div>
                      <p className="text-[10px] font-light text-brand-text-muted truncate leading-relaxed">
                        {c.description}
                      </p>
                      <p className="text-[9px] font-light text-brand-text-muted">
                        Filed: {c.date} • {c.department}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[8px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full border ${getStatusClass(c.status)}`}>
                        {c.status}
                      </span>
                      {c.rating && (
                        <div className="flex items-center gap-0.5 text-brand-accent text-[9px]">
                          <Star size={8} fill="currentColor" />
                          <span>{c.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Features Strip */}
      <div className="space-y-2 pt-2 shrink-0 border-t border-brand-surface-alt/30">
        <span className="text-[8px] font-medium text-brand-text-muted uppercase tracking-widest block">
          Municipal Grievance Features
        </span>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {featureCallouts.map((f, idx) => (
            <div key={idx} className="flex-1 min-w-[76px] bg-brand-surface-alt/30 border border-brand-surface-alt/60 p-2 rounded-xl text-center flex flex-col items-center justify-center space-y-1 select-none">
              <div className="p-1 rounded-lg bg-brand-accent/5 border border-brand-accent/10">
                {f.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-medium text-brand-text leading-tight">{f.label}</p>
                <p className="text-[7px] font-light text-brand-text-muted leading-tight whitespace-nowrap">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
