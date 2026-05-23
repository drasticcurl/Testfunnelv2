import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('dormibien_session');

  if (!session || !session.value) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.value;

  const { data: user, error } = await supabaseAdmin
    .from('sleep_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
