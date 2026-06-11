'use client';

import { motion } from 'framer-motion';
import { SYMPTOM_OPTIONS } from '@/lib/pwa/diary-helpers';

interface SymptomChipsProps {
  selected: string[];
  onChange: (symptoms: string[]) => void;
}

export default function SymptomChips({ selected, onChange }: SymptomChipsProps) {
  const toggle = (symptom: string) => {
    if (selected.includes(symptom)) {
      onChange(selected.filter((s) => s !== symptom));
    } else {
      onChange([...selected, symptom]);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-charcoal">Síntomas del día</span>
      <div className="flex flex-wrap gap-2">
        {SYMPTOM_OPTIONS.map((symptom) => {
          const isActive = selected.includes(symptom);
          return (
            <motion.button
              key={symptom}
              type="button"
              onClick={() => toggle(symptom)}
              whileTap={{ scale: 0.92 }}
              animate={{
                backgroundColor: isActive ? '#7A9B7E' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#2D3A2E',
                borderColor: isActive ? '#7A9B7E' : '#E8EFE9',
              }}
              transition={{ duration: 0.15 }}
              className="px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-shadow"
              style={{
                boxShadow: isActive
                  ? '0 2px 8px rgba(122, 155, 126, 0.3)'
                  : '0 1px 2px rgba(45, 58, 46, 0.04)',
              }}
            >
              {symptom}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
