/**
 * /peru — Quiz funnel para audiencia peruana (PE).
 *
 * Esta es la URL que se usa en los ads de Meta apuntados a Perú.
 * El locale se fuerza a "PE" → precios USD, modismos peruanos
 * ("barriga"), imagen de noticia local y Yape en los métodos de pago.
 */

import { CountryQuizPage } from '@/components/quiz-v2/CountryQuizPage';

export const metadata = {
  title: 'Método del Agua de Arroz — Plan Personalizado para Perú',
  description:
    'Hace el test de 3 minutos y recibí tu protocolo personalizado para deshinchar la barriga en 7 días. Adaptado a mujeres peruanas.',
};

export default function PeruPage() {
  return <CountryQuizPage country="PE" />;
}
