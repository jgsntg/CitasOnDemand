export const SERVICES = [
  { id: 'svc-1', name: 'Initial Consultation', duration: 30,  price: 75,  feeMode: 'applied',   feeAmount: 25, color: 'oklch(0.55 0.15 265)', description: 'Intro session to scope the engagement.',         bookings7d: 18 },
  { id: 'svc-2', name: 'Standard Session',      duration: 60,  price: 150, feeMode: 'applied',   feeAmount: 50, color: 'oklch(0.62 0.14 155)', description: 'Full hour with the practitioner.',              bookings7d: 42 },
  { id: 'svc-3', name: 'Extended Session',       duration: 90,  price: 220, feeMode: 'separate',  feeAmount: 35, color: 'oklch(0.72 0.14 75)',  description: 'Deeper-dive 90-minute session.',                bookings7d: 11 },
  { id: 'svc-4', name: 'Quick Follow-Up',        duration: 15,  price: 0,   feeMode: 'none',      feeAmount: 0,  color: 'oklch(0.65 0.04 265)', description: 'Free 15-minute check-in for existing clients.', bookings7d: 7  },
  { id: 'svc-5', name: 'Group Workshop',         duration: 120, price: 95,  feeMode: 'applied',   feeAmount: 30, color: 'oklch(0.58 0.18 25)',  description: 'Cohort session, up to 8 attendees.',            bookings7d: 24 },
] as const;

export type FeeMode = 'none' | 'applied' | 'separate';

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  feeMode: FeeMode;
  feeAmount: number;
  color: string;
  description: string;
  bookings7d: number;
}

export const APPOINTMENTS = [
  { id: 'a1', start: '09:00', end: '09:30', service: 'svc-1', client: 'Maya Chen',   email: 'maya@example.com',   status: 'confirmed', paid: 25, fee: 25, balance: 50  },
  { id: 'a2', start: '10:00', end: '11:00', service: 'svc-2', client: 'Jordan Park', email: 'jordan@example.com', status: 'confirmed', paid: 50, fee: 50, balance: 100 },
  { id: 'a3', start: '11:30', end: '12:30', service: 'svc-2', client: 'Priya Iyer',  email: 'priya@example.com',  status: 'confirmed', paid: 50, fee: 50, balance: 100 },
  { id: 'a4', start: '13:00', end: '14:30', service: 'svc-3', client: 'Sam Okafor',  email: 'sam@example.com',    status: 'pending',   paid: 35, fee: 35, balance: 220 },
  { id: 'a5', start: '15:00', end: '15:15', service: 'svc-4', client: 'Alex Rivera', email: 'alex@example.com',   status: 'confirmed', paid: 0,  fee: 0,  balance: 0   },
  { id: 'a6', start: '16:00', end: '17:00', service: 'svc-2', client: 'Devon Liu',   email: 'devon@example.com',  status: 'confirmed', paid: 50, fee: 50, balance: 100 },
];

export const CLIENTS = [
  { name: 'Maya Chen',   email: 'maya@example.com',   visits: 6,  spend: 900  },
  { name: 'Jordan Park', email: 'jordan@example.com', visits: 12, spend: 1800 },
  { name: 'Priya Iyer',  email: 'priya@example.com',  visits: 4,  spend: 600  },
  { name: 'Sam Okafor',  email: 'sam@example.com',    visits: 2,  spend: 440  },
  { name: 'Alex Rivera', email: 'alex@example.com',   visits: 9,  spend: 0    },
];

export const FEE_MODE_VALUES = ['none', 'applied', 'separate'] as const;

export const fmt = (n: number, currency = '$') =>
  `${currency}${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const initials = (s: string) =>
  s.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const svcById = (id: string) =>
  (SERVICES as unknown as Service[]).find((s) => s.id === id);
