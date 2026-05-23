import type { Metadata } from 'next';
import QuizContainer from '@/components/quiz/QuizContainer';

export const metadata: Metadata = {
  title: 'DormíBien — Descubrí tu tipo de insomnio',
  description: 'Quiz rápido de 2 minutos para descubrir por qué dormís mal y cómo solucionarlo en 7 noches.',
};

export default function QuizPage() {
  return <QuizContainer />;
}
