'use client';

import { useLang } from '@/lib/LangContext';
import { CLIENTS, fmt, initials } from '@/lib/data';
import * as I from '@/components/ui/Icons';
import type { Tweaks } from '@/components/AppShell';

export default function Clients({ tweaks }: { tweaks: Tweaks }) {
  const { t } = useLang();
  const { currency } = tweaks;

  return (
    <div className="content">
      <div className="row between" style={{ marginBottom: 16 }}>
        <div className="input-group" style={{ width: 280 }}>
          <span className="input-prefix"><I.Search size={14} /></span>
          <input className="input with-prefix" placeholder={t('cl.search')} />
        </div>
        <button className="btn primary"><I.Plus />{t('cl.add')}</button>
      </div>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>{t('cl.col.client')}</th>
              <th>{t('cl.col.visits')}</th>
              <th>{t('cl.col.spend')}</th>
              <th>{t('cl.col.last')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((c) => (
              <tr key={c.email}>
                <td>
                  <div className="row gap-sm">
                    <div className="avatar sm">{initials(c.name)}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="mono tnum">{c.visits}</td>
                <td className="mono tnum">{fmt(c.spend, currency)}</td>
                <td className="muted">{t('cl.last_visit')}</td>
                <td><button className="btn ghost sm icon-only"><I.More /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
