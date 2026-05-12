'use client';

import { useLang } from '@/lib/LangContext';
import { SERVICES, fmt } from '@/lib/data';
import * as I from '@/components/ui/Icons';
import type { Tweaks } from '@/components/AppShell';

type SetTweak = <K extends keyof Tweaks>(key: K, val: Tweaks[K]) => void;

export default function FeeConfig({ tweaks, setTweak }: { tweaks: Tweaks; setTweak: SetTweak }) {
  const { t } = useLang();
  const { feeMode: mode, feeType, feeValue, currency } = tweaks;

  const samplePrice = 150;
  const computedFee = mode === 'none' ? 0
    : feeType === 'percent' ? Math.round((feeValue / 100) * samplePrice)
    : feeValue;
  const dueAtBooking    = computedFee;
  const dueAtAppointment = mode === 'none' ? samplePrice
    : mode === 'applied' ? Math.max(0, samplePrice - computedFee)
    : samplePrice;
  const total = mode === 'separate' ? samplePrice + computedFee : samplePrice;

  const FEE_MODES = [
    { value: 'none',     labelKey: 'fee.mode.none.label',     subKey: 'fee.mode.none.sub' },
    { value: 'applied',  labelKey: 'fee.mode.applied.label',  subKey: 'fee.mode.applied.sub' },
    { value: 'separate', labelKey: 'fee.mode.separate.label', subKey: 'fee.mode.separate.sub' },
  ] as const;

  return (
    <div className="content">
      {/* Hero card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-hd">
          <div>
            <h3>{t('fee.hero.title')}</h3>
            <p>{t('fee.hero.sub')}</p>
          </div>
          <span className="badge accent"><span className="dot" />{t('common.active')}</span>
        </div>
        <div style={{ padding: '20px 22px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {FEE_MODES.map((m) => (
              <ModeCard key={m.value} label={t(m.labelKey)} sub={t(m.subKey)}
                active={mode === m.value} onClick={() => setTweak('feeMode', m.value)} />
            ))}
          </div>
        </div>
      </div>

      {/* Amount + preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-hd">
            <div>
              <h3>{t('fee.amount.title')}</h3>
              <p>{t('fee.amount.sub')}</p>
            </div>
          </div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-muted)', display: 'block', marginBottom: 8 }}>
                {t('fee.charge_type')}
              </label>
              <div className="seg">
                <button className={feeType === 'flat' ? 'on' : ''} onClick={() => setTweak('feeType', 'flat')}>{t('fee.flat')}</button>
                <button className={feeType === 'percent' ? 'on' : ''} onClick={() => setTweak('feeType', 'percent')}>{t('fee.percent')}</button>
              </div>
            </div>

            <div className="field" style={{ maxWidth: 220 }}>
              <label>{feeType === 'flat' ? t('fee.amount.label') : t('fee.percent.label')}</label>
              <div className="input-group">
                {feeType === 'flat' && <span className="input-prefix">{currency}</span>}
                <input type="number"
                  className={feeType === 'flat' ? 'input with-prefix' : 'input with-suffix'}
                  value={feeValue} disabled={mode === 'none'}
                  onChange={(e) => setTweak('feeValue', Number(e.target.value))} />
                {feeType === 'percent' && <span className="input-suffix">%</span>}
              </div>
              <div className="hint">
                {mode === 'none'     && t('fee.hint.none')}
                {mode === 'applied'  && t('fee.hint.applied')}
                {mode === 'separate' && t('fee.hint.separate')}
              </div>
            </div>

            <div className="divider" />

            <ToggleRow label={t('fee.opt.refundable.label')} hint={t('fee.opt.refundable.hint')}
              value={tweaks.feeRefundable} onChange={(v) => setTweak('feeRefundable', v)} disabled={mode === 'none'} />
            <ToggleRow label={t('fee.opt.newonly.label')} hint={t('fee.opt.newonly.hint')}
              value={tweaks.feeNewOnly} onChange={(v) => setTweak('feeNewOnly', v)} disabled={mode === 'none'} />
            <ToggleRow label={t('fee.opt.itemize.label')} hint={t('fee.opt.itemize.hint')}
              value={tweaks.feeItemize} onChange={(v) => setTweak('feeItemize', v)} disabled={mode === 'none'} />
          </div>
        </div>

        {/* Live preview */}
        <div className="card" style={{ background: 'var(--bg-sunken)' }}>
          <div className="card-hd" style={{ background: 'var(--bg-elev)' }}>
            <div>
              <h3>{t('fee.preview.title')}</h3>
              <p>{t('fee.preview.sub')}</p>
            </div>
            <span className="badge"><I.Sparkle /> {t('fee.preview.live')}</span>
          </div>
          <div style={{ padding: 28 }}>
            <CheckoutPreview mode={mode} fee={computedFee} price={samplePrice}
              dueAtBooking={dueAtBooking} dueAtAppointment={dueAtAppointment}
              total={total} currency={currency} />
          </div>
        </div>
      </div>

      {/* Per-service overrides */}
      <div className="section-hd">
        <div>
          <h2>{t('fee.overrides.title')}</h2>
          <p>{t('fee.overrides.sub')}</p>
        </div>
        <button className="btn"><I.Plus /> {t('fee.overrides.add')}</button>
      </div>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>{t('fee.col.service')}</th>
              <th>{t('fee.col.mode')}</th>
              <th>{t('fee.col.fee')}</th>
              <th>{t('fee.col.price')}</th>
              <th>{t('fee.col.last7')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {SERVICES.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="row gap-sm">
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block' }} />
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                  </div>
                </td>
                <td>
                  <span className={'badge ' + (s.feeMode === 'none' ? '' : s.feeMode === 'applied' ? 'accent' : 'warning')}>
                    {s.feeMode === 'none' ? t('fee.badge.none') : s.feeMode === 'applied' ? t('fee.badge.applied') : t('fee.badge.separate')}
                  </span>
                </td>
                <td className="mono tnum">{s.feeMode === 'none' ? '—' : fmt(s.feeAmount, currency)}</td>
                <td className="mono tnum">{s.price === 0 ? <span className="muted">{t('common.free')}</span> : fmt(s.price, currency)}</td>
                <td className="mono tnum muted">{s.bookings7d} {t('common.bookings')}</td>
                <td><button className="btn ghost sm icon-only"><I.More /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModeCard({ label, sub, active, onClick }: { label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', background: active ? 'var(--bg-elev)' : 'var(--bg-sunken)',
      border: '1px solid ' + (active ? 'var(--fg)' : 'var(--border)'),
      borderRadius: 'var(--r-lg)', padding: '16px 18px', cursor: 'default',
      transition: 'border-color .12s, background .12s',
      boxShadow: active ? '0 0 0 3px rgba(24,24,27,.06)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</div>
        <span style={{
          width: 16, height: 16, borderRadius: '50%',
          background: active ? 'var(--fg)' : 'transparent',
          border: '1.5px solid ' + (active ? 'var(--fg)' : 'var(--border-strong)'),
          display: 'grid', placeItems: 'center',
        }}>
          {active && <I.Check size={10} style={{ stroke: 'var(--bg-elev)', strokeWidth: 3 }} />}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{sub}</div>
    </button>
  );
}

function ToggleRow({ label, hint, value, onChange, disabled }: {
  label: string; hint: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="row between" style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 13 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{hint}</div>
      </div>
      <button className={'switch' + (value ? ' on' : '')} onClick={() => onChange(!value)} role="switch" aria-checked={value}><i /></button>
    </div>
  );
}

function CheckoutPreview({ mode, fee, price, dueAtBooking, dueAtAppointment, total, currency }: {
  mode: string; fee: number; price: number;
  dueAtBooking: number; dueAtAppointment: number; total: number; currency: string;
}) {
  const { t } = useLang();
  return (
    <div style={{ background: 'var(--bg-elev)', borderRadius: 'var(--r-lg)', padding: 20, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        {t('fee.preview.summary')}
      </div>
      <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{t('fee.preview.sample_service')}</div>
      <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>{t('fee.preview.sample_date')}</div>

      <div style={{ marginTop: 18, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Line label={t('fee.preview.service')} value={fmt(price, currency)} />
        {mode !== 'none' && (
          <Line label={t('fee.preview.booking_fee')}
            value={mode === 'applied'
              ? <span><span style={{ textDecoration: 'line-through', color: 'var(--fg-subtle)', marginRight: 6 }}>{fmt(fee, currency)}</span><span className="badge success" style={{ fontSize: 11 }}>{t('fee.preview.applied_badge')}</span></span>
              : <span>+{fmt(fee, currency)}</span>}
          />
        )}
        <div className="divider" style={{ margin: '4px 0' }} />
        <Line label={<strong>{t('common.total')}</strong>} value={<strong className="mono tnum">{fmt(total, currency)}</strong>} />
      </div>

      <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)' }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {t('fee.preview.schedule')}
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          <Line
            label={<span><span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{t('common.now_upper')} · </span>{t('fee.preview.due_now')}</span>}
            value={<span className="mono tnum">{fmt(dueAtBooking, currency)}</span>}
          />
          <Line
            label={<span><span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{t('fee.preview.date_prefix')} · </span>{t('fee.preview.due_later')}</span>}
            value={<span className="mono tnum">{fmt(dueAtAppointment, currency)}</span>}
          />
        </div>
      </div>

      <button className="btn primary lg" style={{ width: '100%', marginTop: 16 }}>
        {mode === 'none'
          ? t('fee.preview.confirm')
          : t('fee.preview.pay_and_book', { amt: fmt(dueAtBooking, currency) })}
      </button>
      {mode === 'applied' && fee > 0 && (
        <div style={{ fontSize: 11.5, color: 'var(--fg-subtle)', textAlign: 'center', marginTop: 8 }}>
          {t('fee.preview.applied_note', { fee: fmt(fee, currency), price: fmt(price, currency) })}
        </div>
      )}
    </div>
  );
}

function Line({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--fg-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
