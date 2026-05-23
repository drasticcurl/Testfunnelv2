import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET — fetch diary entries for the logged-in user
export async function GET(request: NextRequest) {
  const session = request.cookies.get('dormibien_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.value;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '30', 10);

  const { data: entries, error } = await supabaseAdmin
    .from('sleep_diary')
    .select('*')
    .eq('user_email', email)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }

  return NextResponse.json({ entries: entries || [] });
}

// POST — create a new diary entry
export async function POST(request: NextRequest) {
  const session = request.cookies.get('dormibien_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.value;

  try {
    const body = await request.json();
    const { date, hora_acostar, hora_dormir, despertares, calidad, energia_dia, notas } = body;

    if (!date || !hora_acostar || !hora_dormir || calidad == null || energia_dia == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('sleep_diary')
      .upsert(
        {
          user_email: email,
          date,
          hora_acostar,
          hora_dormir,
          despertares: despertares || 0,
          calidad,
          energia_dia,
          notas: notas || null,
        },
        { onConflict: 'user_email,date' }
      )
      .select()
      .single();

    if (error) {
      console.error('[Diary POST Error]', error);
      return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
