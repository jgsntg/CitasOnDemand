'use client';

import { useLang } from '@/lib/LangContext';
import type { Lang } from '@/lib/i18n';
import { WorkingHours, BookingWindow } from './WorkingHours';
import type { Tweaks } from '@/components/AppShell';

type SetTweak = <K extends keyof Tweaks>(key: K, val: Tweaks[K]) => void;

export default function SettingsScreen({ tweaks, setTweak }: { tweaks: Tweaks; setTweak: SetTweak }) {
  const { t, lang, setLang } = useLang();

  return (
    <div className="content" style={{ maxWidth: 820 }}>
      <WorkingHours />
      <BookingWindow />

      {/* Business profile */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-hd">
          <div><h3>{t('settings.profile.title')}</h3><p>{t('settings.profile.sub')}</p></div>
        </div>
        <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>{t('settings.business_name')}</label>
            <input className="input" defaultValue="Northside Studio" />
          </div>
          <div className="field">
            <label>{t('settings.booking_url')}</label>
            <div className="input-group">
              <span className="input-prefix">citas.app/</span>
              <input className="input with-prefix" defaultValue="northside" style={{ paddingLeft: 86 }} />
            </div>
          </div>
          <div className="field">
            <label>{t('hours.timezone')}</label>
            <select className="select">
              <option>America/Los_Angeles (PT)</option>
              <option>America/New_York (ET)</option>
              <option>America/Mexico_City (CT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-hd">
          <div><h3>{t('settings.currency.title')}</h3><p>{t('settings.currency.sub')}</p></div>
        </div>
        <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>{t('settings.currency_symbol')}</label>
            <select className="select" value={tweaks.currency} onChange={(e) => setTweak('currency', e.target.value)}>
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="₹">INR (₹)</option>
              <option value="$">MXN ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-hd">
          <div><h3>{t('settings.lang.title')}</h3><p>{t('settings.lang.sub')}</p></div>
        </div>
        <div className="card-pad">
          <div className="seg">
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en' as Lang)}>English</button>
            <button className={lang === 'es' ? 'on' : ''} onClick={() => setLang('es' as Lang)}>Español</button>
          </div>
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-hd">
          <div><h3>{t('settings.cancel.title')}</h3><p>{t('settings.cancel.sub')}</p></div>
        </div>
        <div className="card-pad">
          <textarea className="input" rows={4} defaultValue={t('settings.cancel.default')} />
        </div>
      </div>
    </div>
  );
}
