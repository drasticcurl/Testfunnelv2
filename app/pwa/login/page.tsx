'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { isOnboardingCompleted } from '@/lib/pwa/onboarding-state';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function PwaLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
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

    console.log('[pwa/login] submit start, email=', email);

    try {
      const res = await fetch('/api/pwa/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      console.log('[pwa/login] response status=', res.status);
      const data = await res.json();
      console.log('[pwa/login] response body=', data);

      if (res.ok) {
        // Tanto test mode como prod ahora setean cookie de sesión.
        // Usamos window.location.href en vez de router.push para forzar un
        // full page load — eso garantiza que el browser mande la cookie
        // recién seteada en la próxima request (router.push hace navegación
        // client-side que a veces pierde Set-Cookie en Safari incógnito).
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
        return;
      } else {
        // Mensajes específicos por tipo de error.
        // Los config_* se ven solo si el dev/admin todavía no configuró
        // las env vars correctamente — para usuarios reales, "internal".
        const errorMessages: Record<string, string> = {
          no_purchase:
            'No encontramos una compra con ese email. ¿Usaste otro email para pagar?',
          invalid_email: 'El email no parece válido. Revisá si lo escribiste bien.',
          config_session_secret:
            '⚠️ Falta configurar PWA_SESSION_SECRET en Vercel (mín 16 chars).',
          config_supabase:
            '⚠️ Faltan keys de Supabase en Vercel (NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY).',
          supabase_query_failed:
            '⚠️ Error consultando Supabase: ' + (data.detail ?? 'sin detalle'),
        };
        setErrorMsg(
          errorMessages[data.error] ??
            'Algo salió mal. Intentá de nuevo en unos segundos.'
        );
        setStatus('error');
      }
    } catch (err) {
      console.error('[pwa/login] network error:', err);
      setErrorMsg('Error de conexión. Verificá tu internet e intentá de nuevo.');
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sage rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-heading font-bold">P</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Protocolo Anti-Hinchazón
          </h1>
          <p className="text-charcoal/60 mt-1 text-sm">
            Ingresá con el email de tu compra
          </p>
        </div>

        {/* Success state */}
        {status === 'success' ? (
          <div className="bg-sage-soft border border-sage/20 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="font-heading text-lg font-semibold text-charcoal mb-2">
              ¡Revisá tu email!
            </h2>
            <p className="text-charcoal/70 text-sm">
              Te enviamos un link mágico a <strong>{email}</strong>. Hacé click para acceder.
            </p>
            <p className="text-charcoal/50 text-xs mt-3">¿No lo ves? Revisá spam.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pwa-email" className="block text-sm font-medium text-charcoal mb-1.5">
                Tu email
              </label>
              <input
                id="pwa-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-sand/60 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-colors"
              />
            </div>

            {status === 'error' && (
              <p className="text-coral text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full py-3 px-4 bg-sage text-white font-semibold rounded-xl hover:bg-sage/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                'Acceder a mi protocolo'
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-charcoal/40 mt-6">
          Solo podés acceder si compraste el Protocolo Anti-Hinchazón.
        </p>
      </div>
    </main>
  );
}
