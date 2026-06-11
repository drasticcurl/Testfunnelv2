/**
 * /mexico — Quiz funnel para audiencia mexicana (MX).
 *
 * Esta es la URL que se usa en los ads de Meta apuntados a México.
 * El locale se fuerza a "MX" → precios USD, modismos mexicanos
 * ("pancita"), imagen de noticia local y OXXO en los métodos de pago.
 */

import { CountryQuizPage } from '@/components/quiz-v2/CountryQuizPage';

export const metadata = {
  title: 'Método del Agua de Arroz — Plan Personalizado para México',
  description:
    'Hace el test de 3 minutos y recibí tu protocolo personalizado para deshinchar la pancita en 7 días. Adaptado a mujeres mexicanas.',
};

export default function MexicoPage() {
  return <CountryQuizPage country="MX" />;
}
