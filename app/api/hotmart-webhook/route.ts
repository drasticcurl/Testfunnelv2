import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook token if configured
    const webhookToken = process.env.HOTMART_WEBHOOK_TOKEN;
    if (webhookToken && webhookToken !== '[NEEDS_INPUT]') {
      const authHeader = request.headers.get('x-hotmart-hottok');
      if (authHeader !== webhookToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Extract buyer info from Hotmart webhook payload
    const event = body.event;
    const buyerEmail = body.data?.buyer?.email;
    const buyerName = body.data?.buyer?.name;
    const transactionId = body.data?.purchase?.transaction;

    // Only process approved purchases
    if (event !== 'PURCHASE_APPROVED' && event !== 'PURCHASE_COMPLETE') {
      return NextResponse.json({ success: true, message: 'Event ignored' });
    }

    if (!buyerEmail) {
      return NextResponse.json(
        { error: 'No buyer email found' },
        { status: 400 }
      );
    }

    // Check if lead exists to get their quiz data
    const { data: lead } = await supabaseAdmin
      .from('sleep_leads')
      .select('genero, tipo_insomnio')
      .eq('email', buyerEmail.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Create or update user record
    const { error } = await supabaseAdmin
      .from('sleep_users')
      .upsert(
        {
          email: buyerEmail.toLowerCase(),
          nombre: buyerName || null,
          genero: lead?.genero || 'hombre',
          tipo_insomnio: lead?.tipo_insomnio || 'mente_acelerada',
          plan: 'front',
          hotmart_transaction_id: transactionId || null,
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('[Hotmart Webhook Error]', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    console.log('[Hotmart Webhook] User created/updated:', buyerEmail);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Hotmart Webhook] Parse error:', err);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
