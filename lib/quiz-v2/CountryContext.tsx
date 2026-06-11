'use client';

/**
 * CountryContext — React Context that provides country locale to all quiz V2 components.
 * Wraps the useCountryLocale hook so we only detect once at the top level.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useCountryLocale, type CountryLocale } from './useCountryLocale';
import { DEFAULT_COUNTRY, PRICING_BY_COUNTRY, TEXTS_BY_COUNTRY, SOCIAL_PROOF_OVERRIDES, QUIZ_OVERRIDES } from './localization';

const defaultLocale: CountryLocale = {
  country: DEFAULT_COUNTRY,
  pricing: PRICING_BY_COUNTRY[DEFAULT_COUNTRY],
  texts: TEXTS_BY_COUNTRY[DEFAULT_COUNTRY],
  getQuizOverride: (id: string) => QUIZ_OVERRIDES[DEFAULT_COUNTRY]?.[id],
  socialProof: SOCIAL_PROOF_OVERRIDES[DEFAULT_COUNTRY],
  isLoading: true,
};

const CountryCtx = createContext<CountryLocale>(defaultLocale);

export function CountryProvider({ children }: { children: ReactNode }) {
  const locale = useCountryLocale();
  return <CountryCtx.Provider value={locale}>{children}</CountryCtx.Provider>;
}

export function useCountry(): CountryLocale {
  return useContext(CountryCtx);
}
