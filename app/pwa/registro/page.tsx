'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createPwaBrowserClient } from '@/lib/pwa/supabase-browser';
import { TextInput } from '@/components/pwa/ui/TextInput';
import { Button } from '@/components/pwa/ui/Button';
import { Icon } from '@/components/pwa/ui/Icon';

type Status = 'idle' | 'loading' | 'error' | 'confirm_email';

// Validación simple de formato de email (suficiente para client-side).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PwaRegistroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  // Errores inline por campo + error general (de Supabase / submit).
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Cuando el caso es "ya existe cuenta", mostramos un link a /pwa/login.
  const [showLoginLink, setShowLoginLink] = useState(false);

  function validate(): boolean {
    let ok = true;

    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Ingresá un email válido.');
      ok = false;
    }

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

    // Reset de errores generales antes de validar.
    setGeneralError('');
    setShowLoginLink(false);

    if (!validate()) {
      setStatus('idle');
      return;
    }

    setStatus('loading');

    const cleanEmail = email.trim().toLowerCase();

    try {
      const supabase = createPwaBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.log('[pwa/registro] signUp error:', error.status, error.message);

        const msg = (error.message ?? '').toLowerCase();
        const isAlreadyRegistered =
          error.status === 422 ||
          msg.includes('already registered') ||
          msg.includes('user already registered');
        const isWeakPassword =
          msg.includes('password') &&
          (msg.includes('weak') ||
            msg.includes('at least') ||
            msg.includes('should be') ||
            msg.includes('6 characters'));

        if (isAlreadyRegistered) {
          setGeneralError('Ya existe una cuenta con ese email. Iniciá sesión.');
          setShowLoginLink(true);
        } else if (isWeakPassword) {
          setGeneralError('La contraseña es muy débil (mínimo 8 caracteres).');
        } else {
          setGeneralError('No pudimos crear la cuenta. Intentá de nuevo.');
        }

        setStatus('error');
        return;
      }

      // Éxito sin sesión → "Confirm email" sigue activado en el dashboard.
      // Degradamos con gracia pidiéndole al usuario que revise su email.
      if (!data.session) {
        console.log('[pwa/registro] signUp ok pero sin session (confirm email ON)');
        setStatus('confirm_email');
        return;
      }

      // Éxito con sesión → usuario logueado. Forzamos full page load con
      // window.location.href para que la cookie recién seteada viaje en la
      // próxima request. Los registros nuevos siempre van al onboarding.
      console.log('[pwa/registro] signUp ok con session, redirigiendo a /pwa/onboarding');
      window.location.href = '/pwa/onboarding';
    } catch (err) {
      console.log('[pwa/registro] excepción inesperada:', err);
      setGeneralError('No pudimos crear la cuenta. Intentá de nuevo.');
      setStatus('error');
    }
  }

  const isSubmitting = status === 'loading';
  const fieldsEmpty = !email || !password || !confirmPassword;

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
            Crear cuenta
          </h1>
          <p className="font-body text-muted mt-1 text-sm">
            Registrate para acceder a tu protocolo
          </p>
        </div>

        {status === 'confirm_email' ? (
          <div className="bg-terracotta-soft border border-terracotta/20 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <Icon name="info" size="lg" label="Información" className="text-terracotta" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-charcoal mb-2">
              Revisá tu email para confirmar la cuenta.
            </h2>
            <p className="font-body text-muted text-sm">
              Te enviamos un email a <strong>{email.trim().toLowerCase()}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <TextInput
                id="pwa-registro-email"
                label="Tu email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
              />
              {emailError && (
                <p role="alert" className="font-body text-error text-sm mt-1.5">{emailError}</p>
              )}
            </div>

            <div>
              <TextInput
                id="pwa-registro-password"
                label="Contraseña"
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
                id="pwa-registro-confirm"
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
              token and an exposed error Icon. The entered input is preserved (the
              form fields keep their values) and the submit button acts as the
              retry control (Requirements 9.3, 9.7, 12.5).
            */}
            {status === 'error' && generalError && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-md bg-error/10 border border-error/30"
              >
                <Icon name="error" size="sm" label="Error" className="text-error shrink-0 mt-0.5" />
                <div className="font-body text-sm text-charcoal">
                  <p>{generalError}</p>
                  {showLoginLink && (
                    <Link
                      href="/pwa/login"
                      className="underline font-medium text-terracotta hover:text-terracotta/80"
                    >
                      Iniciá sesión
                    </Link>
                  )}
                </div>
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
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>
        )}

        <p className="text-center font-body text-sm text-muted mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/pwa/login" className="text-terracotta font-medium hover:text-terracotta/80">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
