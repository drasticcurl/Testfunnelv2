import type { Metadata } from 'next';
import QuizContainerV2 from '@/components/quiz/QuizContainerV2';

export const metadata: Metadata = {
  title: 'DormíBien — Analizá tu perfil de sueño',
  description: 'Completá el análisis gratuito de sueño y descubrí qué tipo de insomnio tenés. Plan personalizado de 7 noches.',
};

export default function QuizV2Page() {
  return <QuizContainerV2 />;
}
