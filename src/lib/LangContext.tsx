'use client';

import { createContext, useContext, useState } from 'react';
import { makeT, type Lang, type TFunction } from './i18n';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFunction;
}

const Ctx = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: makeT('en'),
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = makeT(lang);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
