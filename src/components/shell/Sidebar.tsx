'use client';

import * as I from '@/components/ui/Icons';
import { useLang } from '@/lib/LangContext';
import type { Route } from '@/components/AppShell';

const NAV_ITEMS = [
  { id: 'overview' as const, icon: I.Home,     badge: 0 },
  { id: 'calendar' as const, icon: I.Calendar, badge: 6 },
  { id: 'bookings' as const, icon: I.List,     badge: 12 },
  { id: 'services' as const, icon: I.Layers,   badge: 0 },
  { id: 'fees'     as const, icon: I.Wallet,   badge: 0 },
  { id: 'clients'  as const, icon: I.Users,    badge: 0 },
  { id: 'settings' as const, icon: I.Settings, badge: 0 },
];

interface Props {
  route: Route;
  onRoute: (r: Route) => void;
}

export default function Sidebar({ route, onRoute }: Props) {
  const { t } = useLang();
  const workspace = NAV_ITEMS.slice(0, 4);
  const configure = NAV_ITEMS.slice(4);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">C</div>
        <div>
          <div className="brand-name">CitasOnDemand</div>
          <div className="brand-sub">Northside Studio</div>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-section">{t('nav.workspace')}</div>
        {workspace.map((n) => (
          <NavItem key={n.id} icon={n.icon} label={t(`nav.${n.id}`)} badge={n.badge}
            active={route === n.id} onClick={() => onRoute(n.id)} />
        ))}
        <div className="nav-section">{t('nav.configure')}</div>
        {configure.map((n) => (
          <NavItem key={n.id} icon={n.icon} label={t(`nav.${n.id}`)} badge={n.badge}
            active={route === n.id} onClick={() => onRoute(n.id)} />
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="avatar">RM</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>Rosa Medina</div>
          <div style={{ fontSize: 11, color: 'var(--fg-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Owner · Pro plan
          </div>
        </div>
        <button className="btn ghost icon-only sm" aria-label="Notifications"><I.Bell /></button>
      </div>
    </aside>
  );
}

function NavItem({ icon: Ic, label, badge, active, onClick }: {
  icon: React.ComponentType<{ size?: number }>;
  label: string; badge: number; active: boolean; onClick: () => void;
}) {
  return (
    <button className={'nav-item' + (active ? ' active' : '')} onClick={onClick}>
      <Ic />
      <span>{label}</span>
      {badge > 0 && <span className="badge">{badge}</span>}
    </button>
  );
}
