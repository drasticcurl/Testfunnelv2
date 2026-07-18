// lib/pwa/vip-content.ts — Contenido real de la sección VIP (Acceso de por vida).
//
// Todo lo que vive acá es EXTRA / MEJORA de lo que ya trae la app base
// (recetas, calculadora, guías, ritual, diario). No duplica el contenido del
// Front ni del Programa de 30 Días: lo amplía.
//
// Lo consume la ruta dinámica /pwa/vip/guia/[slug] (renderer compartido) y el
// hub /pwa/vip (índice de módulos). Sigue el mismo formato que
// lib/pwa/bonus-guides.ts para mantener consistencia de diseño.

export type VipCategory = 'masterclass' | 'mini-guia' | 'protocolo';

export type VipSection = {
  emoji: string;
  title: string;
  body: string;
  /** Pasos / items opcionales (listas, checklists, recetas). */
  items?: string[];
};

/**
 * Fuente citada al pie de una guía VIP. Estructuralmente idéntica a
 * `BonusSource` (lib/pwa/bonus-guides.ts) y a `GuideSource`
 * (components/pwa/guias/GuideSources.tsx), por lo que un `VipSource[]` se
 * puede pasar directamente al componente `GuideSources` sin casts.
 */
export type VipSource = {
  /** Texto visible del enlace (ej: "Harvard Health — Foods that fight inflammation"). */
  label: string;
  url: string;
};

export type VipGuide = {
  slug: string;
  category: VipCategory;
  emoji: string;
  title: string;
  /** Subtítulo corto para el card del índice. */
  cardDescription: string;
  /** Intro que abre la guía. */
  intro: string;
  sections: VipSection[];
  /** Cierre motivacional. */
  closingTitle: string;
  closingText: string;
  /** CTA opcional al pie (ej: abrir la calculadora base). */
  cta?: { label: string; href: string };
  /** NUEVO — Fuentes que respaldan el contenido (opcional, retrocompatible). */
  sources?: VipSource[];
};

export const VIP_GUIDES: VipGuide[] = [
  // ═══════════════════════════════════════════════════════════════
  // MASTERCLASSES (biblioteca en texto)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'masterclass-sueno',
    category: 'masterclass',
    emoji: '😴',
    title: 'Dormí mejor, desinflamá más',
    cardDescription:
      'Por qué dormir mal te infla la panza y el paso a paso para recuperar un descanso reparador sin pastillas.',
    intro:
      'Podés comer impecable, tomar tu agua de arroz todas las mañanas y aun así levantarte con la panza hinchada si dormís mal. El sueño no es un lujo ni un premio por haber tenido un día productivo: es el momento en que tu cuerpo hace el trabajo pesado de reparación. Mientras dormís profundo, tu intestino ordena lo que comiste, tu sistema nervioso baja un cambio y tu cuerpo regula el cortisol, que es la hormona que tu organismo libera cuando está en alerta y que, cuando queda alta de más, favorece que retengas líquido y te infles. Dormir poco o entrecortado mantiene esa hormona arriba, y ahí arranca el círculo: dormís mal, amanecés hinchada, te estresás y a la noche te cuesta dormir todavía más. En esta masterclass te llevo de la mano para entender por qué pasa y, sobre todo, para que armes una rutina de sueño concreta que potencia todo lo demás que ya venís haciendo. No vas a necesitar pastillas ni aparatos caros: solo orden, repetición y un poco de paciencia con vos misma las primeras noches.',
    sections: [
      {
        emoji: '🌡️',
        title: 'Por qué dormir mal te infla',
        body:
          'Cuando dormís poco, tu cuerpo interpreta que hay una amenaza y mantiene el cortisol más alto al día siguiente. El cortisol es la hormona del estrés: en picos cortos te despierta y te da energía, pero sostenido en el tiempo se asocia a más retención de líquidos, digestión más lenta y antojos de azúcar y harinas. Un ejemplo concreto: si una noche dormís 5 horas en lugar de 8, lo más probable es que al otro día tengas más hambre y elijas peor, aunque tengas toda la voluntad del mundo. No es falta de fuerza de voluntad: es pura química trabajando en tu contra.',
      },
      {
        emoji: '🧹',
        title: 'Lo que tu intestino hace mientras dormís',
        body:
          'Durante la noche, cuando ya no estás comiendo, se activa el complejo motor migratorio, que son unas ondas de limpieza que barren los restos de comida y bacterias del intestino delgado, como el camión que pasa de madrugada por una calle vacía. Si comés hasta el momento de meterte en la cama, esas ondas no llegan a hacer bien su trabajo y al otro día amanecés con más gases y distensión. Un ejemplo: si cenás liviano a las 20 hs y te dormís a las 23 hs, esas ondas tienen unas 3 horas para arrancar su tarea antes de que te duermas. Por eso una cena temprana rinde tanto.',
      },
      {
        emoji: '🕗',
        title: 'La regla de las 3 horas',
        body:
          'Terminá de cenar al menos 3 horas antes de acostarte. Ese margen le da tiempo a tu digestión de cerrar el día antes de dormir, así no fermentás comida durante la noche (la causa número uno de la panza hinchada de la mañana). Ejemplo práctico: si te acostás 23 hs, tu última comida debería ser antes de las 20 hs. Y si llegás tarde con hambre real, elegí algo mínimo como una infusión o un caldo liviano, nunca una comida completa.',
      },
      {
        emoji: '📵',
        title: 'Tu rutina de apagado, paso a paso',
        body:
          'Las últimas dos horas del día le avisan a tu cerebro que se viene el descanso. Armá esta secuencia y repetila siempre en el mismo orden: la repetición es la que entrena al cuerpo a soltar.',
        items: [
          '2 horas antes: cená liviano y cerrá la cocina, sin volver a picotear después',
          '1 hora antes: bajá las luces de toda la casa a algo cálido y tenue',
          '45 minutos antes: guardá el celular lejos de la cama y cargalo en otro ambiente',
          '30 minutos antes: tomá una infusión sin cafeína (manzanilla, tilo o melisa)',
          '15 minutos antes: una ducha tibia o un estiramiento suave para bajar la temperatura del cuerpo',
          'Ya en la cama: 5 respiraciones lentas, exhalando largo, con los ojos cerrados',
        ],
      },
      {
        emoji: '🌙',
        title: 'El mineral del descanso',
        body:
          'El magnesio es un mineral que colabora con la relajación del sistema nervioso y los músculos, y además ayuda al tránsito intestinal. Muchas mujeres andan bajas de magnesio sin saberlo. No hace falta que corras a comprar suplementos: sumá una fuente natural en la cena, como un puñado de semillas de zapallo, hojas verdes, palta o un cuadradito de chocolate amargo de 70% o más. Si igual querés suplementar, consultalo antes con tu médico de confianza.',
      },
      {
        emoji: '⛔',
        title: 'Errores comunes que te roban el sueño',
        body:
          'Hay costumbres que parecen inofensivas pero te sabotean el descanso sin que te des cuenta. Leé esta lista y marcá las que reconozcas como tuyas para empezar a soltarlas:',
        items: [
          'Mirar el celular en la cama: la luz de la pantalla frena la melatonina, la hormona que le avisa al cuerpo que es de noche',
          'Tomar café o mate después de las 16 hs: la cafeína puede seguir activándote 6 a 8 horas',
          'Usar el alcohol para dormir: te tumba rápido pero fragmenta el sueño profundo de la madrugada',
          'Cenar tarde y abundante: tu cuerpo se pasa la noche digiriendo en vez de reparando',
          'Acostarte y levantarte a horarios distintos cada día: desordena tu reloj interno',
        ],
      },
      {
        emoji: '🛏️',
        title: 'Tu semana para reentrenar el sueño',
        body:
          'No intentes cambiar todo de golpe o lo vas a abandonar en tres días. Esta es una forma realista de ir sumando, un paso por vez, sin que se convierta en otra obligación que te estresa.',
        items: [
          'Días 1 y 2: fijá una hora de despertar y respetala, incluso el fin de semana',
          'Días 3 y 4: sumá la regla de las 3 horas para la cena',
          'Días 5 y 6: incorporá la rutina de apagado completa de esta guía',
          'Día 7: anotá cómo dormiste y tu nivel de hinchazón al despertar (0 a 10) para comparar',
        ],
      },
    ],
    closingTitle: 'El sueño es tratamiento, no premio',
    closingText:
      'Tratá tus horas de sueño como una parte más del protocolo, igual que el agua de arroz o la cena liviana. Te lo prometo: una sola semana durmiendo bien hace más por tu panza que cualquier suplemento de moda. Elegí un cambio de esta guía y empezá esta misma noche.',
    sources: [
      {
        label: 'PubMed (Leproult) — La pérdida de sueño eleva el cortisol de la noche siguiente',
        url: 'https://pubmed.ncbi.nlm.nih.gov/9415946/',
      },
      {
        label: 'PubMed — Sueño insuficiente, hormonas del apetito y mayor hambre',
        url: 'https://pubmed.ncbi.nlm.nih.gov/19955752/',
      },
      {
        label: 'Sleep Foundation — Magnesio y calidad del sueño',
        url: 'https://www.sleepfoundation.org/nutrition/magnesium-and-sleep',
      },
    ],
  },
  {
    slug: 'masterclass-cortisol',
    category: 'masterclass',
    emoji: '🧠',
    title: 'Estrés, cortisol y panza',
    cardDescription:
      'Cómo el estrés crónico te hincha el abdomen y un kit de herramientas para bajarlo en el día a día.',
    intro:
      'Tu intestino y tu cerebro se hablan todo el día a través del nervio vago, que es el cable principal que conecta la panza con la cabeza y le avisa al cuerpo cuándo relajarse. Cuando vivís corriendo y estresada, ese eje se desregula: el intestino se vuelve más sensible, la digestión se frena y el cuerpo tiende a acumular grasa y líquido en la zona media. Quizás te pasó de tener una semana tranquila y notar la panza más chata, y otra semana a mil con la panza dura aunque comiste parecido. No te lo estás imaginando: el estrés deja marca en el cuerpo, y muy especialmente en la digestión. La buena noticia es que ese mismo eje se puede entrenar para el otro lado. No vas a tener que meditar una hora ni mudarte a una montaña: con herramientas cortas, concretas y repetidas todos los días alcanza para empezar a bajar el cortisol y, con él, la hinchazón. En esta masterclass te dejo el kit completo y, al final, una rutina de 5 minutos para que no tengas que pensar qué hacer.',
    sections: [
      {
        emoji: '⚡',
        title: 'Qué hace el cortisol alto',
        body:
          'El cortisol es la hormona que tu cuerpo libera ante el estrés. En picos cortos es tu aliado: te despierta a la mañana y te da empuje para reaccionar. El problema es cuando queda alto todo el tiempo, porque entonces se asocia con más retención de líquidos, picos de azúcar en sangre y mayor tendencia a acumular grasa justo en el abdomen. Un ejemplo cotidiano: esos días de mucha presión en que terminás con la panza dura y con ganas de algo dulce a media tarde. Eso es el cortisol pidiendo energía rápida.',
      },
      {
        emoji: '🌬️',
        title: 'Respiración 4-7-8: tu botón de pausa',
        body:
          'Esta técnica es el botón de pausa de tu sistema nervioso y la podés usar apenas sentís tensión o ganas de picotear por ansiedad. La clave está en que la exhalación sea más larga que la inhalación: ese gesto activa el nervio vago y le avisa al cuerpo que puede pasar a modo calma.',
        items: [
          'Inhalá por la nariz contando hasta 4',
          'Retené el aire contando hasta 7',
          'Exhalá por la boca, bien despacio, contando hasta 8',
          'Repetí 4 ciclos completos (te lleva alrededor de un minuto)',
        ],
      },
      {
        emoji: '🚶',
        title: 'Caminata después de comer',
        body:
          'Diez minutos de caminata suave después del almuerzo o la cena ayudan a moderar el azúcar en sangre, mejoran la digestión y descargan la tensión acumulada. No necesitás gimnasio ni ropa especial: alcanza con dar una vuelta a la manzana o caminar por casa mientras hablás por teléfono. Un ejemplo simple: poné una alarma 10 minutos después de levantarte de la mesa para acordarte de moverte.',
      },
      {
        emoji: '🤲',
        title: 'Pausas de descompresión durante el día',
        body:
          'No hace falta esperar a la noche para bajar el cortisol. Insertá micro-pausas en los momentos de mayor tensión: son segundos que cortan la escalada del estrés antes de que se te instale en la panza.',
        items: [
          'Antes de comer: 3 respiraciones lentas para pasar a "modo digestión"',
          'A media mañana: 2 minutos de estiramiento de cuello y hombros',
          'Después de una llamada difícil: salí a tomar aire 1 minuto',
          'A media tarde: una infusión sin cafeína en lugar del cafecito ansioso',
        ],
      },
      {
        emoji: '📓',
        title: 'Descarga mental nocturna',
        body:
          'Antes de dormir, agarrá un papel y anotá las 3 cosas que te quedaron dando vueltas en la cabeza. Sacarlas de la mente y dejarlas por escrito ayuda a frenar la rumiación nocturna (ese repaso interminable de pendientes) y favorece un sueño más profundo, que a la mañana se traduce en una panza más liviana. Sumá al lado una sola prioridad para mañana, así no te dormís planificando.',
      },
      {
        emoji: '🚫',
        title: 'Errores comunes que te suben el cortisol',
        body:
          'A veces, sin querer, hacemos cosas que mantienen el estrés alto justo cuando queremos bajarlo. Revisá si caés en alguna de estas y cambiala de a una:',
        items: [
          'Arrancar el día mirando el celular en la cama: empezás en alerta antes de levantarte',
          'Saltarte comidas y llegar con hambre voraz: los bajones de azúcar también disparan cortisol',
          'Tomar café tras café para "aguantar": la cafeína en exceso amplifica la respuesta de estrés',
          'Hacer ejercicio muy intenso cuando ya venís agotada y durmiendo poco: suma estrés en lugar de restarlo',
          'Querer relajarte recién a las 23 hs: dejá ventanas de calma repartidas en el día',
        ],
      },
      {
        emoji: '⏱️',
        title: 'Tu rutina anti-cortisol de 5 minutos',
        body:
          'Si solo te quedás con una cosa de esta guía, que sea esta secuencia. Elegí un horario fijo (ideal a media tarde o antes de cenar) y repetila todos los días, aunque ese día estés bien.',
        items: [
          '1 minuto: respiración 4-7-8 (4 ciclos)',
          '2 minutos: respiración lenta y pareja, inhalando 5 segundos y exhalando 5',
          '1 minuto: descarga mental rápida en papel',
          '1 minuto: estiramiento suave de cuello, hombros y espalda',
          'Cerrá repitiendo una frase amable, como "estoy en calma, mi cuerpo se cuida solo"',
        ],
      },
    ],
    closingTitle: 'La calma también desinflama',
    closingText:
      'No necesitás meditar una hora ni volverte una persona zen de la noche a la mañana. Con 5 minutos diarios de respiración y movimiento suave empezás a reordenar tu eje intestino-cerebro. Elegí una sola herramienta de esta guía y sostenela toda esta semana: la constancia tranquila es la que cambia el cuerpo.',
    sources: [
      {
        label: 'PMC — Estrés crónico y mayor acumulación de grasa abdominal',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4104274/',
      },
      {
        label: 'PMC — Estrés y eje intestino-cerebro',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11292226/',
      },
      {
        label: 'PMC — Respiración lenta, tono vagal y reducción de la ansiedad',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8481564/',
      },
    ],
  },
  {
    slug: 'masterclass-ejercicio',
    category: 'masterclass',
    emoji: '🤸',
    title: 'Movimiento de bajo impacto que desinfla',
    cardDescription:
      'Rutinas suaves de 10-15 minutos que movilizan líquidos y mejoran la digestión, sin gimnasio.',
    intro:
      'Olvidate de la idea de que para que el ejercicio "sirva" tenés que terminar empapada y muerta de cansancio. Para desinflamar, lo que mejor funciona es justo lo contrario: movimiento suave, frecuente y sostenido. El cuerpo retiene líquido cuando pasás muchas horas quieta, porque el sistema linfático, que es la red que se encarga de drenar los líquidos de los tejidos, no tiene una bomba propia como el corazón y se mueve gracias a que vos te movés. Por eso una caminata corta puede deshincharte más que una hora de gimnasio una vez por semana. Además, moverte un poco después de comer ayuda a moderar el azúcar en sangre y a que la digestión fluya, en lugar de quedarte pesada en el sillón. En esta masterclass te dejo rutinas cortas, pensadas para hacer en casa, sin equipamiento y en 10 a 15 minutos. Son tan accesibles que las podés encajar entre tareas, y están ordenadas para que cubras la mañana, el después de las comidas y la noche. Elegí por dónde empezar y, sobre todo, repetí.',
    sections: [
      {
        emoji: '🌅',
        title: 'Activación de la mañana (5 minutos)',
        body:
          'Apenas te levantás, después de tu agua de arroz, esta secuencia despierta el cuerpo y pone la circulación en marcha. Hacela despacio, sin rebotes, prestando atención a la respiración.',
        items: [
          '10 círculos de cuello suaves hacia cada lado',
          '10 elevaciones de hombros, subiendo y soltando',
          '10 rotaciones de cadera tipo hula-hula hacia cada lado',
          '20 segundos de estiramiento de costado por lado, estirando el brazo hacia arriba',
          '10 respiraciones profundas de pie, llevando el aire a la panza',
        ],
      },
      {
        emoji: '🚶‍♀️',
        title: 'Caminata digestiva (10 minutos)',
        body:
          'Es lo más simple y lo más efectivo de toda la guía: una caminata tranquila después de las comidas principales ayuda a moderar la subida de azúcar en sangre y pone en movimiento el intestino. No necesitás salir a la calle si no querés: 10 minutos caminando por casa, después de almorzar o cenar, ya hacen la diferencia. Un truco: dejá las zapatillas a la vista para que te acuerdes.',
      },
      {
        emoji: '🧘‍♀️',
        title: 'Secuencia anti-hinchazón (8 minutos)',
        body:
          'Estas posturas suaves masajean el abdomen y ayudan a liberar gases atrapados. Son ideales para la tarde o antes de dormir, cuando la panza suele estar más distendida. Respirá hondo en cada una.',
        items: [
          'Rodillas al pecho, acostada, 30 segundos abrazando las piernas',
          'Torsión suave acostada, 30 segundos por lado, dejando caer las rodillas',
          'Postura del niño, 1 minuto respirando hacia la espalda baja',
          'Piernas apoyadas en la pared, 3 minutos para ayudar a drenar líquidos',
          'Gato-vaca en cuatro apoyos, 10 repeticiones lentas',
        ],
      },
      {
        emoji: '💧',
        title: 'Mover los líquidos cuando estás mucho tiempo quieta',
        body:
          'Si trabajás sentada o pasás horas en el mismo lugar, los líquidos se estancan en las piernas y la zona media. La solución no es entrenar más fuerte, sino cortar la quietud seguido con micro-movimientos que reactivan el drenaje.',
        items: [
          'Cada hora, levantate y caminá 2 minutos aunque sea hasta la cocina',
          'Sentada, hacé 20 círculos de tobillo para activar el retorno de las piernas',
          'Poné una alarma cada 60 minutos como recordatorio',
          'Al final del día, 3 minutos de piernas en la pared',
        ],
      },
      {
        emoji: '🌬️',
        title: 'Respiración que masajea la panza',
        body:
          'El movimiento más subestimado es el de tu diafragma, que es el músculo que está justo debajo de los pulmones y que, al respirar hondo, le hace una especie de masaje interno al intestino y ayuda a movilizar los gases atrapados. Sumá este mini-ejercicio en cualquier momento del día, sobre todo si te sentís distendida después de comer o al final de la jornada.',
        items: [
          'Sentada o acostada, apoyá una mano sobre la panza',
          'Inhalá por la nariz 4 segundos llevando el aire a inflar esa mano, no el pecho',
          'Exhalá por la boca 6 segundos, hundiendo suave el ombligo hacia adentro',
          'Repetí 10 veces, sin apuro, sintiendo cómo se afloja la zona',
        ],
      },
      {
        emoji: '⛔',
        title: 'Errores comunes al moverte para desinflamar',
        body:
          'Con la mejor intención, a veces hacemos cosas que juegan en contra. Mirá si te identificás con alguna y ajustala:',
        items: [
          'Creer que si no transpirás muchísimo "no sirve": el movimiento suave y constante es el que más desinfla',
          'Hacer entrenamientos extenuantes durmiendo poco: el cuerpo lo lee como más estrés y retiene más',
          'Quedarte sentada justo después de comer: es el peor momento para no moverte nada',
          'Empezar a lo bestia el lunes y abandonar el jueves: mejor poco todos los días',
          'Saltarte la entrada en calor y estirar en frío de golpe: vas despacio para no lesionarte',
        ],
      },
      {
        emoji: '🗓️',
        title: 'Tu semana de movimiento (sin gimnasio)',
        body:
          'Así combinás todo sin que se vuelva una carga. La idea es que el movimiento quede repartido y liviano, no concentrado en una sesión heroica.',
        items: [
          'Todos los días: activación de la mañana de 5 minutos',
          'Después de la comida principal: caminata digestiva de 10 minutos',
          'Lunes, miércoles y viernes a la noche: secuencia anti-hinchazón',
          'Días de mucho escritorio: pausas de movimiento cada hora',
          'Domingo: una caminata más larga al aire libre, a tu ritmo',
        ],
      },
    ],
    closingTitle: 'Constancia gana a intensidad',
    closingText:
      'Quedate con esta idea: es mejor 10 minutos todos los días que una hora aislada una vez por semana. Si tuvieras que sumar una sola cosa, que sea la caminata digestiva después de comer, porque es la que más rinde con el menor esfuerzo. Empezá hoy con esa y, cuando se vuelva costumbre, sumá el resto.',
    sources: [
      {
        label: 'PubMed — Caminar después de comer reduce la glucemia posprandial en mujeres',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20029518/',
      },
      {
        label: 'PMC — Meta-análisis: ejercicio posprandial y respuesta de glucosa',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10036272/',
      },
    ],
  },
  {
    slug: 'masterclass-ayuno',
    category: 'masterclass',
    emoji: '⏳',
    title: 'Ayuno intermitente suave para mujeres',
    cardDescription:
      'Cómo darle descanso a tu digestión sin pasar hambre ni desregular tus hormonas, paso a paso.',
    intro:
      'El ayuno intermitente cargó con mucha fama de extremo, pero en su versión suave no es pasar hambre ni castigarte: es simplemente ordenar las horas en las que comés para darle a tu intestino una pausa de reparación. Pensalo así: si comés sin parar desde que te levantás hasta que te acostás, tu digestión nunca descansa. Concentrar las comidas en una ventana de horas y dejar el resto de descanso (sumando el sueño) le permite al cuerpo encarar otras tareas de limpieza interna. En las mujeres conviene especialmente la versión amable, sin extremos, porque nuestro cuerpo es sensible a las señales de falta de energía y los ayunos largos pueden desordenar el ciclo, el ánimo y el sueño. Por eso esta masterclass está pensada para que empieces de a poco, con criterio y sin presión: te explico cómo hacerlo bien, qué podés tomar en la pausa, cómo avanzar solo si tu cuerpo lo pide y, muy importante, para quién este enfoque no es recomendable. La meta no es sufrir: es sentirte más liviana y con la digestión más ordenada.',
    sections: [
      {
        emoji: '🕐',
        title: 'La ventana 12/12 (para empezar)',
        body:
          'Es el punto de partida ideal y casi no se nota. Comé dentro de una ventana de 12 horas y descansá las otras 12, incluyendo las horas de sueño. Un ejemplo concreto: si tu primera comida es a las 8 hs, la última debería ser cerca de las 20 hs. Es tan suave que la mayoría lo logra solo adelantando un poco la cena, y suele alcanzar para notar menos hinchazón al despertar.',
      },
      {
        emoji: '💧',
        title: 'Qué sí podés tomar en la pausa',
        body:
          'Durante las horas sin comer, la idea es mantener la hidratación. Estas opciones no rompen el descanso digestivo y, además, ayudan a que la pausa se te haga más llevadera sin sentir ansiedad.',
        items: [
          'Agua, incluida tu agua de arroz en ayunas',
          'Infusiones sin azúcar: té verde, manzanilla o jengibre',
          'Café o mate amargo, con moderación',
          'Agua con unas rodajas de pepino o un toque de limón si querés variar',
        ],
      },
      {
        emoji: '🚦',
        title: 'Avanzá despacio a 14/10 (solo si te sienta bien)',
        body:
          'Si después de 2 semanas con 12/12 te sentís cómoda, con energía y durmiendo bien, podés correr la primera comida una hora para llegar a una ventana 14/10 (14 horas de pausa, 10 de comidas). El paso clave es escucharte: si aparece cansancio raro, mal humor o se te desordena el sueño, volvé a 12/12. No vayas más allá por tu cuenta, porque en mujeres los ayunos largos pueden traer más problemas que beneficios.',
      },
      {
        emoji: '🍽️',
        title: 'Qué comer cuando abrís la ventana',
        body:
          'El ayuno no es magia si después rompés con cualquier cosa. Para que la pausa rinda, cuidá la calidad de la primera comida y evitá el atracón de hambre acumulada.',
        items: [
          'Arrancá con proteína y grasas buenas: huevo, yogur natural, palta, frutos secos',
          'Sumá fibra de verduras o una fruta entera para la saciedad',
          'Evitá empezar con dulces o harinas refinadas en ayunas, que disparan el azúcar en sangre',
          'Comé despacio y sin pantallas para registrar cuándo estás satisfecha',
        ],
      },
      {
        emoji: '⛔',
        title: 'Errores comunes (y cuándo NO hacer ayuno)',
        body:
          'El ayuno suave es seguro para muchas personas, pero hay situaciones donde está de más o directamente no conviene. Leé esto con honestidad antes de arrancar:',
        items: [
          'No lo hagas si estás embarazada o en período de lactancia',
          'Evitalo si tenés antecedentes de trastornos de la conducta alimentaria',
          'No lo encares por tu cuenta si tenés diabetes en tratamiento u otra condición médica: consultá primero a tu médico',
          'No uses el ayuno como excusa para comer de menos todo el día: la meta es ordenar horarios, no recortar comida',
          'No lo combines con entrenamientos muy intensos si recién empezás: sumás demasiado estrés junto',
        ],
      },
      {
        emoji: '📊',
        title: 'Cómo saber si te está funcionando',
        body:
          'En lugar de obsesionarte con la balanza, prestá atención a señales concretas de tu cuerpo durante las primeras 2 a 3 semanas. Anotalas en tu diario para tener el dato y decidir si seguís igual o ajustás.',
        items: [
          'Hinchazón al despertar: idealmente más baja que antes',
          'Energía estable durante la mañana, sin bajones bruscos',
          'Sueño parejo y sin despertarte con hambre',
          'Estado de ánimo: si te ponés irritable o ansiosa, suavizá la ventana',
        ],
      },
      {
        emoji: '🗓️',
        title: 'Tu plan de arranque de 2 semanas',
        body:
          'Para que no tengas que pensarlo, acá tenés un camino claro y sin apuro. Si en algún punto tu cuerpo dice basta, frená sin culpa: la flexibilidad es parte del método.',
        items: [
          'Días 1 a 3: adelantá la cena para acercarte a la ventana 12/12',
          'Días 4 a 7: sostené 12/12 firme y registrá cómo te sentís',
          'Días 8 a 11: si venís bien, corré la primera comida media hora',
          'Días 12 a 14: probá llegar a 13/11 o 14/10, solo si te sienta cómodo',
          'Cualquier día con hambre real o malestar: comé y volvé al paso anterior',
        ],
      },
    ],
    closingTitle: 'Suave y sostenible gana',
    closingText:
      'El objetivo es darle descanso a tu digestión, no sufrir ni demostrarle nada a nadie. Si un día tenés hambre real, comé sin culpa: forzar la máquina no acelera nada. La constancia tranquila, semana tras semana, es la que de verdad te da resultados que duran.',
    sources: [
      {
        label: 'PubMed (NEJM) — Efectos del ayuno intermitente en la salud y el envejecimiento',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31881139/',
      },
      {
        label: 'PMC — Ayuno intermitente: de las calorías a la restricción horaria',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8190218/',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PROTOCOLO ANTI-REBOTE
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'anti-rebote',
    category: 'protocolo',
    emoji: '🧭',
    title: 'Protocolo anti-rebote',
    cardDescription:
      'Tu hoja de ruta para después de los 30 días: cómo sostener los resultados sin volver atrás, con pasos en orden y checklist.',
    intro:
      'Terminar el programa no es el final: es el momento más importante. El anti-rebote es el sistema que armás para no volver al punto de partida cuando se termina la motivación de las primeras semanas. La idea no es vivir a dieta para siempre, sino quedarte con los pocos hábitos que de verdad mueven la aguja e incorporar todo lo demás con flexibilidad y sin culpa. En este protocolo vas a encontrar criterios claros de cuándo aplicarlo y cuándo NO, los pasos en orden para activarlo, una checklist semanal para marcar, y las señales tempranas que te avisan que el rebote está empezando antes de que se note en el cuerpo. Leelo una vez completo y después usalo como mapa cada vez que sientas que te estás desviando.',
    sections: [
      {
        emoji: '🧭',
        title: '1. Cuándo aplicar este protocolo (y cuándo NO) ✅⛔',
        body:
          'Antes de arrancar, ubicate. Este protocolo es de mantenimiento, no de limpieza intensiva: está pensado para sostener un resultado que ya conseguiste, no para forzar uno nuevo.',
        items: [
          'APLICALO cuando terminaste los 30 días y te sentís mejor: es el momento de consolidar',
          'APLICALO cuando ya bajó la hinchazón y querés que no vuelva',
          'APLICALO al volver de vacaciones, fiestas o una racha desordenada',
          'NO lo apliques como castigo ni como dieta súper restrictiva: no es eso',
          'NO lo uses si todavía estás en plena fase de limpieza (terminá esa primero)',
          'NO lo uses para tratar un problema médico: si tenés dolor fuerte, sangrado o pérdida de peso sin explicación, consultá a tu médico antes',
        ],
      },
      {
        emoji: '🪜',
        title: '2. Los 5 pasos del anti-rebote, en orden 🔢',
        body:
          'Seguí estos pasos en secuencia la primera semana después del programa. Cada uno se apoya en el anterior, así que no te saltees ninguno.',
        items: [
          'Paso 1 — Elegí tus 4 pilares y anotalos en un lugar visible (la heladera, el celular)',
          'Paso 2 — Fijá horarios reales para cada pilar (ej: agua de arroz 7:30, caminata 13:30)',
          'Paso 3 — Activá el autoguardado de tu planner y cargá la primera semana completa',
          'Paso 4 — Definí tu "día de gusto" de la regla 90/10 (ej: el sábado a la noche)',
          'Paso 5 — Agendá tu chequeo mensual para dentro de 30 días, así no se te pasa',
        ],
      },
      {
        emoji: '🏛️',
        title: '3. Los 4 pilares que no se negocian 💪',
        body:
          'Pase lo que pase, sostené estos cuatro. Son el 80% del resultado con el 20% del esfuerzo, porque atacan las causas más comunes de la hinchazón que vuelve.',
        items: [
          'Agua de arroz en ayunas, al menos 4 mañanas por semana',
          'Cena liviana y temprana, unas 3 horas antes de dormir',
          'Caminata digestiva de 10 minutos después de la comida principal',
          'Hidratación e infusiones repartidas a lo largo del día (apuntá a orina de color claro)',
        ],
      },
      {
        emoji: '🍽️',
        title: '4. La regla 90/10 y por qué funciona 🎯',
        body:
          'Comé alineada al protocolo el 90% de la semana y date el 10% de gustos sin culpa. Esa flexibilidad es justamente lo que te permite sostenerlo años, no semanas: cuando una forma de comer no prohíbe todo, es mucho más fácil mantenerla en el tiempo. Un ejemplo concreto: de unas 21 comidas semanales, 2 pueden ser totalmente libres. La caminata suave después de comer ayuda en esos días de gusto, porque el movimiento liviano posterior a la comida modera la subida de glucemia (el azúcar en sangre, que es el combustible que circula por tu cuerpo después de comer). Caminar 10 a 15 minutos después de un plato pesado es de los gestos más simples y más rendidores.',
      },
      {
        emoji: '✅',
        title: '5. Checklist semanal anti-rebote 📋',
        body:
          'Imprimila o marcala mentalmente cada domingo. Si tildás 4 o más, vas bien encaminada; si tildás 2 o menos, es momento de volver a los pasos del punto 2.',
        items: [
          '☐ Tomé agua de arroz al menos 4 mañanas',
          '☐ Cené liviano y temprano la mayoría de las noches',
          '☐ Caminé después de comer al menos 4 días',
          '☐ Me hidraté bien todos los días',
          '☐ Respeté mi día de gusto sin que se transforme en semana de gustos',
          '☐ Dormí 7 horas o más la mayoría de las noches',
        ],
      },
      {
        emoji: '🔁',
        title: '6. Semana de reset (tu botón de reinicio) ♻️',
        body:
          'Si volviste de vacaciones o tuviste una racha desordenada, repetí una semana del plan de limpieza (días 1 a 7). No empezás de cero: solo le das al cuerpo un empujón para volver a desinflamarte rápido. Un ejemplo: arrancás el lunes con agua de arroz + ingrediente dorado, cenas livianas toda la semana, cero ultraprocesados ni alcohol, y caminata diaria. En 5 a 7 días la mayoría nota que la panza vuelve a estar liviana. Usalo como reseteo puntual, no como rutina permanente.',
      },
      {
        emoji: '📊',
        title: '7. Chequeo mensual y señales de alerta 🚨',
        body:
          'Una vez por mes, volvé a hacer la calculadora de microbiota y registrá cómo te sentís. Tener el dato te avisa temprano si algo se está desordenando, antes de que el rebote se instale. El cortisol —la hormona que tu cuerpo libera cuando está en alerta y que, sostenido en el tiempo, favorece la retención de líquidos— suele dispararse justo en las semanas de más estrés y peor sueño, así que prestá atención a esos períodos.',
        items: [
          'Rehacé la evaluación de síntomas y compará con tu mes anterior',
          'Señal de alerta: la hinchazón de la mañana volvió 3 días seguidos',
          'Señal de alerta: dejaste de caminar después de comer hace más de una semana',
          'Señal de alerta: las comidas libres pasaron de 2 a casi todos los días',
          'Acción: si aparece una señal, reactivá el pilar que se aflojó esa misma semana',
        ],
      },
    ],
    closingTitle: 'Esto es un estilo de vida',
    closingText:
      'El rebote no aparece de un día para el otro: aparece cuando se aflojan los pilares sin que te des cuenta. Por eso este protocolo es de mantenimiento, no de sufrimiento. Volvé a esta guía cada vez que sientas que te estás desviando, marcá la checklist y, si hace falta, hacé una semana de reset. La constancia tranquila, con margen para disfrutar, es lo que sostiene el resultado en el tiempo.',
    sources: [
      {
        label: 'PMC — Meta-análisis: caminar después de comer y glucosa posprandial',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10036272/',
      },
      {
        label: 'PubMed — Cortar el sedentarismo con caminatas suaves mejora la glucemia',
        url: 'https://pubmed.ncbi.nlm.nih.gov/24704421/',
      },
      {
        label: 'Harvard Health — Alimentos que ayudan a bajar la inflamación',
        url: 'https://www.health.harvard.edu/staying-healthy/foods-that-fight-inflammation',
      },
    ],
  },
  {
    slug: 'reintroduccion-alimentos',
    category: 'protocolo',
    emoji: '🧪',
    title: 'Protocolo de reintroducción de alimentos',
    cardDescription:
      'Identificá qué alimento te cae mal con un método guiado paso a paso, sin andar adivinando.',
    intro:
      'Después de la limpieza, muchas se sienten mejor pero no saben qué las inflaba. Este protocolo te enseña a reintroducir alimentos de a uno, de forma ordenada, para detectar tu disparador real sin volver al caos. Es trabajo de detective, no una dieta nueva: cada alimento que probás es una pista, y tu diario de síntomas es el cuaderno donde anotás el caso. La idea no es prohibir para siempre, sino armar TU lista personal de qué tolerás bien y qué conviene moderar. Acá vas a encontrar criterios de cuándo hacerlo y cuándo NO, los pasos del ciclo de prueba en orden, el orden sugerido de alimentos, una checklist para cada desafío y cómo interpretar lo que te pasa. Tomate las semanas que haga falta: la prisa es la enemiga de un buen diagnóstico.',
    sections: [
      {
        emoji: '🧪',
        title: '1. Cuándo hacer la reintroducción (y cuándo NO) ✅⛔',
        body:
          'El timing importa. Reintroducir antes de estar estable arruina el experimento, porque no vas a poder distinguir qué síntoma viene de qué alimento.',
        items: [
          'HACELO cuando ya pasaste la fase de limpieza y tus síntomas se calmaron y estabilizaron',
          'HACELO cuando tenés varias semanas tranquilas por delante, sin viajes ni eventos que descontrolen tu comida',
          'HACELO con tu diario de síntomas listo para registrar todos los días',
          'NO lo hagas si todavía estás muy hinchada o con síntomas fuertes: esperá a estar en una base estable',
          'NO lo hagas en una semana de mucho estrés o mal sueño: el estrés solo ya altera la digestión y te confunde los resultados',
          'NO lo hagas por tu cuenta si sospechás una alergia real (no una intolerancia): las alergias pueden ser peligrosas y necesitan control médico',
        ],
      },
      {
        emoji: '📋',
        title: '2. La regla de oro: de a uno por vez 1️⃣',
        body:
          'Reintroducí un solo grupo de alimentos por vez y mantené el resto de tu alimentación igual que en tu base estable. Si metés dos cosas nuevas juntas y te inflás, no vas a saber cuál fue la culpable. Este principio es el corazón de los protocolos serios de reintroducción, como el método FODMAP de la Universidad de Monash —los FODMAP son un grupo de azúcares que fermentan en el intestino y que en algunas personas generan gases e hinchazón—. Probar de a uno es lo que te da una respuesta clara.',
      },
      {
        emoji: '🗓️',
        title: '3. Los pasos del ciclo de prueba, en orden 🔢',
        body:
          'Para cada alimento sospechoso seguí estos pasos en secuencia y anotá todo en tu diario. El ciclo completo de un alimento lleva unos 3 días de prueba más unos días de descanso.',
        items: [
          'Paso 1 — Elegí UN solo alimento sospechoso para esta semana',
          'Paso 2 — Día 1: comé una porción chica del alimento y observá las próximas horas',
          'Paso 3 — Día 2: si toleraste bien, repetí con una porción un poco más grande',
          'Paso 4 — Día 3: probá una porción normal y seguí registrando síntomas',
          'Paso 5 — Días 4 y 5: volvé a tu base limpia y dejá que los síntomas se asienten antes del próximo alimento',
          'Paso 6 — Anotá la conclusión: ¿lo tolerás, lo tolerás en poca cantidad, o es un disparador?',
        ],
      },
      {
        emoji: '🥛',
        title: '4. Orden sugerido de reintroducción 📂',
        body:
          'Empezá por los sospechosos más comunes, uno por semana, en este orden. La lactosa es el azúcar de la leche, y el gluten es la proteína del trigo, la avena común, la cebada y el centeno: dos de los disparadores que más se repiten.',
        items: [
          '1. Lácteos (leche, quesos) — para evaluar la lactosa',
          '2. Gluten (pan, pastas, panificados) — la proteína del trigo y cereales similares',
          '3. Legumbres (porotos, garbanzos, lentejas)',
          '4. Crucíferas crudas (brócoli, coliflor) y cebolla/ajo en cantidad',
          '5. Edulcorantes y ultraprocesados',
        ],
      },
      {
        emoji: '✅',
        title: '5. Checklist de cada desafío 📋',
        body:
          'Antes de probar cada alimento nuevo, tildá que cumplís estas condiciones. Si te falta alguna, esperá: un desafío mal hecho te da un resultado que no sirve.',
        items: [
          '☐ Estoy en mi base estable, sin síntomas fuertes desde hace varios días',
          '☐ Voy a probar un solo alimento esta semana, no dos',
          '☐ Tengo el diario de síntomas a mano para anotar mañana, tarde y noche',
          '☐ No es una semana de estrés alto, mal sueño ni eventos sociales con comida descontrolada',
          '☐ Dejé pasar al menos 2 días de descanso desde el desafío anterior',
        ],
      },
      {
        emoji: '🔎',
        title: '6. Qué anotar en el diario 📓',
        body:
          'El dato es lo que te da el diagnóstico. Registrá todos los días, a la misma hora, para poder comparar manzanas con manzanas.',
        items: [
          'Hinchazón de la mañana y de la noche, en una escala del 0 al 10',
          'Gases y cómo estuvo el tránsito intestinal',
          'Energía y claridad mental durante el día',
          'Calidad del sueño de esa noche',
        ],
      },
      {
        emoji: '🚦',
        title: '7. Cómo interpretar tus resultados 📊',
        body:
          'Después de unas semanas vas a tener tu mapa personal. Interpretalo con calma: muchas veces el resultado no es "sí o no", sino "sí, pero en menos cantidad o con menos frecuencia". La tolerancia es individual, así que tu lista no tiene por qué parecerse a la de nadie más.',
        items: [
          'Sin reacción en los 3 días → lo tolerás bien, reincorporalo con tranquilidad',
          'Reacción leve solo con porción grande → tolerás cantidades chicas; moderá la frecuencia',
          'Reacción clara desde la primera porción → marcalo como disparador y dejalo afuera por ahora; podés reintentar el desafío más adelante',
          'Si dudás del resultado, repetí el desafío en otra semana tranquila para confirmar',
        ],
      },
    ],
    closingTitle: 'Tu cuerpo, tus reglas',
    closingText:
      'No existe una lista universal de "alimentos prohibidos": existe TU lista, y este protocolo te la arma con evidencia propia, paso a paso. Andá sin apuro, probá de a uno y confiá en lo que registra tu diario más que en lo que dice cualquier regla general. Si sospechás una intolerancia seria o una alergia, confirmala con un profesional antes de sacar conclusiones definitivas.',
    sources: [
      {
        label: 'Monash University — Fase 2: cómo reintroducir FODMAP de a uno',
        url: 'https://www.monashfodmap.com/blog/3-phases-low-fodmap-diet/',
      },
      {
        label: 'Monash FODMAP — Consejos prácticos y descanso entre desafíos',
        url: 'https://www.monashfodmap.com/blog/practical-tips-fodmap-reintroduction/',
      },
      {
        label: 'Monash FODMAP — Orden recomendado de reintroducción',
        url: 'https://monashfodmap.com/blog/order-of-fodmap-reintroduction/',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MINI-GUÍAS EXPRESS (bonos)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'deshincha-72h',
    category: 'mini-guia',
    emoji: '⚡',
    title: 'Deshinchá en 72h',
    cardDescription:
      'Protocolo intensivo de 3 días para un evento: desinflamarte rápido y sentirte liviana.',
    intro:
      'Tenés un evento, una sesión de fotos o un viaje en 3 días y querés sentirte liviana. Esta mini-guía es un empujón intensivo —no es para siempre—: 72 horas enfocadas en bajar la hinchazón y la retención de líquidos (cuando tu cuerpo acumula agua de más entre los tejidos y te sentís pesada y abotagada). La idea es darle un respiro a tu digestión y ayudar a que elimines ese líquido extra. Seguí el plan día por día, con cantidades y horarios concretos, y vas a notar la diferencia en el espejo y en cómo te queda la ropa el día clave.',
    sections: [
      {
        emoji: '🌾',
        title: 'Día 1 — Limpieza',
        body:
          'El primer día se trata de destrabar la digestión y darle menos trabajo a tu intestino. Comé simple, cocido y caliente: así tu cuerpo gasta menos energía en digerir y desinfla más rápido. Un ejemplo de almuerzo listo para copiar: caldo de verduras casero + una palma de pollo a la plancha + zucchini al vapor con un hilo de aceite de oliva.',
        items: [
          'En ayunas: agua de arroz tibia + ½ cdita de jengibre rallado (raíz que ayuda a que el estómago se vacíe más rápido)',
          'Almuerzo: proteína magra (pollo, pescado o huevo) + verduras cocidas',
          'Cero ultraprocesados, harinas blancas, gaseosas y alcohol por hoy',
          '2 litros de agua repartidos en el día + 1 infusión de jengibre después de comer',
        ],
      },
      {
        emoji: '🥒',
        title: 'Día 2 — Drenaje',
        body:
          'Hoy sumamos alimentos con efecto diurético (que ayudan a tu cuerpo a eliminar el líquido acumulado a través de la orina) y mantenemos el cuerpo en movimiento para movilizar esos líquidos. Un ejemplo de media tarde listo para copiar: licuá ½ pepino con cáscara + 1 rodaja de ananá + 1 cm de jengibre + 1 vaso de agua, y tomalo al momento.',
        items: [
          'Sumá espárragos, apio, pepino y hojas verdes a tus dos comidas principales',
          'Licuado drenante de media tarde (pepino + ananá + jengibre)',
          'Caminata suave de 20 minutos para activar la circulación',
          'A la noche: 5 minutos con las piernas apoyadas en la pared',
        ],
      },
      {
        emoji: '✨',
        title: 'Día 3 — Liviana',
        body:
          'El día del evento mantené todo conocido y simple: no es momento de probar comidas nuevas que te puedan caer mal. Un ejemplo de desayuno listo para copiar: yogur natural sin azúcar + un puñado de arándanos + 1 cdita de semillas de chía.',
        items: [
          'Desayuno y almuerzo livianos y ya probados por vos',
          'Evitá legumbres, repollo y brócoli crudos el mismo día (fermentan y dan gases)',
          'Si sentís retención, una infusión de hibisco a media mañana',
          'Respiración lenta 4-7-8 para calmar los nervios del evento',
        ],
      },
      {
        emoji: '🍵',
        title: 'Bebidas que te acompañan las 72h',
        body:
          'Lo que tomás pesa tanto como lo que comés. Estas tres bebidas hidratan y ayudan a desinflamar, todas sin azúcar y sin gas. Un ejemplo concreto: dejá una jarra de agua con rodajas de pepino y limón en la heladera y andá tomando durante el día.',
        items: [
          'Agua simple: la base de todo, apuntá a 2 litros por día',
          'Infusión de jengibre y manzanilla después de las comidas',
          'Té de hibisco (flor de color rojo con efecto diurético suave) a media tarde',
        ],
      },
      {
        emoji: '⛔',
        title: 'Qué dejar afuera estos 3 días',
        body:
          'Hay alimentos que reman en contra justo cuando querés desinflamar. No los demonices para siempre: solo sacalos del menú por estas 72 horas. El más importante de cuidar es la sal, porque favorece que tu cuerpo retenga agua.',
        items: [
          'Sal en exceso y snacks salados de paquete',
          'Gaseosas y bebidas con gas, aunque sean light',
          'Alcohol, que deshidrata y al día siguiente te infla más',
          'Harinas blancas y dulces, que hinchan y te dejan con más hambre',
        ],
      },
      {
        emoji: '📋',
        title: 'Tu checklist de las 72h',
        body:
          'Tené esta lista a mano y marcá cada hábito cumplido. Si llegás al día del evento con la mayoría tildada, vas a estar liviana y tranquila.',
        items: [
          'Agua de arroz las 3 mañanas',
          '2 litros de agua por día',
          'Caminata diaria de al menos 20 minutos',
          'Cena temprana y liviana las 3 noches',
        ],
      },
    ],
    closingTitle: 'Es un empujón, no la base',
    closingText:
      'Este protocolo es para momentos puntuales. El resultado real y duradero viene del hábito sostenido, no del modo intensivo. Usalo cuando lo necesites y volvé después a tu rutina de siempre.',
    sources: [
      {
        label: 'PMC — Jengibre, vaciado gástrico y motilidad digestiva',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3016669/',
      },
      {
        label: 'Harvard Health — Alimentos que combaten la inflamación',
        url: 'https://www.health.harvard.edu/staying-healthy/foods-that-fight-inflammation',
      },
    ],
  },
  {
    slug: 'en-viajes',
    category: 'mini-guia',
    emoji: '✈️',
    title: 'Anti-hinchazón en viajes',
    cardDescription:
      'Cómo no arruinar tu progreso en vacaciones, vuelos y comidas afuera.',
    intro:
      'Viajar suele inflar: cambian los horarios, la comida y la rutina, y aparece la retención del avión por pasar muchas horas sentada (cuando estás quieta, la sangre y los líquidos tienden a estancarse en las piernas y se hinchan). Pero no tenés que elegir entre disfrutar y cuidarte. Con estos trucos simples sostenés lo que lograste sin dejar de comer rico, salir a recorrer ni relajarte en tus vacaciones. La clave es tener un par de anclas que viajan con vos.',
    sections: [
      {
        emoji: '🛫',
        title: 'En el vuelo',
        body:
          'La presión de la cabina y estar horas sentada favorecen la hinchazón y que se te hinchen los pies y las piernas. Moverte y tomar agua es tu mejor defensa. Un ejemplo listo para copiar: poné una alarma en el celular cada hora para pararte y caminar hasta el fondo del avión y volver.',
        items: [
          'Tomá agua seguido y evitá el alcohol y las gaseosas a bordo',
          'Caminá por el pasillo cada 1 o 2 horas',
          'Sentada, hacé círculos con los tobillos (ayuda a que la sangre no se estanque en las piernas)',
          'Llevá frutos secos para no caer en los snacks ultraprocesados del avión',
        ],
      },
      {
        emoji: '🍴',
        title: 'Comiendo afuera',
        body:
          'No hace falta ser la que no come nada en la mesa. Elegí inteligente y date los gustos sin culpa. Un ejemplo listo para copiar en un restaurante: pedí pescado a la plancha + ensalada, y la salsa aparte para que vos manejes la cantidad.',
        items: [
          'Armá el plato con proteína + verduras como base',
          'Pedí las salsas y los aderezos aparte',
          'Comé despacio y pará cuando estés satisfecha, no llena',
          'Cerrá la comida con una caminata corta',
        ],
      },
      {
        emoji: '🏨',
        title: 'Tu rutina mínima en el hotel',
        body:
          'No necesitás tu cocina ni tu gimnasio para sostener lo básico. Con tres anclas simples alcanza para no perder el ritmo durante el viaje.',
        items: [
          'Pedí agua caliente en el desayuno para tu agua de arroz o una infusión',
          'Caminá para conocer el lugar en vez de tomar transporte',
          'Llevá saquitos de manzanilla o jengibre en el bolso de mano',
        ],
      },
      {
        emoji: '🥗',
        title: 'Qué meter en la valija',
        body:
          'Tener lo correcto a mano evita que termines comiendo cualquier cosa por hambre en un aeropuerto. Armá un kit chico antes de salir. Un ejemplo concreto: tres bolsitas con un puñado de almendras cada una.',
        items: [
          'Frutos secos y un par de barritas sin azúcar',
          'Saquitos de infusiones (jengibre, manzanilla, hibisco)',
          'Una botella reutilizable para tener siempre agua encima',
        ],
      },
      {
        emoji: '🌾',
        title: 'Sostené el ancla',
        body:
          'Aunque cambie todo, mantené tu agua de arroz en ayunas. Es el hábito ancla que te mantiene conectada al protocolo aunque estés lejos de tu rutina. Tomala antes de salir a recorrer, todavía en ayunas.',
        items: [
          'Preparala en el hotel o pedí agua caliente y un poco de arroz hervido',
          'Si no podés, reemplazala por un vaso de agua tibia con limón',
          'Mantené el horario: siempre en ayunas, antes del desayuno',
        ],
      },
      {
        emoji: '🧳',
        title: 'Al volver, reset suave',
        body:
          'No te castigues por los desvíos del viaje: volvé a la rutina sin dramatismo. Un par de días de comidas livianas alcanzan para reacomodarte y soltar la hinchazón del regreso.',
        items: [
          'Retomá la cena temprana y liviana ya la primera noche',
          'Si lo necesitás, repetí un par de días del plan de limpieza',
          'Volvé a tu caminata diaria desde el día 1',
        ],
      },
    ],
    closingTitle: 'Disfrutá sin culpa',
    closingText:
      'Un viaje no tira por la borda tu progreso. Sostené el ancla, movete y volvé a la rutina al regresar. La flexibilidad también es parte del método.',
    sources: [
      {
        label: 'Mayo Clinic — Trombosis venosa profunda y riesgo por estar inmóvil mucho tiempo',
        url: 'https://www.mayoclinic.org/diseases-conditions/deep-vein-thrombosis/symptoms-causes/syc-20352557',
      },
    ],
  },
  {
    slug: 'cena-anti-rebote',
    category: 'mini-guia',
    emoji: '🌙',
    title: 'Cena anti-rebote',
    cardDescription:
      'La fórmula de la cena ideal para amanecer desinflamada (con 5 ejemplos listos).',
    intro:
      'La cena define cómo amanecés. Una cena pesada o muy tardía sigue fermentando mientras dormís (las bacterias de tu intestino procesan esa comida y generan gas durante la noche), y te despertás hinchada y pesada. Esta es la fórmula simple para armar cenas que desinflaman, con ejemplos listos para copiar, la bebida que cierra bien el día y el detalle del horario que casi nadie tiene en cuenta. Si tuvieras que cambiar una sola comida, que sea esta.',
    sections: [
      {
        emoji: '🧮',
        title: 'La fórmula',
        body:
          'Armá tu cena con esta estructura y no falla: liviana, temprana y fácil de digerir. Un ejemplo listo para copiar: una palma de pescado + un plato de zucchini al vapor + 1 cdita de aceite de oliva por encima.',
        items: [
          'Proteína magra (pescado, pollo, huevo, tofu), del tamaño de tu palma',
          'Verduras cocidas, que a la noche se digieren mejor que las crudas',
          'Una grasa buena en poca cantidad (palta o aceite de oliva)',
          'Sin harinas pesadas ni postres azucarados',
        ],
      },
      {
        emoji: '🍽️',
        title: '5 cenas listas para copiar',
        body:
          'Rotalas durante la semana así no caés en la rutina. Todas son livianas, fáciles de hacer y a prueba de hinchazón.',
        items: [
          'Tortilla de zucchini + ensalada de hojas tibias',
          'Pescado al horno + puré de zanahoria',
          'Sopa de verduras + huevo poché',
          'Pollo a la plancha + zucchini salteado',
          'Tofu salteado con jengibre + un poco de arroz integral',
        ],
      },
      {
        emoji: '⏰',
        title: 'El horario importa tanto como el plato',
        body:
          'Cená al menos 3 horas antes de acostarte. Comer muy tarde le deja menos tiempo a tu digestión y favorece el reflujo (cuando el contenido del estómago sube hacia el esófago y arde). Un ejemplo concreto: si te acostás 23 hs, terminá de cenar antes de las 20.',
        items: [
          'Fijate una hora tope para cenar y respetala',
          'Si llegás tarde, hacé una cena mínima (una sopa o un caldo)',
          'Después de cenar, cerrá la cocina: una infusión y listo',
        ],
      },
      {
        emoji: '🌿',
        title: 'La bebida que cierra el día',
        body:
          'Una infusión caliente sin azúcar ayuda a la digestión y corta la ansiedad por lo dulce de la noche. Un ejemplo concreto: una taza de manzanilla 20 minutos después de cenar.',
        items: [
          'Manzanilla si querés relajarte para dormir',
          'Jengibre si cenaste un poco más pesado de lo planeado',
          'Menta si sentís la panza distendida (relaja el músculo del intestino y alivia los gases)',
        ],
      },
      {
        emoji: '⚠️',
        title: 'Errores que te inflan de noche',
        body:
          'Pequeños hábitos que arruinan hasta la cena más sana. Identificalos y evitalos para no sabotear tu mañana.',
        items: [
          'Cenar frente a la pantalla y comer de más sin darte cuenta',
          'Picar algo dulce después de cenar',
          'Tomar gaseosa o agua con gas durante la cena',
          'Irte a dormir apenas terminás de comer',
        ],
      },
      {
        emoji: '📋',
        title: 'Checklist de la cena perfecta',
        body:
          'Antes de sentarte a cenar, repasá esta lista mental de 4 preguntas. Si respondés que sí a todas, vas a amanecer liviana.',
        items: [
          '¿Tiene proteína + verdura cocida?',
          '¿Es temprano, al menos 3 horas antes de dormir?',
          '¿Evité harinas pesadas y dulces?',
          '¿Cerré con agua o infusión, sin gaseosa?',
        ],
      },
    ],
    closingTitle: 'Cena liviana, mañana liviana',
    closingText:
      'Si tuvieras que elegir un solo cambio, que sea la cena: temprana y liviana. Es lo que más impacto tiene en la panza de la mañana.',
    sources: [
      {
        label: 'PMC — Aceite de menta: efecto antiespasmódico en síntomas digestivos',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6337770/',
      },
      {
        label: 'PMC — Jengibre y vaciado gástrico',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3016669/',
      },
    ],
  },
  {
    slug: 'snacks-que-desinflaman',
    category: 'mini-guia',
    emoji: '🥗',
    title: 'Snacks que desinflaman',
    cardDescription:
      '12 ideas de snacks rápidos para cortar el hambre sin inflar ni romper el protocolo.',
    intro:
      'El problema no es comer entre comidas: es CON QUÉ. Estos snacks cortan el hambre, te dan saciedad real (esa sensación de estar satisfecha que dura un buen rato) y no te inflan. El truco para que no te den un pico de azúcar (una subida brusca de glucosa en sangre que después te deja con más hambre) es combinar siempre algo dulce o con almidón con una proteína o una grasa buena. Tenelos preparados y a la vista para no caer siempre en lo de siempre cuando llega el bajón de la tarde.',
    sections: [
      {
        emoji: '🍎',
        title: 'Dulces y frescos',
        body:
          'Cuando el antojo va por lo dulce, combiná una fruta con una grasa buena o algo de proteína: así la energía entra más despacio y evitás el pico de azúcar. Un ejemplo listo para copiar: manzana verde en rodajas + 6 almendras.',
        items: [
          'Manzana verde + 6 almendras',
          'Bastones de pera con un toque de canela',
          'Un puñado de arándanos + 4 nueces',
          'Yogur natural sin azúcar + 1 cdita de chía',
        ],
      },
      {
        emoji: '🧀',
        title: 'Salados y saciantes',
        body:
          'Cuando necesitás algo que llene de verdad, sumá fibra (la parte de los vegetales que no se digiere y te da saciedad) o proteína. Un ejemplo listo para copiar: bastones de pepino y zanahoria con 2 cucharadas de hummus.',
        items: [
          'Pepino y zanahoria en bastones + hummus (puré de garbanzos)',
          'Huevo duro con sal y pimienta',
          'Un puñado de aceitunas + tomates cherry',
          'Tostada de pan de masa madre + palta pisada',
        ],
      },
      {
        emoji: '🍵',
        title: 'Para la tarde-noche',
        body:
          'Cuando es más ansiedad que hambre real, una bebida caliente y algo mínimo alcanzan para cortar el impulso. Un ejemplo concreto: una infusión de jengibre mientras preparás la cena.',
        items: [
          'Infusión de jengibre o manzanilla',
          'Té verde + 2 cuadraditos de chocolate 70%',
          'Gelatina sin azúcar con frutos rojos',
        ],
      },
      {
        emoji: '🥤',
        title: 'Snacks líquidos',
        body:
          'Un licuado bien armado también cuenta como snack y te hidrata de paso. Un ejemplo listo para copiar: licuá ½ pepino + 1 rodaja de ananá + 1 cm de jengibre + 1 vaso de agua.',
        items: [
          'Licuado desinflamante (pepino + ananá + jengibre)',
          'Yogur natural batido con frutos rojos',
          'Agua con limón, pepino y menta para la tarde',
        ],
      },
      {
        emoji: '✅',
        title: 'Cómo elegir un buen snack',
        body:
          'Más allá de la lista, lo valioso es aprender el criterio para improvisar uno sano en cualquier lado, incluso en un kiosco o un aeropuerto.',
        items: [
          'Que tenga proteína o fibra (almendras, yogur, verduras)',
          'Sin azúcar agregada ni harinas blancas',
          'Porción chica: un puñado, no la bolsa entera',
        ],
      },
      {
        emoji: '🗒️',
        title: 'Tu kit de snacks listo',
        body:
          'El secreto es la disponibilidad: si lo sano está a mano, comés sano. Dejá armado tu kit el domingo y vas a tener resuelta la semana. Un ejemplo concreto: lavá y cortá la fruta apenas volvés del super.',
        items: [
          'Frutas lavadas y cortadas en la heladera',
          'Frutos secos repartidos en porciones de un puñado',
          'Huevos duros ya cocidos para toda la semana',
        ],
      },
    ],
    closingTitle: 'Tené el snack correcto a mano',
    closingText:
      'El secreto es la disponibilidad: si lo sano está a mano, comés sano. Dejá preparados 2 o 3 de estos para tus horarios de bajón.',
    sources: [
      {
        label: 'PubMed — Orden de los alimentos y respuesta de glucosa posprandial',
        url: 'https://pubmed.ncbi.nlm.nih.gov/36574255/',
      },
      {
        label: 'Harvard Health — Alimentos que combaten la inflamación',
        url: 'https://www.health.harvard.edu/staying-healthy/foods-that-fight-inflammation',
      },
    ],
  },
];

/** Devuelve una guía VIP por su slug, o undefined si no existe. */
export function getVipGuide(slug: string): VipGuide | undefined {
  return VIP_GUIDES.find((g) => g.slug === slug);
}

/** Devuelve todas las guías VIP de una categoría. */
export function getVipGuidesByCategory(category: VipCategory): VipGuide[] {
  return VIP_GUIDES.filter((g) => g.category === category);
}
