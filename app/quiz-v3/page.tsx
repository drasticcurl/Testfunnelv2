/**
 * /quiz-v3 — Quiz ultra-corto para Google Ads.
 *
 * 11 pasos: 6 preguntas → email → loading → perfil → plan → venta embebida.
 * Pensado para tráfico de alto intent (búsqueda en Google).
 * No participa del A/B (se accede directo via ads).
 */

import { QuizContainerV3 } from '@/components/quiz-v3/QuizContainerV3';

export const metadata = {
  title: 'Test Anti-Hinchazón — Resultado en 2 minutos',
  description:
    'Descubrí tu tipo de hinchazón y recibí un plan personalizado de 7 días. Test rápido de 6 preguntas.',
};

export default function QuizV3Page() {
  return <QuizContainerV3 />;
}
