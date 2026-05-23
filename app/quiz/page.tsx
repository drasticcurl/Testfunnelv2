/**
 * /quiz - contenedor minimo del quiz.
 * La logica completa vive en components/quiz/QuizContainer.tsx
 */

import { QuizContainer } from '@/components/quiz/QuizContainer';

export const metadata = {
  title: 'Test Anti-Hinchazón',
  description:
    'Descubrí cuál de los 4 tipos de hinchazón estás sufriendo. Test personalizado de 2 minutos.',
};

export default function QuizPage() {
  return <QuizContainer />;
}
