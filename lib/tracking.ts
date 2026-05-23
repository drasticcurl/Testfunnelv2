'use client';

import { UTMParams, TrackingEvent } from '@/lib/types';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_KEY = 'dormibien_utms';

/**
 * Capture UTM parameters from URL and store in localStorage
 */
export function captureUTMs(): UTMParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utms: UTMParams = {};
  let hasUtms = false;

  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utms[key] = value;
      hasUtms = true;
    }
  });

  if (hasUtms) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
  }

  return utms;
}

/**
 * Get stored UTMs from localStorage
 */
export function getStoredUTMs(): UTMParams {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Fire Meta Pixel event (client-side)
 */
export function trackPixelEvent(event: TrackingEvent, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (fbq) {
    fbq('track', event, data);
  }
}

/**
 * Send event to server-side tracking endpoint
 */
export async function trackServerEvent(event: TrackingEvent, data?: Record<string, unknown>) {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        data,
        utms: getStoredUTMs(),
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Silently fail - tracking should never block UX
  }
}

/**
 * Build Hotmart checkout URL with UTMs and email
 */
export function buildCheckoutUrl(email?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL;
  if (!baseUrl || baseUrl === '[NEEDS_INPUT]') {
    console.warn('NEXT_PUBLIC_HOTMART_CHECKOUT_URL not configured');
    return '#';
  }

  try {
    const url = new URL(baseUrl);
    const utms = getStoredUTMs();
    Object.entries(utms).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    if (email) url.searchParams.set('email', email);
    return url.toString();
  } catch {
    return baseUrl;
  }
}
