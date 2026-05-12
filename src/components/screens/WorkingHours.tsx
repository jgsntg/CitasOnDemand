'use client';

import { useState } from 'react';
import { useLang } from '@/lib/LangContext';
import * as I from '@/components/ui/Icons';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = typeof DAY_KEYS[number];

interface DayData { open: boolean; start: string; end: string; breaks: { start: string; end: string }[] }

const DEFAULT_HOURS: Record<DayKey, DayData> = {
  mon: { open: true,  start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
  tue: { open: true,  start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
  wed: { open: true,  start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
  thu: { open: true,  start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
  fri: { open: true,  start: '09:00', end: '17:00', breaks: [] },
  sat: { open: true,  start: '10:00', end: '14:00', breaks: [] },
  sun: { open: false, start: '09:00', end: '17:00', breaks: [] },
};

export function WorkingHours() {
  const { t } = useLang();
  const [hours, setHours] = useState<Record<DayKey, DayData>>(DEFAULT_HOURS);

  const update = (day: DayKey, patch: Partial<DayData>) =>
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }));

  const copyToWeekdays = (day: DayKey) => {
    const src = hours[day];
    setHours((h) => {
      const next = { ...h };
      (['mon', 'tue', 'wed', 'thu', 'fri'] as DayKey[]).forEach((d) => { next[d] = { ...src }; });
      return next;
    });
  };

  const addBreak = (day: DayKey) =>
    update(day, { breaks: [...hours[day].breaks, { start: '12:00', end: '13:00' }] });

  const removeBreak = (day: DayKey, idx: number) =>
    update(day, { breaks: hours[day].breaks.filter((_, i) => i !== idx) });

  return (
    <div className="card">
      <div className="card-hd">
        <div>
          <h3>{t('hours.title')}</h3>
          <p>{t('hours.sub')}</p>
        </div>
      </div>
      <div style={{ padding: '6px 0' }}>
        {DAY_KEYS.map((d) => (
          <DayRow key={d} dayKey={d} data={hours[d]}
            onChange={(p) => update(d, p)}
            onCopy={() => copyToWeekdays(d)}
            onAddBreak={() => addBreak(d)}
            onRemoveBreak={(i) => removeBreak(d, i)} />
        ))}
      </div>
    </div>
  );
}

function DayRow({ dayKey, data, onChange, onCopy, onAddBreak, onRemoveBreak }: {
  dayKey: DayKey; data: DayData;
  onChange: (p: Partial<DayData>) => void;
  onCopy: () => void; onAddBreak: () => void; onRemoveBreak: (i: number) => void;
}) {
  const { t } = useLang();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 48px 1fr auto', gap: 16, alignItems: 'flex-start', padding: '14px 22px', borderTop: '1px solid var(--border)' }}>
      <div style={{ paddingTop: 6 }}>
        <div style={{ fontWeight: 500 }}>{t(`day.${dayKey}`)}</div>
        <div className="muted" style={{ fontSize: 11.5 }}>
          {data.open
            ? `${data.start}–${data.end}${data.breaks.length ? ' · ' + data.breaks.length + ' break' + (data.breaks.length === 1 ? '' : 's') : ''}`
            : t('hours.closed')}
        </div>
      </div>
      <div style={{ paddingTop: 8 }}>
        <button className={'switch' + (data.open ? ' on' : '')}
          onClick={() => onChange({ open: !data.open })} role="switch" aria-checked={data.open}><i /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: data.open ? 1 : 0.4, pointerEvents: data.open ? 'auto' : 'none' }}>
        <div className="row gap-sm">
          <TimeInput value={data.start} onChange={(v) => onChange({ start: v })} />
          <span className="muted">—</span>
          <TimeInput value={data.end} onChange={(v) => onChange({ end: v })} />
          <button className="btn ghost sm" onClick={onAddBreak}><I.Plus size={12} />{t('hours.add_break')}</button>
        </div>
        {data.breaks.map((b, i) => (
          <div key={i} className="row gap-sm" style={{ paddingLeft: 4 }}>
            <span className="badge">{t('hours.break')}</span>
            <TimeInput value={b.start} onChange={(v) => {
              const next = [...data.breaks]; next[i] = { ...b, start: v };
              onChange({ breaks: next });
            }} />
            <span className="muted">—</span>
            <TimeInput value={b.end} onChange={(v) => {
              const next = [...data.breaks]; next[i] = { ...b, end: v };
              onChange({ breaks: next });
            }} />
            <button className="btn ghost sm icon-only" onClick={() => onRemoveBreak(i)} aria-label="Remove">
              <I.Trash size={13} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 4 }}>
        <button className="btn ghost sm" onClick={onCopy} title={t('hours.copy')}>
          <I.Copy size={13} />
        </button>
      </div>
    </div>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input type="time" className="input" value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: 110, height: 30, fontFamily: 'var(--font-mono)', fontSize: 12.5, padding: '0 8px' }} />
  );
}

export function BookingWindow() {
  const { t } = useLang();
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-hd">
        <div><h3>{t('hours.advance.title')}</h3></div>
      </div>
      <div className="card-pad" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field">
          <label>{t('hours.advance.min')}</label>
          <select className="select" defaultValue="2h">
            <option value="0">{t('hours.no_min')}</option>
            <option value="1h">{t('hours.hours_ahead', { n: '1' })}</option>
            <option value="2h">{t('hours.hours_ahead', { n: '2' })}</option>
            <option value="24h">{t('hours.hours_ahead', { n: '24' })}</option>
            <option value="48h">{t('hours.hours_ahead', { n: '48' })}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('hours.advance.max')}</label>
          <select className="select" defaultValue="60">
            <option value="14">{t('hours.days_out', { n: '14' })}</option>
            <option value="30">{t('hours.days_out', { n: '30' })}</option>
            <option value="60">{t('hours.days_out', { n: '60' })}</option>
            <option value="90">{t('hours.days_out', { n: '90' })}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('hours.slot')}</label>
          <select className="select" defaultValue="30">
            <option value="15">15 {t('common.minutes')}</option>
            <option value="30">30 {t('common.minutes')}</option>
            <option value="60">60 {t('common.minutes')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('hours.buffer')}</label>
          <select className="select" defaultValue="0">
            <option value="0">{t('hours.no_buffer')}</option>
            <option value="10">10 {t('common.minutes')}</option>
            <option value="15">15 {t('common.minutes')}</option>
            <option value="30">30 {t('common.minutes')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
