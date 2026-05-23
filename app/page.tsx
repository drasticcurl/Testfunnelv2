import { redirect } from 'next/navigation';

/**
 * / → Fallback redirect a /quiz.
 *
 * En producción, el middleware.ts maneja el A/B split (50/50 entre
 * /quiz y /quiz-v2) y setea la cookie `quiz_variant` para consistency.
 *
 * Este fallback existe solo por si el middleware no se ejecuta (ej: en
 * ciertos edge cases de ISR/cache). Redirige a V1 como safe default.
 */
export default function RootPage() {
  redirect('/quiz');
}
