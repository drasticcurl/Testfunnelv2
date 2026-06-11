/**
 * /usa — Quiz funnel para audiencia hispanohablante en EE.UU. (US).
 *
 * Esta es la URL que se usa en los ads de Meta apuntados a Estados Unidos.
 * El locale se fuerza a "US" → precios USD, español neutro,
 * imagen de noticia local y PayPal/Amex en los métodos de pago.
 */

import { CountryQuizPage } from '@/components/quiz-v2/CountryQuizPage';

export const metadata = {
  title: 'Método del Agua de Arroz — Plan Personalizado para EE.UU.',
  description:
    'Hace el test de 3 minutos y recibí tu protocolo personalizado para deshinchar el abdomen en 7 días. Disponible en EE.UU.',
};

export default function UsaPage() {
  return <CountryQuizPage country="US" />;
}
