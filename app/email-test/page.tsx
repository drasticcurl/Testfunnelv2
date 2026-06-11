'use client';

/**
 * /email-test — página para testear emails del funnel.
 *
 * UI simple: ponés un email, elegís tipo, tocás "Enviar" y te llega.
 * Protegido por ADMIN_PASSWORD (se pide en la misma página).
 */

import { useState } from 'react';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<'diagnostico' | 'followup'>('followup');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ email, type }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setStatus('error');
        setMessage('Password incorrecta.');
        return;
      }

      if (data.ok) {
        setStatus('sent');
        setMessage(`Email "${type}" enviado a ${email}. Revisá tu inbox (y spam).`);
      } else {
        setStatus('error');
        setMessage(data.error || 'No se pudo enviar. ¿Configuraste RESEND_API_KEY?');
      }
    } catch {
      setStatus('error');
      setMessage('Error de red. Intentá de nuevo.');
    }
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#EFECE7] p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-charcoal font-semibold text-center">
          Test de Emails
        </h1>
        <p className="mt-2 text-sm text-[#5C5852] text-center">
          Enviá un email de prueba para ver cómo queda.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Password admin */}
          <div>
            <label htmlFor="pw" className="block text-xs font-medium text-[#5C5852] mb-1">
              Admin password
            </label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu ADMIN_PASSWORD"
              className="w-full px-4 py-3 rounded-lg border border-[#EFECE7] focus:border-sage focus:outline-none text-sm"
              required
            />
          </div>

          {/* Email destino */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#5C5852] mb-1">
              Email destino
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-lg border border-[#EFECE7] focus:border-sage focus:outline-none text-sm"
              required
            />
          </div>

          {/* Tipo de email */}
          <div>
            <label className="block text-xs font-medium text-[#5C5852] mb-2">
              Tipo de email
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('diagnostico')}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  type === 'diagnostico'
                    ? 'border-sage bg-sage-soft text-sage-dark'
                    : 'border-[#EFECE7] text-[#5C5852] hover:border-sage'
                }`}
              >
                Diagnóstico
                <span className="block text-xs font-normal mt-0.5 opacity-70">
                  (Email 1 — inmediato)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setType('followup')}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  type === 'followup'
                    ? 'border-coral bg-coral-soft text-coral'
                    : 'border-[#EFECE7] text-[#5C5852] hover:border-coral'
                }`}
              >
                Follow-up
                <span className="block text-xs font-normal mt-0.5 opacity-70">
                  (Email 2 — 24h + 10% off)
                </span>
              </button>
            </div>
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={status === 'sending' || !email || !password}
            className="w-full bg-coral text-white px-6 py-3.5 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? 'Enviando...' : 'ENVIAR EMAIL DE PRUEBA'}
          </button>

          {/* Resultado */}
          {message && (
            <div
              className={`mt-4 p-4 rounded-lg text-sm ${
                status === 'sent'
                  ? 'bg-sage-soft text-sage-dark'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
