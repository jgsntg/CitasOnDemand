'use client';

import { useLang } from '@/lib/LangContext';
import type { Lang } from '@/lib/i18n';

interface Props {
  title: string;
  subtitle: string;
  extra?: React.ReactNode;
}

export default function Topbar({ title, subtitle, extra }: Props) {
  const { lang, setLang } = useLang();
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      <div className="topbar-actions">
        <LangPill lang={lang} setLang={setLang} />
        {extra}
      </div>
    </div>
  );
}

function LangPill({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="seg" style={{ marginRight: 4 }}>
      <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
      <button className={lang === 'es' ? 'on' : ''} onClick={() => setLang('es')}>ES</button>
    </div>
  );
}
