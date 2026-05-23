import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data, utms, url, timestamp } = body;

    // Log the event (in production, send to Meta CAPI or analytics)
    console.log('[TRACK]', {
      event,
      data,
      utms,
      url,
      timestamp,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
    });

    // Meta Conversions API (if configured)
    const pixelId = process.env.META_PIXEL_ID;
    const capiToken = process.env.META_CAPI_TOKEN;

    if (pixelId && capiToken && pixelId !== '[NEEDS_INPUT]') {
      try {
        await fetch(
          `https://graph.facebook.com/v18.0/${pixelId}/events`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [
                {
                  event_name: event,
                  event_time: Math.floor(Date.now() / 1000),
                  action_source: 'website',
                  event_source_url: url,
                  user_data: {
                    client_ip_address: request.headers.get('x-forwarded-for'),
                    client_user_agent: request.headers.get('user-agent'),
                  },
                  custom_data: data,
                },
              ],
              access_token: capiToken,
            }),
          }
        );
      } catch (err) {
        console.error('[CAPI Error]', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
