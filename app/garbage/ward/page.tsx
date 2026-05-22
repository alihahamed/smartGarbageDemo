'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, CheckCircle2, AlertTriangle, Download, PieChart, Users, MapPin } from 'lucide-react';
import { fetchResidents, House } from '@/lib/api/garbage';
import Skeleton from '@/components/Skeleton';
import Toast from '@/components/Toast';

export default function WardDashboard() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    loadData();
  }, []);

  const collectedCount = houses.filter(h => h.status === 'done').length;
  const attemptedCount = houses.filter(h => h.status === 'attempted').length;
  const pendingCount = houses.filter(h => h.status === 'pending').length;
  const totalCount = houses.length;
  const coveragePercent = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  // Donut chart calculations
  // Circumference of our circle is 2 * pi * r = 2 * 3.14159 * 25 = 157.08
  const radius = 25;
  const strokeCircumference = 2 * Math.PI * radius;
  const strokeDashoffset = strokeCircumference - (coveragePercent / 100) * strokeCircumference;

  const handleExport = () => {
    setToastMessage('Exporting PDF Sanitation Audit Report for Ward 1...');
    setTimeout(() => {
      setToastMessage('Download initiated! Check your browser downloads.');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-5">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Title greeting */}
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-brand-text flex items-center gap-2">
          <PieChart size={18} className="text-brand-accent animate-pulse" />
          Ward Member Console
        </h2>
        <p className="text-xs font-light text-brand-text-muted">
          Ward 1 Municipal Representative Panel
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="card" />
          <Skeleton variant="list" count={3} />
        </div>
      ) : (
        <>
          {/* Donut Chart Visual & Numeric stats */}
          <div className="p-5 rounded-2xl glass-panel border border-[#014BAA]/15 flex items-center justify-between gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(1, 75, 170, 0.08)"
                  strokeWidth="8"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#014BAA"
                  strokeWidth="8"
                  strokeDasharray={strokeCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                <span className="text-xl font-medium text-brand-text leading-none">{coveragePercent}%</span>
                <span className="text-[11px] font-light text-brand-text-muted uppercase tracking-wider">Cleared</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-0.5">
                <h3 className="text-xs font-medium text-brand-text">Coverage Summary</h3>
                <p className="text-[11px] font-light text-brand-text-muted">
                  Daily route tracking index.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="space-y-0.5 border-l border-brand-success/40 pl-2">
                  <span className="text-brand-text-muted block">Cleaned</span>
                  <strong className="text-brand-success text-xs font-medium">{collectedCount} Houses</strong>
                </div>
                <div className="space-y-0.5 border-l border-brand-warning/40 pl-2">
                  <span className="text-brand-text-muted block">Missed</span>
                  <strong className="text-brand-warning text-xs font-medium">{attemptedCount} Houses</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Export Report Actions */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-3 pl-6 pr-1.5 py-1.5 rounded-full bg-[#014BAA] text-white text-xs font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
          >
            <span>Export Ward Audit Report</span>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#FAF6F3] text-[#014BAA]">
              <Download size={12} />
            </span>
          </button>

          {/* Pending houses list */}
          <div className="flex-1 space-y-3 min-h-0 flex flex-col">
            <h3 className="text-xs font-medium text-brand-text flex items-center gap-1.5 shrink-0">
              <AlertTriangle size={13} className="text-brand-warning shrink-0" />
              <span>Pending & Missed Houses ({pendingCount + attemptedCount})</span>
            </h3>

            <div className="flex-1 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto divide-y divide-brand-surface-alt">
                {houses.filter(h => h.status !== 'done').length === 0 ? (
                  <div className="p-8 text-center text-xs font-light text-brand-text-muted flex flex-col items-center justify-center h-full gap-1.5">
                    <CheckCircle2 size={24} className="text-brand-success" />
                    <p>100% Ward Coverage Achieved!</p>
                  </div>
                ) : (
                  houses.filter(h => h.status !== 'done').map((h) => (
                    <div key={h.id} className="p-3.5 flex items-start justify-between gap-3 bg-brand-surface-alt/10">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-medium text-brand-text block">{h.houseNo}</span>
                        <p className="text-[11px] font-light text-brand-text-muted truncate leading-relaxed">
                          {h.address}
                        </p>
                      </div>
                      <span className={`text-[11px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                        h.status === 'attempted'
                          ? 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'
                          : 'bg-brand-text-muted/10 text-brand-text-muted border-brand-text-muted/20'
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
    </div>
  );
}
