'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Home, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { fetchResidents, House } from '@/lib/api/garbage';
import Skeleton from '@/components/Skeleton';

export default function AdminStatus() {
  const [houses, setHouses] = useState<House[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'attempted'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const list = await fetchResidents();
        setHouses(list);
        setFilteredHouses(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let result = houses;

    // Filter by status
    if (filter !== 'all') {
      result = result.filter(h => h.status === filter);
    }

    // Filter by search text
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        h => h.houseNo.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
      );
    }

    setFilteredHouses(result);
  }, [search, filter, houses]);

  const getStatusBadge = (status: House['status']) => {
    switch (status) {
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-brand-success/10 text-brand-success border border-brand-success/20">
            <CheckCircle2 size={12} />
            Done
          </span>
        );
      case 'attempted':
        return (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-brand-warning/10 text-brand-warning border border-brand-warning/20">
            <AlertCircle size={12} />
            Attempted
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-brand-text-muted/10 text-brand-text-muted border border-brand-text-muted/20">
            <HelpCircle size={12} />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
      {/* Filters & Search */}
      <div className="space-y-3.5">
        {/* Search bar */}
        <div className="relative w-[82%] mx-auto mt-2">
          <input
            type="text"
            placeholder="Search house no. or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-24 py-[11px] rounded-full border border-brand-surface-alt bg-brand-bg text-brand-text text-[12px] placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
          />
          <Search size={18} className="absolute left-3.5 top-[13px] text-brand-text-muted/50" />
          <span className="absolute right-2 top-1.5 text-[12px] font-medium tracking-wide bg-brand-surface-alt border border-brand-accent/20 text-brand-accent px-2.5 py-[7px] rounded-full select-none">
            {houses.length} Houses
          </span>
        </div>

        {/* Filter Badges */}
        <div className="w-[82%] mx-auto flex justify-center gap-1.5 pb-1">
          {([
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'done', label: 'Done' },
            { id: 'attempted', label: 'Attempted' }
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-3.5 py-[7px] rounded-full border text-[12px] font-medium transition-all ${
                filter === opt.id
                  ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                  : 'border-brand-surface-alt bg-brand-surface-alt/40 text-brand-text-muted hover:bg-brand-surface-alt/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* House list container */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-16 space-y-2.5">
        {loading ? (
          <div className="w-[82%] mx-auto py-4">
            <Skeleton variant="list" count={5} />
          </div>
        ) : filteredHouses.length === 0 ? (
          <div className="p-8 text-center text-[12px] font-light text-brand-text-muted space-y-1">
            <p>No matching households found.</p>
            <p className="text-[12px]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredHouses.map((house) => (
            <div 
              key={house.id} 
              className="w-[82%] mx-auto p-3.5 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 hover:border-brand-accent/30 transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[16px] font-medium text-brand-text">{house.houseNo}</span>
                  {getStatusBadge(house.status)}
                  {house.visitTimestamp && (
                    <span className="text-[12px] font-light text-brand-accent/70">
                      Visited at {house.visitTimestamp}
                    </span>
                  )}
                </div>
                <p className="text-[12px] font-light text-brand-text-muted truncate leading-relaxed">
                  {house.address}
                </p>
                {house.visitTimestamp && house.paymentMode && (
                  <p className="text-[12px] font-light text-brand-text-muted opacity-80">
                    Payment Mode: {house.paymentMode}
                  </p>
                )}
              </div>
              
              {house.amount && (
                <div className="text-right shrink-0">
                  <div className="text-[16px] font-medium text-brand-accent">₹{house.amount}</div>
                  <div className="text-[12px] font-light text-brand-text-muted opacity-50 truncate max-w-[60px]">
                    {house.receiptId}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
