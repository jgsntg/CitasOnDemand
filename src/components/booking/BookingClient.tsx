'use client';

import { useState } from 'react';
import { useLang } from '@/lib/LangContext';
import type { Lang } from '@/lib/i18n';
import {
  STUDIO, CATEGORIES, SERVICES, PRACTITIONERS, DAYS,
  slotsFor, fmtTime, svcById, pracById, dayLabel, computeFee,
  type Service, type Practitioner,
} from './bookingData';

// ── Icons (inline SVG via React) ────────────────────────────────────────────

function Icon({ paths, size = 16 }: { paths: string | string[]; size?: number }) {
  const ps = Array.isArray(paths) ? paths : [paths];
  return (
    <svg className="bk-icon" width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ps.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const ICONS = {
  lock:      ['M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  phone:     'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  clock:     ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  chevRight: 'M9 18l6-6-6-6',
  chevLeft:  'M15 18l-6-6 6-6',
  sparkle:   ['M12 3v6','M12 15v6','M3 12h6','M15 12h6','M5.6 5.6l4.2 4.2','M14.2 14.2l4.2 4.2','M5.6 18.4l4.2-4.2','M14.2 9.8l4.2-4.2'],
  calendar:  ['M4 6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13z','M4 10h16','M9 3v4','M15 3v4'],
  users:     ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  home:      ['M3 11l9-8 9 8','M5 9.5V20h14V9.5','M10 20v-6h4v6'],
  receipt:   ['M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z','M9 8h6','M9 12h6','M9 16h3'],
  check:     'M5 12l5 5L20 7',
  wallet:    ['M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2H5a2 2 0 0 1-2-2z','M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9','M16 13h2'],
  mail:      ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z','M22 6l-10 7L2 6'],
  info:      ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z','M12 16v-4','M12 8h.01'],
};

// ── Booking state ────────────────────────────────────────────────────────────

interface BookingState {
  serviceId: string | null;
  practitionerId: string;
  date: string | null;
  time: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  consent: boolean;
}

const initialBooking: BookingState = {
  serviceId: null, practitionerId: 'any', date: null, time: null,
  firstName: '', lastName: '', email: '', phone: '', notes: '', consent: true,
};

// ── Top-level BookingClient ──────────────────────────────────────────────────

export default function BookingClient() {
  const { lang, setLang, t } = useLang();
  const [booking, setBooking] = useState<BookingState>(initialBooking);
  const [submitted, setSubmitted] = useState(false);
  const [feeMode] = useState<'none' | 'applied' | 'separate'>('applied');
  const [feeType] = useState<'flat' | 'percent'>('flat');
  const [feeValue] = useState(25);
  const currency = '$';

  const setField = <K extends keyof BookingState>(k: K, v: BookingState[K]) =>
    setBooking((b) => ({ ...b, [k]: v }));

  const svc = svcById(booking.serviceId);
  const fee = computeFee(svc, feeMode, feeType, feeValue);
  const dueNow = feeMode === 'none' || !svc ? 0 : fee;
  const ctaText = dueNow > 0
    ? t('book.cta.pay', { cur: currency, amt: String(dueNow) })
    : t('book.cta.confirm');

  const canStep1 = !!booking.serviceId;
  const canStep4 = !!(booking.firstName.trim() && booking.lastName.trim() && /.+@.+\..+/.test(booking.email));
  const canConfirm = !!(canStep1 && booking.practitionerId && booking.date && booking.time && canStep4);

  const onConfirm = () => {
    if (!canConfirm) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onReset = () => {
    setSubmitted(false);
    setBooking(initialBooking);
  };

  if (submitted) {
    return (
      <div className="bk-shell">
        <BookingTopbar lang={lang} setLang={setLang} t={t} />
        <ConfirmationScreen booking={booking} svc={svc} fee={fee} feeMode={feeMode} currency={currency} onReset={onReset} t={t} />
      </div>
    );
  }

  return (
    <div className="bk-shell">
      <BookingTopbar lang={lang} setLang={setLang} t={t} />

      <div className="bk-page-hd">
        <h1>{t('book.page.title')}</h1>
        <div className="bk-page-sub">{STUDIO.name} · {STUDIO.hours} · {STUDIO.location}</div>
      </div>

      <div className="bk-page">
        <div className="bk-main">
          <ServiceStep
            value={booking.serviceId}
            onChange={(id) => setField('serviceId', id)}
            currency={currency}
            lang={lang}
            t={t}
          />
          <PractitionerStep
            value={booking.practitionerId}
            onChange={(id) => setField('practitionerId', id)}
            t={t}
          />
          <DateTimeStep
            date={booking.date}
            time={booking.time}
            onDate={(k) => { setField('date', k); setField('time', null); }}
            onTime={(tm) => setField('time', tm)}
            svc={svc}
            t={t}
          />
          <DetailsStep data={booking} onChange={setField} t={t} />
          <ReviewStep
            booking={booking}
            svc={svc}
            fee={fee}
            feeMode={feeMode}
            currency={currency}
            ctaText={ctaText}
            canConfirm={canConfirm}
            onConfirm={onConfirm}
            t={t}
          />
        </div>

        <aside className="bk-summary-wrap">
          <SummaryPanel booking={booking} svc={svc} fee={fee} feeMode={feeMode} currency={currency} t={t} />
          <p className="bk-cancel-note">
            <Icon paths={ICONS.info} /> {t('book.cancel.note')}
          </p>
        </aside>
      </div>
    </div>
  );
}

// ── Topbar ───────────────────────────────────────────────────────────────────

function BookingTopbar({ lang, setLang, t }: { lang: Lang; setLang: (l: Lang) => void; t: (k: string, v?: Record<string,string>) => string }) {
  return (
    <header className="bk-topbar">
      <div className="bk-brand">
        <div className="bk-brand-mark">M</div>
        <div>
          <div className="bk-brand-name">{STUDIO.name}</div>
          <div className="bk-brand-sub">{STUDIO.tagline}</div>
        </div>
      </div>
      <div className="bk-topbar-actions">
        <span className="bk-trust-pill"><Icon paths={ICONS.lock} /> {t('book.topbar.secure')}</span>
        <div className="bk-lang-seg" role="group" aria-label="Language">
          <button
            className={lang === 'en' ? 'active' : ''}
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
          >EN</button>
          <button
            className={lang === 'es' ? 'active' : ''}
            onClick={() => setLang('es')}
            aria-pressed={lang === 'es'}
          >ES</button>
        </div>
        <button className="bk-btn ghost bk-hide-sm">
          <Icon paths={ICONS.phone} /> {t('book.topbar.call')}
        </button>
      </div>
    </header>
  );
}

// ── Step card shell ──────────────────────────────────────────────────────────

function StepCard({ num, title, sub, done, children }: {
  num: number; title: string; sub: string; done: boolean; children: React.ReactNode;
}) {
  return (
    <section className="bk-step">
      <header className="bk-step-hd">
        <div className={'bk-step-num' + (done ? ' done' : '')}>
          {done
            ? <svg className="bk-icon" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
            : <span>{num}</span>
          }
        </div>
        <div className="bk-step-titles">
          <div className="bk-step-title">{title}</div>
          <div className="bk-step-sub">{sub}</div>
        </div>
      </header>
      <div className="bk-step-body">{children}</div>
    </section>
  );
}

// ── Step 1: Service ──────────────────────────────────────────────────────────

function ServiceStep({ value, onChange, currency, lang, t }: {
  value: string | null; onChange: (id: string) => void;
  currency: string; lang: string;
  t: (k: string, v?: Record<string,string>) => string;
}) {
  const [cat, setCat] = useState('all');
  const services = SERVICES.filter((s) => cat === 'all' || s.category === cat);

  return (
    <StepCard num={1} title={t('book.step1.title')} sub={t('book.step1.sub')} done={!!value}>
      <div className="bk-cats">
        <button className={'bk-cat' + (cat === 'all' ? ' on' : '')} onClick={() => setCat('all')}>
          {t('book.cat.all')}
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={'bk-cat' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>
            {lang === 'es' ? c.labelEs : c.labelEn}
          </button>
        ))}
      </div>
      <div className="bk-svc-grid">
        {services.map((s) => (
          <button key={s.id} className={'bk-svc' + (value === s.id ? ' sel' : '')} onClick={() => onChange(s.id)}>
            <div>
              <div className="bk-svc-name">
                <span className="bk-svc-radio" />
                {s.name}
                {s.popular && <span className="bk-badge accent">{t('book.badge.popular')}</span>}
              </div>
              <div className="bk-svc-blurb">{s.blurb}</div>
              <div className="bk-svc-meta">
                <span><Icon paths={ICONS.clock} /> {s.duration} min</span>
              </div>
            </div>
            <div className="bk-svc-price">{currency}{s.price}</div>
          </button>
        ))}
      </div>
    </StepCard>
  );
}

// ── Step 2: Practitioner ─────────────────────────────────────────────────────

function PractitionerStep({ value, onChange, t }: {
  value: string; onChange: (id: string) => void;
  t: (k: string, v?: Record<string,string>) => string;
}) {
  const done = !!value;
  return (
    <StepCard num={2} title={t('book.step2.title')} sub={t('book.step2.sub')} done={done}>
      <div className="bk-prac-grid">
        {PRACTITIONERS.map((p) => (
          <button key={p.id} className={'bk-prac' + (value === p.id ? ' sel' : '')} onClick={() => onChange(p.id)}>
            {p.id === 'any' ? (
              <span className="bk-prac-avatar any"><Icon paths={ICONS.sparkle} /></span>
            ) : (
              <span className="bk-prac-avatar">{p.initials}</span>
            )}
            <span className="bk-prac-text">
              <div className="bk-prac-name">{p.id === 'any' ? t('book.prac.any.name') : p.name}</div>
              <div className="bk-prac-role">{p.id === 'any' ? t('book.prac.any.role') : p.role}</div>
            </span>
          </button>
        ))}
      </div>
    </StepCard>
  );
}

// ── Step 3: Date & time ──────────────────────────────────────────────────────

function DateTimeStep({ date, time, onDate, onTime, svc, t }: {
  date: string | null; time: string | null;
  onDate: (k: string) => void; onTime: (tm: string) => void;
  svc: Service | null;
  t: (k: string, v?: Record<string,string>) => string;
}) {
  const slots = date ? slotsFor(date) : [];
  const dayObj = DAYS.find((d) => d.key === date) ?? DAYS[0];
  const monthLabel = `${dayObj.month} ${dayObj.year}`;
  const sub = svc
    ? t('book.step3.sub', { min: String(svc.duration) })
    : t('book.step3.sub_default');

  return (
    <StepCard num={3} title={t('book.step3.title')} sub={sub} done={!!date && !!time}>
      <div className="bk-month-row">
        <span><b>{monthLabel}</b></span>
        <span>{t('book.step3.tz')}</span>
      </div>
      <div className="bk-date-strip">
        {DAYS.map((d) => (
          <button
            key={d.key}
            className={'bk-date' + (date === d.key ? ' sel' : '') + (d.closed ? ' closed' : '')}
            disabled={d.closed}
            onClick={() => onDate(d.key)}
          >
            <div className="bk-date-dow">{d.dow}</div>
            <div className="bk-date-dom">{d.dom}</div>
            <div className="bk-date-mark" />
          </button>
        ))}
      </div>

      {date ? (
        <div className="bk-slot-section">
          <div className="bk-slot-hd">
            <span>{t('book.slot.times')} · <b style={{ color: 'var(--fg)' }}>{dayLabel(date)}</b></span>
            <span className="bk-mono">{t('book.slot.open', { n: String(slots.filter((s) => !s.taken).length) })}</span>
          </div>
          {slots.length === 0 ? (
            <div className="bk-no-slots">{t('book.slot.none')}</div>
          ) : (
            <div className="bk-slot-grid">
              {slots.map((s) => (
                <button
                  key={s.time}
                  className={'bk-slot' + (time === s.time ? ' sel' : '')}
                  disabled={s.taken}
                  onClick={() => onTime(s.time)}
                >
                  {fmtTime(s.time)}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bk-no-slots" style={{ marginTop: 14 }}>{t('book.slot.pick')}</div>
      )}
    </StepCard>
  );
}

// ── Step 4: Details ──────────────────────────────────────────────────────────

function DetailsStep({ data, onChange, t }: {
  data: BookingState;
  onChange: <K extends keyof BookingState>(k: K, v: BookingState[K]) => void;
  t: (k: string, v?: Record<string,string>) => string;
}) {
  const done = !!(data.firstName && data.lastName && data.email);
  return (
    <StepCard num={4} title={t('book.step4.title')} sub={t('book.step4.sub')} done={done}>
      <div className="bk-form-grid">
        <div className="bk-field">
          <label>{t('book.form.first')}</label>
          <input className="bk-input" value={data.firstName} onChange={(e) => onChange('firstName', e.target.value)} placeholder="Ava" />
        </div>
        <div className="bk-field">
          <label>{t('book.form.last')}</label>
          <input className="bk-input" value={data.lastName} onChange={(e) => onChange('lastName', e.target.value)} placeholder="Martinez" />
        </div>
        <div className="bk-field full">
          <label>{t('book.form.email')}</label>
          <input className="bk-input" type="email" value={data.email} onChange={(e) => onChange('email', e.target.value)} placeholder="ava@example.com" />
        </div>
        <div className="bk-field full">
          <label>
            {t('book.form.phone')} <span className="bk-muted">· {t('book.form.phone.hint')}</span>
          </label>
          <input className="bk-input" type="tel" value={data.phone} onChange={(e) => onChange('phone', e.target.value)} placeholder="(555) 123-4567" />
        </div>
        <div className="bk-field full">
          <label>
            {t('book.form.notes')} <span className="bk-muted">· {t('book.form.notes.hint')}</span>
          </label>
          <textarea className="bk-input" rows={3} value={data.notes} onChange={(e) => onChange('notes', e.target.value)} placeholder={t('book.form.notes.ph')} />
        </div>
      </div>
      <button
        className={'bk-checkbox' + (data.consent ? ' on' : '')}
        onClick={() => onChange('consent', !data.consent)}
      >
        <span className="bk-checkbox-box">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={'bk-checkbox-tick' + (data.consent ? ' show' : '')}>
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
        <span>
          <div className="bk-checkbox-label">{t('book.form.reminder')}</div>
          <div className="bk-checkbox-hint">{t('book.form.reminder.hint')}</div>
        </span>
      </button>
    </StepCard>
  );
}

// ── Step 5: Review ───────────────────────────────────────────────────────────

function ReviewStep({ booking, svc, fee, feeMode, currency, ctaText, canConfirm, onConfirm, t }: {
  booking: BookingState; svc: Service | null;
  fee: number; feeMode: string; currency: string;
  ctaText: string; canConfirm: boolean; onConfirm: () => void;
  t: (k: string, v?: Record<string,string>) => string;
}) {
  const servicePrice = svc?.price ?? 0;
  let dueNow = 0, dueLater = servicePrice;
  if (feeMode === 'applied')  { dueNow = fee; dueLater = Math.max(0, servicePrice - fee); }
  else if (feeMode === 'separate') { dueNow = fee; dueLater = servicePrice; }

  return (
    <StepCard num={5} title={t('book.step5.title')} sub={t('book.step5.sub')} done={false}>
      {svc ? (
        <>
          <div className="bk-review-list">
            <div className="bk-review-row">
              <span className="lbl">{svc.name}</span>
              <span className="val">{currency}{servicePrice}</span>
            </div>
            {feeMode === 'applied' && (
              <div className="bk-review-row">
                <span className="lbl">
                  Booking fee <span className="bk-badge accent" style={{ marginLeft: 4 }}>{t('book.review.fee_applied.badge')}</span>
                </span>
                <span className="val">−{currency}{fee}</span>
              </div>
            )}
            {feeMode === 'separate' && (
              <div className="bk-review-row">
                <span className="lbl">
                  Booking fee <span className="bk-badge" style={{ marginLeft: 4 }}>{t('book.review.fee_hold.badge')}</span>
                </span>
                <span className="val">+{currency}{fee}</span>
              </div>
            )}
            <div className="bk-review-row total">
              <span className="lbl">{t('book.review.due_today')}</span>
              <span className="val">{currency}{dueNow}</span>
            </div>
            <div className="bk-review-row" style={{ paddingTop: 0 }}>
              <span className="lbl">{t('book.review.due_later')}</span>
              <span className="val">{currency}{dueLater}</span>
            </div>
          </div>

          {dueNow > 0 && (
            <>
              <div className="bk-divider" />
              <div className="bk-pay-tabs">
                <button className="bk-pay-tab on"><Icon paths={ICONS.wallet} /> {t('book.pay.card')}</button>
                <button className="bk-pay-tab"><Icon paths={ICONS.sparkle} /> Apple Pay</button>
                <button className="bk-pay-tab"><Icon paths={ICONS.wallet} /> Google Pay</button>
              </div>
              <div className="bk-form-grid">
                <div className="bk-field full">
                  <label>{t('book.review.card_num')}</label>
                  <input className="bk-input bk-mono" placeholder="1234 1234 1234 1234" />
                </div>
                <div className="bk-field">
                  <label>{t('book.review.expires')}</label>
                  <input className="bk-input bk-mono" placeholder="MM / YY" />
                </div>
                <div className="bk-field">
                  <label>CVC</label>
                  <input className="bk-input bk-mono" placeholder="123" />
                </div>
                <div className="bk-field full">
                  <label>{t('book.review.zip')}</label>
                  <input className="bk-input bk-mono" placeholder="11201" />
                </div>
              </div>
            </>
          )}

          <div className="bk-cta-row" style={{ marginTop: 18 }}>
            <button className="bk-btn primary" disabled={!canConfirm} onClick={onConfirm}>{ctaText}</button>
          </div>
          <div className="bk-secure">
            <Icon paths={ICONS.lock} /> {t('book.review.secure')}
          </div>
        </>
      ) : (
        <div className="bk-no-slots">{t('book.slot.pick')}</div>
      )}
    </StepCard>
  );
}

// ── Summary panel ────────────────────────────────────────────────────────────

function SummaryPanel({ booking, svc, fee, feeMode, currency, t }: {
  booking: BookingState; svc: Service | null;
  fee: number; feeMode: string; currency: string;
  t: (k: string, v?: Record<string,string>) => string;
}) {
  const prac = pracById(booking.practitionerId);
  const servicePrice = svc?.price ?? 0;
  const empty = !svc && !booking.date;
  let dueNow = 0;
  if (svc && feeMode === 'applied') dueNow = fee;
  else if (svc && feeMode === 'separate') dueNow = fee;

  return (
    <div className="bk-summary">
      <div className="bk-summary-hd">
        <span>{t('book.summary.title')}</span>
        <Icon paths={ICONS.receipt} />
      </div>
      <div className="bk-summary-body">
        {empty ? (
          <div className="bk-summary-empty">
            {t('book.summary.empty').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </div>
        ) : (
          <>
            {svc && (
              <SumItem icon={<Icon paths={ICONS.sparkle} />} label="Service" value={svc.name} sub={`${svc.duration} min · ${currency}${servicePrice}`} />
            )}
            {booking.date && (
              <SumItem
                icon={<Icon paths={ICONS.calendar} />}
                label={t('book.summary.when')}
                value={`${dayLabel(booking.date)}${booking.time ? ` · ${fmtTime(booking.time)}` : ''}`}
                sub={!booking.time ? t('book.summary.pick_time') : undefined}
              />
            )}
            {prac && prac.id !== 'any' && (
              <SumItem icon={<Icon paths={ICONS.users} />} label={t('book.summary.with')} value={prac.name} />
            )}
          </>
        )}
      </div>
      {svc && (
        <div className="bk-summary-foot">
          <div className="bk-sum-row">
            <span>Service</span>
            <span>{currency}{servicePrice}</span>
          </div>
          {feeMode === 'applied' && fee > 0 && (
            <div className="bk-sum-row">
              <span>{t('book.summary.fee_applied')}</span>
              <span>−{currency}{fee}</span>
            </div>
          )}
          {feeMode === 'separate' && fee > 0 && (
            <div className="bk-sum-row">
              <span>Booking fee</span>
              <span>+{currency}{fee}</span>
            </div>
          )}
          <div className="bk-sum-row total">
            <span>{t('book.review.due_today')}</span>
            <span>{currency}{dueNow}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SumItem({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bk-sum-item">
      <div className="bk-sum-icon">{icon}</div>
      <div className="bk-sum-text">
        <div className="bk-sum-lbl">{label}</div>
        <div className="bk-sum-val">{value}</div>
        {sub && <div className="bk-sum-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ── Confirmation screen ──────────────────────────────────────────────────────

function ConfirmationScreen({ booking, svc, fee, feeMode, currency, onReset, t }: {
  booking: BookingState; svc: Service | null;
  fee: number; feeMode: string; currency: string;
  onReset: () => void;
  t: (k: string, v?: Record<string,string>) => string;
}) {
  const prac = pracById(booking.practitionerId);
  const servicePrice = svc?.price ?? 0;
  const paidToday = feeMode === 'none' ? 0 : fee;
  const dueLater = feeMode === 'applied' ? Math.max(0, servicePrice - fee) : servicePrice;

  return (
    <div className="bk-confirm">
      <div className="bk-confirm-mark">
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <h1>{t('book.confirm.title')}</h1>
      <p className="bk-confirm-sub">
        {t('book.confirm.sub', { email: booking.email || 'your email' }).split(booking.email || 'your email').map((part, i, arr) => (
          i === 0 ? <span key={i}>{part}<b>{booking.email || 'your email'}</b></span> : <span key={i}>{part}</span>
        ))}
      </p>

      <div className="bk-confirm-card">
        <div className="bk-summary-hd">
          <span>{svc?.name ?? ''}</span>
          <span className="bk-badge success"><span className="bk-dot" /> {t('book.confirm.confirmed')}</span>
        </div>
        <div className="bk-summary-body">
          {booking.date && booking.time && (
            <SumItem
              icon={<Icon paths={ICONS.calendar} />}
              label={t('book.confirm.when')}
              value={`${dayLabel(booking.date)} · ${fmtTime(booking.time)}`}
            />
          )}
          <SumItem
            icon={<Icon paths={ICONS.users} />}
            label={t('book.confirm.with')}
            value={prac && prac.id !== 'any' ? prac.name : t('book.confirm.next_avail')}
          />
          <SumItem
            icon={<Icon paths={ICONS.home} />}
            label={t('book.confirm.where')}
            value={`${STUDIO.name} · ${STUDIO.location}`}
            sub={STUDIO.city}
          />
        </div>
        <div className="bk-summary-foot">
          <div className="bk-sum-row">
            <span>{t('book.confirm.paid')}</span>
            <span>{currency}{paidToday}</span>
          </div>
          <div className="bk-sum-row total">
            <span>{t('book.confirm.due')}</span>
            <span>{currency}{dueLater}</span>
          </div>
        </div>
      </div>

      <div className="bk-confirm-actions">
        <button className="bk-btn"><Icon paths={ICONS.calendar} /> {t('book.confirm.add_cal')}</button>
        <button className="bk-btn"><Icon paths={ICONS.mail} /> {t('book.confirm.resend')}</button>
        <button className="bk-btn ghost" onClick={onReset}>{t('book.confirm.another')}</button>
      </div>
    </div>
  );
}
