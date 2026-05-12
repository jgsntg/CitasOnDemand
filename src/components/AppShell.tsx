'use client';

import { useState } from 'react';
import Sidebar from './shell/Sidebar';
import Topbar from './shell/Topbar';
import { useLang } from '@/lib/LangContext';
import * as I from './ui/Icons';

import Overview from './screens/Overview';
import FeeConfig from './screens/FeeConfig';
import Services from './screens/Services';
import CalendarView from './screens/CalendarView';
import Bookings from './screens/Bookings';
import Clients from './screens/Clients';
import SettingsScreen from './screens/SettingsScreen';

export type Route = 'overview' | 'calendar' | 'bookings' | 'services' | 'fees' | 'clients' | 'settings';

const ROUTE_KEYS: Record<Route, { key: string; subKey: string }> = {
  overview: { key: 'nav.overview', subKey: 'top.overview.sub' },
  calendar: { key: 'nav.calendar', subKey: 'top.calendar.sub' },
  bookings: { key: 'nav.bookings', subKey: 'top.bookings.sub' },
  services: { key: 'nav.services', subKey: 'top.services.sub' },
  fees:     { key: 'nav.fees',     subKey: 'top.fees.sub' },
  clients:  { key: 'nav.clients',  subKey: 'top.clients.sub' },
  settings: { key: 'nav.settings', subKey: 'top.settings.sub' },
};

export type Tweaks = {
  feeMode: 'none' | 'applied' | 'separate';
  feeType: 'flat' | 'percent';
  feeValue: number;
  feeRefundable: boolean;
  feeNewOnly: boolean;
  feeItemize: boolean;
  currency: string;
};

const DEFAULT_TWEAKS: Tweaks = {
  feeMode: 'separate',
  feeType: 'flat',
  feeValue: 25,
  feeRefundable: true,
  feeNewOnly: false,
  feeItemize: true,
  currency: '$',
};

export default function AppShell() {
  const { t } = useLang();
  const [route, setRoute] = useState<Route>('fees');
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);

  const setTweak = <K extends keyof Tweaks>(key: K, val: Tweaks[K]) =>
    setTweaks((prev) => ({ ...prev, [key]: val }));

  const meta = ROUTE_KEYS[route];

  const topbarExtra = route === 'fees' ? (
    <>
      <button className="btn">{t('common.discard')}</button>
      <button className="btn primary">{t('common.save')}</button>
    </>
  ) : (
    <>
      <button className="btn icon-only" aria-label="Search"><I.Search /></button>
      <button className="btn icon-only" aria-label="Notifications"><I.Bell /></button>
    </>
  );

  return (
    <div className="app">
      <Sidebar route={route} onRoute={setRoute} />
      <div className="main">
        <Topbar title={t(meta.key)} subtitle={t(meta.subKey)} extra={topbarExtra} />
        {route === 'overview'  && <Overview  tweaks={tweaks} />}
        {route === 'calendar'  && <CalendarView tweaks={tweaks} />}
        {route === 'bookings'  && <Bookings  tweaks={tweaks} />}
        {route === 'services'  && <Services  tweaks={tweaks} />}
        {route === 'fees'      && <FeeConfig tweaks={tweaks} setTweak={setTweak} />}
        {route === 'clients'   && <Clients   tweaks={tweaks} />}
        {route === 'settings'  && <SettingsScreen tweaks={tweaks} setTweak={setTweak} />}
      </div>
    </div>
  );
}
