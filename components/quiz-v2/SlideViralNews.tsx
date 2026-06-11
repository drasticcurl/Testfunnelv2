'use client';

import { useState } from 'react';
import { useCountry } from '@/lib/quiz-v2/CountryContext';

interface Props {
  onNext: (value: string) => void;
}

/**
 * Slide "noticia viral".
 *
 * Muestra un screenshot del periódico LOCAL del país detectado del usuario
 * (Chile → BioBio Chile, Colombia → El Tiempo, etc.). La imagen ya trae el
 * logo del medio, el titular y la bajada — por eso NO reconstruimos eso al
 * lado, solo mostramos la captura.
 *
 * La imagen y el nombre del medio salen de `useCountry().socialProof`
 * (`socialProofImage` y `socialProofSource` — ver lib/quiz-v2/localization.ts).
 *
 * Cada país tiene su archivo en `/public/img/noticia-viral-{cc}.jpg`. Si el
 * archivo no existe (típico mientras el equipo creativo todavía no subió la
 * imagen), `onError` activa el fallback de texto con el nombre del medio
 * sugerido — el slide nunca queda vacío.
 *
 * Las dimensiones recomendadas son 900x1342 vertical (proporción mobile).
 */
export function SlideViralNews({ onNext }: Props) {
  const [imgError, setImgError] = useState(false);
  const { socialProof } = useCountry();
  const imgSrc = socialProof.socialProofImage;
  const sourceName = socialProof.socialProofSource;

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2
        className="text-2xl text-center leading-tight mb-6"
        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
      >
        ¿Llegaste a ver esta publicación que se hizo viral esta semana?
      </h2>

      {/* Screenshot del periódico LOCAL (la imagen ya trae medio + titular + bajada) */}
      <div className="news-card mb-6 overflow-hidden rounded-xl shadow-md">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={`Nota de ${sourceName} sobre el agua de arroz para deshinchar la panza`}
            className="block w-full h-auto"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback de texto si la imagen no existe (todavía sin subir) */
          <div>
            <div className="news-card__header">📰 {sourceName}</div>
            <div className="news-card__body">
              <p className="news-card__title">
                Nutricionista revela por qué el agua de arroz en ayunas deshincha la panza mejor que cualquier dieta
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
