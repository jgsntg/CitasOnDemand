'use client';

import { useState } from 'react';
import { useLang } from '@/lib/LangContext';
import { SERVICES, fmt } from '@/lib/data';
import type { Service } from '@/lib/data';
import * as I from '@/components/ui/Icons';
import type { Tweaks } from '@/components/AppShell';

const FEE_MODE_KEYS = [
  { value: 'none',     labelKey: 'fee.mode.none.label',     subKey: 'fee.mode.none.sub' },
  { value: 'applied',  labelKey: 'fee.mode.applied.label',  subKey: 'fee.mode.applied.sub' },
  { value: 'separate', labelKey: 'fee.mode.separate.label', subKey: 'fee.mode.separate.sub' },
] as const;

export default function Services({ tweaks }: { tweaks: Tweaks }) {
  const { t } = useLang();
  const { currency } = tweaks;
  const [expanded, setExpanded] = useState<string | null>('svc-2');
  const [filter, setFilter] = useState<'all' | 'active' | 'drafts'>('all');

  return (
    <div className="content">
      <div className="row between" style={{ marginBottom: 16 }}>
        <div className="row gap-sm">
          <div className="seg">
            <button className={filter === 'all'    ? 'on' : ''} onClick={() => setFilter('all')}>{t('svc.all')}</button>
            <button className={filter === 'active' ? 'on' : ''} onClick={() => setFilter('active')}>{t('svc.active')}</button>
            <button className={filter === 'drafts' ? 'on' : ''} onClick={() => setFilter('drafts')}>{t('svc.drafts')}</button>
          </div>
          <div className="input-group" style={{ width: 240 }}>
            <span className="input-prefix"><I.Search size={14} /></span>
            <input className="input with-prefix" placeholder={t('svc.search')} />
          </div>
        </div>
        <button className="btn primary"><I.Plus />{t('svc.new')}</button>
      </div>

      <div className="card">
        {(SERVICES as unknown as Service[]).map((s, i) => (
          <ServiceRow key={s.id} svc={s} currency={currency}
            expanded={expanded === s.id}
            onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
            isLast={i === SERVICES.length - 1} />
        ))}
      </div>
    </div>
  );
}

function ServiceRow({ svc, currency, expanded, onToggle, isLast }: {
  svc: Service; currency: string; expanded: boolean; onToggle: () => void; isLast: boolean;
}) {
  const { t } = useLang();
  const feeBadge = (vvc: Service) => {
    if (vvc.feeMode === 'none') return <span className="badge">{t('fee.badge.none')}</span>;
    if (vvc.feeMode === 'applied') return <span className="badge accent">{t('svc.fee_badge.applied')} {fmt(vvc.feeAmount, currency)}</span>;
    return <span className="badge warning">{t('svc.fee_badge.hold')} {fmt(vvc.feeAmount, currency)}</span>;
  };

  return (
    <div style={{ borderBottom: isLast ? 0 : '1px solid var(--border)' }}>
      <div onClick={onToggle}
        style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto auto auto auto', gap: 16, alignItems: 'center', padding: '14px 22px', cursor: 'default' }}>
        <div style={{ width: 8, height: 28, borderRadius: 2, background: svc.color, marginLeft: 4 }} />
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{svc.name}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{svc.description}</div>
        </div>
        <div className="muted mono tnum" style={{ fontSize: 12.5 }}>{svc.duration} {t('common.minutes')}</div>
        <div className="mono tnum" style={{ fontSize: 13.5, fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
          {svc.price === 0 ? <span className="muted">{t('common.free')}</span> : fmt(svc.price, currency)}
        </div>
        <div>{feeBadge(svc)}</div>
        <button className="btn ghost icon-only sm"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .15s' }}>
          <I.ChevronRight />
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '4px 22px 22px', borderTop: '1px dashed var(--border)', background: 'var(--bg-sunken)' }}>
          <ServiceFeeForm svc={svc} currency={currency} />
        </div>
      )}
    </div>
  );
}

function ServiceFeeForm({ svc, currency }: { svc: Service; currency: string }) {
  const { t } = useLang();
  const [mode, setMode] = useState(svc.feeMode);
  const [amount, setAmount] = useState(svc.feeAmount);

  const sample = svc.price || 100;
  const dueNow = mode === 'none' ? 0 : amount;
  const dueLater = mode === 'none' ? sample : mode === 'applied' ? Math.max(0, sample - amount) : sample;
  const total = mode === 'separate' ? sample + amount : sample;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 16 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-muted)', marginBottom: 8 }}>{t('svc.fee')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {FEE_MODE_KEYS.map((m) => (
            <button key={m.value} onClick={() => setMode(m.value)} style={{
              textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--r-md)',
              border: '1px solid ' + (mode === m.value ? 'var(--fg)' : 'var(--border)'),
              background: mode === m.value ? 'var(--bg-elev)' : 'transparent',
              cursor: 'default',
              boxShadow: mode === m.value ? '0 0 0 3px rgba(24,24,27,.06)' : 'none',
            }}>
              <div style={{ fontWeight: 600, fontSize: 12.5 }}>{t(m.labelKey)}</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 2, lineHeight: 1.45 }}>{t(m.subKey)}</div>
            </button>
          ))}
        </div>

        {mode !== 'none' && (
          <div className="row" style={{ gap: 16, marginTop: 16, alignItems: 'flex-end' }}>
            <div className="field" style={{ width: 160 }}>
              <label>{t('fee.amount.title')}</label>
              <div className="input-group">
                <span className="input-prefix">{currency}</span>
                <input className="input with-prefix" type="number" value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', paddingBottom: 10 }}>
              {mode === 'applied'
                ? t('svc.fee_desc.applied',  { now: fmt(amount, currency), later: fmt(dueLater, currency) })
                : t('svc.fee_desc.separate', { now: fmt(amount, currency), total: fmt(sample, currency) })}
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 18, gap: 8 }}>
          <button className="btn primary sm">{t('common.save_short')}</button>
          <button className="btn sm">{t('common.reset')}</button>
          <div style={{ flex: 1 }} />
          <button className="btn ghost sm danger"><I.Trash size={13} />{t('svc.delete')}</button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {t('svc.preview.title')}
        </div>
        <table style={{ width: '100%', marginTop: 10, fontSize: 13 }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--fg-muted)' }}>{t('svc.service_price')}</td>
              <td className="mono tnum" style={{ textAlign: 'right' }}>{fmt(sample, currency)}</td>
            </tr>
            {mode === 'applied' && (
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--fg-muted)' }}>{t('svc.fee')}</td>
                <td className="mono tnum" style={{ textAlign: 'right', color: 'var(--success)' }}>−{fmt(amount, currency)}</td>
              </tr>
            )}
            {mode === 'separate' && (
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--fg-muted)' }}>{t('svc.fee')}</td>
                <td className="mono tnum" style={{ textAlign: 'right' }}>+{fmt(amount, currency)}</td>
              </tr>
            )}
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0 0', fontWeight: 600 }}>{t('common.total')}</td>
              <td className="mono tnum" style={{ textAlign: 'right', padding: '8px 0 0', fontWeight: 600 }}>{fmt(total, currency)}</td>
            </tr>
          </tbody>
        </table>
        <div className="divider" />
        <div className="row between" style={{ fontSize: 12 }}>
          <span className="muted">{t('common.now')}</span>
          <span className="mono tnum">{fmt(dueNow, currency)}</span>
        </div>
        <div className="row between" style={{ fontSize: 12, marginTop: 4 }}>
          <span className="muted">{t('svc.at_appt')}</span>
          <span className="mono tnum">{fmt(dueLater, currency)}</span>
        </div>
      </div>
    </div>
  );
}
