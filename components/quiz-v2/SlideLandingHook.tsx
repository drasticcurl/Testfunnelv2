'use client';

import { motion } from 'framer-motion';

interface Props {
  onNext: () => void;
}

export function SlideLandingHook({ onNext }: Props) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: 'var(--warm)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center gap-5">

        {/* Badge social proof */}
        <div
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--terracotta-soft)', color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
        >
          ⭐ +3.200 mujeres lo probaron este mes
        </div>

        {/* Headline — ARRIBA de la imagen */}
        <h1
          className="text-2xl leading-tight"
          style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
        >
          Descubrí el método del agua de arroz que está{' '}
          <span style={{ color: 'var(--terracotta)' }}>deshinchando y bajando de peso</span>{' '}
          a miles de argentinas
        </h1>

        {/* Subtítulo de DOLOR — identifica al target */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
        >
          ¿Sentís la panza hinchada, te cuesta bajar de peso o tu metabolismo está cada vez más lento?
        </p>

        {/* Imagen hero — infográfica con beneficios */}
        <div className="w-full rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--warm-border)' }}>
          <img
            src="/img/landing-hook.jpg"
            alt="Método del Agua de Arroz — beneficios"
            className="w-full object-cover"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
              if (el.parentElement) {
                el.parentElement.innerHTML = `
                  <div style="padding:24px;background:#FFF5F0;display:flex;flex-direction:column;gap:12px;align-items:center;">
                    <span style="font-size:3rem;">🌾</span>
                    <div style="display:flex;flex-direction:column;gap:6px;text-align:left;width:100%;">
                      <p style="font-size:13px;color:#1F2433;font-weight:600;">Para mujeres que quieren:</p>
                      <p style="font-size:12px;color:#5A6072;">✓ Deshinchar la panza sin dieta</p>
                      <p style="font-size:12px;color:#5A6072;">✓ Controlar la ansiedad por la comida</p>
                      <p style="font-size:12px;color:#5A6072;">✓ Sentirse más liviana en 7 días</p>
                    </div>
                    <div style="display:flex;gap:16px;margin-top:8px;">
                      <span style="font-size:11px;color:#5A6072;text-align:center;">🌾 Receta fácil</span>
                      <span style="font-size:11px;color:#5A6072;text-align:center;">🌙 Ideal en ayunas</span>
                      <span style="font-size:11px;color:#5A6072;text-align:center;">⚡ Activa metabolismo</span>
                    </div>
                  </div>
                `;
              }
            }}
          />
        </div>

        {/* Subtítulo explicativo — qué va a pasar */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
        >
          Respondé este diagnóstico rápido y descubrí cómo el agua de arroz puede ayudarte a{' '}
          <strong style={{ color: 'var(--charcoal)' }}>deshinchar, bajar de peso y controlar la ansiedad por la comida</strong>.
        </p>

        {/* Badge — plan personalizado (estilo burbuja, un poco más oscura que la social proof) */}
        <div
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--coral-soft)', color: 'var(--terracotta-dark)', fontFamily: 'var(--font-sans)' }}
        >
          ✨ Plan personalizado según tu cuerpo
        </div>

        {/* Tarjeta autoridad */}
        <div
          className="w-full flex items-center gap-3 p-3 rounded-2xl border"
          style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}
        >
          <img
            src="/img/natalia-reyes.jpg"
            alt="Lic. Natalia Reyes"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2"
            style={{ borderColor: 'var(--terracotta)' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Ccircle cx="24" cy="24" r="24" fill="%23FFF5F0"/%3E%3Ctext x="24" y="30" text-anchor="middle" font-size="20"%3E👩‍⚕️%3C/text%3E%3C/svg%3E';
            }}
          />
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
              Lic. Natalia Reyes · MN 9283
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
              Nutricionista · Salud digestiva
            </p>
          </div>
          <span
            className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: '#FFF9C4', color: '#B45309', fontFamily: 'var(--font-sans)' }}
          >
            +3.200 diagnósticos
          </span>
        </div>

        {/* CTA primario */}
        <button type="button" onClick={onNext} className="btn-primary w-full animate-bounce-cta">
          ✅ Sí, quiero descubrir el método
        </button>

        {/* CTA secundario */}
        <button
          type="button"
          onClick={onNext}
          className="text-xs underline-offset-2 underline"
          style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}
        >
          No, prefiero seguir igual
        </button>

        {/* Trust badges */}
        <div
          className="flex items-center justify-center gap-4 text-xs"
          style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}
        >
          <span>⏱️ 3 minutos</span>
          <span>·</span>
          <span>🔒 100% privado</span>
          <span>·</span>
          <span>✅ Sin costo</span>
        </div>

      </div>
    </motion.div>
  );
}
