/**
 * /chile — Quiz funnel para audiencia chilena (CL).
 *
 * Esta es la URL que se usa en los ads de Meta apuntados a Chile.
 * El locale se fuerza a "CL" → precios USD, modismos chilenos ("guata"),
 * imagen de noticia local y método de pago Webpay listado en los badges.
 */

import { CountryQuizPage } from '@/components/quiz-v2/CountryQuizPage';

export const metadata = {
  title: 'Método del Agua de Arroz — Plan Personalizado para Chile',
  description:
    'Hace el test de 3 minutos y recibí tu protocolo personalizado para deshinchar la guata en 7 días. Adaptado a mujeres chilenas.',
};

export default function ChilePage() {
  return <CountryQuizPage country="CL" />;
}
