/**
 * /quiz — Quiz funnel "Método del Agua de Arroz". Auto-detecta país (URL,
 * localStorage o geo-IP) y muestra precios, textos e imagen de prueba social
 * localizados.
 *
 * Esta ruta NO se usa para campañas: los anuncios apuntan a las rutas SEO
 * por país (`/chile`, `/colombia`, `/mexico`, `/peru`, `/usa`) que fuerzan
 * el país y dan SSR consistente sin flicker. `/quiz` queda como entrada
 * orgánica / fallback.
 */

import { CountryProvider } from '@/lib/quiz-v2/CountryContext';
import { QuizContainerV2 } from '@/components/quiz-v2/QuizContainerV2';

export const metadata = {
  title: 'Método del Agua de Arroz — Plan Personalizado Anti-Hinchazón',
  description:
    'Una nutricionista revela el método del agua de arroz que está deshinchando y bajando de peso a miles de mujeres. Hacé el test de 3 minutos y recibí tu protocolo personalizado.',
};

export default function QuizPage() {
  return (
    <CountryProvider>
      <QuizContainerV2 />
    </CountryProvider>
  );
}
