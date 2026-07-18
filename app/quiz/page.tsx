/**
 * /quiz — "Método del Agua de Arroz" — Plan personalizado.
 * Quiz funnel V3 — 22 slides con diagnóstico embebido y sales page al final.
 *
 * Metadata zona-gris: el crawler de Meta lee estos campos al aprobar el ad.
 * NO incluir "anti-hinchazón / deshinchando / baja de peso" en title ni
 * description — son señales que clasifican la cuenta como Health Sensitive
 * Category y recortan optimización.
 */

import { QuizContainerV2 } from '@/components/quiz-v2/QuizContainerV2';

export const metadata = {
  title: 'Método del Agua de Arroz — Test Personalizado',
  description:
    'Una nutricionista argentina te enseña un ritual matutino con agua de arroz. Hacé el test gratis de 3 minutos y recibí tu plan personalizado según tu rutina.',
};

export default function QuizPage() {
  return <QuizContainerV2 />;
}
