export interface Complaint {
  id: string;
  category: 'Road' | 'Water' | 'Garbage' | 'Electricity' | 'Other';
  description: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  status: 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved';
  department: string;
  etaDays: number;
  rating?: number;
  date: string;
}

const COMPLAINTS_KEY = 'smart_village_citizen_complaints';

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'CC-20260519-001',
    category: 'Road',
    description: 'Huge pothole near ward boundary, causing vehicles to slip at night.',
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500&auto=format&fit=crop&q=60',
    latitude: 10.8505,
    longitude: 76.2711,
    status: 'Resolved',
    department: 'Public Works Department (PWD)',
    etaDays: 0,
    rating: 5,
    date: '2026-05-19'
  },
  {
    id: 'CC-20260520-002',
    category: 'Water',
    description: 'Main pipeline leakage near temple water tank. Clean water going to waste.',
    photoUrl: 'https://images.unsplash.com/photo-1542013936693-8848e574047a?w=500&auto=format&fit=crop&q=60',
    latitude: 10.8521,
    longitude: 76.2695,
    status: 'In Progress',
    department: 'Kerala Water Authority (KWA)',
    etaDays: 2,
    date: '2026-05-20'
  }
];

export async function fetchComplaints(): Promise<Complaint[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(COMPLAINTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  } else {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(DEFAULT_COMPLAINTS));
    return DEFAULT_COMPLAINTS;
  }
}

export async function fetchComplaintById(id: string): Promise<Complaint | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const list = await fetchComplaints();
  return list.find((c) => c.id === id) || null;
}

export async function submitComplaint(
  category: Complaint['category'],
  description: string,
  photoUrl: string,
  lat = 10.8530,
  lng = 76.2725
): Promise<Complaint> {
  if (typeof window === 'undefined') throw new Error('Client side only');

  const deptMap: Record<Complaint['category'], string> = {
    Road: 'Public Works Department (PWD)',
    Water: 'Kerala Water Authority (KWA)',
    Garbage: 'Sanitation Board',
    Electricity: 'State Electricity Board',
    Other: 'General Municipal Administration'
  };

  const id = `CC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900) + 100}`;
  const newComplaint: Complaint = {
    id,
    category,
    description,
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    latitude: lat,
    longitude: lng,
    status: 'Submitted',
    department: deptMap[category],
    etaDays: 5,
    date: new Date().toISOString().slice(0, 10)
  };

  const list = await fetchComplaints();
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify([newComplaint, ...list]));
  return newComplaint;
}

export async function rateComplaint(id: string, rating: number): Promise<Complaint> {
  if (typeof window === 'undefined') throw new Error('Client side only');
  const list = await fetchComplaints();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Complaint not found');

  list[index] = { ...list[index], rating };
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(list));
  return list[index];
}
