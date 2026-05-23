/**
 * /quiz-v2 — Quiz Funnel V2 "Chau Hinchazón" (estilo MusesAcademy).
 *
 * Funnel largo de ~35 pasos con la página de ventas embebida al final.
 * La lógica completa vive en components/quiz-v2/QuizContainerV2.tsx.
 */

import { QuizContainerV2 } from '@/components/quiz-v2/QuizContainerV2';

export const metadata = {
  title: 'Test Anti-Hinchazón V2 — Plan Personalizado',
  description:
    'Descubrí cuál de los 4 tipos de hinchazón estás sufriendo y recibí un plan de 7 días hecho a tu medida.',
};

export default function QuizV2Page() {
  return <QuizContainerV2 />;
}
