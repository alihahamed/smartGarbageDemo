'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, CheckCircle, Search, Sparkles } from 'lucide-react';
import { fetchWorkers, WorkerProfile } from '@/lib/api/serviceHub';
import Skeleton from '@/components/Skeleton';

export default function CategoryDirectory() {
  const params = useParams();
  const router = useRouter();
  const category = (params?.category as string) || '';

  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance'>('rating');

  useEffect(() => {
    async function loadData() {
      if (!category) return;
      try {
        const list = await fetchWorkers(category);
        setWorkers(list);
        setFilteredWorkers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [category]);

  // Search & Filter Effect
  useEffect(() => {
    let result = [...workers];
    
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(w => w.name.toLowerCase().includes(q) || w.bio.toLowerCase().includes(q));
    }

    // Sort options
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    setFilteredWorkers(result);
  }, [search, sortBy, workers]);

  const getCategoryTitle = () => {
    switch (category.toLowerCase()) {
      case 'plumber': return 'Verified Plumbers';
      case 'electrician': return 'Verified Electricians';
      case 'carpenter': return 'Verified Carpenters';
      case 'mason': return 'Verified Masons';
      default: return 'Verified Local Technicians';
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
      {/* Back button */}
      <div>
        <Link 
          href="/service-hub" 
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Service Hub</span>
        </Link>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-brand-text capitalize">
          {getCategoryTitle()}
        </h2>
        <p className="text-xs font-light text-brand-text-muted">
          All service personnel are background-checked and rated by residents.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search technician name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-brand-surface-alt bg-brand-bg text-brand-text text-xs placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-3 text-brand-text-muted/50" />
        </div>

        {/* Sort controls */}
        <div className="flex items-center justify-between text-[10px] text-brand-text-muted">
          <span>Available: {filteredWorkers.length} Technicians</span>
          <div className="flex gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => setSortBy('rating')}
              className={`hover:text-brand-accent transition-colors font-medium ${sortBy === 'rating' ? 'text-brand-accent underline underline-offset-2' : ''}`}
            >
              Rating
            </button>
            <span>•</span>
            <button
              onClick={() => setSortBy('distance')}
              className={`hover:text-brand-accent transition-colors font-medium ${sortBy === 'distance' ? 'text-brand-accent underline underline-offset-2' : ''}`}
            >
              Distance
            </button>
          </div>
        </div>
      </div>

      {/* Workers directory list */}
      <div className="flex-1 min-h-[300px] space-y-3 overflow-y-auto">
        {loading ? (
          <Skeleton variant="profile" count={3} />
        ) : filteredWorkers.length === 0 ? (
          <div className="p-8 text-center text-xs font-light text-brand-text-muted space-y-1">
            <p>No technicians match your search.</p>
            <p className="text-[10px]">Try entering general keywords like "leak" or "wiring".</p>
          </div>
        ) : (
          filteredWorkers.map((worker) => (
            <button
              key={worker.id}
              onClick={() => router.push(`/service-hub/worker/${worker.id}`)}
              className="w-full p-4 rounded-xl glass-panel border border-brand-accent/15 hover:border-brand-accent/35 text-left transition-all flex gap-4 group"
            >
              {/* Avatar placeholder */}
              <div className="w-12 h-12 rounded-xl bg-brand-surface-alt border border-brand-surface-alt/80 flex items-center justify-center text-brand-accent font-medium relative shrink-0">
                {worker.name.split(' ').map(n => n[0]).join('')}
                <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-brand-success border-2 border-brand-bg flex items-center justify-center text-brand-bg">
                  <CheckCircle size={9} />
                </div>
              </div>

              {/* Profile details */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-medium text-brand-text group-hover:text-brand-accent transition-colors truncate">
                    {worker.name}
                  </h3>
                  <div className="flex items-center gap-0.5 text-brand-accent text-[10px] shrink-0 font-medium">
                    <Star size={10} className="fill-brand-accent text-brand-accent" />
                    <span>{worker.rating}</span>
                  </div>
                </div>

                <p className="text-[10px] font-light text-brand-text-muted line-clamp-2 leading-relaxed">
                  {worker.bio}
                </p>

                <div className="flex gap-3 text-[9px] font-light text-brand-text-muted pt-1 border-t border-brand-surface-alt/25">
                  <span className="flex items-center gap-0.5">
                    <MapPin size={10} />
                    {worker.distanceKm} km away
                  </span>
                  <span>•</span>
                  <span>{worker.jobsCompleted} jobs completed</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
