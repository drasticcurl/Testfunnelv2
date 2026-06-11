'use client';

export default function LockedOverlay() {
  return (
    <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center z-10 p-3">
      <span className="text-2xl mb-1">🔒</span>
      <span className="text-white text-xs font-medium text-center">
        Desbloquear Kit Anti-Excusas
      </span>
      <span className="text-white/70 text-[9px] text-center mt-1 leading-tight">
        25 recetas en 10 min · Meal Prep 1 hora · Menú SOS · 20 Swaps
      </span>
    </div>
  );
}
