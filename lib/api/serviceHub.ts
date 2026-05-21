export interface WorkerProfile {
  id: number;
  name: string;
  category: 'electrician' | 'plumber' | 'carpenter' | 'mason';
  rating: number;
  distanceKm: number;
  jobsCompleted: number;
  phone: string;
  avatarUrl?: string;
  bio: string;
}

export interface Booking {
  id: string;
  workerId: number;
  workerName: string;
  workerCategory: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending';
  etaMinutes: number;
}

const BOOKINGS_KEY = 'smart_village_service_bookings';

const MOCK_WORKERS: WorkerProfile[] = [
  // Plumbers
  { id: 1, name: 'Arun Kumar', category: 'plumber', rating: 4.8, distanceKm: 0.5, jobsCompleted: 38, phone: '+91 94470 12345', bio: 'Expert in household leakages, sanitary installations, and pipe routing.' },
  { id: 2, name: 'Rajan Pillai', category: 'plumber', rating: 4.5, distanceKm: 1.2, jobsCompleted: 54, phone: '+91 94470 54321', bio: 'Over 10 years experience in community plumbing systems.' },
  { id: 3, name: 'Sajeev K.', category: 'plumber', rating: 4.2, distanceKm: 2.1, jobsCompleted: 22, phone: '+91 98450 99887', bio: 'Quick domestic repairs and water pump installation.' },
  
  // Electricians
  { id: 4, name: 'Manoharan V.', category: 'electrician', rating: 4.9, distanceKm: 0.8, jobsCompleted: 71, phone: '+91 94460 11223', bio: 'Government certified A-grade electrician. House wiring and inverter repairs.' },
  { id: 5, name: 'Anish Lal', category: 'electrician', rating: 4.6, distanceKm: 1.5, jobsCompleted: 43, phone: '+91 95670 44556', bio: 'Home appliances servicing and electrical troubleshooting.' },
  
  // Carpenters
  { id: 6, name: 'Babu Carpenter', category: 'carpenter', rating: 4.7, distanceKm: 1.0, jobsCompleted: 60, phone: '+91 94470 88990', bio: 'Specialist in teak wood furniture design, door fitting, and kitchen cabinets.' },
  { id: 7, name: 'Girish Chandran', category: 'carpenter', rating: 4.4, distanceKm: 2.5, jobsCompleted: 29, phone: '+91 98950 11224', bio: 'General woodwork, locks, and wardrobe repairs.' },
  
  // Masons
  { id: 8, name: 'Surendran Mason', category: 'mason', rating: 4.8, distanceKm: 1.7, jobsCompleted: 92, phone: '+91 94470 33445', bio: 'Expert in brickwork, concreting, floor tiling, and plastering.' },
  { id: 9, name: 'Devan A.', category: 'mason', rating: 4.3, distanceKm: 3.0, jobsCompleted: 48, phone: '+91 90720 55667', bio: 'Compound walls, steps construction, and general masonry.' }
];

export async function fetchWorkers(category: string): Promise<WorkerProfile[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const filtered = MOCK_WORKERS.filter(
    (w) => w.category.toLowerCase() === category.toLowerCase()
  );
  // Sort by rating descending
  return filtered.sort((a, b) => b.rating - a.rating);
}

export async function fetchWorkerById(id: number): Promise<WorkerProfile | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_WORKERS.find((w) => w.id === id) || null;
}

export async function fetchBookings(): Promise<Booking[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function submitBooking(workerId: number, date: string, time: string): Promise<Booking> {
  if (typeof window === 'undefined') throw new Error('Client side only');
  const worker = MOCK_WORKERS.find((w) => w.id === workerId);
  if (!worker) throw new Error('Worker not found');

  const newBooking: Booking = {
    id: `BK-${Date.now().toString().slice(-6)}`,
    workerId,
    workerName: worker.name,
    workerCategory: worker.category,
    date,
    time,
    status: 'Confirmed',
    etaMinutes: Math.floor(Math.random() * 45) + 15 // 15 to 60 mins
  };

  const currentBookings = await fetchBookings();
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify([newBooking, ...currentBookings]));
  return newBooking;
}
