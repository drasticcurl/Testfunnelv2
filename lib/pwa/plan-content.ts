import { Gender } from '@/lib/types';

export interface NightContent {
  number: number;
  title: string;
  subtitle: string;
  emoji: string;
  intro: string;
  steps: string[];
  tips: { hombre: string[]; mujer: string[] };
  challenge: string;
}

export const PLAN_NIGHTS: NightContent[] = [
  {
    number: 1,
    title: 'Reset Total',
    subtitle: 'Eliminación de disruptores + reset de horario',
    emoji: '🔄',
    intro: 'Esta noche vas a identificar y eliminar todo lo que sabotea tu sueño. No vas a cambiar todo de golpe — solo los 3 disruptores más importantes.',
    steps: [
      'Sacá el celular de tu mesa de luz. Dejalo en otro mueble o fuera de la habitación.',
      'Definí tu horario de sueño fijo: elegí una hora para acostarte y respetala HOY (sugerido: entre 22:30 y 23:30).',
      'Oscurecé tu habitación: tapá luces de standby, cerrá persianas. La oscuridad total activa la producción de melatonina.',
      'Cortá cafeína a partir de las 14hs (café, mate, té negro, bebidas cola).',
      'No cenes pesado ni tarde. Última comida sustancial al menos 2 horas antes de dormir.',
    ],
    tips: {
      hombre: [
        'Si jugás videojuegos de noche, dejá la sesión al menos 90 min antes de dormir. La luz azul + adrenalina son un combo letal para tu sueño.',
        'El entrenamiento intenso después de las 20hs puede mantenerte activado. Si entrenás de noche, bajá la intensidad.',
      ],
      mujer: [
        'Si tu ciclo está en fase lútea (pre-menstrual), tu temperatura corporal sube. Bajá un grado la temperatura del cuarto o usá sábanas más frescas.',
        'El scroll nocturno en redes sociales activa comparación + ansiedad. Ponete un límite de pantalla a las 21:30.',
      ],
    },
    challenge: 'Desafío de esta noche: acostate a la hora que elegiste, con el celular fuera de alcance. Mañana registrá cómo te fue.',
  },
  {
    number: 2,
    title: 'Tu Rutina Pre-Sueño',
    subtitle: 'Creá una rutina de 20 minutos que le diga a tu cerebro: "es hora de dormir"',
    emoji: '🧘',
    intro: 'Tu cerebro necesita una señal clara de transición entre "día activo" y "modo descanso". Esta rutina se convierte en ese interruptor.',
    steps: [
      'Elegí una hora fija: 20 minutos antes de tu hora de acostarte, empezá siempre la misma rutina.',
      'Bajá las luces de toda la casa (o al menos de tu habitación). Luz tenue o velas.',
      'Lavate la cara y los dientes — este acto marca el "cierre" del día.',
      'Hacé 5 minutos de estiramiento suave: cuello, hombros, espalda baja. No ejercicio, solo soltar tensión.',
      'Los últimos 10 minutos: lectura en papel, escribir 3 cosas buenas del día, o simplemente respirar con los ojos cerrados.',
      'Acá va la clave: hacelo TODAS las noches igual. La repetición es lo que crea el hábito.',
    ],
    tips: {
      hombre: [
        'Si tu rutina actual es: "ver una serie → quedarme dormido en el sillón → arrastrarte a la cama", estás generando sueño fragmentado. La cama es SOLO para dormir.',
        'Rutina express si tenés poco tiempo: 5 min estiramientos + 5 min respiración. Listo.',
      ],
      mujer: [
        'Agregá un momento de cuidado personal: crema hidratante, aceite esencial de lavanda en las muñecas, o un té de manzanilla.',
        'Si la carga mental del día no para: escribí una lista de "pendientes para mañana" y cerrá esa libreta. Tu cerebro necesita ese permiso para soltar.',
      ],
    },
    challenge: 'Desafío: diseñá TU rutina de 20 min con los pasos que más te gusten y hacela esta noche. Repetila mañana.',
  },
  {
    number: 3,
    title: 'Respiración 4-7-8 + Body Scan',
    subtitle: 'Técnicas de relajación que bajan tu sistema nervioso en minutos',
    emoji: '🫁',
    intro: 'La respiración 4-7-8 activa tu sistema nervioso parasimpático (el de "descanso"). Es como un interruptor biológico para calmar tu cuerpo.',
    steps: [
      'Acostate boca arriba, brazos relajados a los costados, ojos cerrados.',
      'Técnica 4-7-8: Inhalá por la nariz contando hasta 4. Mantené el aire contando hasta 7. Exhalá por la boca contando hasta 8.',
      'Repetí el ciclo 4-7-8 al menos 4 veces. Si te mareás, volvé a respirar normal y retomá.',
      'Body Scan: Después de la respiración, llevá la atención a los pies. Sentí el peso contra el colchón. Subí lentamente: pantorrillas, muslos, cadera, abdomen, pecho, brazos, cuello, cara.',
      'En cada zona, "soltá" conscientemente la tensión. Imaginá que esa parte se hunde en el colchón.',
      'Si tu mente se va, no te frustres. Volvé a la parte del cuerpo donde estabas. Es normal.',
    ],
    tips: {
      hombre: [
        'Si te parece "demasiado meditación", pensalo como una técnica de recuperación deportiva. Los atletas de élite la usan para bajar el cortisol post-entrenamiento.',
        'Variante rápida: solo 4 ciclos de 4-7-8 si no querés hacer el body scan completo.',
      ],
      mujer: [
        'Si tenés ansiedad nocturna, agregá una frase interna mientras exhalás: "ya hice todo lo que podía hoy". Repetila con cada exhalación.',
        'El body scan es especialmente útil en la fase premenstrual cuando el cuerpo está más tenso y sensible.',
      ],
    },
    challenge: 'Desafío: hacé 4 ciclos de 4-7-8 + body scan completo antes de dormir. Cronometrá cuánto tardás en quedarte dormida/o.',
  },
  {
    number: 4,
    title: 'Optimización del Ambiente',
    subtitle: 'Luz, temperatura y ruido: los 3 pilares de un cuarto pro-sueño',
    emoji: '🏠',
    intro: 'Tu ambiente de sueño puede estar saboteándote sin que lo notes. Estos 3 factores tienen más impacto del que imaginás.',
    steps: [
      'TEMPERATURA: Bajá a 18-20°C si podés. Tu cuerpo necesita enfriarse para dormir. Si no tenés aire, usá ventilador + sábanas frescas.',
      'LUZ: Oscuridad total. Tapá LEDs de standby con cinta, cerrá persianas. Si entra luz de la calle, considerá un antifaz.',
      'RUIDO: Si hay ruido exterior, usá tapones o ruido blanco (hay apps gratuitas). El silencio total también puede ser un problema — un ventilador suave funciona.',
      'CAMA: Tu cama es solo para dormir (y sexo). Nada de trabajar, comer o scrollear en la cama. Tu cerebro necesita asociar cama = sueño.',
      'ALMOHADA: Si te despertás con dolor de cuello, tu almohada no va. Probá dormir una noche sin almohada o con una toalla enrollada.',
      'Revisá tu checklist: ¿Celular fuera? ¿Oscuridad total? ¿Temperatura fresca? ¿Sin ruidos molestos? ¿Ropa cómoda?',
    ],
    tips: {
      hombre: [
        'Si tu habitación tiene la PC/consola y te tienta usarla, considerá taparlo con una tela por la noche. Fuera de vista, fuera de mente.',
        'El calor post-ejercicio nocturno dificulta el sueño. Una ducha tibia 30 min antes de dormir ayuda a bajar la temperatura corporal.',
      ],
      mujer: [
        'Los sofocos nocturnos (especialmente en perimenopausia) se alivian con ventilación cruzada y ropa de cama de algodón o bambú.',
        'Un difusor con lavanda real (no sintética) puede ayudar a bajar la ansiedad. Usalo 20 min antes de acostarte.',
      ],
    },
    challenge: 'Desafío: hacé el checklist de ambiente completo esta noche. Asegurate de los 3 pilares: oscuridad, frescura, silencio.',
  },
  {
    number: 5,
    title: 'Alimentación Pro-Sueño',
    subtitle: 'Qué cenar (y qué evitar) para dormir mejor',
    emoji: '🍽️',
    intro: 'Lo que comés en las últimas 3-4 horas antes de dormir impacta directamente en la calidad de tu sueño. No es solo "no comer pesado" — hay alimentos que AYUDAN activamente.',
    steps: [
      'CENAR 2-3 HORAS ANTES de acostarte. Ni muy tarde ni saltear la cena (el hambre también despierta).',
      'ALIMENTOS PRO-SUEÑO: banana, kiwi, cerezas, almendras, avena, pescado, pavo. Contienen triptófano, magnesio y melatonina natural.',
      'EVITAR: comidas muy grasas, picantes, azúcar refinada, chocolate negro (tiene cafeína), alcohol (fragmenta el sueño).',
      'El alcohol es un falso amigo: te hace dormirte rápido pero destruye el sueño profundo. Evitalo al menos 3 horas antes.',
      'Una infusión tibia post-cena ayuda: manzanilla, tilo, valeriana, pasiflora. Sin azúcar.',
      'Si te despertás a las 3am con hambre, probá agregar proteína magra a tu cena (pollo, huevo, legumbres).',
    ],
    tips: {
      hombre: [
        'Si entrenás de noche, tu cena post-entreno debe ser moderada en proteína pero no excesiva. Demasiada proteína antes de dormir dificulta la digestión.',
        'El mate después de las 14hs tiene cafeína suficiente para afectar tu sueño 8 horas después. Cortalo temprano.',
      ],
      mujer: [
        'En la fase lútea (pre-menstrual) los antojos de dulce aumentan. Satisfacelos con banana congelada o una cucharada de mantequilla de maní. No con azúcar refinada que genera picos de glucosa.',
        'El magnesio glicinato (200-400mg) después de cenar puede ayudar con los calambres nocturnos y la relajación muscular.',
      ],
    },
    challenge: 'Desafío: esta noche cená algo del grupo "pro-sueño" y evitá cafeína + alcohol. Mañana registrá si notaste diferencia.',
  },
  {
    number: 6,
    title: 'Protocolo Anti-Rumiación',
    subtitle: 'Técnica de descarga mental para la mente que no para',
    emoji: '📝',
    intro: 'Si tu mente se activa cuando apagás la luz, no es porque "pensás demasiado" — es porque no le diste un espacio ANTES para procesar. Esta noche le damos ese espacio.',
    steps: [
      'DESCARGA MENTAL (30 min antes de acostarte): Agarrá papel y lapicera (no celular) y escribí TODO lo que tenés en la cabeza. Pendientes, preocupaciones, ideas, cualquier cosa.',
      'No filtres ni ordenes. Solo volcá. Escribí hasta que sientas que "no queda nada" en tu cabeza. Pueden ser 5 renglones o 3 páginas.',
      'Al terminar, cerrá la libreta y decí (en voz alta o mental): "Esto queda acá hasta mañana".',
      'Si un pensamiento vuelve en la cama, decite: "Ya lo anoté. Lo resuelvo mañana." No necesitás procesarlo ahora.',
      'TÉCNICA DE ANCLAJE: Si la mente sigue, enfocate en una sensación física: el peso del cuerpo en el colchón, la temperatura del aire en tu nariz, el sonido de tu respiración.',
      'Recordá: no podés resolver nada acostado a las 11pm. Todo se ve peor de noche. Dale permiso a tu mente de descansar.',
    ],
    tips: {
      hombre: [
        'Si tus pensamientos son sobre trabajo o problemas por resolver, escribí la SIGUIENTE ACCIÓN CONCRETA para cada uno. Tu cerebro se relaja cuando tiene un plan, no cuando da vueltas en el problema.',
        'Si tenés irritabilidad o frustración acumulada, hacé la descarga más directa: "Estoy enojado porque..." sin censurarte.',
      ],
      mujer: [
        'Si tu mente repasa conversaciones o situaciones emocionales del día, escribí lo que SENTISTE (no solo lo que pasó). Darle nombre a la emoción la desactiva.',
        'La técnica de "preocupaciones programadas" funciona bien: asignale 10 min al día (no de noche) para preocuparte. Si surge de noche, decite: "Eso lo pienso mañana a las 10am".',
      ],
    },
    challenge: 'Desafío: hacé la descarga mental completa esta noche. Escribí hasta vaciar. Cerrá la libreta y acéptá que mañana resolvés.',
  },
  {
    number: 7,
    title: 'Consolidación + Plan de Mantenimiento',
    subtitle: 'Lo que aprendiste en 7 noches y cómo sostenerlo',
    emoji: '🏆',
    intro: '¡Llegaste a la noche 7! Esta noche consolidamos todo lo que implementaste y te damos tu plan de mantenimiento para que los resultados duren.',
    steps: [
      'REVISÁ TU PROGRESO: ¿Cuántas noches seguiste el protocolo? ¿Notaste cambios? Registralo en tu diario.',
      'TU RUTINA CONSOLIDADA: A esta altura deberías tener clara tu secuencia: horario fijo → cena liviana → rutina 20 min → respiración → dormir.',
      'PLAN DE MANTENIMIENTO: No necesitás hacer todo perfecto cada noche. Pero mantené SIEMPRE: horario fijo + rutina pre-sueño + celular fuera.',
      'Si una noche dormís mal, NO compenses durmiendo más al día siguiente. Levantate a la hora normal y recuperá la noche siguiente.',
      'Seguí registrando en tu diario al menos 3 veces por semana. Detectar patrones es clave para prevenir recaídas.',
      'Revisá las guías de suplementos si querés agregar apoyo natural: melatonina (0.5-1mg, no más), magnesio glicinato, L-teanina.',
    ],
    tips: {
      hombre: [
        'Plan mínimo para mantener: horario fijo + 4 ciclos de 4-7-8 + celular fuera. Esto solo ya es el 70% del resultado.',
        'Si viajás o tu rutina cambia, priorizá mantener la hora de despertar fija. Es más importante que la hora de acostarte.',
      ],
      mujer: [
        'Tené en cuenta que tu sueño va a variar con tu ciclo. Las noches pre-menstruales pueden ser peores — no te frustres, es hormonal y temporal.',
        'Plan de mantenimiento personalizado: rutina nocturna + descarga mental + magnesio. Estos 3 son tu base no negociable.',
      ],
    },
    challenge: 'Desafío final: escribí en tu diario qué cambió en 7 noches y cuáles son tus 3 hábitos no negociables que vas a mantener.',
  },
];

export function getNightContent(nightNumber: number): NightContent | undefined {
  return PLAN_NIGHTS.find((n) => n.number === nightNumber);
}

export function getGenderTips(night: NightContent, genero: Gender): string[] {
  return night.tips[genero] || night.tips.hombre;
}
