'use client';

/**
 * useCountryLocale — Hook que detecta el país del usuario y devuelve
 * los textos, precios e imagen de prueba social localizados.
 *
 * Prioridad de detección (de mayor a menor):
 *   0. `forced` (prop del CountryProvider) — la ruta SEO ya sabe el país
 *      (ej: /chile fuerza CL). Pisa todo lo demás. Sin flicker.
 *   1. ?country=XX en la URL (para ads que linkean directo a /quiz?country=CL)
 *   2. localStorage (visita previa)
 *   3. Geo-IP via ip-api.com (3s timeout)
 *   4. Fallback: DEFAULT_COUNTRY (CL)
 *
 * Cuando `forced` está seteado, isLoading queda en false desde el primer
 * render → el SSR y el primer paint del cliente coinciden (ningún flash de
 * pricing en la moneda equivocada). Para `/quiz` (sin forced), el flash
 * lo evita el hecho de que todos los países ahora cobran en USD igual,
 * pero el `country` real puede tardar ~1s mientras llega geo-IP.
 */

import { useState, useEffect } from 'react';
import {
  CountryCode,
  CountryPricing,
  CountryTexts,
  CountrySocialProof,
  DEFAULT_COUNTRY,
  isValidCountry,
  PRICING_BY_COUNTRY,
  TEXTS_BY_COUNTRY,
  QUIZ_OVERRIDES,
  SOCIAL_PROOF_OVERRIDES,
  QuizQuestionOverride,
} from './localization';

import { STORAGE_KEYS } from '@/lib/constants';

const STORAGE_KEY = STORAGE_KEYS.country;

export interface CountryLocale {
  country: CountryCode;
  pricing: CountryPricing;
  texts: CountryTexts;
  getQuizOverride: (questionId: string) => QuizQuestionOverride | undefined;
  socialProof: CountrySocialProof;
  isLoading: boolean;
}

export interface UseCountryLocaleOptions {
  /**
   * Fuerza el país del locale, ignorando URL/localStorage/IP. Lo pasan las
   * rutas SEO `/chile`, `/colombia`, etc. para que el primer render ya
   * tenga el locale correcto.
   */
  forced?: CountryCode | null;
}

export function useCountryLocale(options?: UseCountryLocaleOptions): CountryLocale {
  const forced = options?.forced ?? null;

  const [country, setCountry] = useState<CountryCode>(forced ?? DEFAULT_COUNTRY);
  // Si el país viene forzado, no hay nada que cargar.
  const [isLoading, setIsLoading] = useState(!forced);

  useEffect(() => {
    // Si la ruta fuerza un país, lo persistimos en localStorage para que
    // navegaciones internas (ej: lead que vuelve a /quiz desde /chile)
    // mantengan la moneda y modismos elegidos. Y abortamos la detección.
    if (forced && isValidCountry(forced)) {
      try {
        localStorage.setItem(STORAGE_KEY, forced);
      } catch {
        /* storage bloqueado */
      }
      setCountry(forced);
      setIsLoading(false);
      return;
    }

    async function detect() {
      // 1. ?country=XX en la URL.
      const params = new URLSearchParams(window.location.search);
      const urlCountry = params.get('country')?.toUpperCase();
      if (isValidCountry(urlCountry)) {
        setCountry(urlCountry);
        try { localStorage.setItem(STORAGE_KEY, urlCountry); } catch {}
        setIsLoading(false);
        return;
      }

      // 2. localStorage.
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (isValidCountry(stored)) {
          setCountry(stored);
          setIsLoading(false);
          return;
        }
      } catch {
        /* storage bloqueado */
      }

      // 3. Geo-IP (best effort, 3s).
      try {
        const res = await fetch('https://ip-api.com/json/?fields=countryCode', {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          const geoCountry = data.countryCode?.toUpperCase();
          if (isValidCountry(geoCountry)) {
            setCountry(geoCountry);
            try { localStorage.setItem(STORAGE_KEY, geoCountry); } catch {}
          }
        }
      } catch {
        /* fallback al DEFAULT_COUNTRY ya seteado */
      }

      setIsLoading(false);
    }

    detect();
  }, [forced]);

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
