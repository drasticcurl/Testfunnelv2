import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      nombre,
      genero,
      tipo_insomnio,
      severidad,
      respuestas,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    } = body;

    // Validate required fields
    if (!email || !genero || !tipo_insomnio || !severidad) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert lead into Supabase
    const { data, error } = await supabaseAdmin
      .from('sleep_leads')
      .insert({
        email,
        nombre: nombre || null,
        genero,
        tipo_insomnio,
        severidad,
        respuestas: respuestas || {},
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Submit Quiz Error]', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
