/**
 * CountryQuizPage — render compartido de las rutas SEO por país
 * (`/chile`, `/colombia`, `/mexico`, `/peru`, `/usa`).
 *
 * Cada una de esas rutas le pasa su `country` y este componente:
 *   1. Envuelve el quiz con `CountryProvider forced={country}` → todo el
 *      árbol ve los textos/precios/imagen de ese país desde el primer render
 *      (sin flicker mientras se resuelve la geo-IP).
 *   2. Persiste el país en localStorage (lo hace el hook) → si el usuario
 *      navega después a `/quiz` o a `/upsell`, sigue viendo el mismo locale.
 *
 * Es un Server Component (no necesita estado): solo arma el árbol que se
 * envía al cliente. La parte client-side vive dentro de QuizContainerV2.
 */

import { CountryProvider } from '@/lib/quiz-v2/CountryContext';
import type { CountryCode } from '@/lib/quiz-v2/localization';
import { QuizContainerV2 } from './QuizContainerV2';

interface CountryQuizPageProps {
  country: CountryCode;
}

export function CountryQuizPage({ country }: CountryQuizPageProps) {
  return (
    <CountryProvider forced={country}>
      <QuizContainerV2 />
    </CountryProvider>
  );
}
