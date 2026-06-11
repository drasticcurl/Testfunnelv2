'use client';

/**
 * CountryContext — provee el `CountryLocale` a todos los componentes del quiz
 * a través del árbol de React. Hay un único `useCountryLocale()` arriba del
 * todo (en CountryProvider) → cada slide consume con `useCountry()` sin
 * duplicar la detección.
 *
 * USO:
 *
 *   // En una ruta SEO con país conocido (ej: /chile/page.tsx).
 *   <CountryProvider forced="CL">
 *     <QuizContainerV2 />
 *   </CountryProvider>
 *
 *   // En /quiz (sin país conocido) — auto-detect URL/localStorage/IP.
 *   <CountryProvider>
 *     <QuizContainerV2 />
 *   </CountryProvider>
 *
 * Si `useCountry()` se llama desde un componente que NO está dentro de un
 * CountryProvider (ej: tests, o por error), recibe el `defaultLocale` con el
 * país DEFAULT_COUNTRY (CL) y `isLoading: true`. Eso evita crashes pero hay
 * que asegurarse de envolver siempre.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useCountryLocale, type CountryLocale } from './useCountryLocale';
import {
  DEFAULT_COUNTRY,
  PRICING_BY_COUNTRY,
  TEXTS_BY_COUNTRY,
  SOCIAL_PROOF_OVERRIDES,
  QUIZ_OVERRIDES,
  type CountryCode,
} from './localization';

const defaultLocale: CountryLocale = {
  country: DEFAULT_COUNTRY,
  pricing: PRICING_BY_COUNTRY[DEFAULT_COUNTRY],
  texts: TEXTS_BY_COUNTRY[DEFAULT_COUNTRY],
  getQuizOverride: (id: string) => QUIZ_OVERRIDES[DEFAULT_COUNTRY]?.[id],
  socialProof: SOCIAL_PROOF_OVERRIDES[DEFAULT_COUNTRY],
  isLoading: true,
};

const CountryCtx = createContext<CountryLocale>(defaultLocale);

interface CountryProviderProps {
  children: ReactNode;
  /**
   * Si está seteado, el provider fuerza ese país y skipea toda la
   * detección. Lo usan las rutas SEO (`/chile`, `/colombia`, etc.).
   * Si es `null`/`undefined`, el provider auto-detecta (URL/localStorage/IP).
   */
  forced?: CountryCode | null;
}

export function CountryProvider({ children, forced = null }: CountryProviderProps) {
  const locale = useCountryLocale({ forced });
  return <CountryCtx.Provider value={locale}>{children}</CountryCtx.Provider>;
}

export function useCountry(): CountryLocale {
  return useContext(CountryCtx);
}
