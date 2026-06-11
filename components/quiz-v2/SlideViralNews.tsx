'use client';

import { useState } from 'react';

interface Props {
  onNext: (value: string) => void;
}

/**
 * Slide "noticia viral".
 *
 * Muestra el screenshot real de Infobae (public/img/noticia-viral.jpg), que ya
 * incluye el logo del medio, el titular y la bajada. Por eso NO reconstruimos
 * un header/título/bajada por separado: eso tapaba y duplicaba la captura.
 *
 * La imagen es vertical (900x1342). Se muestra COMPLETA (w-full, h-auto, sin
 * recortar). Si por algún motivo la imagen no carga, mostramos un fallback de
 * texto para no dejar la card vacía.
 */
export function SlideViralNews({ onNext }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2
        className="text-2xl text-center leading-tight mb-6"
        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
      >
        ¿Llegaste a ver esta publicación que se hizo viral esta semana?
      </h2>

      {/* Screenshot real de la noticia (la imagen ya trae medio + titular + bajada) */}
      <div className="news-card mb-6 overflow-hidden rounded-xl shadow-md">
        {!imgError ? (
          <img
            src="/img/noticia-viral.jpg"
            alt="Nota de Infobae sobre el agua de arroz para deshinchar la panza"
            className="block w-full h-auto"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback solo si la imagen no carga */
          <div>
            <div className="news-card__header">📰 Infobae Salud</div>
            <div className="news-card__body">
              <p className="news-card__title">
                Nutricionista argentina revela por qué el agua de arroz en ayunas deshincha la panza mejor que cualquier dieta
              </p>
              <p className="news-card__excerpt">
                La Lic. Natalia Reyes (MN 9283) publicó un protocolo de 7 días basado en agua de arroz que está generando resultados sorprendentes en miles de mujeres...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onNext('si')}
          className="btn-primary"
        >
          ✅ Sí, lo vi y quiero probarlo
        </button>
        <button
          type="button"
          onClick={() => onNext('no')}
          className="btn-outline w-full"
        >
          🔍 No, es la primera vez que lo escucho
        </button>
      </div>
    </div>
  );
}
