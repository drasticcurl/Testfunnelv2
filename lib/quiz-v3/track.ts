/**
 * V3-specific tracking helper.
 * Uses sendBeacon as primary (survives page unload) with fetch fallback.
 * Completely independent from V2 tracking code.
 */

export function trackV3Event(event: string, custom: Record<string, unknown> = {}) {
  const payload = JSON.stringify({
    event,
    custom: { ...custom, quiz_version: 'v3' },
  });

  // sendBeacon is the most reliable for mobile — never gets cancelled
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    const sent = navigator.sendBeacon('/api/track', blob);
    if (sent) return;
  }

  // Fallback to fetch with keepalive
  fetch('/api/track', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  }).catch(() => {});
}
