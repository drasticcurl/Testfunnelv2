'use client';

import { SCALE_LABELS } from '@/lib/pwa/microbiota-symptoms';

interface SymptomSliderProps {
  number: number;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function SymptomSlider({ number, label, value, onChange }: SymptomSliderProps) {
  const percentage = (value / 4) * 100;

  // Color del badge según severidad — tokens del Design_System.
  const badgeColors: Record<number, string> = {
    0: 'bg-terracotta-soft text-terracotta-dark',
    1: 'bg-terracotta-soft text-terracotta',
    2: 'bg-warning/15 text-warning',
    3: 'bg-error/10 text-error',
    4: 'bg-error/20 text-error',
  };

  return (
    <div className="bg-warm rounded-lg p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          <span className="font-body text-xs font-semibold text-charcoal/40 mt-0.5 shrink-0">
            {number}.
          </span>
          <span className="font-body text-sm font-medium text-charcoal leading-tight">{label}</span>
        </div>
        <span
          className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeColors[value] ?? badgeColors[0]}`}
        >
          {SCALE_LABELS[value]}
        </span>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer symptom-slider"
          style={{
            background: `linear-gradient(to right, var(--terracotta) 0%, var(--terracotta) ${percentage}%, var(--warm-border) ${percentage}%, var(--warm-border) 100%)`,
          }}
        />
        {/* Ticks */}
        <div className="flex justify-between px-[2px] mt-1">
          {[0, 1, 2, 3, 4].map((tick) => (
            <button
              key={tick}
              type="button"
              onClick={() => onChange(tick)}
              className={`w-6 h-6 flex items-center justify-center rounded-full font-body text-[10px] font-medium transition-all ${
                value === tick
                  ? 'bg-terracotta text-warm scale-110'
                  : 'bg-terracotta-soft/50 text-charcoal/50 hover:bg-terracotta-soft'
              }`}
            >
              {tick}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .symptom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--terracotta);
          border: 3px solid var(--warm);
          box-shadow: var(--shadow-md);
          cursor: pointer;
          transition: transform 150ms ease;
        }
        .symptom-slider::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }
        .symptom-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--terracotta);
          border: 3px solid var(--warm);
          box-shadow: var(--shadow-md);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
