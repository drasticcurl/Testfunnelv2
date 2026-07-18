'use client';

/**
 * GuideSources — pie de "Fuentes" reutilizable para las guías de la PWA.
 *
 * Muestra una lista de referencias con links inline a las fuentes (Harvard
 * Health, NIH/PMC, Monash FODMAP, etc.) sobre las que se apoya el contenido.
 * Aporta credibilidad y cumple con la atribución de las fuentes consultadas.
 *
 * El contenido de las guías es divulgativo y está adaptado/parafraseado de
 * estas fuentes; no reproduce sus textos.
 */

export type GuideSource = {
  /** Texto visible del enlace (ej: "Harvard Health — Foods that fight inflammation"). */
  label: string;
  url: string;
};

export default function GuideSources({ sources }: { sources: GuideSource[] }) {
  return (
    <div className="rounded-2xl p-4 border border-sand/30 bg-white/60">
      <p className="text-xs uppercase tracking-wider text-charcoal/40 font-medium mb-2">
        📚 Fuentes
      </p>
      <ul className="space-y-1.5">
        {sources.map((s, i) => (
          <li key={i} className="text-[12px] leading-relaxed">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sage hover:underline break-words"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-charcoal/40 mt-3 leading-relaxed">
        Contenido divulgativo, adaptado de las fuentes citadas. No reemplaza la consulta con un
        profesional de la salud.
      </p>
    </div>
  );
}
