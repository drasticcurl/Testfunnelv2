/**
 * /colombia — Quiz funnel para audiencia colombiana (CO).
 *
 * Esta es la URL que se usa en los ads de Meta apuntados a Colombia.
 * El locale se fuerza a "CO" → precios USD, modismos colombianos
 * ("barriga"), imagen de noticia local y PSE en los métodos de pago.
 */

import { CountryQuizPage } from '@/components/quiz-v2/CountryQuizPage';

export const metadata = {
  title: 'Método del Agua de Arroz — Plan Personalizado para Colombia',
  description:
    'Hace el test de 3 minutos y recibí tu protocolo personalizado para deshinchar la barriga en 7 días. Adaptado a mujeres colombianas.',
};

export default function ColombiaPage() {
  return <CountryQuizPage country="CO" />;
}
