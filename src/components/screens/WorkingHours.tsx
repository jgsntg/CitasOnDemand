'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLang } from '@/lib/LangContext';
import * as I from '@/components/ui/Icons';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = typeof DAY_KEYS[number];

// Maps DayKey to JS dayOfWeek (0=Sun…6=Sat)
const DAY_INDEX: Record<DayKey, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

interface DayData {
  open: boolean;
  start: string;
  end: string;
  capacityPerHour: number;
  breaks: { start: string; end: string }[];
}

const DEFAULT_HOURS: Record<DayKey, DayData> = {
  mon: { open: true,  start: '09:00', end: '18:00', capacityPerHour: 3, breaks: [{ start: '12:00', end: '13:00' }] },
  tue: { open: true,  start: '09:00', end: '18:00', capacityPerHour: 3, breaks: [{ start: '12:00', end: '13:00' }] },
  wed: { open: true,  start: '09:00', end: '18:00', capacityPerHour: 3, breaks: [{ start: '12:00', end: '13:00' }] },
  thu: { open: true,  start: '09:00', end: '18:00', capacityPerHour: 3, breaks: [{ start: '12:00', end: '13:00' }] },
  fri: { open: true,  start: '09:00', end: '17:00', capacityPerHour: 3, breaks: [] },
  sat: { open: true,  start: '10:00', end: '14:00', capacityPerHour: 2, breaks: [] },
  sun: { open: false, start: '09:00', end: '17:00', capacityPerHour: 1, breaks: [] },
};

function apiToState(rows: ApiRow[]): Record<DayKey, DayData> {
  const state = structuredClone(DEFAULT_HOURS) as Record<DayKey, DayData>;
  for (const row of rows) {
    const key = (Object.entries(DAY_INDEX).find(([, v]) => v === row.dayOfWeek)?.[0]) as DayKey | undefined;
    if (!key) continue;
    state[key] = {
      open: row.isActive,
      start: row.openTime,
      end: row.closeTime,
      capacityPerHour: row.capacityPerHour,
      breaks: [],
    };
  }
  return state;
}

interface ApiRow {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  capacityPerHour: number;
  isActive: boolean;
}

export function WorkingHours() {
  const { t } = useLang();
  const [hours, setHours] = useState<Record<DayKey, DayData>>(DEFAULT_HOURS);
  const [savedHours, setSavedHours] = useState<Record<DayKey, DayData>>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(hours) !== JSON.stringify(savedHours);

  useEffect(() => {
    fetch('/api/working-hours')
      .then((r) => r.json())
      .then((rows: ApiRow[]) => {
        const state = apiToState(rows);
        setHours(state);
        setSavedHours(state);
      })
      .catch(() => setError('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    const payload = DAY_KEYS.map((key) => ({
      dayOfWeek: DAY_INDEX[key],
      openTime: hours[key].start,
      closeTime: hours[key].end,
      capacityPerHour: hours[key].capacityPerHour,
      isActive: hours[key].open,
    }));
    try {
      const res = await fetch('/api/working-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: ApiRow[] = await res.json();
      const state = apiToState(updated);
      setHours(state);
      setSavedHours(state);
    } catch {
      setError('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  }, [hours]);

  const discard = () => setHours(structuredClone(savedHours));

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
        {dirty && (
          <div className="row gap-sm">
            <button className="btn" onClick={discard} disabled={saving}>{t('common.discard')}</button>
            <button className="btn primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : t('common.save')}
            </button>
          </div>
        )}
      </div>
      {error && (
        <div style={{ padding: '8px 22px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>
      )}
      {loading ? (
        <div style={{ padding: '32px 22px', color: 'var(--fg-subtle)', fontSize: 13 }}>Loading schedule…</div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {DAY_KEYS.map((d) => (
            <DayRow key={d} dayKey={d} data={hours[d]}
              onChange={(p) => update(d, p)}
              onCopy={() => copyToWeekdays(d)}
              onAddBreak={() => addBreak(d)}
              onRemoveBreak={(i) => removeBreak(d, i)} />
          ))}
        </div>
      )}
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
        <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
          <TimeInput value={data.start} onChange={(v) => onChange({ start: v })} />
          <span className="muted">—</span>
          <TimeInput value={data.end} onChange={(v) => onChange({ end: v })} />
          <div className="row gap-sm" style={{ alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 12 }}>Cap/hr:</span>
            <input
              type="number" min={1} max={100}
              value={data.capacityPerHour}
              onChange={(e) => onChange({ capacityPerHour: Math.max(1, parseInt(e.target.value) || 1) })}
              className="input"
              style={{ width: 56, height: 30, fontFamily: 'var(--font-mono)', fontSize: 12.5, padding: '0 8px' }}
            />
          </div>
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
