'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, HelpCircle, Map, List, Compass } from 'lucide-react';
import { fetchResidents, House } from '@/lib/api/garbage';
import Skeleton from '@/components/Skeleton';

/* ─── Pannable Map Canvas ─── */
function MapCanvas({ houses, onHouseClick }: { houses: House[]; onHouseClick: (id: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Virtual canvas size (larger than viewport → scrollable)
  const CANVAS_W = 800;
  const CANVAS_H = 600;

  // Deterministic positions for up to 20 houses spread across the canvas
  const housePositions = [
    { x: 60, y: 45 }, { x: 180, y: 70 }, { x: 310, y: 40 }, { x: 440, y: 90 },
    { x: 130, y: 170 }, { x: 270, y: 155 }, { x: 400, y: 180 }, { x: 550, y: 60 },
    { x: 90, y: 290 }, { x: 230, y: 270 }, { x: 370, y: 300 }, { x: 510, y: 250 },
    { x: 650, y: 130 }, { x: 680, y: 280 }, { x: 150, y: 390 }, { x: 320, y: 420 },
    { x: 480, y: 380 }, { x: 620, y: 400 }, { x: 740, y: 340 }, { x: 560, y: 480 },
  ];

  // Road paths connecting house clusters
  const roads = [
    'M 60,55 Q 120,60 180,80 T 310,50 T 440,100',
    'M 440,100 Q 490,75 550,70 T 650,140',
    'M 130,180 Q 200,165 270,165 T 400,190',
    'M 90,300 Q 160,280 230,280 T 370,310 T 510,260',
    'M 510,260 Q 600,250 680,290',
    'M 150,400 Q 240,410 320,430 T 480,390 T 620,410',
    'M 270,165 Q 250,220 230,280',
    'M 400,190 Q 420,240 370,310',
    'M 550,70 Q 560,160 510,260',
    'M 620,410 Q 680,370 740,350',
    'M 480,390 Q 520,440 560,490',
  ];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan(prev => {
      const container = containerRef.current;
      if (!container) return prev;
      const maxX = Math.max(0, CANVAS_W - container.clientWidth);
      const maxY = Math.max(0, CANVAS_H - container.clientHeight);
      return {
        x: Math.max(-maxX, Math.min(0, prev.x + dx)),
        y: Math.max(-maxY, Math.min(0, prev.y + dy)),
      };
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const statusColor = (s: string) =>
    s === 'done' ? '#10B981' : s === 'attempted' ? '#F59E0B' : '#94A3B8';

  const statusBg = (s: string) =>
    s === 'done' ? '#ECFDF5' : s === 'attempted' ? '#FFFBEB' : '#F8FAFC';

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden rounded-lg mx-3 mb-1 border border-brand-accent/5 bg-brand-bg/60 cursor-grab active:cursor-grabbing select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Pannable inner canvas */}
      <div
        className="absolute"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          willChange: 'transform',
        }}
      >
        {/* Road network SVG */}
        <svg
          className="absolute inset-0"
          width={CANVAS_W}
          height={CANVAS_H}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-brand-text-muted" />

          {/* Roads */}
          {roads.map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} fill="none" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeDasharray="6,8" />
            </g>
          ))}

          {/* Your location indicator */}
          <circle cx="55" cy="50" r="8" fill="#014BAA" opacity="0.15">
            <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="55" cy="50" r="4" fill="#014BAA" stroke="white" strokeWidth="2" />
        </svg>

        {/* House markers */}
        {houses.map((house, idx) => {
          const pos = housePositions[idx] || { x: 400, y: 300 };
          const color = statusColor(house.status);
          const bg = statusBg(house.status);

          return (
            <button
              key={house.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragging.current) onHouseClick(house.id);
              }}
              className="absolute flex flex-col items-center gap-0.5 group"
              style={{
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {/* House icon */}
              <div
                className="relative w-8 h-8 rounded-lg flex items-center justify-center shadow-md border-2 transition-transform group-hover:scale-110"
                style={{ backgroundColor: bg, borderColor: color }}
              >
                {/* Tiny house SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>

                {/* Status dot */}
                {house.status === 'done' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white" />
                )}
                {house.status === 'attempted' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F59E0B] border-2 border-white" />
                )}
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/90 border shadow-sm whitespace-nowrap"
                style={{ borderColor: `${color}40`, color: '#334155' }}
              >
                {house.houseNo}
              </span>

              {/* Pointer triangle */}
              <div
                className="absolute -bottom-[3px] w-0 h-0"
                style={{
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: `4px solid ${color}`,
                  bottom: '14px',
                }}
              />
            </button>
          );
        })}

        {/* Location badge */}
        <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-brand-accent/20 shadow-sm pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#014BAA] animate-ping" />
          <span className="text-[#014BAA]">You</span>
        </div>
      </div>
    </div>
  );
}


/* ─── Main Page Component ─── */
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
    <div className="flex-1 flex flex-col justify-between py-2 min-h-0 space-y-4">
      {/* Progress Card */}
      <div className="p-4 rounded-xl glass-panel border border-brand-accent/15 space-y-3 shrink-0">
        <div className="flex justify-between items-center text-[15px] text-brand-text-muted">
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
            <div className="text-[14px] font-light text-brand-text-muted">Done</div>
          </div>
          <div className="bg-brand-bg/40 p-1.5 rounded border border-brand-surface-alt">
            <div className="text-[16px] font-medium text-brand-warning">{attemptedCount}</div>
            <div className="text-[14px] font-light text-brand-text-muted">Attempted</div>
          </div>
          <div className="bg-brand-bg/40 p-1.5 rounded border border-brand-surface-alt">
            <div className="text-[16px] font-medium text-brand-text-muted">{pendingCount}</div>
            <div className="text-[14px] font-light text-brand-text-muted">Pending</div>
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
                      <span className="text-[13px] font-medium uppercase tracking-wider text-brand-success px-1.5 py-0.5 rounded bg-brand-success/10 border border-brand-success/20 flex items-center gap-0.5">
                        <CheckCircle2 size={11} /> Done
                      </span>
                    )}
                    {house.status === 'attempted' && (
                      <span className="text-[13px] font-medium uppercase tracking-wider text-brand-warning px-1.5 py-0.5 rounded bg-brand-warning/10 border border-brand-warning/20 flex items-center gap-0.5">
                        <AlertCircle size={11} /> Attempt
                      </span>
                    )}
                    {house.status === 'pending' && (
                      <span className="text-[13px] font-medium uppercase tracking-wider text-brand-text-muted px-1.5 py-0.5 rounded bg-brand-surface-alt/60 border border-brand-surface-alt flex items-center gap-0.5">
                        <HelpCircle size={11} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-light text-brand-text-muted truncate">
                    {house.address}
                  </p>
                </div>
                <div className="text-[13px] font-medium text-brand-accent group-hover:translate-x-0.5 transition-transform shrink-0">
                  Manage →
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Interactive Pannable Route Map */
          <div className="w-full flex-1 flex flex-col rounded-xl border border-brand-surface-alt bg-brand-surface-alt/20 overflow-hidden">
            <div className="flex items-center justify-between text-[12px] text-brand-text-muted px-4 pt-3 pb-2 shrink-0">
              <span className="flex items-center gap-1">
                <Compass size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                Interactive Route Map
              </span>
              <span>GPS Precision: 3.2m</span>
            </div>

            <MapCanvas houses={houses} onHouseClick={(id) => router.push(`/garbage/collector/house/${id}`)} />

            <p className="text-[12px] font-light text-brand-text-muted text-center py-2 shrink-0">
              Drag to pan • Tap houses to manage
            </p>
          </div>
        )}
      </div>

      {/* Centered Bigger Toggle Mode at the Bottom (above navbar) */}
      <div className="flex justify-center pt-2 pb-1 shrink-0">
        <div className="flex rounded-xl border border-brand-surface-alt bg-brand-surface-alt/65 p-1 w-full max-w-[260px] shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-[9px] px-3.5 rounded-lg flex items-center justify-center gap-2 transition-all text-[12px] font-medium ${
              viewMode === 'list' 
                ? 'bg-[#014BAA] text-white shadow-sm' 
                : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-alt/40'
            }`}
          >
            <List size={16} />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-[9px] px-3.5 rounded-lg flex items-center justify-center gap-2 transition-all text-[12px] font-medium ${
              viewMode === 'map' 
                ? 'bg-[#014BAA] text-white shadow-sm' 
                : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-alt/40'
            }`}
          >
            <Map size={16} />
            <span>Map Route</span>
          </button>
        </div>
      </div>
    </div>
  );
}
