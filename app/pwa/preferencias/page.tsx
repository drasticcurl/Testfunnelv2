'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  DietaryPreferences,
  getDietaryPreferences,
  saveDietaryPreferences,
} from '@/lib/pwa/dietary-preferences';

const DIETARY_OPTIONS = [
  {
    key: 'sin_gluten' as const,
    icon: '🌾',
    label: 'Sin Gluten',
    desc: 'Excluir recetas con trigo, avena, centeno',
  },
  {
    key: 'sin_lactosa' as const,
    icon: '🥛',
    label: 'Sin Lactosa',
    desc: 'Excluir recetas con lácteos (yogur, queso, leche)',
  },
  {
    key: 'vegetariano' as const,
    icon: '🥬',
    label: 'Vegetariano',
    desc: 'Solo recetas sin carne ni pescado',
  },
];

export default function PreferenciasPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<DietaryPreferences>({
    sin_gluten: false,
    sin_lactosa: false,
    vegetariano: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(getDietaryPreferences());
  }, []);

  const togglePref = (key: keyof DietaryPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    saveDietaryPreferences(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const activeCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="pb-24 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sage text-sm font-medium mb-3 flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver
        </button>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">
          Preferencias alimentarias
        </h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Adaptamos tu plan y recetas según tus necesidades. Podés cambiarlas cuando quieras.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {DIETARY_OPTIONS.map((option) => (
          <button
            key={option.key}
            onClick={() => togglePref(option.key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
              prefs[option.key]
                ? 'border-sage bg-sage-soft shadow-sm'
                : 'border-sand/40 bg-white hover:border-sage/40'
            }`}
          >
            <span className="text-3xl">{option.icon}</span>
            <div className="text-left flex-1">
              <p className="font-medium text-sm text-charcoal">{option.label}</p>
              <p className="text-xs text-charcoal/50 mt-0.5">{option.desc}</p>
            </div>
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                prefs[option.key]
                  ? 'border-sage bg-sage'
                  : 'border-sand'
              }`}
            >
              {prefs[option.key] && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3 7L6 10L11 4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-cream-warm/50 rounded-xl p-4 border border-sand/20">
        <p className="text-xs text-charcoal/60 leading-relaxed">
          💡 <strong>¿Cómo funciona?</strong> Las recetas y comidas del plan que no cumplan con tus preferencias se marcarán con una alternativa sugerida. Así podés adaptar cada comida a tus necesidades sin perder el protocolo antiinflamatorio.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-coral-soft/30 rounded-xl p-4 border border-coral/10">
        <p className="text-xs text-charcoal/60 leading-relaxed">
          ⚠️ Si tenés una condición médica específica (celiaquía, alergia a la proteína de leche, etc.), consultá con tu médico antes de empezar cualquier plan alimenticio.
        </p>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3.5 px-6 font-semibold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
          saved
            ? 'bg-sage/80 text-white'
            : 'bg-sage text-white hover:bg-sage/90'
        }`}
      >
        {saved ? '✓ Guardado' : activeCount > 0 ? `Guardar ${activeCount} preferencia${activeCount > 1 ? 's' : ''}` : 'Guardar (sin restricciones)'}
      </button>
    </div>
  );
}
