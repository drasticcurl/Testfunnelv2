'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PwaLoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Ingresá un email válido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pwa/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al verificar tu email');
        return;
      }

      router.push('/pwa/dashboard');
      router.refresh();
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pwa-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🌙</span>
          <h1 className="font-serif text-2xl text-pwa-accent mb-2">DormíBien</h1>
          <p className="text-pwa-text-secondary text-sm">
            Ingresá el email con el que compraste para acceder a tu protocolo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="tu@email.com"
              className="input-pwa"
              autoFocus
              disabled={loading}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pwa-accent text-white font-semibold rounded-lg py-3 px-6 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Acceder a mi protocolo'}
          </button>
        </form>

        <p className="text-pwa-text-secondary text-xs text-center mt-6">
          ¿Todavía no compraste?{' '}
          <a href="/quiz" className="text-pwa-accent underline">
            Descubrí tu tipo de insomnio
          </a>
        </p>
      </div>
    </div>
  );
}
