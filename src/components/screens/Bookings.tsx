'use client';

import { useState } from 'react';
import { useLang } from '@/lib/LangContext';
import { APPOINTMENTS, fmt, svcById, initials } from '@/lib/data';
import * as I from '@/components/ui/Icons';
import type { Tweaks } from '@/components/AppShell';

type Tab = 'all' | 'upcoming' | 'past' | 'cancelled';

export default function Bookings({ tweaks }: { tweaks: Tweaks }) {
  const { t } = useLang();
  const { currency } = tweaks;
  const [tab, setTab] = useState<Tab>('all');

  return (
    <div className="content">
      <div className="row between" style={{ marginBottom: 16 }}>
        <div className="row gap-sm">
          <div className="seg">
            <button className={tab === 'all'       ? 'on' : ''} onClick={() => setTab('all')}>{t('bk.all')}</button>
            <button className={tab === 'upcoming'  ? 'on' : ''} onClick={() => setTab('upcoming')}>{t('bk.upcoming')}</button>
            <button className={tab === 'past'      ? 'on' : ''} onClick={() => setTab('past')}>{t('bk.past')}</button>
            <button className={tab === 'cancelled' ? 'on' : ''} onClick={() => setTab('cancelled')}>{t('bk.cancelled')}</button>
          </div>
          <div className="input-group" style={{ width: 240 }}>
            <span className="input-prefix"><I.Search size={14} /></span>
            <input className="input with-prefix" placeholder={t('bk.search')} />
          </div>
        </div>
        <div className="row gap-sm">
          <button className="btn"><I.Download size={14} />{t('common.export')}</button>
          <button className="btn primary"><I.Plus />{t('bk.new')}</button>
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>{t('bk.col.when')}</th>
              <th>{t('bk.col.client')}</th>
              <th>{t('bk.col.service')}</th>
              <th>{t('bk.col.status')}</th>
              <th>{t('bk.col.fee')}</th>
              <th>{t('bk.col.balance')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {APPOINTMENTS.map((a) => {
              const s = svcById(a.service)!;
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t('bk.date_sample')}</div>
                    <div className="muted mono" style={{ fontSize: 11.5 }}>{a.start}–{a.end}</div>
                  </td>
                  <td>
                    <div className="row gap-sm">
                      <div className="avatar sm">{initials(a.client)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{a.client}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="row gap-sm">
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, display: 'inline-block' }} />
                      {s.name}
                    </div>
                  </td>
                  <td>
                    <span className={'badge ' + (a.status === 'confirmed' ? 'success' : 'warning')}>
                      <span className="dot" />{t(`common.${a.status}`)}
                    </span>
                  </td>
                  <td className="mono tnum">
                    {a.fee > 0 ? (
                      <>{fmt(a.fee, currency)}{' '}
                        <span className="muted" style={{ fontSize: 11 }}>
                          {s.feeMode === 'applied' ? t('bk.mode.applied') : t('bk.mode.hold')}
                        </span>
                      </>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td className="mono tnum">
                    {a.balance > 0
                      ? <span style={{ color: 'var(--warning)' }}>{fmt(a.balance, currency)}</span>
                      : <span className="muted">{fmt(0, currency)}</span>}
                  </td>
                  <td><button className="btn ghost sm icon-only"><I.More /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
