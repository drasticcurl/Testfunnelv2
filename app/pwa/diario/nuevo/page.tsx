'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import SliderField from '@/components/pwa/diario/SliderField';
import SymptomChips from '@/components/pwa/diario/SymptomChips';
import {
  SymptomLog,
  saveLogToStorage,
  BOWEL_OPTIONS,
  ADHERENCE_OPTIONS,
} from '@/lib/pwa/diary-helpers';

export default function NuevoRegistroPage() {
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [bloatingAm, setBloatingAm] = useState(5);
  const [bloatingPm, setBloatingPm] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [bowelMovement, setBowelMovement] = useState('normal');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [planAdherence, setPlanAdherence] = useState('100');
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);

    const log: SymptomLog = {
      id: `log-${today}`,
      date: today,
      bloating_am: bloatingAm,
      bloating_pm: bloatingPm,
      energy,
      stress,
      sleep_quality: sleepQuality,
      bowel_movement: bowelMovement,
      symptoms,
      notes,
      water_glasses: waterGlasses,
      plan_adherence: planAdherence,
      created_at: new Date().toISOString(),
    };

    // In test mode: save to localStorage
    saveLogToStorage(log);

    setTimeout(() => {
      router.push('/pwa/diario');
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-charcoal">¿Cómo te sentiste hoy?</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          {format(new Date(), "d 'de' MMMM")} — 1 registro por día
        </p>
      </div>

      {/* Bloating AM/PM */}
      <section className="bg-white rounded-lg p-4 shadow-sm border border-sage-soft/50 space-y-5">
        <h2 className="text-base font-medium text-charcoal">Hinchazón</h2>
        <SliderField
          label="🌅 Al levantarte (AM)"
          value={bloatingAm}
          onChange={setBloatingAm}
          lowLabel="Nada"
          highLabel="Máxima"
        />
        <SliderField
          label="🌙 Al acostarte (PM)"
          value={bloatingPm}
          onChange={setBloatingPm}
          lowLabel="Nada"
          highLabel="Máxima"
        />
      </section>

      {/* Energy, Stress, Sleep */}
      <section className="bg-white rounded-lg p-4 shadow-sm border border-sage-soft/50 space-y-5">
        <h2 className="text-base font-medium text-charcoal">Bienestar general</h2>
        <SliderField
          label="⚡ Energía"
          value={energy}
          onChange={setEnergy}
          lowLabel="Agotada"
          highLabel="Plena"
        />
        <SliderField
          label="🧠 Estrés"
          value={stress}
          onChange={setStress}
          lowLabel="Tranquila"
          highLabel="Muy estresada"
        />
        <SliderField
          label="😴 Calidad del sueño"
          value={sleepQuality}
          onChange={setSleepQuality}
          lowLabel="Pésimo"
          highLabel="Excelente"
        />
      </section>

      {/* Bowel movement */}
      <section className="bg-white rounded-lg p-4 shadow-sm border border-sage-soft/50 space-y-3">
        <h2 className="text-base font-medium text-charcoal">Movimiento intestinal</h2>
        <select
          value={bowelMovement}
          onChange={(e) => setBowelMovement(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-sage-soft bg-cream text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30"
        >
          {BOWEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      {/* Symptom chips */}
      <section className="bg-white rounded-lg p-4 shadow-sm border border-sage-soft/50">
        <SymptomChips selected={symptoms} onChange={setSymptoms} />
      </section>

      {/* Plan adherence */}
      <section className="bg-white rounded-lg p-4 shadow-sm border border-sage-soft/50 space-y-3">
        <h2 className="text-base font-medium text-charcoal">¿Cumpliste el plan?</h2>
        <select
          value={planAdherence}
          onChange={(e) => setPlanAdherence(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-sage-soft bg-cream text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30"
        >
          {ADHERENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      {/* Water counter */}
      <section className="bg-white rounded-lg p-4 shadow-sm border border-sage-soft/50 space-y-3">
        <h2 className="text-base font-medium text-charcoal">💧 Vasos de agua</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-sage-soft text-charcoal font-bold text-lg active:scale-90 transition-transform"
          >
            −
          </button>
          <span className="text-2xl font-semibold text-sage w-8 text-center">
            {waterGlasses}
          </span>
          <button
            type="button"
            onClick={() => setWaterGlasses(Math.min(15, waterGlasses + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-sage-soft text-charcoal font-bold text-lg active:scale-90 transition-transform"
          >
            +
          </button>
          <span className="text-xs text-charcoal/50">vasos (250ml)</span>
        </div>
      </section>

      {/* Notes */}
      <section className="bg-white rounded-lg p-4 shadow-sm border border-sage-soft/50 space-y-3">
        <h2 className="text-base font-medium text-charcoal">📝 Notas</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="¿Algo que quieras anotar sobre hoy?"
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-sage-soft bg-cream text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-sage/30 resize-none"
        />
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 rounded-full bg-sage text-white font-semibold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? 'Guardando...' : 'Guardar registro'}
      </button>
    </motion.div>
  );
}
