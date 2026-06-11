'use client';

/**
 * useCountryLocale — Hook que detecta el país del usuario y devuelve
 * los textos y precios localizados para Quiz V2.
 *
 * Prioridad de detección:
 *  1. ?country=XX en la URL (para ads segmentados)
 *  2. localStorage (si ya se detectó antes)
 *  3. Geo-IP via API gratuita (ip-api.com)
 *  4. Fallback: AR
 */

import { useState, useEffect } from 'react';
import {
  CountryCode,
  CountryPricing,
  CountryTexts,
  DEFAULT_COUNTRY,
  isValidCountry,
  PRICING_BY_COUNTRY,
  TEXTS_BY_COUNTRY,
  QUIZ_OVERRIDES,
  SOCIAL_PROOF_OVERRIDES,
  QuizQuestionOverride,
} from './localization';

const STORAGE_KEY = 'chau-hinchazon-country';

export interface CountryLocale {
  country: CountryCode;
  pricing: CountryPricing;
  texts: CountryTexts;
  getQuizOverride: (questionId: string) => QuizQuestionOverride | undefined;
  socialProof: typeof SOCIAL_PROOF_OVERRIDES[CountryCode];
  isLoading: boolean;
}

export function useCountryLocale(): CountryLocale {
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      // 1. Check URL param
      const params = new URLSearchParams(window.location.search);
      const urlCountry = params.get('country')?.toUpperCase();
      if (isValidCountry(urlCountry)) {
        setCountry(urlCountry);
        localStorage.setItem(STORAGE_KEY, urlCountry);
        setIsLoading(false);
        return;
      }

      // 2. Check localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isValidCountry(stored)) {
        setCountry(stored);
        setIsLoading(false);
        return;
      }

      // 3. Geo-IP detection
      try {
        const res = await fetch('https://ip-api.com/json/?fields=countryCode', {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          const geoCountry = data.countryCode?.toUpperCase();
          if (isValidCountry(geoCountry)) {
            setCountry(geoCountry);
            localStorage.setItem(STORAGE_KEY, geoCountry);
          }
        }
      } catch {
        // Silently fail — use default
      }

      setIsLoading(false);
    }

    detect();
  }, []);

  const getQuizOverride = (questionId: string) => {
    return QUIZ_OVERRIDES[country]?.[questionId];
  };

  return {
    country,
    pricing: PRICING_BY_COUNTRY[country],
    texts: TEXTS_BY_COUNTRY[country],
    getQuizOverride,
    socialProof: SOCIAL_PROOF_OVERRIDES[country],
    isLoading,
  };
}
