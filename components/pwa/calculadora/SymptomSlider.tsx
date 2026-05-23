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

  // Color del badge según severidad
  const badgeColors: Record<number, string> = {
    0: 'bg-sage-soft text-sage-dark',
    1: 'bg-sage-soft text-sage',
    2: 'bg-yellow-100 text-yellow-700',
    3: 'bg-orange-100 text-orange-700',
    4: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-xs font-semibold text-charcoal/40 mt-0.5 shrink-0">
            {number}.
          </span>
          <span className="text-sm font-medium text-charcoal leading-tight">{label}</span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeColors[value] ?? badgeColors[0]}`}
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
            background: `linear-gradient(to right, #7A9B7E 0%, #7A9B7E ${percentage}%, #E8EFE9 ${percentage}%, #E8EFE9 100%)`,
          }}
        />
        {/* Ticks */}
        <div className="flex justify-between px-[2px] mt-1">
          {[0, 1, 2, 3, 4].map((tick) => (
            <button
              key={tick}
              type="button"
              onClick={() => onChange(tick)}
              className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-medium transition-all ${
                value === tick
                  ? 'bg-sage text-white scale-110'
                  : 'bg-sage-soft/50 text-charcoal/50 hover:bg-sage-soft'
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
          background: #7A9B7E;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(45, 58, 46, 0.25);
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
          background: #7A9B7E;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(45, 58, 46, 0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
