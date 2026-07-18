/**
 * /latam — "Método del Agua de Arroz" — Plan personalizado (español neutro).
 * Funnel paralelo al de /quiz, en español NEUTRO ("tú"), sin captura de email.
 *
 * Metadata zona-gris: el crawler de Meta lee estos campos al aprobar el ad.
 * NO incluir "anti-hinchazón / deshinchando / baja de peso" en title ni
 * description — son señales que clasifican la cuenta como Health Sensitive
 * Category y recortan optimización.
 */

import { QuizContainerLatam } from '@/components/quiz-v2/QuizContainerLatam';

export const metadata = {
  title: 'Método del Agua de Arroz — Test Personalizado',
  description:
    'Una nutricionista te enseña un ritual matutino con agua de arroz. Haz el test gratis de 3 minutos y recibe tu plan personalizado según tu rutina.',
};

export default function LatamPage() {
  return <QuizContainerLatam />;
}
