'use client';

import { useState } from 'react';
import { useLang } from '@/lib/LangContext';
import { APPOINTMENTS, fmt, svcById, initials } from '@/lib/data';
import * as I from '@/components/ui/Icons';
import type { Tweaks } from '@/components/AppShell';

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const DAY_NUMS = [11, 12, 13, 14, 15, 16, 17];
const DAY_KEYS = ['day.mon.short', 'day.tue.short', 'day.wed.short', 'day.thu.short', 'day.fri.short', 'day.sat.short', 'day.sun.short'] as const;
const HOUR_H = 56;

const WEEK_APTS = (() => {
  const out: (typeof APPOINTMENTS[number] & { day: number })[] = [];
  DAY_NUMS.forEach((_, di) => {
    APPOINTMENTS.forEach((a) => {
      if (di === 1) out.push({ ...a, day: di });
      else if ((di + a.id.charCodeAt(1)) % 3 === 0) out.push({ ...a, id: a.id + '-' + di, day: di });
    });
  });
  return out;
})();

export default function CalendarView({ tweaks }: { tweaks: Tweaks }) {
  const { t } = useLang();
  const { currency } = tweaks;
  const [selected, setSelected] = useState<typeof APPOINTMENTS[number] | null>(null);

  return (
    <div className="content">
      <div className="row between" style={{ marginBottom: 16 }}>
        <div className="row gap-sm">
          <button className="btn icon-only sm"><I.ChevronLeft /></button>
          <button className="btn sm">{t('common.today')}</button>
          <button className="btn icon-only sm"><I.ChevronRight /></button>
          <div style={{ marginLeft: 8, fontWeight: 600, fontSize: 14 }}>{t('cal.week_range')}</div>
        </div>
        <div className="row gap-sm">
          <div className="seg">
            <button>{t('cal.day')}</button>
            <button className="on">{t('cal.week')}</button>
            <button>{t('cal.month')}</button>
          </div>
          <button className="btn"><I.Filter size={14} /> {t('cal.filter')}</button>
          <button className="btn primary"><I.Plus />{t('cal.new')}</button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }} />
          {DAY_KEYS.map((dk, i) => (
            <div key={dk} style={{
              padding: '12px 14px', borderBottom: '1px solid var(--border)',
              borderRight: i < 6 ? '1px solid var(--border)' : 0,
              fontWeight: 500, fontSize: 13, background: i === 1 ? 'var(--bg-sunken)' : 'var(--bg-elev)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--fg-subtle)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t(dk)}</div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{DAY_NUMS[i]}</div>
            </div>
          ))}

          <div style={{ borderRight: '1px solid var(--border)', position: 'relative' }}>
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_H, padding: '4px 8px', fontSize: 11, color: 'var(--fg-subtle)', textAlign: 'right', borderTop: '1px solid var(--border)' }}>
                {h % 12 || 12}{h < 12 ? 'a' : 'p'}
              </div>
            ))}
          </div>

          {DAY_NUMS.map((_, di) => (
            <div key={di} style={{ position: 'relative', borderRight: di < 6 ? '1px solid var(--border)' : 0, background: di === 1 ? 'var(--bg-sunken)' : 'var(--bg-elev)' }}>
              {HOURS.map((h, hi) => (
                <div key={h} style={{ height: HOUR_H, borderTop: hi === 0 ? 'none' : '1px solid var(--border)' }} />
              ))}
              {WEEK_APTS.filter((a) => a.day === di).map((a) => {
                const s = svcById(a.service)!;
                const [sh, sm] = a.start.split(':').map(Number);
                const [eh, em] = a.end.split(':').map(Number);
                const top = ((sh + sm / 60) - HOURS[0]) * HOUR_H;
                const height = ((eh + em / 60) - (sh + sm / 60)) * HOUR_H - 2;
                if (top < 0 || top > HOURS.length * HOUR_H) return null;
                const base = APPOINTMENTS.find((b) => b.id === a.id || a.id.startsWith(b.id));
                return (
                  <button key={a.id} onClick={() => setSelected(base ?? APPOINTMENTS[0])} style={{
                    position: 'absolute', left: 4, right: 4, top, height,
                    background: 'var(--bg-elev)', border: '1px solid var(--border)',
                    borderLeft: `3px solid ${s.color}`, borderRadius: 4, padding: '4px 8px',
                    textAlign: 'left', cursor: 'default', boxShadow: '0 1px 2px rgba(0,0,0,.04)',
                    overflow: 'hidden', fontSize: 11.5, lineHeight: 1.3,
                  }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.client}</div>
                    <div style={{ color: 'var(--fg-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selected && <BookingDetail apt={selected} currency={currency} onClose={() => setSelected(null)} />}
    </div>
  );
}

function BookingDetail({ apt, currency, onClose }: {
  apt: typeof APPOINTMENTS[number]; currency: string; onClose: () => void;
}) {
  const { t } = useLang();
  const s = svcById(apt.service)!;
  const isApplied  = s.feeMode === 'applied';
  const isSeparate = s.feeMode === 'separate';
  const total      = isSeparate ? s.price + s.feeAmount : s.price;
  const dueAtAppt  = isApplied  ? Math.max(0, s.price - s.feeAmount) : s.price;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,24,27,.4)', zIndex: 30 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw',
        background: 'var(--bg-elev)', borderLeft: '1px solid var(--border)',
        zIndex: 31, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>{t('cal.detail')}</div>
          <button className="btn ghost icon-only sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 22, overflowY: 'auto', flex: 1 }}>
          <div className="row gap-sm">
            <div className="avatar lg">{initials(apt.client)}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{apt.client}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{apt.email}</div>
            </div>
            <div style={{ flex: 1 }} />
            <span className={'badge ' + (apt.status === 'confirmed' ? 'success' : 'warning')}>
              <span className="dot" />{t(`common.${apt.status}`)}
            </span>
          </div>

          <div style={{ marginTop: 18, padding: 14, background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)' }}>
            <div className="row gap-sm">
              <span style={{ width: 4, height: 32, borderRadius: 2, background: s.color }} />
              <div>
                <div style={{ fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>Tue, May 12 · {apt.start}–{apt.end} · {s.duration} {t('common.minutes')}</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 22 }}>
            {t('cal.payment')}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row label={t('svc.service_price')} value={fmt(s.price, currency)} />
            {s.feeMode !== 'none' && (
              <Row
                label={isApplied ? t('cal.fee_applied') : t('cal.fee_hold')}
                value={isApplied
                  ? <span className="mono tnum" style={{ color: 'var(--success)' }}>−{fmt(s.feeAmount, currency)}</span>
                  : <span className="mono tnum">+{fmt(s.feeAmount, currency)}</span>}
              />
            )}
            <div className="divider" style={{ margin: '4px 0' }} />
            <Row label={<strong>{t('common.total')}</strong>} value={<strong className="mono tnum">{fmt(total, currency)}</strong>} />
          </div>

          <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row
              label={<span><span className="badge success" style={{ fontSize: 10 }}><I.Check size={10} />{t('common.paid')}</span> {t('svc.fee')}</span>}
              value={<span className="mono tnum">{fmt(apt.paid, currency)}</span>}
            />
            <Row
              label={<span style={{ color: 'var(--fg-muted)' }}>{t('cal.balance_appt')}</span>}
              value={<span className="mono tnum" style={{ color: dueAtAppt > 0 ? 'var(--warning)' : 'var(--fg-muted)' }}>{fmt(dueAtAppt, currency)}</span>}
            />
          </div>

          <div className="row" style={{ gap: 8, marginTop: 22 }}>
            <button className="btn primary"><I.Mail size={13} />{t('cal.message')}</button>
            <button className="btn">{t('cal.reschedule')}</button>
            <button className="btn ghost danger">{t('common.cancel')}</button>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--fg-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
