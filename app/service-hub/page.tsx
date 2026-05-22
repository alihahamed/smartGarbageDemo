'use client';

import { useState, useEffect } from 'react';
import { 
  Wrench, Zap, Hammer, Layers, Calendar, Clock, ChevronRight, UserCheck, 
  ArrowLeft, Star, MapPin, CheckCircle, Phone, ShieldCheck, Award, Search, CheckCircle2 
} from 'lucide-react';
import { fetchBookings, fetchWorkers, submitBooking, Booking, WorkerProfile } from '@/lib/api/serviceHub';
import Skeleton from '@/components/Skeleton';
import Toast from '@/components/Toast';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

export default function ServiceHubHome() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer & Selection States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerProfile[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance'>('rating');

  // Worker Profile Selection State
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);

  // Booking Scheduling States
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingActive, setBookingActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const activeBookings = await fetchBookings();
        setBookings(activeBookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    {
      id: 'plumber',
      title: 'Plumbers',
      desc: 'Leakages, taps, and water pump installations.',
      icon: <Wrench size={20} className="text-[#1D4ED8] shrink-0" />,
      count: '3 Near You'
    },
    {
      id: 'electrician',
      title: 'Electricians',
      desc: 'Inverters, house wiring, and appliance fixes.',
      icon: <Zap size={20} className="text-[#1D4ED8] shrink-0" />,
      count: '2 Near You'
    },
    {
      id: 'carpenter',
      title: 'Carpenters',
      desc: 'Furniture repair, door fitting, locks, wardrobes.',
      icon: <Hammer size={20} className="text-[#1D4ED8] shrink-0" />,
      count: '2 Near You'
    },
    {
      id: 'mason',
      title: 'Masons',
      desc: 'Brickwork, tiling, compound walls, concrete.',
      icon: <Layers size={20} className="text-[#1D4ED8] shrink-0" />,
      count: '2 Near You'
    }
  ];

  // Open Category Drawer & Fetch Workers
  const openCategoryDrawer = async (catId: string) => {
    setSelectedCategory(catId);
    setSelectedWorker(null);
    setIsScheduling(false);
    setSearch('');
    setSortBy('rating');
    setIsDrawerOpen(true);
    setWorkersLoading(true);

    try {
      const list = await fetchWorkers(catId);
      setWorkers(list);
      setFilteredWorkers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setWorkersLoading(false);
    }
  };

  // Search & Filter Effect for Category Drawer
  useEffect(() => {
    if (!selectedCategory) return;
    let result = [...workers];
    
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) => w.name.toLowerCase().includes(q) || w.bio.toLowerCase().includes(q)
      );
    }

    // Sort options
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    setFilteredWorkers(result);
  }, [search, sortBy, workers, selectedCategory]);

  // Generate next 4 calendar days (excluding Sundays for convenience)
  const getNextDays = () => {
    const days = [];
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const date = new Date();
    
    for (let i = 0; i < 4; i++) {
      date.setDate(date.getDate() + (i === 0 ? 0 : 1));
      days.push({
        id: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('en-US', options)
      });
    }
    return days;
  };

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM'
  ];

  const dates = getNextDays();

  // Reset date/time selection on worker change
  useEffect(() => {
    if (selectedWorker) {
      if (dates.length > 0) setSelectedDate(dates[0].id);
      setSelectedTime(timeSlots[0]);
    }
  }, [selectedWorker]);

  const handleBook = async () => {
    if (!selectedWorker || !selectedDate || !selectedTime) return;
    setBookingActive(true);
    setToastMessage('Registering appointment slot with Local Directory...');

    setTimeout(async () => {
      try {
        await submitBooking(selectedWorker.id, selectedDate, selectedTime);
        setToastMessage(`Booking Confirmed! ${selectedWorker.name} is scheduled.`);
        
        // Reload bookings feed instantly
        const activeBookings = await fetchBookings();
        setBookings(activeBookings);
        
        setTimeout(() => {
          setIsDrawerOpen(false);
          // reset drawer states safely
          setTimeout(() => {
            setSelectedCategory(null);
            setSelectedWorker(null);
            setIsScheduling(false);
            setToastMessage(null);
            setBookingActive(false);
          }, 300);
        }, 1500);
      } catch (err) {
        setToastMessage('Failed to register slot booking.');
        setBookingActive(false);
      }
    }, 1500);
  };

  const getCategoryTitle = () => {
    if (!selectedCategory) return '';
    switch (selectedCategory.toLowerCase()) {
      case 'plumber': return 'Verified Plumbers';
      case 'electrician': return 'Verified Electricians';
      case 'carpenter': return 'Verified Carpenters';
      case 'mason': return 'Verified Masons';
      default: return 'Verified Local Technicians';
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) {
      setTimeout(() => {
        setSelectedCategory(null);
        setSelectedWorker(null);
        setIsScheduling(false);
        setSearch('');
      }, 300);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Curved Premium Blue Header Banner */}
      <div className="-mx-4 -mt-8 px-6 pt-8 pb-7 rounded-b-[40px] bg-gradient-to-br from-[#3B82F6] via-[#3B82F6] to-[#1D4ED8] shadow-lg shadow-[#1D4ED8]/10 flex flex-col items-center justify-center text-center space-y-5">
        <div className="space-y-1.5 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-medium text-white tracking-tight leading-none">Village Service Hub</h2>
          <p className="text-[15px] font-light text-[#FAF6F3]/80 leading-normal max-w-[280px]">
            Connect directly with local, municipality-verified service providers.
          </p>
        </div>

        {/* Grid Categories (Moved inside background banner) */}
        <div className="w-full space-y-2 pt-6">
          <span className="text-[15px] font-medium text-[#FAF6F3]/75 uppercase tracking-wider block text-left">
            Select Service Category
          </span>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => openCategoryDrawer(cat.id)}
                className="p-3 rounded-2xl bg-[#FAF6F3] border border-[#1D4ED8]/12 hover:bg-white flex items-center gap-3 w-full group transition-all duration-200 shadow-md shadow-black/5 text-left"
              >
                {/* Left: Premium Icon Frame */}
                <div className="w-11 h-11 rounded-xl bg-white border border-[#1D4ED8]/8 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#3B82F6]/5 transition-all shrink-0">
                  <div className="p-2 rounded-lg bg-[#FAF6F3] border border-[#1D4ED8]/5">
                    {cat.icon}
                  </div>
                </div>

                {/* Center: Sleek Stacked Info */}
                <div className="flex-1 min-w-0 space-y-1 text-left">
                  <h3 className="text-[13px] font-medium text-[#0A1C33] group-hover:text-[#1D4ED8] transition-colors leading-none truncate">
                    {cat.title}
                  </h3>
                  <span className="inline-flex items-center text-[9px] font-medium text-[#1D4ED8] bg-[#3B82F6]/10 px-1.5 py-0.5 rounded-full border border-[#1D4ED8]/10 leading-none">
                    {cat.count}
                  </span>
                </div>

                {/* Right: Small Chevron */}
                <div className="text-[#1D4ED8]/50 group-hover:translate-x-0.5 group-hover:text-[#1D4ED8] transition-all pr-0.5">
                  <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Tracker */}
      <div className="flex-1 space-y-3 min-h-0 flex flex-col">
        <h3 className="text-[20px] font-medium text-[#0A1C33] flex items-center justify-center gap-1.5 shrink-0 px-1">
          <Calendar size={20} className="text-[#1D4ED8]" />
          <span>Active Bookings ({bookings.length})</span>
        </h3>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3 pb-6">
          {loading ? (
            <div className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#1D4ED8]/10">
              <Skeleton variant="list" count={1} />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#1D4ED8]/10 bg-white/70 backdrop-blur-sm text-center text-[12px] font-light text-[#0A1C33]/60 flex flex-col items-center justify-center min-h-[160px] space-y-2 shadow-sm">
              <Clock size={20} className="text-[#1D4ED8]/40" />
              <p className="font-medium text-[#0A1C33]/80">No active service bookings.</p>
              <p className="text-[10px] text-[#0A1C33]/50 max-w-[200px]">Book a technician to see live job scheduling status updates here.</p>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="relative bg-white border border-[#1D4ED8]/12 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex overflow-hidden max-w-[440px] mx-auto w-full">
                {/* Left ticket punch notch */}
                <div className="absolute top-0 right-[28%] -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#F8F3F0] border-b border-[#1D4ED8]/12 z-10"></div>
                {/* Right ticket punch notch */}
                <div className="absolute bottom-0 right-[28%] translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#F8F3F0] border-t border-[#1D4ED8]/12 z-10"></div>

                {/* Main content: 72% width */}
                <div className="flex-1 p-3.5 flex flex-col justify-between space-y-3 min-w-0 pr-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#1D4ED8] bg-[#3B82F6]/10 px-2 py-0.5 rounded-md border border-[#1D4ED8]/10 capitalize">
                        {b.workerCategory}
                      </span>
                      <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/15">
                        <UserCheck size={14}  /> Verified
                      </span>
                    </div>
                    <h4 className="text-[20px] font-medium text-[#0A1C33] truncate">{b.workerName}</h4>
                    <div className="flex items-center gap-3 text-[12px] font-light text-[#0A1C33]/70">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-[#1D4ED8]/60" />
                        {b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-[#1D4ED8]/60" />
                        {b.time}
                      </span>
                    </div>
                  </div>

                  {/* Custom Live Tracker Line */}
                  <div className="pt-2 border-t border-[#FAF6F3] flex items-center gap-2">
                    {b.status === 'Confirmed' ? (
                      <>
                        <div className="relative flex items-center justify-center shrink-0">
                          <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981] opacity-75 animate-ping"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
                        </div>
                        <span className="text-[12px] font-medium text-[#10B981]">Technician Assigned</span>
                        <span className="flex-1 border-t border-dashed border-[#1D4ED8]/15"></span>
                        <span className="text-[12px] font-light text-[#0A1C33]/50">Dispatched</span>
                      </>
                    ) : (
                      <>
                        <div className="relative flex items-center justify-center shrink-0">
                          <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                        </div>
                        <span className="text-[12px] font-medium text-amber-600">Pending Confirm</span>
                        <span className="flex-1 border-t border-dashed border-[#1D4ED8]/15"></span>
                        <span className="text-[12px] font-light text-[#0A1C33]/50">Hold</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ticket perforation line */}
                <div className="w-[1px] border-l border-dashed border-[#1D4ED8]/15 h-full self-stretch shrink-0"></div>

                {/* Stub content: 28% width */}
                <div className="w-[28%] shrink-0 bg-[#FAF6F3] flex flex-col items-center justify-center p-3 text-center min-w-0">
                  <div className="space-y-1">
                    {b.status === 'Confirmed' ? (
                      <>
                        <span className="text-[24px] font-medium text-[#1D4ED8] tracking-tight block leading-none">
                          ~{b.etaMinutes}
                        </span>
                        <span className="text-[12px] font-light text-[#0A1C33]/60 uppercase tracking-wider block">
                          Mins ETA
                        </span>
                        <span className="inline-block mt-2 text-[10px] font-medium uppercase tracking-wider bg-[#10B981]/15 text-[#10B981] px-1.5 py-0.5 rounded-md border border-[#10B981]/25">
                          Confirmed
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock size={18} className="text-amber-500 animate-pulse" />
                        <span className="text-[9px] font-light text-[#0A1C33]/60 uppercase tracking-wider block mt-1">
                          Waiting
                        </span>
                        <span className="inline-block mt-2 text-[8px] font-medium uppercase tracking-wider bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded-md border border-amber-500/25">
                          Pending
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Integrated Categories Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-w-[460px] mx-auto bg-[#FAF6F3] rounded-t-[32px] px-0 pt-0 pb-6 flex flex-col outline-none border-t border-[#1D4ED8]/10 shadow-2xl max-h-[92vh] overflow-hidden">
          {toastMessage && (
            <Toast 
              message={toastMessage} 
              type="success" 
              onClose={() => setToastMessage(null)} 
            />
          )}

          {/* Banner inside Drawer (sticky top, covers grabber) */}
          <div className="bg-gradient-to-br from-[#3B82F6] via-[#3B82F6] to-[#1D4ED8] rounded-t-none rounded-b-[40px] px-6 pt-8 pb-5 text-white flex flex-col gap-1 shadow-md shadow-[#1D4ED8]/10 relative z-10 overflow-hidden shrink-0 -mt-10">
            {/* iOS style grabber */}
            <div className="mx-auto w-12 h-1 rounded-full bg-white/20 mb-3 shrink-0" />

            {/* Header controls depending on panel state */}
            {selectedWorker ? (
              <button 
                onClick={() => {
                  if (isScheduling) {
                    setIsScheduling(false);
                  } else {
                    setSelectedWorker(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white text-[13px] font-medium transition-all cursor-pointer self-start mb-2"
              >
                <ArrowLeft size={13} className="text-white" />
                <span>{isScheduling ? 'Back to Profile' : 'Back to List'}</span>
              </button>
            ) : (
              <button 
                onClick={() => handleOpenChange(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white text-[12px] font-medium transition-all cursor-pointer self-start mb-2"
              >
                <ArrowLeft size={13} className="text-white" />
                <span>Close Directory</span>
              </button>
            )}

            <h2 className="text-3xl font-medium text-white tracking-tight leading-none capitalize">
              {isScheduling 
                ? 'Schedule Appointment' 
                : selectedWorker 
                ? 'Contractor Profile' 
                : getCategoryTitle()}
            </h2>
            <p className="text-[13px] font-light text-[#FAF6F3]/80 leading-normal">
              {isScheduling 
                ? `Confirm appointment day & time with ${selectedWorker?.name}.` 
                : selectedWorker 
                ? 'Municipality-approved partner bio and scheduling.' 
                : 'Background-checked and rated by local residents.'}
            </p>

            {/* Search bar inside the banner, only when not viewing a specific worker profile/scheduler */}
            {!selectedWorker && (
              <div className="relative mt-3">
                <input
                  type="text"
                  placeholder="Search technician name or skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/15 text-white text-[14px] placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/20 transition-all shadow-inner"
                />
                <Search size={14} className="absolute left-3.5 top-3.5 text-white/60" />
              </div>
            )}
          </div>

          {/* Dynamic Drawer Panels */}
          {workersLoading ? (
            <div className="py-4 space-y-4 px-6 pt-4">
              <Skeleton variant="profile" count={2} />
            </div>
          ) : !selectedWorker ? (
            /* PANEL A: TECHNICIANS DIRECTORY LIST */
            <div className="flex-1 flex flex-col space-y-4 min-h-0 px-6 pt-4">
              {/* Sort UI */}
              <div className="shrink-0 pb-1">
                <div className="flex items-center justify-between text-[13px] text-[#0A1C33]/70 px-1">
                  <span>Available: <strong className="font-medium text-[#1D4ED8]">{filteredWorkers.length} Technicians</strong></span>
                  <div className="flex gap-2.5">
                    <span>Sort by:</span>
                    <button
                      onClick={() => setSortBy('rating')}
                      className={`hover:text-[#1D4ED8] transition-colors font-medium ${sortBy === 'rating' ? 'text-[#1D4ED8] underline underline-offset-2' : ''}`}
                    >
                      Rating
                    </button>
                    <span className="text-[#0A1C33]/30">•</span>
                    <button
                      onClick={() => setSortBy('distance')}
                      className={`hover:text-[#1D4ED8] transition-colors font-medium ${sortBy === 'distance' ? 'text-[#1D4ED8] underline underline-offset-2' : ''}`}
                    >
                      Distance
                    </button>
                  </div>
                </div>
              </div>

              {/* Workers Grid */}
              <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-0.5">
                {filteredWorkers.length === 0 ? (
                  <div className="p-8 text-center text-[14px] font-light text-[#0A1C33]/60 space-y-1 bg-white rounded-2xl border border-[#1D4ED8]/10 shadow-sm">
                    <p className="font-medium text-[#0A1C33]/85">No technicians match search.</p>
                    <p className="text-[14px] text-[#0A1C33]/50">Try searching standard keywords.</p>
                  </div>
                ) : (
                  filteredWorkers.map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => setSelectedWorker(worker)}
                      className="w-full p-4 rounded-2xl bg-white border border-[#1D4ED8]/10 hover:border-[#3B82F6]/45 text-left transition-all flex gap-4 group shadow-sm hover:shadow-[#1D4ED8]/5"
                    >
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-[#FAF6F3] border border-[#1D4ED8]/10 flex items-center justify-center text-[#1D4ED8] text-[16px] font-medium relative shrink-0">
                        {worker.name.split(' ').map(n => n[0]).join('')}
                        <div className="absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white">
                          <CheckCircle size={10} />
                        </div>
                      </div>

                      {/* Profile details */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-[18px] font-medium text-[#0A1C33] group-hover:text-[#1D4ED8] transition-colors truncate pr-2">
                            {worker.name}
                          </h3>
                          <div className="flex items-center gap-0.5 text-[#1D4ED8] text-[14px] shrink-0 font-medium">
                            <Star size={14} className="fill-[#1D4ED8] text-[#1D4ED8]" />
                            <span>{worker.rating}</span>
                          </div>
                        </div>

                        <p className="text-[13px] font-light text-[#0A1C33]/70 line-clamp-2 leading-relaxed">
                          {worker.bio}
                        </p>

                        <div className="flex gap-3 text-[12px] font-light text-[#0A1C33]/65 pt-1.5 border-t border-[#EFEAE6]">
                          <span className="flex items-center gap-0.5">
                            <MapPin size={12} className="text-[#1D4ED8]" />
                            {worker.distanceKm} km away
                          </span>
                          <span className="text-[#EFEAE6]">•</span>
                          <span>{worker.jobsCompleted} jobs completed</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : !isScheduling ? (
            /* PANEL B: WORKER PROFILE DETAILS */
            <div className="flex-1 flex flex-col space-y-4 overflow-y-auto min-h-0 pr-0.5 px-6 pt-4">
              {/* Header profile details */}
              <div className="w-full rounded-2xl bg-white p-5 border border-[#1D4ED8]/10 flex flex-col items-center text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#FAF6F3] border border-[#1D4ED8]/12 flex items-center justify-center text-[#1D4ED8] text-2xl font-medium relative">
                  {selectedWorker.name.split(' ').map(n => n[0]).join('')}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white">
                    <CheckCircle size={12} />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-[22px] font-medium text-[#0A1C33]">{selectedWorker.name}</h2>
                  <p className="text-[10px] font-medium text-[#1D4ED8] uppercase tracking-wider">
                    Verified {selectedWorker.category}
                  </p>
                </div>

                <div className="flex gap-3 text-[13px] font-light text-[#0A1C33]/70 justify-center py-2 border-y border-[#EFEAE6] w-full">
                  <span className="flex items-center gap-0.5 font-medium text-[#0A1C33]">
                    <Star size={11} className="fill-[#1D4ED8] text-[#1D4ED8]" />
                    {selectedWorker.rating} Rating
                  </span>
                  <span className="text-[#EFEAE6]">•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin size={11} className="text-[#1D4ED8]" />
                    {selectedWorker.distanceKm} km away
                  </span>
                  <span className="text-[#EFEAE6]">•</span>
                  <span>{selectedWorker.jobsCompleted} jobs completed</span>
                </div>

                <div className="flex items-center gap-2 text-[14px] font-light text-[#0A1C33]/75 bg-[#FAF6F3] px-3 py-2.5 rounded-xl border border-[#1D4ED8]/10 w-full justify-center">
                  <Phone size={13} className="text-[#1D4ED8]" />
                  <span>Contact: <strong className="font-medium text-[#0A1C33]">{selectedWorker.phone}</strong></span>
                </div>
              </div>

              {/* Biography */}
              <div className="p-4 rounded-2xl border border-[#1D4ED8]/10 bg-white shadow-sm space-y-1.5">
                <h3 className="text-[12px] font-medium text-[#0A1C33]/70 uppercase tracking-wider">
                  Biography & Skills
                </h3>
                <p className="text-[14px] font-medium text-black leading-relaxed">
                  {selectedWorker.bio}
                </p>
              </div>

              {/* Checks */}
              <div className="p-4 rounded-2xl border border-[#1D4ED8]/10 bg-white shadow-sm space-y-2.5">
                <h3 className="text-[14px] font-medium text-[#0A1C33] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#1D4ED8]" />
                  SV Verification Records
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[12px] font-light">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#FAF6F3] border border-[#1D4ED8]/10">
                    <Award size={14} className="text-[#1D4ED8] shrink-0" />
                    <span className="text-[#0A1C33] truncate">ID Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#FAF6F3] border border-[#1D4ED8]/10">
                    <ShieldCheck size={14} className="text-[#1D4ED8] shrink-0" />
                    <span className="text-[#0A1C33] truncate">Police Clearance</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setIsScheduling(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white text-[16px] font-medium hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#1D4ED8]/15 shrink-0"
              >
                <Calendar size={13} />
                <span>Schedule Appointment Slot</span>
              </button>
            </div>
          ) : (
            /* PANEL C: SCHEDULER & BOOKING CONFIRMATION */
            <div className="flex-1 flex flex-col space-y-4 overflow-y-auto min-h-0 pr-0.5 px-6 pt-4">
              {/* Selectors card */}
              <div className="w-full rounded-2xl bg-white p-5 border border-[#1D4ED8]/10 flex flex-col space-y-5 shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-[18px] font-medium text-[#0A1C33]">Select Date & Time</h3>
                  <p className="text-[13px] font-light text-[#0A1C33]/70">
                    Choose from available calendar slot options.
                  </p>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#0A1C33]/70 uppercase tracking-wider block">
                    Appointment Date
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {dates.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDate(d.id)}
                        className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          selectedDate === d.id
                            ? 'border-transparent bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-white shadow-md shadow-[#1D4ED8]/15'
                            : 'border-[#1D4ED8]/10 bg-[#FAF6F3] text-[#0A1C33]/65 hover:bg-[#EFEAE6]/60'
                        }`}
                      >
                        <span className="text-[15px] font-light leading-none capitalize">
                          {d.label.split(' ')[0]}
                        </span>
                        <span className="text-[15px] font-medium leading-none">
                          {d.label.split(' ')[1]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slots */}
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-[#0A1C33]/70 uppercase tracking-wider block">
                    Time Slot
                  </label>
                  <div className="space-y-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`w-full p-2.5 rounded-xl border text-left text-[14px] font-light transition-all flex items-center justify-between ${
                          selectedTime === slot
                            ? 'border-[#3B82F6] bg-[#3B82F6]/5 text-[#1D4ED8] font-medium'
                            : 'border-[#1D4ED8]/10 bg-[#FAF6F3] text-[#0A1C33]/65 hover:bg-[#EFEAE6]/50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Clock size={13} className={selectedTime === slot ? 'text-[#1D4ED8]' : 'text-[#0A1C33]/60'} />
                          {slot}
                        </span>
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                          selectedTime === slot ? 'border-[#1D4ED8]' : 'border-[#0A1C33]/30'
                        }`}>
                          {selectedTime === slot && <div className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleBook}
                  disabled={bookingActive}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white text-[16px] font-medium hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#1D4ED8]/15"
                >
                  <CheckCircle2 size={13} />
                  <span>{bookingActive ? 'Registering Slot...' : 'Confirm Appointment'}</span>
                </button>
              </div>

              {/* Insurance */}
              <div className="p-4 rounded-xl border border-[#1D4ED8]/10 bg-white shadow-sm flex items-start gap-2.5">
                <ShieldCheck className="text-[#1D4ED8] shrink-0 mt-0.5" size={14} />
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-medium text-[#0A1C33]">Municipal Service Insurance</h4>
                  <p className="text-[9px] font-light text-[#0A1C33]/70 leading-relaxed">
                    All services booked via the SV Portal are covered under local municipal dispute resolutions and pricing guidelines.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
