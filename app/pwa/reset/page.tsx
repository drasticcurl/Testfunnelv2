'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { createPwaBrowserClient } from '@/lib/pwa/supabase-browser';
import { TextInput } from '@/components/pwa/ui/TextInput';
import { Button } from '@/components/pwa/ui/Button';
import { Icon } from '@/components/pwa/ui/Icon';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function PwaResetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-warm">
          <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
        </div>
      }
    >
      <ResetContent />
    </Suspense>
  );
}

function ResetContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  // `ready` indica que Supabase estableció la sesión de recuperación
  // (evento PASSWORD_RECOVERY) o que ya hay una sesión activa.
  const [ready, setReady] = useState(false);
  // `linkInvalid` se activa si tras un tiempo prudencial no apareció ninguna
  // sesión: el link probablemente es inválido o expiró.
  const [linkInvalid, setLinkInvalid] = useState(false);

  // Errores inline por campo + error general (de Supabase / submit).
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const supabase = createPwaBrowserClient();

    // Escuchamos el evento de recuperación. Con @supabase/ssr y
    // detectSessionInUrl, al aterrizar desde el email de recuperación
    // Supabase dispara PASSWORD_RECOVERY y establece la sesión.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[pwa/reset] onAuthStateChange event=', event, 'hasSession=', !!session);
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true);
        setLinkInvalid(false);
      }
    });

    // También chequeamos proactivamente si ya hay sesión activa.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        console.log('[pwa/reset] getSession encontró sesión activa');
        setReady(true);
        setLinkInvalid(false);
      }
    });

    // Si después de un tiempo razonable no hay sesión, asumimos link
    // inválido/expirado.
    const timer = window.setTimeout(() => {
      setReady((current) => {
        if (!current) {
          console.log('[pwa/reset] timeout sin sesión → link inválido/expirado');
          setLinkInvalid(true);
        }
        return current;
      });
    }, 4000);

    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  function validate(): boolean {
    let ok = true;

    setPasswordError('');
    setConfirmError('');

    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      ok = false;
    }

    if (password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.');
      ok = false;
    }

    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      setStatus('idle');
      return;
    }

    setStatus('loading');
    console.log('[pwa/reset] submit start');

    try {
      const supabase = createPwaBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.log('[pwa/reset] updateUser error:', error.status, error.message);
        setGeneralError('No pudimos actualizar la contraseña. Pedí un nuevo link.');
        setStatus('error');
        return;
      }

      console.log('[pwa/reset] contraseña actualizada, redirigiendo a /pwa/dashboard');
      setStatus('success');

      // Redirigimos con full page load para que la cookie de sesión viaje
      // en la próxima request. Dejamos un link manual por si no dispara.
      window.setTimeout(() => {
        window.location.href = '/pwa/dashboard';
      }, 1500);
    } catch (err) {
      console.log('[pwa/reset] excepción inesperada:', err);
      setGeneralError('No pudimos actualizar la contraseña. Pedí un nuevo link.');
      setStatus('error');
    }
  }

  const isSubmitting = status === 'loading';
  const fieldsEmpty = !password || !confirmPassword;

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
            Nueva contraseña
          </h1>
          <p className="font-body text-muted mt-1 text-sm">
            Creá una contraseña nueva para tu cuenta.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-terracotta-soft border border-terracotta/20 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <Icon name="success" size="lg" label="Listo" className="text-success" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-charcoal mb-2">
              ¡Listo! Tu contraseña fue actualizada.
            </h2>
            <p className="font-body text-muted text-sm">
              Te estamos redirigiendo...{' '}
              <Link href="/pwa/login" className="text-terracotta font-medium hover:text-terracotta/80">
                Iniciá sesión
              </Link>{' '}
              si no pasa nada.
            </p>
          </div>
        ) : linkInvalid && !ready ? (
          <div className="bg-terracotta-soft border border-terracotta/20 rounded-2xl p-6 text-center">
            <p className="font-body text-muted text-sm mb-3">
              El link no es válido o expiró. Pedí uno nuevo.
            </p>
            <Link
              href="/pwa/recuperar"
              className="text-terracotta font-medium hover:text-terracotta/80 text-sm"
            >
              Pedir un nuevo link
            </Link>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin mx-auto" />
            <p className="font-body text-muted text-sm mt-3">Validando link...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <TextInput
                id="pwa-reset-password"
                label="Nueva contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              {passwordError && (
                <p role="alert" className="font-body text-error text-sm mt-1.5">{passwordError}</p>
              )}
            </div>

            <div>
              <TextInput
                id="pwa-reset-confirm"
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí tu contraseña"
                autoComplete="new-password"
              />
              {confirmError && (
                <p role="alert" className="font-body text-error text-sm mt-1.5">{confirmError}</p>
              )}
            </div>

            {/*
              General submit error — inline error treatment with the named status
              token and an exposed error Icon. Entered input is preserved; the
              submit button acts as the retry control (Requirements 9.3, 9.7, 12.5).
            */}
            {status === 'error' && generalError && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-md bg-error/10 border border-error/30"
              >
                <Icon name="error" size="sm" label="Error" className="text-error shrink-0 mt-0.5" />
                <p className="font-body text-sm text-charcoal">{generalError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || fieldsEmpty}
              className="w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-warm/30 border-t-warm rounded-full animate-spin" />
                  Actualizando...
                </span>
              ) : (
                'Guardar nueva contraseña'
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
