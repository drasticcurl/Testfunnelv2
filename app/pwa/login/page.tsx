'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isOnboardingCompleted } from '@/lib/pwa/onboarding-state';
import { createPwaBrowserClient } from '@/lib/pwa/supabase-browser';
import { TextInput } from '@/components/pwa/ui/TextInput';
import { Button } from '@/components/pwa/ui/Button';
import { Icon } from '@/components/pwa/ui/Icon';

type Status = 'idle' | 'loading' | 'error';

export default function PwaLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-warm">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const prefill = searchParams.get('email');
    if (prefill) setEmail(prefill);

    // Si quedó cacheado un service worker viejo (de un deploy roto donde
    // el middleware redirigía /pwa-sw.js al login), lo desregistramos y
    // limpiamos sus caches. Sin esto, el SW intercepta las requests de
    // login y deja la UI colgada en "Verificando...".
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(async (regs) => {
        for (const reg of regs) {
          if (reg.scope.includes('/pwa')) {
            console.log('[pwa/login] desregistrando SW viejo:', reg.scope);
            await reg.unregister();
          }
        }
        // Borrar caches manualmente por si el SW dejó cosas atrás.
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      });
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    console.log('[pwa/login] submit start, email=', cleanEmail);

    try {
      const supabase = createPwaBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.log('[pwa/login] auth error:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Email o contraseña incorrectos.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Tu cuenta todavía no está confirmada. Revisá tu email.');
        } else {
          setErrorMsg('No pudimos iniciar sesión. Intentá de nuevo.');
        }
        setStatus('error');
        return;
      }

      // Usamos window.location.href en vez de router.push para forzar un
      // full page load — eso garantiza que el browser mande la cookie
      // de sesión recién seteada en la próxima request (router.push hace
      // navegación client-side que a veces pierde Set-Cookie en Safari
      // incógnito).
      //
      // Decisión de destino:
      //  - Primer login (sin flag de onboarding completo) → /pwa/onboarding
      //    para que vea el tour + setee preferencias dietéticas.
      //  - Segundo login en adelante → /pwa/dashboard directo.
      //
      // El flag vive en localStorage del device: si el usuario abre la app
      // desde otro celu por primera vez, vuelve a ver el onboarding.
      // Aceptable hasta que migremos esto a tabla `profiles` en Supabase.
      const target = isOnboardingCompleted() ? '/pwa/dashboard' : '/pwa/onboarding';
      console.log('[pwa/login] redirecting to', target);
      window.location.href = target;
    } catch (err) {
      console.error('[pwa/login] unexpected error:', err);
      setErrorMsg('No pudimos iniciar sesión. Intentá de nuevo.');
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-warm">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-terracotta rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-warm text-3xl font-heading font-bold">P</span>
          </div>
          {/* Page-title level: heading family, 30px, semibold. */}
          <h1 className="font-heading text-3xl font-semibold text-charcoal">
            Protocolo Anti-Hinchazón
          </h1>
          <p className="font-body text-muted mt-2 text-base">
            Ingresá a tu protocolo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextInput
            id="pwa-email"
            label="Tu email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <TextInput
            id="pwa-password"
            label="Tu contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {/*
            Inline error treatment (replaces the ad-hoc `text-coral` text). Uses
            the named status token, an exposed error Icon, and `role="alert"`.
            Entered input is preserved — the form fields keep their values and
            the persistent submit button below acts as the retry control
            (Requirements 9.3, 9.7, 12.5).
          */}
          {status === 'error' && errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-md bg-error/10 border border-error/30"
            >
              <Icon name="error" size="sm" label="Error" className="text-error shrink-0 mt-0.5" />
              <p className="font-body text-base text-charcoal">{errorMsg}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={status === 'loading' || !email || !password}
            className="w-full"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-warm/30 border-t-warm rounded-full animate-spin" />
                Verificando...
              </span>
            ) : (
              'Acceder a mi protocolo'
            )}
          </Button>
        </form>

        <div className="mt-8 space-y-3 text-center">
          <Link
            href="/pwa/recuperar"
            className="block font-body text-base text-terracotta hover:text-terracotta/80 transition-colors duration-fast ease-standard"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link
            href="/pwa/registro"
            className="block font-body text-base text-muted hover:text-charcoal transition-colors duration-fast ease-standard"
          >
            ¿No tenés cuenta? Registrate
          </Link>
        </div>
      </div>
    </main>
  );
}
