import { redirect } from 'next/navigation';

/**
 * / → redirige a /quiz, que auto-detecta el país por geo-IP.
 *
 * El tráfico real entra por las rutas SEO por país (`/chile`, `/colombia`,
 * `/mexico`, `/peru`, `/usa`) que se usan en los ads de Meta. El `/` queda
 * como fallback para tráfico orgánico — el quiz elige el locale apropiado
 * leyendo la IP del visitante.
 */
export default function RootPage() {
  redirect('/quiz');
}
