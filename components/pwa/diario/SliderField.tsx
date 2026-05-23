'use client';

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

export default function SliderField({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel = '1',
  highLabel = '10',
}: SliderFieldProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-charcoal">{label}</span>
        <span className="text-sm font-semibold text-sage bg-sage-soft px-2 py-0.5 rounded-full">
          {value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer slider-sage"
          style={{
            background: `linear-gradient(to right, #7A9B7E 0%, #7A9B7E ${percentage}%, #E8EFE9 ${percentage}%, #E8EFE9 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-charcoal/50">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>

      <style jsx>{`
        .slider-sage::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #7A9B7E;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(45, 58, 46, 0.2);
          cursor: pointer;
          transition: transform 150ms ease;
        }
        .slider-sage::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }
        .slider-sage::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #7A9B7E;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(45, 58, 46, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
