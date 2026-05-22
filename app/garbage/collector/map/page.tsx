'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, HelpCircle, Map, List, Compass } from 'lucide-react';
import { fetchResidents, House } from '@/lib/api/garbage';
import Skeleton from '@/components/Skeleton';

export default function CollectorMap() {
  const router = useRouter();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [shiftStarted, setShiftStarted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isShift = localStorage.getItem('sgcs_shift_started') === 'true';
      setShiftStarted(isShift);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await fetchResidents();
        setHouses(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (shiftStarted) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [shiftStarted]);

  const collectedCount = houses.filter(h => h.status === 'done').length;
  const attemptedCount = houses.filter(h => h.status === 'attempted').length;
  const pendingCount = houses.filter(h => h.status === 'pending').length;
  const totalCount = houses.length;
  const coveragePercent = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  if (!shiftStarted && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-warning/15 flex items-center justify-center text-brand-warning">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-[16px] font-medium text-brand-text">Shift Lock Active</h3>
          <p className="text-[12px] font-light text-brand-text-muted max-w-[280px] mx-auto leading-relaxed">
            Please start your shift in the Collector Console before accessing routes.
          </p>
        </div>
        <Link
          href="/garbage/collector"
          className="px-4 py-[10px] bg-brand-accent text-brand-bg text-[12px] font-medium rounded-lg hover:bg-brand-accent/90 transition-colors"
        >
          Go to Collector Shift
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
      {/* Top navigation header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/garbage/collector" 
          className="inline-flex items-center gap-1 text-[12px] text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Collector Shift</span>
        </Link>
        
        {/* Toggle Mode */}
        <div className="flex rounded-lg border border-brand-surface-alt bg-brand-surface-alt/45 p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`py-[7px] px-1.5 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-muted hover:text-brand-text'
            }`}
            aria-label="List View"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`py-[7px] px-1.5 rounded-md transition-colors ${
              viewMode === 'map' ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-muted hover:text-brand-text'
            }`}
            aria-label="Interactive Route Map"
          >
            <Map size={14} />
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-4 rounded-xl glass-panel border border-brand-accent/15 space-y-3">
        <div className="flex justify-between items-center text-[12px] text-brand-text-muted">
          <span className="font-medium uppercase tracking-wider">Route Progress (Ward 1)</span>
          <span className="text-brand-accent">{coveragePercent}% Coverage</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-brand-surface-alt/60 overflow-hidden flex">
          <div className="bg-brand-success h-full transition-all" style={{ width: `${coveragePercent}%` }}></div>
          <div className="bg-brand-warning h-full transition-all" style={{ width: `${totalCount > 0 ? (attemptedCount / totalCount) * 100 : 0}%` }}></div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-brand-bg/40 p-1.5 rounded border border-brand-surface-alt">
            <div className="text-[16px] font-medium text-brand-success">{collectedCount}</div>
            <div className="text-[12px] font-light text-brand-text-muted">Done</div>
          </div>
          <div className="bg-brand-bg/40 p-1.5 rounded border border-brand-surface-alt">
            <div className="text-[16px] font-medium text-brand-warning">{attemptedCount}</div>
            <div className="text-[12px] font-light text-brand-text-muted">Attempted</div>
          </div>
          <div className="bg-brand-bg/40 p-1.5 rounded border border-brand-surface-alt">
            <div className="text-[16px] font-medium text-brand-text-muted">{pendingCount}</div>
            <div className="text-[12px] font-light text-brand-text-muted">Pending</div>
          </div>
        </div>
      </div>

      {/* Main Body content */}
      <div className="flex-1 min-h-[320px] flex flex-col justify-between">
        {loading ? (
          <Skeleton variant="list" count={4} />
        ) : viewMode === 'list' ? (
          /* List of houses */
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {houses.map((house) => (
              <button
                key={house.id}
                onClick={() => router.push(`/garbage/collector/house/${house.id}`)}
                className="w-full py-[13px] px-3 rounded-xl border border-brand-accent/10 bg-brand-surface-alt/25 hover:border-brand-accent/40 hover:bg-brand-surface-alt/55 text-left transition-all flex justify-between items-center group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-medium text-brand-text group-hover:text-brand-accent transition-colors">
                      {house.houseNo}
                    </span>
                    {house.status === 'done' && (
                      <span className="text-[12px] font-medium uppercase tracking-wider text-brand-success px-1.5 py-0.5 rounded bg-brand-success/10 border border-brand-success/20 flex items-center gap-0.5">
                        <CheckCircle2 size={11} /> Done
                      </span>
                    )}
                    {house.status === 'attempted' && (
                      <span className="text-[12px] font-medium uppercase tracking-wider text-brand-warning px-1.5 py-0.5 rounded bg-brand-warning/10 border border-brand-warning/20 flex items-center gap-0.5">
                        <AlertCircle size={11} /> Attempt
                      </span>
                    )}
                    {house.status === 'pending' && (
                      <span className="text-[12px] font-medium uppercase tracking-wider text-brand-text-muted px-1.5 py-0.5 rounded bg-brand-surface-alt/60 border border-brand-surface-alt flex items-center gap-0.5">
                        <HelpCircle size={11} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-light text-brand-text-muted truncate">
                    {house.address}
                  </p>
                </div>
                <div className="text-[12px] font-medium text-brand-accent group-hover:translate-x-0.5 transition-transform shrink-0">
                  Manage →
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* High-Fidelity SVG Route Map */
          <div className="w-full flex-1 flex flex-col justify-between p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/20">
            <div className="flex items-center justify-between text-[12px] text-brand-text-muted mb-2">
              <span className="flex items-center gap-1">
                <Compass size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                Interactive Route Map
              </span>
              <span>GPS Precision: 3.2m</span>
            </div>

            <div className="flex-1 aspect-[4/3] rounded-lg border border-brand-accent/5 bg-brand-bg/60 p-2 relative flex items-center justify-center overflow-hidden">
              {/* Route Road Grid representation */}
              <svg className="w-full h-full text-brand-surface-alt/45" viewBox="0 0 100 80">
                <path d="M 10 10 Q 50 15 50 40 T 90 70" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M 20 65 Q 40 50 50 40 T 80 15" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
              </svg>

              {/* Dynamic Coordinate Points mapping to houses */}
              {houses.slice(0, 8).map((house, idx) => {
                const positions = [
                  { x: 10, y: 10 },
                  { x: 25, y: 13 },
                  { x: 42, y: 22 },
                  { x: 50, y: 40 },
                  { x: 55, y: 55 },
                  { x: 70, y: 62 },
                  { x: 83, y: 66 },
                  { x: 90, y: 70 }
                ];
                const pos = positions[idx] || { x: 50, y: 40 };
                const dotColor = 
                  house.status === 'done' ? 'bg-brand-success' :
                  house.status === 'attempted' ? 'bg-brand-warning' : 'bg-brand-text-muted';
                
                return (
                  <button
                    key={house.id}
                    onClick={() => router.push(`/garbage/collector/house/${house.id}`)}
                    className={`absolute w-3 h-3 rounded-full border-2 border-brand-bg -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-all shadow-md ${dotColor}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    title={`${house.houseNo}: ${house.status}`}
                  />
                );
              })}

              <div className="absolute top-2 right-2 bg-brand-surface-alt/90 px-2 py-1 rounded text-[12px] font-light flex items-center gap-1 border border-brand-accent/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
                <span>Your Location</span>
              </div>
            </div>

            <p className="text-[12px] font-light text-brand-text-muted text-center mt-3">
              Tap dots on map to scan household QR codes or log check-ins directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
