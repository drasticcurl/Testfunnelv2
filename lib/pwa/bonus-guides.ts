// lib/pwa/bonus-guides.ts — Contenido de los 3 bonos del Protocolo TURBO
//
// El VSL del upsell (docs/ad-scripts/vsl-upsell-turbo.md) promete 3 regalos al
// comprar el Programa de 30 Días TURBO. Para que la promesa del video coincida
// con lo que el comprador encuentra en la PWA, acá vive el contenido real de
// cada bono. Lo consume la ruta dinámica /pwa/guias/bonus/[slug].
//
// Estos bonos requieren upsell (son exclusivos del TURBO).

export type BonusSection = {
  emoji: string;
  title: string;
  body: string;
  /** Pasos / items opcionales (recetas, listas). */
  items?: string[];
};

export type BonusGuide = {
  slug: string;
  emoji: string;
  title: string;
  /** Subtítulo corto para el card del índice. */
  cardDescription: string;
  /** Intro que abre la guía. */
  intro: string;
  sections: BonusSection[];
  /** Cierre motivacional. */
  closingTitle: string;
  closingText: string;
};

export const BONUS_GUIDES: BonusGuide[] = [
  // ─────────────────────────────────────────────────────────────
  // BONO 1 — Ingredientes potenciadores
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'potenciadores',
    emoji: '🧬',
    title: 'Ingredientes Potenciadores TURBO',
    cardDescription:
      'Las 3 recetas caseras que multiplican el efecto del agua de arroz: el ingrediente dorado, el tónico y el batido desinflamante.',
    intro:
      'Estas son las recetas que convierten tu agua de arroz en una bomba antiinflamatoria. Son simples, con ingredientes que conseguís en cualquier verdulería, y potencian lo que ya venís haciendo. Sumalas de a una y observá cómo responde tu cuerpo.',
    sections: [
      {
        emoji: '🟡',
        title: 'El ingrediente dorado de la mañana',
        body:
          'Sumá esta mezcla a tu agua de arroz en ayunas, 3 mañanas por semana. La cúrcuma es antiinflamatoria y la pimienta negra multiplica su absorción hasta 20 veces. El jengibre activa el tránsito y desinflama.',
        items: [
          '½ cdita de cúrcuma en polvo',
          '1 pizca de pimienta negra recién molida',
          '1 cdita de jengibre fresco rallado',
          'Mezclá todo en el vaso de agua de arroz tibia y tomá despacio en ayunas',
        ],
      },
      {
        emoji: '🔴',
        title: 'El tónico rojo para la ansiedad nocturna',
        body:
          'Tomalo 30 minutos antes de cenar para cortar la ansiedad por lo dulce de la noche y ayudar a estabilizar el azúcar en sangre. El hibisco es diurético natural y la canela ayuda a regular la glucosa.',
        items: [
          '1 taza de agua caliente',
          '1 cda de flor de hibisco (o 1 saquito)',
          '½ cdita de canela en polvo',
          'Unas gotas de limón. Dejá reposar 5 min, colá y tomá tibio',
        ],
      },
      {
        emoji: '🥤',
        title: 'El batido desinflamante de media tarde',
        body:
          'Reemplazá el snack de la tarde por este batido 2 o 3 veces por semana. Reduce la hinchazón abdominal y la retención de líquidos gracias al pepino, el jengibre y la piña.',
        items: [
          '½ pepino con cáscara',
          '1 rodaja de piña (ananá)',
          '1 cdita de jengibre fresco',
          'Jugo de ½ limón + 1 vaso de agua. Licuá y tomá al momento',
        ],
      },
    ],
    closingTitle: 'Sumalos de a uno',
    closingText:
      'No hace falta hacer los tres el mismo día. Empezá por el ingrediente dorado en tu agua de arroz, y a partir de la segunda semana sumá el tónico y el batido. Tu intestino te lo va a agradecer.',
  },

  // ─────────────────────────────────────────────────────────────
  // BONO 2 — Rituales de las famosas
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'rituales-famosas',
    emoji: '✨',
    title: 'Rituales de las Famosas',
    cardDescription:
      'Los trucos que usan para mantener el cuerpo y la piel después de los 40, sin gimnasio ni dietas locas.',
    intro:
      'No tienen un secreto mágico: tienen hábitos simples y constantes. Acá tenés los que mejor se combinan con el Método del Agua de Arroz, para que los apliques desde hoy sin gastar de más ni vivir en el gimnasio.',
    sections: [
      {
        emoji: '💧',
        title: 'Hidratación estratégica',
        body:
          'Arrancan el día con agua tibia y limón antes que con café. Mantienen la piel y el intestino hidratados, lo que reduce la retención y mejora la luminosidad de la piel.',
      },
      {
        emoji: '🌙',
        title: 'Cena temprano y liviana',
        body:
          'Cenan al menos 3 horas antes de dormir y eligen platos livianos. Esto mejora el descanso, baja la hinchazón matutina y favorece la regeneración de la piel durante la noche.',
      },
      {
        emoji: '🧖',
        title: 'Auto-masaje y drenaje',
        body:
          '5 minutos de masaje ascendente en piernas y abdomen activan el sistema linfático y movilizan los líquidos retenidos. Hacelo a la noche, con una crema o aceite.',
      },
      {
        emoji: '🚶',
        title: 'Movimiento suave y constante',
        body:
          'No viven en el gimnasio: caminan todos los días, suben escaleras, se mueven seguido. La constancia gana siempre sobre la intensidad ocasional.',
      },
      {
        emoji: '😴',
        title: 'El sueño como tratamiento de belleza',
        body:
          'Priorizan 7 a 8 horas de sueño. Dormir bien regula el cortisol (la hormona que infla y acumula grasa abdominal) y es el antiarrugas más barato que existe.',
      },
    ],
    closingTitle: 'Constancia, no perfección',
    closingText:
      'Ninguno de estos hábitos es difícil. El secreto está en sostenerlos. Elegí dos para esta semana y, cuando se vuelvan automáticos, sumá los demás.',
  },

  // ─────────────────────────────────────────────────────────────
  // BONO 3 — Mente y Panza
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'mente-panza',
    emoji: '🧘',
    title: 'Programa Mente y Panza',
    cardDescription:
      'Bajá la ansiedad y el estrés que inflaman tu intestino, con respiración y hábitos simples del día a día.',
    intro:
      'El estrés no está solo en tu cabeza: activa la inflamación intestinal y dispara la ansiedad por la comida. Tu intestino y tu cerebro están conectados por el nervio vago. Estos ejercicios calman ese eje y, con él, tu panza.',
    sections: [
      {
        emoji: '🌬️',
        title: 'Respiración 4-7-8 (cortá el estrés en 1 minuto)',
        body:
          'Cuando sientas ansiedad o ganas de picotear, hacé este ejercicio. Activa el nervio vago y pasa tu cuerpo a "modo descanso y digestión".',
        items: [
          'Inhalá por la nariz contando hasta 4',
          'Retené el aire contando hasta 7',
          'Exhalá por la boca, despacio, contando hasta 8',
          'Repetí 4 veces. Sentí cómo baja la ansiedad',
        ],
      },
      {
        emoji: '🍽️',
        title: 'Comer con atención (mindful eating)',
        body:
          'Comé sin pantallas, masticá al menos 20 veces cada bocado y dejá los cubiertos entre bocado y bocado. Comer despacio reduce los gases, mejora la digestión y te hace sentir saciada con menos.',
      },
      {
        emoji: '📓',
        title: 'Descarga mental antes de dormir',
        body:
          'Anotá en un papel las 3 cosas que te dieron vueltas en el día. Sacarlas de la cabeza baja el cortisol nocturno, mejora el sueño y desinfla la panza de la mañana.',
      },
      {
        emoji: '🕯️',
        title: 'Mantra de 2 minutos',
        body:
          'Sentate cómoda, cerrá los ojos y repetí mentalmente una frase corta y amable ("estoy en calma", "mi cuerpo se cuida solo") al ritmo de tu respiración. Calma la mente y el sistema digestivo.',
      },
    ],
    closingTitle: 'Tu panza escucha a tu mente',
    closingText:
      'Dedicale 5 minutos por día a calmar tu sistema nervioso y vas a ver el efecto en tu digestión. La calma también desinflama.',
  },
];

/** Devuelve un bono por su slug, o undefined si no existe. */
export function getBonusGuide(slug: string): BonusGuide | undefined {
  return BONUS_GUIDES.find((g) => g.slug === slug);
}
