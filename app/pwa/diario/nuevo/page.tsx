'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NuevoDiarioPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: today,
    hora_acostar: '23:00',
    hora_dormir: '23:30',
    despertares: 0,
    calidad: 5,
    energia_dia: 5,
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/pwa/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar');
        return;
      }

      router.push('/pwa/diario');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/pwa/diario" className="text-pwa-accent text-sm mb-3 inline-block">
          ← Volver al diario
        </Link>
        <h1 className="font-serif text-2xl text-pwa-accent">Registrar Sueño</h1>
        <p className="text-pwa-text-secondary text-sm mt-1">¿Cómo dormiste?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-pwa-text mb-1">Fecha</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            max={today}
            className="input-pwa"
          />
        </div>

        {/* Bed time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-pwa-text mb-1">Me acosté</label>
            <input
              type="time"
              value={form.hora_acostar}
              onChange={(e) => setForm({ ...form, hora_acostar: e.target.value })}
              className="input-pwa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pwa-text mb-1">Me dormí</label>
            <input
              type="time"
              value={form.hora_dormir}
              onChange={(e) => setForm({ ...form, hora_dormir: e.target.value })}
              className="input-pwa"
            />
          </div>
        </div>

        {/* Awakenings */}
        <div>
          <label className="block text-sm font-medium text-pwa-text mb-1">
            Despertares nocturnos
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, despertares: Math.max(0, form.despertares - 1) })}
              className="w-10 h-10 rounded-lg border border-pwa-border flex items-center justify-center text-lg"
            >
              −
            </button>
            <span className="text-2xl font-bold text-pwa-text w-8 text-center">
              {form.despertares}
            </span>
            <button
              type="button"
              onClick={() => setForm({ ...form, despertares: Math.min(10, form.despertares + 1) })}
              className="w-10 h-10 rounded-lg border border-pwa-border flex items-center justify-center text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Quality slider */}
        <div>
          <label className="block text-sm font-medium text-pwa-text mb-1">
            Calidad al despertar: <span className="text-pwa-accent">{form.calidad}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={form.calidad}
            onChange={(e) => setForm({ ...form, calidad: parseInt(e.target.value) })}
            className="w-full accent-pwa-accent"
          />
          <div className="flex justify-between text-xs text-pwa-text-secondary">
            <span>Pésimo</span>
            <span>Excelente</span>
          </div>
        </div>

        {/* Energy slider */}
        <div>
          <label className="block text-sm font-medium text-pwa-text mb-1">
            Energía al día siguiente: <span className="text-pwa-highlight">{form.energia_dia}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={form.energia_dia}
            onChange={(e) => setForm({ ...form, energia_dia: parseInt(e.target.value) })}
            className="w-full accent-pwa-highlight"
          />
          <div className="flex justify-between text-xs text-pwa-text-secondary">
            <span>Sin energía</span>
            <span>Mucha energía</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-pwa-text mb-1">Notas (opcional)</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            placeholder="¿Algo que quieras anotar? Sueños, sensaciones..."
            rows={3}
            className="input-pwa resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pwa-accent text-white font-semibold rounded-lg py-3 px-6 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar registro'}
        </button>
      </form>
    </div>
  );
}
