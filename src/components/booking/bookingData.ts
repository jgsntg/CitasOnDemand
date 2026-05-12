export const STUDIO = {
  name: 'Maren & Sage',
  tagline: 'Skincare & bodywork studio',
  location: '410 Linden St, Suite 2',
  city: 'Brooklyn, NY',
  phone: '(718) 555-0142',
  hours: 'Tue–Sat · 10am–7pm',
};

export const CATEGORIES = [
  { id: 'facial',  labelEn: 'Facials',       labelEs: 'Faciales' },
  { id: 'massage', labelEn: 'Bodywork',       labelEs: 'Masajes' },
  { id: 'brow',    labelEn: 'Brow & lash',   labelEs: 'Cejas y pestañas' },
  { id: 'package', labelEn: 'Packages',       labelEs: 'Paquetes' },
];

export interface Service {
  id: string;
  category: string;
  name: string;
  duration: number;
  price: number;
  blurb: string;
  popular?: boolean;
}

export const SERVICES: Service[] = [
  { id: 'svc-1', category: 'facial',  name: 'Signature Facial',          duration: 60,  price: 145, blurb: 'Deep-clean, exfoliate, and a custom mask for your skin type.' },
  { id: 'svc-2', category: 'facial',  name: 'Hydrating Glow Facial',     duration: 75,  price: 175, blurb: 'Plumping serums and a lymphatic massage to leave skin dewy.' },
  { id: 'svc-3', category: 'facial',  name: 'Microcurrent Lift',         duration: 60,  price: 195, blurb: 'A non-invasive tone-and-lift treatment — see results immediately.' },
  { id: 'svc-4', category: 'massage', name: 'Deep Tissue Massage',       duration: 60,  price: 135, blurb: 'Firm, focused pressure for tight shoulders, back, and hips.' },
  { id: 'svc-5', category: 'massage', name: 'Aromatherapy Massage',      duration: 90,  price: 185, blurb: 'A slow, full-body unwind with botanical oils.' },
  { id: 'svc-6', category: 'brow',    name: 'Brow Shaping',              duration: 30,  price: 45,  blurb: 'Tweeze and trim, finished with a tint to match your hair.' },
  { id: 'svc-7', category: 'brow',    name: 'Lash Lift & Tint',         duration: 45,  price: 95,  blurb: 'A semi-permanent curl that lasts 6–8 weeks.' },
  { id: 'svc-8', category: 'package', name: 'The Reset · Facial + Massage', duration: 120, price: 295, blurb: "A full afternoon to yourself. Our most-booked package.", popular: true },
];

export interface Practitioner {
  id: string;
  name: string;
  role: string;
  initials?: string;
}

export const PRACTITIONERS: Practitioner[] = [
  { id: 'any',  name: 'Any available',   role: 'First slot that fits' },
  { id: 'p-1', name: 'Maren Ellis',     role: 'Senior esthetician',      initials: 'ME' },
  { id: 'p-2', name: 'Sage Okonkwo',    role: 'Massage therapist',        initials: 'SO' },
  { id: 'p-3', name: 'Lina Park',       role: 'Brow & lash specialist',   initials: 'LP' },
];

export interface Day {
  key: string;
  dow: string;
  dom: number;
  month: string;
  year: number;
  closed: boolean;
  isToday: boolean;
}

function buildDays(): Day[] {
  const base = new Date(2026, 4, 12); // May 12, 2026 — Tuesday
  const wkShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mShort  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out: Day[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const wd = d.getDay();
    out.push({
      key: d.toISOString().slice(0, 10),
      dow: wkShort[wd],
      dom: d.getDate(),
      month: mShort[d.getMonth()],
      year: d.getFullYear(),
      closed: wd === 0 || wd === 1,
      isToday: i === 0,
    });
  }
  return out;
}

export const DAYS = buildDays();

const ALL_SLOTS = ['10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];
const TAKEN: Record<string, string[]> = {
  '2026-05-12': ['10:00','11:30','15:00','16:30'],
  '2026-05-13': ['13:00','13:30','17:00'],
  '2026-05-14': ['10:00','10:30','11:00','12:00','15:00','15:30','16:00'],
  '2026-05-15': ['14:00','14:30'],
  '2026-05-16': ['10:00','11:00','12:00','13:00','14:00','15:00','16:00'],
  '2026-05-20': ['11:30','12:00','17:30'],
};

export function slotsFor(dayKey: string) {
  const taken = new Set(TAKEN[dayKey] || []);
  return ALL_SLOTS.map((t) => ({ time: t, taken: taken.has(t) }));
}

export function fmtTime(t24: string) {
  const [h, m] = t24.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, '0')} ${ap}`;
}

export function svcById(id: string | null) {
  return SERVICES.find((s) => s.id === id) ?? null;
}

export function pracById(id: string) {
  return PRACTITIONERS.find((p) => p.id === id) ?? null;
}

export function dayLabel(key: string) {
  const d = DAYS.find((x) => x.key === key);
  if (!d) return '';
  return `${d.dow}, ${d.month} ${d.dom}`;
}

export function computeFee(svc: Service | null, feeMode: string, feeType: string, feeValue: number) {
  if (!svc || feeMode === 'none') return 0;
  if (feeType === 'percent') return Math.round((svc.price * feeValue) / 100);
  return Number(feeValue) || 0;
}
