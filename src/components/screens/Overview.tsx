'use client';

import { useLang } from '@/lib/LangContext';
import { APPOINTMENTS, fmt, svcById } from '@/lib/data';
import * as I from '@/components/ui/Icons';
import type { Tweaks } from '@/components/AppShell';

export default function Overview({ tweaks }: { tweaks: Tweaks }) {
  const { t } = useLang();
  const { currency } = tweaks;
  const totalRevToday = APPOINTMENTS.reduce((s, a) => s + (svcById(a.service)?.price ?? 0), 0);
  const collectedToday = APPOINTMENTS.reduce((s, a) => s + a.paid, 0);

  return (
    <div className="content">
      <div className="kpi-grid">
        <Kpi label={t('ov.kpi.today')}   value={APPOINTMENTS.length} delta={t('ov.vs_last_tue')} up />
        <Kpi label={t('ov.kpi.revenue')} value={fmt(totalRevToday, currency)} delta={t('ov.mom')} up />
        <Kpi label={t('ov.kpi.fees')}    value={fmt(collectedToday, currency)} delta={t('ov.of_booked')} />
        <Kpi label={t('ov.kpi.noshow')}  value="2.1%" delta={t('ov.noshow_delta')} up />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-hd">
            <div>
              <h3>{t('ov.today.title')}</h3>
              <p>{t('ov.today.sub')}</p>
            </div>
            <button className="btn sm">{t('ov.open_cal')}</button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {APPOINTMENTS.map((a) => {
              const s = svcById(a.service)!;
              return (
                <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 22px', borderTop: '1px solid var(--border)' }}>
                  <div className="mono tnum" style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{a.start}</div>
                  <div className="row gap-sm">
                    <span style={{ width: 4, height: 28, borderRadius: 2, background: s.color }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{a.client}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s.name} · {s.duration} {t('common.minutes')}</div>
                    </div>
                  </div>
                  <div className="row gap-sm">
                    {a.balance > 0 ? (
                      <span className="badge warning"><span className="dot" />{fmt(a.balance, currency)} {t('common.due')}</span>
                    ) : a.paid > 0 ? (
                      <span className="badge success"><I.Check size={11} />{t('common.paid')} {fmt(a.paid, currency)}</span>
                    ) : (
                      <span className="badge">{t('common.free')}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <div><h3>{t('ov.fee_collect')}</h3><p>{t('ov.this_week')}</p></div>
          </div>
          <div className="card-pad">
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{fmt(1430, currency)}</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{t('ov.collected')}</div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Bar label={t('ov.legend.applied')}  value={68} amount={fmt(972, currency)}  color="var(--accent)" />
              <Bar label={t('ov.legend.separate')} value={22} amount={fmt(310, currency)}  color="oklch(0.72 0.14 75)" />
              <Bar label={t('ov.legend.free')}     value={10} amount="14 bookings"         color="var(--border-strong)" />
            </div>
            <div className="divider" />
            <div className="row between" style={{ fontSize: 12.5 }}>
              <span className="muted">{t('ov.refunded')}</span>
              <span className="mono tnum">{fmt(50, currency)}</span>
            </div>
            <div className="row between" style={{ fontSize: 12.5, marginTop: 6 }}>
              <span className="muted">{t('ov.retained')}</span>
              <span className="mono tnum">{fmt(85, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, up }: { label: string; value: string | number; delta: string; up?: boolean }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className={'kpi-delta' + (up ? ' up' : '')}>{delta}</div>
    </div>
  );
}

function Bar({ label, value, amount, color }: { label: string; value: number; amount: string; color: string }) {
  return (
    <div>
      <div className="row between" style={{ fontSize: 12.5, marginBottom: 4 }}>
        <span>{label}</span>
        <span className="mono tnum muted">{amount}</span>
      </div>
      <div style={{ height: 4, background: 'var(--bg-sunken)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: value + '%', height: '100%', background: color }} />
      </div>
    </div>
  );
}
