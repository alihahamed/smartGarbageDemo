'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, History, FileText, CheckCircle } from 'lucide-react';
import { fetchReceipts, Receipt } from '@/lib/api/garbage';
import Skeleton from '@/components/Skeleton';

export default function ResidentReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await fetchReceipts();
        setReceipts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Back to resident */}
      <div>
        <Link 
          href="/garbage/resident" 
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Portal</span>
        </Link>
      </div>

      {/* Header title */}
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-brand-text flex items-center gap-2">
          <History size={18} className="text-brand-accent animate-[spin_4s_linear_infinite]" />
          Receipt History Logs
        </h2>
        <p className="text-xs font-light text-brand-text-muted">
          Track official settlements for municipal sanitation services.
        </p>
      </div>

      {/* Receipts list container */}
      <div className="flex-1 min-h-[300px] rounded-xl border border-brand-surface-alt overflow-hidden bg-brand-surface-alt/10 flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <Skeleton variant="list" count={3} />
            </div>
          ) : receipts.length === 0 ? (
            <div className="p-8 text-center text-xs font-light text-brand-text-muted space-y-2 flex flex-col items-center justify-center h-full">
              <FileText size={24} className="text-brand-text-muted/40" />
              <p>No receipt history found.</p>
              <p className="text-[10px] max-w-[200px]">Once a collector validates your household or you pay dues online, your tax records will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-brand-surface-alt">
              {receipts.map((rcpt) => (
                <div key={rcpt.id} className="p-4 flex items-center justify-between gap-4 hover:bg-brand-surface-alt/25 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-brand-text">{rcpt.id}</span>
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-success/15 text-brand-success border border-brand-success/20">
                        <CheckCircle size={8} /> {rcpt.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-light text-brand-text-muted">
                      House {rcpt.house} • Method: {rcpt.mode}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium text-brand-accent">₹{rcpt.amount}.00</div>
                    <span className="text-[8px] font-light text-brand-text-muted block">Verified TAX</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
