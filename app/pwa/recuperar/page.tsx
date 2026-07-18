'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createPwaBrowserClient } from '@/lib/pwa/supabase-browser';
import { TextInput } from '@/components/pwa/ui/TextInput';
import { Button } from '@/components/pwa/ui/Button';
import { Icon } from '@/components/pwa/ui/Icon';

type Status = 'idle' | 'loading' | 'sent' | 'error';

// Validación simple de formato de email (suficiente para client-side).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PwaRecuperarPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();

    // Validación de formato ANTES de enviar. Es el único caso en el que
    // mostramos un error inline relacionado con el email.
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Ingresá un email válido.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    console.log('[pwa/recuperar] submit start, email=', cleanEmail);

    try {
      const supabase = createPwaBrowserClient();
      const redirectTo = `${window.location.origin}/pwa/reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      // IMPORTANTE (privacidad/seguridad): no revelamos si el email existe.
      // Tanto en éxito como en error de Supabase mostramos el mismo estado
      // neutral "sent". Solo logueamos el error para debugging.
      if (error) {
        console.log('[pwa/recuperar] resetPasswordForEmail error:', error.status, error.message);
      } else {
        console.log('[pwa/recuperar] reset email enviado (o cuenta inexistente), redirectTo=', redirectTo);
      }

      setStatus('sent');
    } catch (err) {
      // Solo las excepciones de red/inesperadas muestran un error real.
      console.log('[pwa/recuperar] excepción inesperada:', err);
      setErrorMsg('Error de conexión. Intentá de nuevo.');
      setStatus('error');
    }
  }

  const isSubmitting = status === 'loading';

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-warm">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-terracotta rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-warm text-2xl font-heading font-bold">P</span>
          </div>
          {/* Section-heading level: heading family, 20px, semibold. */}
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Recuperar contraseña
          </h1>
          <p className="font-body text-muted mt-1 text-sm">
            Te enviamos un link para crear una nueva contraseña.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="bg-terracotta-soft border border-terracotta/20 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <Icon name="info" size="lg" label="Información" className="text-terracotta" />
            </div>
            <p className="font-body text-muted text-sm">
              Si existe una cuenta con ese email, te enviamos un link para
              restablecer tu contraseña. Revisá tu bandeja (y spam).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <TextInput
              id="pwa-recuperar-email"
              label="Tu email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />

            {/*
              Inline error treatment (replaces the ad-hoc `text-coral` text) with
              the named status token and an exposed error Icon. The entered email
              is preserved; the submit button acts as the retry control
              (Requirements 9.3, 9.7, 12.5).
            */}
            {status === 'error' && errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-md bg-error/10 border border-error/30"
              >
                <Icon name="error" size="sm" label="Error" className="text-error shrink-0 mt-0.5" />
                <p className="font-body text-sm text-charcoal">{errorMsg}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-warm/30 border-t-warm rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                'Enviar link de recuperación'
              )}
            </Button>
          </form>
        )}

        <p className="text-center font-body text-sm text-muted mt-6">
          <Link href="/pwa/login" className="text-terracotta font-medium hover:text-terracotta/80">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
