import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify email exists in sleep_users
    const { data: user, error } = await supabaseAdmin
      .from('sleep_users')
      .select('email, nombre, genero, tipo_insomnio')
      .eq('email', normalizedEmail)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'No encontramos una compra con ese email. Verificá que sea el mismo email que usaste en la compra.' },
        { status: 404 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({ success: true, user });

    response.cookies.set('dormibien_session', normalizedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
