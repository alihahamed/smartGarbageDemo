export interface House {
  id: number;
  houseNo: string;
  address: string;
  status: 'pending' | 'done' | 'attempted';
  paymentMode?: string;
  amount?: number;
  receiptId?: string;
  visitTimestamp?: string;
  photoUrl?: string;
}

export interface Broadcast {
  time: string;
  message: string;
  actor: string;
}

export interface Receipt {
  id: string;
  house: string;
  amount: number;
  mode: string;
  status: string;
}

const STORAGE_KEY = 'smart_village_garbage_route';
const BROADCAST_KEY = 'smart_village_garbage_broadcasts';
const RECEIPTS_KEY = 'smart_village_garbage_receipts';

function generateDailyRoute(count = 20): House[] {
  const base = 1000;
  const houses: House[] = [];
  const roadNames = ['Grand Avenue', 'Hill Station Road', 'Temple Street', 'Market Junction', 'Lakeview Lane'];
  const names = ['K. R. Nair', 'S. Pillai', 'M. Mathew', 'P. Kurian', 'J. Joseph', 'A. Menon', 'R. Panicker', 'V. Das'];
  
  for (let i = 1; i <= count; i++) {
    const id = base + i;
    const road = roadNames[i % roadNames.length];
    const resident = names[i % names.length];
    houses.push({
      id,
      houseNo: `H-${100 + i}`,
      address: `${resident}, ${100 + i} ${road}`,
      status: 'pending',
    });
  }
  return houses;
}

export async function fetchResidents(): Promise<House[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  } else {
    const newRoute = generateDailyRoute(20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRoute));
    return newRoute;
  }
}

export async function updateHouseStatus(id: number, status: 'pending' | 'done' | 'attempted', extras: Partial<House> = {}): Promise<House[]> {
  if (typeof window === 'undefined') return [];
  const list = await fetchResidents();
  const index = list.findIndex(h => h.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], status, ...extras, visitTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  return list;
}

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(BROADCAST_KEY);
  if (stored) return JSON.parse(stored);
  
  const initial = [
    { time: '10:00 AM', message: 'System initialized for monthly collection cycle.', actor: 'System' }
  ];
  localStorage.setItem(BROADCAST_KEY, JSON.stringify(initial));
  return initial;
}

export async function addBroadcast(message: string): Promise<Broadcast[]> {
  if (typeof window === 'undefined') return [];
  const list = await fetchBroadcasts();
  const newItem = {
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    message,
    actor: 'Admin'
  };
  const updated = [newItem, ...list];
  localStorage.setItem(BROADCAST_KEY, JSON.stringify(updated));
  return updated;
}

export async function fetchInbox(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const storedBroadcasts = await fetchBroadcasts();
  const list = [
    'Collector is nearby for monthly collection.',
    'Monthly collection started for your ward.',
    'Please keep your QR pass ready for verification.'
  ];
  // Add actual broadcasts to resident inbox
  return [...storedBroadcasts.map(b => b.message), ...list];
}

export async function fetchReceipts(): Promise<Receipt[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(RECEIPTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function logPayment(houseId: number, amount: number, mode: string): Promise<Receipt> {
  if (typeof window === 'undefined') throw new Error('Client side only');
  const list = await fetchResidents();
  const house = list.find(h => h.id === houseId);
  if (!house) throw new Error('House not found');

  const receiptId = `RCPT-${house.houseNo.replace('-', '')}-${Date.now().toString().slice(-4)}`;
  const newReceipt: Receipt = {
    id: receiptId,
    house: house.houseNo,
    amount,
    mode,
    status: 'Settled'
  };

  // Update house status
  await updateHouseStatus(houseId, 'done', { paymentMode: mode, amount, receiptId });

  // Save receipt
  const receipts = await fetchReceipts();
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify([newReceipt, ...receipts]));
  
  return newReceipt;
}
