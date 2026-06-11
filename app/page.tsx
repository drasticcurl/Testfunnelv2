import { redirect } from 'next/navigation';

/**
 * / → Redirige directamente a /quiz.
 * Ya no hay A/B split — el quiz V2 es la única versión.
 */
export default function RootPage() {
  redirect('/quiz');
}
