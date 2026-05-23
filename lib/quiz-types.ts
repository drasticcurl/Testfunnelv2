/**
 * Tipos canónicos del quiz Anti-Hinchazón.
 * Fuente de verdad: docs/_QUIZ-DATA.md
 *
 * Importado por Agente 02 (quiz), Agente 03 (resultados) y Agente 04 (api).
 *
 * REDESIGN v2 (eliminado edad/frecuencia/3 yes-sets, agregado
 * apertura/objetivo/compromiso + slide tipo name_capture).
 */

export type QuestionId =
  // Apertura emocional (reemplaza `edad` como primera pregunta — abre
  // problem-state al estilo Sultanic: "qué te trajo hasta acá")
  | 'apertura'
  // Diagnósticas (definen tipo + severidad)
  | 'momento_del_dia'
  | 'tiempo_con_problema'
  | 'sintomas'
  | 'ya_probo'
  | 'impacto_emocional'
  // Objetivo medible (sirve para personalizar el copy de /resultados)
  | 'objetivo'
  // Compromiso temporal real (reemplaza los 3 yes-set, no se siente
  // manipulador y la respuesta se reusa en /resultados)
  | 'compromiso';

export type Slide =
  | {
      type: 'question';
      id: QuestionId;
      question: string;
      subtitle?: string;
      multiple: boolean;
      options: { value: string; label: string; emoji?: string }[];
    }
  | {
      type: 'info_card';
      id: string;
      title: string;
      body: string;
      source?: string;
      ctaLabel?: string;
      // Nueva variante 'infographic' = render hardcoded sin imagen externa.
      // No usar `image` (Cloudinary) salvo si realmente necesitás un asset
      // dinámico. Default: render de texto.
      variant?: 'text' | 'infographic';
      // Solo para variant='infographic' — id del componente visual a usar.
      // Mapeado en SlideInfoCard.tsx.
      infographicKey?: string;
    }
  | { type: 'name_capture'; id: 'nombre' }
  | { type: 'email_capture'; id: 'email' }
  | { type: 'loading'; id: 'loading' };

export type QuizAnswers = {
  [K in QuestionId]?: string | string[];
} & {
  email?: string;
  nombre?: string;
};

export type TipoHinchazon = 1 | 2 | 3 | 4;
