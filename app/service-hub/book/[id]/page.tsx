'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { fetchWorkerById, submitBooking, WorkerProfile } from '@/lib/api/serviceHub';
import Skeleton from '@/components/Skeleton';
import Toast from '@/components/Toast';

export default function BookWorker() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Date and Time slots
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const [bookingActive, setBookingActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const result = await fetchWorkerById(id);
        setWorker(result);
        // Default select first date/time
        if (dates.length > 0) setSelectedDate(dates[0].id);
        setSelectedTime(timeSlots[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleBook = async () => {
    if (!worker || !selectedDate || !selectedTime) return;
    setBookingActive(true);
    setToastMessage('Registering appointment slot with Local Directory...');

    setTimeout(async () => {
      try {
        await submitBooking(worker.id, selectedDate, selectedTime);
        setToastMessage(`Booking Confirmed! ${worker.name} is scheduled.`);
        
        setTimeout(() => {
          router.push('/service-hub');
        }, 1500);
      } catch (err) {
        setToastMessage('Failed to register slot booking.');
        setBookingActive(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <Skeleton variant="card" />
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
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Back button */}
      <div>
        <Link 
          href={`/service-hub/worker/${worker.id}`}
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Profile</span>
        </Link>
      </div>

      {/* Scheduler Card */}
      <div className="w-full rounded-2xl glass-panel p-5 border border-brand-accent/20 flex flex-col space-y-5">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-brand-text">Select Date & Time</h3>
          <p className="text-xs font-light text-brand-text-muted">
            Choose an available slot for <strong>{worker.name}</strong> ({worker.category}).
          </p>
        </div>

        {/* Date Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-brand-text uppercase tracking-wider block">
            Select Appointment Date
          </label>
          <div className="grid grid-cols-4 gap-2">
            {dates.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDate(d.id)}
                className={`py-2 px-1 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedDate === d.id
                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                    : 'border-brand-surface-alt bg-brand-bg/40 text-brand-text-muted hover:bg-brand-surface-alt/30'
                }`}
              >
                <span className="text-[9px] font-light leading-none capitalize">
                  {d.label.split(' ')[0]}
                </span>
                <span className="text-xs font-medium leading-none">
                  {d.label.split(' ')[1]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-brand-text uppercase tracking-wider block">
            Select Time Slot
          </label>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`w-full p-3 rounded-lg border text-left text-xs font-light transition-all flex items-center justify-between ${
                  selectedTime === slot
                    ? 'border-brand-accent bg-brand-accent/5 text-brand-accent font-normal'
                    : 'border-brand-surface-alt bg-brand-bg/40 text-brand-text-muted hover:bg-brand-surface-alt/25'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock size={12} className={selectedTime === slot ? 'text-brand-accent' : 'text-brand-text-muted'} />
                  {slot}
                </span>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedTime === slot ? 'border-brand-accent' : 'border-brand-text-muted/30'
                }`}>
                  {selectedTime === slot && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Action Button */}
        <button
          onClick={handleBook}
          disabled={bookingActive}
          className="w-full py-3 rounded-lg bg-brand-accent text-brand-bg text-xs font-medium hover:bg-brand-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/15"
        >
          <CheckCircle2 size={14} />
          <span>{bookingActive ? 'Registering Booking...' : 'Confirm Appointment'}</span>
        </button>
      </div>

      {/* Safety Info */}
      <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 flex items-start gap-3">
        <ShieldCheck className="text-brand-accent shrink-0 mt-0.5" size={15} />
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-medium text-brand-text">Municipal Service Insurance</h4>
          <p className="text-[9px] font-light text-brand-text-muted leading-relaxed">
            All services booked via the SV Portal are covered under local municipal dispute resolutions and pricing guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
