'use client';

import { useState } from 'react';

interface Props {
  onNext: (value: string) => void;
}

/**
 * SlideViralNewsLatam — fork neutro (español "tú") de SlideViralNews.
 * Misma estructura/estilo/props. Se quitan referencias argentinas del
 * fallback y del alt ("argentina", matrícula "MN 9283").
 */
export function SlideViralNewsLatam({ onNext }: Props) {
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
            alt="Nota sobre el agua de arroz para deshinchar la barriga"
            className="block w-full h-auto"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback solo si la imagen no carga */
          <div>
            <div className="news-card__header">📰 Salud</div>
            <div className="news-card__body">
              <p className="news-card__title">
                Una nutricionista revela por qué el agua de arroz en ayunas deshincha la barriga mejor que cualquier dieta
              </p>
              <p className="news-card__excerpt">
                La Lic. Natalia Reyes publicó un protocolo de 7 días basado en agua de arroz que está generando resultados sorprendentes en miles de mujeres...
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
