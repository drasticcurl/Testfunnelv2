// lib/pwa/bonus-guides.ts — Contenido de los 3 bonos del Protocolo TURBO
//
// El VSL del upsell promete 3 regalos al comprar el Programa de 30 Días TURBO.
// Para que la promesa del video coincida con lo que el comprador encuentra en
// la PWA, acá vive el contenido real de cada bono. Lo consume la ruta dinámica
// /pwa/guias/bonus/[slug].
//
// Contenido ampliado y revisado con evidencia (2024-2025): respiración lenta y
// tono vagal, eje intestino-cerebro, hipnoterapia dirigida al intestino, aceite
// de menta en SII, orden de los alimentos y glucemia, sueño/cortisol. Fuentes
// citadas al pie de cada bono (componente GuideSources).
//
// Estos bonos requieren upsell (son exclusivos del TURBO).

export type BonusSection = {
  emoji: string;
  title: string;
  body: string;
  /** Pasos / items opcionales (recetas, listas, checklists). */
  items?: string[];
};

export type BonusSource = {
  label: string;
  url: string;
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
  /** Fuentes que respaldan el contenido (opcional). */
  sources?: BonusSource[];
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
      '9 preparaciones caseras que multiplican el efecto del agua de arroz: shots, tónicos, batidos e infusiones desinflamantes, con su calendario de uso.',
    intro:
      'Estas son las preparaciones que convierten tu agua de arroz en una verdadera rutina antiinflamatoria. Son simples, con ingredientes de cualquier verdulería, y potencian lo que ya venís haciendo. Más abajo te dejo el calendario para combinarlas sin volverte loca, los errores más comunes y cómo conservarlas.',
    sections: [
      {
        emoji: '🌾',
        title: '0. Tu agua de arroz, bien hecha (la base)',
        body:
          'Antes de potenciarla, asegurate de prepararla bien y de forma segura. El secreto está en el frío: enfriar el arroz cocido en la heladera activa el almidón resistente que tus bacterias usan como alimento. Tenés la receta completa en la Guía del Agua de Arroz.',
        items: [
          'Cociná ½ taza de arroz blanco en 2 tazas de agua, sin sal ni condimentos, y enfrialo rápido',
          'Guardalo tapado en la heladera 12-24 h (activa el almidón resistente). Nunca lo dejes a temperatura ambiente',
          'A la noche, poné 2 cdas de ese arroz frío en un vaso con 200 ml de agua y dejá reposar tapado en la heladera',
          'A la mañana colá el líquido, entibialo sin hervir, sumá unas gotas de limón y tomalo en ayunas',
        ],
      },
      {
        emoji: '🟡',
        title: '1. El ingrediente dorado de la mañana',
        body:
          'Sumá esta mezcla a tu agua de arroz en ayunas, 3 mañanas por semana. La curcumina de la cúrcuma es antiinflamatoria, pero sola se absorbe muy poco: la pimienta negra (piperina) multiplica su absorción. El jengibre, además, acelera el vaciado gástrico.',
        items: [
          '½ cdita de cúrcuma en polvo',
          '1 pizca de pimienta negra recién molida (clave para absorberla)',
          '1 cdita de jengibre fresco rallado',
          'Mezclá en el vaso de agua de arroz tibia y tomá despacio en ayunas',
        ],
      },
      {
        emoji: '🍋',
        title: '2. El shot verde de arranque',
        body:
          'Para los días en que querés un golpe extra de energía y digestión. Tomalo apenas te levantás, antes del desayuno.',
        items: [
          'Jugo de ½ limón',
          '1 cm de jengibre rallado (o licuado con un poco de agua)',
          '1 pizca de cúrcuma + pimienta',
          'Opcional: 1 cdita de vinagre de manzana. Completá con agua tibia',
        ],
      },
      {
        emoji: '🔴',
        title: '3. El tónico rojo para la ansiedad nocturna',
        body:
          'Tomalo 30 minutos antes de cenar para cortar la ansiedad por lo dulce de la noche. El hibisco es diurético natural y la canela ayuda a regular el azúcar en sangre.',
        items: [
          '1 taza de agua caliente',
          '1 cda de flor de hibisco (o 1 saquito)',
          '½ cdita de canela en polvo',
          'Unas gotas de limón. Reposá 5 min, colá y tomá tibio',
        ],
      },
      {
        emoji: '🥤',
        title: '4. El batido desinflamante de media tarde',
        body:
          'Reemplazá el snack de la tarde por este batido 2 o 3 veces por semana. Pepino, jengibre y piña ayudan contra la hinchazón y la retención de líquidos.',
        items: [
          '½ pepino con cáscara',
          '1 rodaja de piña (ananá) — aporta bromelina',
          '1 cdita de jengibre fresco',
          'Jugo de ½ limón + 1 vaso de agua. Licuá y tomá al momento',
        ],
      },
      {
        emoji: '🍵',
        title: '5. La infusión digestiva post-comida',
        body:
          'Después del almuerzo o la cena pesada, esta infusión ayuda a desinflamar y a calmar los gases. El hinojo es un carminativo clásico (ayuda a expulsar gases).',
        items: [
          '1 cdita de semillas de hinojo (o anís)',
          '1 rodaja de jengibre',
          '1 saquito de manzanilla',
          'Agua caliente. Reposá 5-7 min y tomá tibio sin azúcar',
        ],
      },
      {
        emoji: '🌿',
        title: '6. Té de menta para el dolor y la distensión',
        body:
          'La menta es de las hierbas con más respaldo para los síntomas digestivos: tiene efecto antiespasmódico (relaja el músculo intestinal), lo que ayuda con el dolor y la sensación de distensión. Ideal después de comer o ante una molestia puntual.',
        items: [
          '1 saquito de té de menta o un puñado de hojas frescas',
          'Agua caliente, reposá 5 min',
          'Tomalo tibio, sin azúcar',
          'Si tenés reflujo, no abuses: en algunas personas relaja de más el esfínter',
        ],
      },
      {
        emoji: '🌙',
        title: '7. Leche dorada nocturna (golden milk)',
        body:
          'Una versión nocturna y reconfortante del ingrediente dorado, sin cafeína. Ideal para cerrar el día y bajar la ansiedad por lo dulce.',
        items: [
          '1 taza de leche vegetal (almendras, avena o coco)',
          '½ cdita de cúrcuma + 1 pizca de pimienta',
          '½ cdita de canela + un toque de jengibre',
          'Calentá sin hervir, endulzá con poca miel si querés',
        ],
      },
      {
        emoji: '🍶',
        title: '8. Vinagre de manzana antes de las comidas',
        body:
          'Un clásico de las abuelas: 1 cdita en agua antes del almuerzo. Puede ayudar a la sensación de saciedad y a comer más tranquila. Usá poca cantidad y siempre diluido para no dañar el esmalte dental.',
        items: [
          '1 cdita de vinagre de manzana en 1 vaso de agua',
          'Tomalo 10-15 min antes de la comida principal',
          'Con sorbete para cuidar los dientes',
          'Si te molesta el estómago, suspendelo',
        ],
      },
      {
        emoji: '🗓️',
        title: 'Cómo combinarlas (semana tipo)',
        body:
          'No hace falta tomar todo todos los días. Esta es una forma simple de rotarlas para que sume sin agobiarte.',
        items: [
          'Mañanas (lun-mié-vie): agua de arroz + ingrediente dorado',
          'Mañanas (mar-jue): shot verde de arranque',
          'Tardes (2-3 por semana): batido desinflamante',
          'Después de comidas pesadas: infusión digestiva o té de menta',
          'Noches: leche dorada o tónico rojo si hay ansiedad',
        ],
      },
      {
        emoji: '⚠️',
        title: 'Errores comunes (evitalos)',
        body:
          'Pequeños detalles que hacen que estas preparaciones no te rindan o hasta te caigan mal.',
        items: [
          'Cúrcuma sin pimienta: casi no se absorbe',
          'Tomar el shot de limón puro sin diluir: irrita y desgasta el esmalte',
          'Endulzar todo con azúcar: anula el efecto desinflamante',
          'Hervir la cúrcuma o la miel a fuego fuerte: pierden propiedades',
          'Querer hacer las 9 el mismo día: arrancá de a una',
        ],
      },
    ],
    closingTitle: 'Sumalas de a una',
    closingText:
      'Empezá por el ingrediente dorado en tu agua de arroz, y desde la segunda semana sumá el resto siguiendo el calendario. La constancia es lo que hace la diferencia, no la perfección.',
    sources: [
      {
        label: 'PMC — Jengibre, motilidad gástrica y dispepsia funcional',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3016669/',
      },
      {
        label: 'PubMed (Shoba) — Piperina y biodisponibilidad de la curcumina',
        url: 'https://pubmed.ncbi.nlm.nih.gov/9619120/',
      },
      {
        label: 'PMC — Meta-análisis: aceite de menta en el SII',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6337770/',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // BONO 2 — Rituales de las famosas
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'rituales-famosas',
    emoji: '✨',
    title: 'Rituales de las Famosas',
    cardDescription:
      'Los 14 hábitos reales que usan para mantener el cuerpo, la panza plana y la piel después de los 40 — con el paso a paso para copiarlos hoy.',
    intro:
      'No tienen un secreto mágico ni un cirujano de cabecera: tienen hábitos simples, baratos y constantes. Acá tenés los 14 que mejor se combinan con el Método del Agua de Arroz, cada uno con su paso a paso para que los apliques desde hoy sin gimnasio ni dietas locas. No hagas todo de golpe: elegí 2 o 3 y, cuando se vuelvan automáticos, sumá más.',
    sections: [
      {
        emoji: '☀️',
        title: '1. Luz natural apenas te levantás',
        body:
          'Antes que el celular, buscá la ventana. La luz natural temprano ordena tu reloj interno (ritmo circadiano): mejora el ánimo, la energía del día y, sobre todo, el sueño de la noche. Es gratis y poderoso.',
        items: [
          '5-10 min de luz natural en la primera hora del día',
          'Tomá tu agua afuera o cerca de la ventana',
          'Si podés, una caminata corta a la mañana',
        ],
      },
      {
        emoji: '💧',
        title: '2. Hidratación estratégica al despertar',
        body:
          'Arrancan el día con agua antes que con café. Después de 8 horas sin tomar nada, tu cuerpo amanece deshidratado: eso enlentece la digestión y marca más la retención. Hidratarte primero activa el tránsito y la piel.',
        items: [
          'Apenas te levantás: 1-2 vasos de agua tibia con ½ limón',
          'Esperá 15-20 min antes del café',
          'Meta del día: que tu orina sea de color claro',
        ],
      },
      {
        emoji: '🥗',
        title: '3. El orden de los alimentos en el plato',
        body:
          'El truco más subestimado. Comer las verduras y la proteína ANTES que los carbohidratos reduce el pico de glucosa después de comer (la fibra y la proteína enlentecen el vaciado gástrico). Menos picos = menos antojos, menos hinchazón y energía más pareja.',
        items: [
          'Primero: las verduras / ensalada',
          'Segundo: la proteína y las grasas buenas',
          'Último: los carbohidratos (arroz, pan, papa)',
          'Mismo plato, mismo menú — solo cambiás el orden',
        ],
      },
      {
        emoji: '🍳',
        title: '4. Proteína en cada comida',
        body:
          'Es el hábito que más cuida el cuerpo después de los 40: la proteína da saciedad real, sostiene la masa muscular (clave para el metabolismo) y aporta los ladrillos del colágeno de la piel. La mayoría come mucho menos de la que necesita.',
        items: [
          'Una fuente de proteína en cada comida (huevo, pollo, pescado, legumbres, yogur)',
          'Apuntá a algo del tamaño de tu palma por comida',
          'En el desayuno también (no solo tostada y café)',
        ],
      },
      {
        emoji: '🧖',
        title: '5. Drenaje linfático en 5 minutos',
        body:
          'El sistema linfático no tiene una "bomba" propia: se mueve con el movimiento y el masaje. 5 minutos de masaje ascendente ayudan con la sensación de piernas y abdomen pesados. Hacelo a la noche, con una crema o aceite.',
        items: [
          'Siempre en sentido ascendente (de los pies hacia el corazón)',
          'Piernas: movimientos largos y suaves, de tobillo a muslo',
          'Abdomen: círculos suaves en el sentido de las agujas del reloj',
          'Cerrá con 1 minuto de piernas apoyadas en la pared',
        ],
      },
      {
        emoji: '🪥',
        title: '6. Cepillado en seco (dry brushing)',
        body:
          'Pasar un cepillo de cerdas naturales por la piel seca antes de la ducha exfolia y deja la piel más suave, con un golpe de circulación. Aclaración honesta: los beneficios "detox" o anticelulitis no tienen respaldo científico — pero como ritual de activación matutina, suma y se siente bien.',
        items: [
          'Piel seca, antes de la ducha',
          'Movimientos largos hacia el corazón, sin apretar',
          '2-3 veces por semana (no todos los días)',
          'Evitá zonas irritadas, heridas o piel muy sensible',
        ],
      },
      {
        emoji: '💆',
        title: '7. Gua sha y descongestión facial',
        body:
          'El rostro también retiene líquido (sobre todo al despertar). Un masaje facial ascendente con una piedra fría o con los dedos reduce la hinchazón matutina y reactiva la circulación. 2 minutos alcanzan.',
        items: [
          'Aplicá unas gotas de aceite o sérum',
          'Deslizá desde el centro de la cara hacia las orejas',
          'Del cuello hacia abajo para drenar',
          'Guardá la piedra/roller en la heladera: el frío potencia el efecto',
        ],
      },
      {
        emoji: '🧘‍♀️',
        title: '8. Yoga facial / gimnasia de cara',
        body:
          'Ejercitar los músculos de la cara unos minutos al día ayuda a tonificar y a relajar la tensión que se acumula (mandíbula, frente). Pensalo como entrenamiento suave para la zona que más se nota.',
        items: [
          'Inflá las mejillas y pasá el aire de un lado a otro',
          'Sonrisa amplia + presión suave de los pómulos hacia arriba',
          'Relajá la mandíbula: abrí la boca y soltá la tensión',
          '2-3 minutos, mientras te ponés la crema',
        ],
      },
      {
        emoji: '🌙',
        title: '9. "Cocina cerrada" después de cenar',
        body:
          'Cenan temprano y liviano, y después no vuelven a la cocina. Cenar al menos 3 horas antes de dormir mejora el descanso, baja la hinchazón matutina y favorece la regeneración nocturna de la piel.',
        items: [
          'Cená al menos 3 horas antes de acostarte',
          'Platos livianos: proteína + verduras cocidas',
          'Después de cenar, "cerrá la cocina": infusión y listo',
          'Si te da hambre de ansiedad, probá una manzanilla o té de menta',
        ],
      },
      {
        emoji: '⏳',
        title: '10. Ayuno nocturno de 12 horas',
        body:
          'La versión más suave y sostenible del ayuno intermitente: simplemente dejá 12 horas entre la cena y el desayuno (incluye el sueño). Le da a tu digestión una pausa de reparación y casi no se nota.',
        items: [
          'Ejemplo: última comida 20 hs, primera 8 hs',
          'Durante la pausa: agua, infusiones, café/mate amargo',
          'No fuerces más allá si te sentís mal o tenés mucha hambre',
          'No lo hagas si estás embarazada, en lactancia o con una condición médica',
        ],
      },
      {
        emoji: '🚶',
        title: '11. Movimiento constante (no gimnasio)',
        body:
          'No viven en el gimnasio: se mueven todo el día. Caminan, suben escaleras, hacen una caminata corta después de comer. Ese movimiento de baja intensidad suma muchísimo y, post-comida, baja la glucemia.',
        items: [
          'Caminata de 10 min después de la comida principal',
          'Escaleras en vez de ascensor',
          '"Snacks de movimiento": 2 min de estiramiento cada par de horas',
          'Meta simple: que el cuerpo no pase horas quieto',
        ],
      },
      {
        emoji: '🚿',
        title: '12. Ducha de contraste',
        body:
          'Terminar la ducha con agua fría 20-30 segundos activa la circulación, tonifica la piel y deja sensación de energía. Un truco viejo para "despertar" la piel a la mañana.',
        items: [
          'Duchate normal con agua tibia',
          'Cerrá con 20-30 seg de agua fresca/fría, de piernas hacia arriba',
          'Si te cuesta, empezá solo por las piernas',
        ],
      },
      {
        emoji: '🧍‍♀️',
        title: '13. Postura: el lifting gratis',
        body:
          'Caminar erguida, hombros atrás y abdomen activo cambia cómo te ves al instante —y cómo te sentís—. La postura "de pasarela" no es vanidad: descomprime la panza y proyecta seguridad.',
        items: [
          'Imaginá un hilo que te tira la coronilla hacia arriba',
          'Hombros relajados hacia atrás y abajo',
          'Abdomen levemente activo al caminar',
          'Chequeá tu postura cada vez que mirás el celular',
        ],
      },
      {
        emoji: '😴',
        title: '14. El sueño como tratamiento de belleza',
        body:
          'Es el hábito que más rinde y el más barato. Dormir 7-8 horas regula el cortisol (la hormona que infla y acumula grasa abdominal) y es cuando la piel se repara. Dormir mal aumenta el hambre y los antojos al día siguiente.',
        items: [
          'Objetivo: 7-8 horas reales',
          'Última pantalla 45 min antes de dormir',
          'Cuarto oscuro y fresco',
          'Misma hora de dormir y despertar, también los findes',
        ],
      },
    ],
    closingTitle: 'Constancia, no perfección',
    closingText:
      'Ninguno de estos hábitos es difícil ni caro. El secreto está en sostenerlos. Elegí dos para esta semana y, cuando se vuelvan automáticos, sumá los demás. Eso es lo que hacen ellas: lo simple, todos los días.',
    sources: [
      {
        label: 'PubMed — Orden de los alimentos y glucosa posprandial',
        url: 'https://pubmed.ncbi.nlm.nih.gov/36574255/',
      },
      {
        label: 'Cleveland Clinic — La verdad sobre el cepillado en seco',
        url: 'https://health.clevelandclinic.org/the-truth-about-dry-brushing-and-what-it-does-for-you/',
      },
      {
        label: 'Harvard Health — Foods that fight inflammation',
        url: 'https://www.health.harvard.edu/staying-healthy/foods-that-fight-inflammation',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // BONO 3 — Mente y Panza
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'mente-panza',
    emoji: '🧘',
    title: 'Programa Mente y Panza',
    cardDescription:
      'Bajá la ansiedad y el estrés que inflaman tu intestino, con 12 técnicas de respiración, hábitos y una rutina de 5 minutos al día.',
    intro:
      'El estrés no está solo en tu cabeza: tu intestino y tu cerebro se comunican todo el día por el nervio vago, y el estrés crónico desregula ese eje, favoreciendo la inflamación intestinal y la ansiedad por la comida. La buena noticia es que ese eje se entrena. Estas técnicas calman tu sistema nervioso y, con él, tu panza. Probá varias y quedate con las que más te funcionen.',
    sections: [
      {
        emoji: '🔗',
        title: '1. Entendé el eje intestino-cerebro',
        body:
          'Tu intestino tiene su propia red de neuronas (por eso se lo llama "segundo cerebro") y está conectado al cerebro por el nervio vago. Cuando estás en alerta, el cuerpo frena la digestión para "atender la amenaza". Por eso el estrés hincha, da gases y altera el tránsito. Calmar el sistema nervioso es, literalmente, calmar la panza.',
      },
      {
        emoji: '🌬️',
        title: '2. Respiración 4-7-8 (corta el estrés en 1 minuto)',
        body:
          'Cuando sientas ansiedad o ganas de picotear, hacé este ejercicio. La respiración lenta, con la exhalación más larga que la inhalación, activa el nervio vago y pasa tu cuerpo a "modo descanso y digestión".',
        items: [
          'Inhalá por la nariz contando hasta 4',
          'Retené el aire contando hasta 7',
          'Exhalá por la boca, despacio, contando hasta 8',
          'Repetí 4 veces. Sentí cómo baja la tensión',
        ],
      },
      {
        emoji: '🟦',
        title: '3. Respiración en caja (box breathing)',
        body:
          'La técnica que usan hasta los militares para mantener la calma bajo presión. Es fácil de recordar porque todo dura lo mismo. Ideal antes de una situación estresante.',
        items: [
          'Inhalá contando 4',
          'Retené contando 4',
          'Exhalá contando 4',
          'Mantené los pulmones vacíos contando 4. Repetí 4-6 veces',
        ],
      },
      {
        emoji: '💓',
        title: '4. Coherencia cardíaca (5 minutos de calma)',
        body:
          'Una versión más larga para bajar el estrés de fondo. Respirar a un ritmo lento y parejo mejora la variabilidad de la frecuencia cardíaca y el tono vagal. Ideal a media tarde o antes de una comida.',
        items: [
          'Inhalá 5 segundos, exhalá 5 segundos (6 respiraciones por minuto)',
          'Mantené el ritmo parejo durante 5 minutos',
          'Usá un dedo para seguir el conteo o una app de respiración',
        ],
      },
      {
        emoji: '🌀',
        title: '5. Relajación muscular progresiva',
        body:
          'Una técnica con evidencia para bajar la tensión física que el estrés deja en el cuerpo. Consiste en tensar y soltar grupos musculares de a uno. Se usa incluso en consultorios como apoyo para el intestino irritable.',
        items: [
          'Acostada, tensá los pies 5 seg y soltá',
          'Subí: pantorrillas, muslos, glúteos, abdomen, manos, hombros, cara',
          'En cada zona: tensá 5 seg, soltá 10 seg',
          'Terminá con 3 respiraciones lentas',
        ],
      },
      {
        emoji: '🎧',
        title: '6. Audios de relajación dirigida al intestino',
        body:
          'La hipnoterapia dirigida al intestino tiene de las mejores evidencias entre las terapias mente-cuerpo para el intestino irritable, al punto que figura en guías de gastroenterología. No reemplaza al médico, pero escuchar audios guiados de relajación enfocados en la panza es una herramienta concreta para sumar.',
        items: [
          'Buscá audios de "relajación guiada" o "gut-directed"',
          'Escuchalos acostada, con auriculares, sin distracciones',
          '15-20 min, idealmente antes de dormir',
          'La constancia (varias semanas) es lo que da resultado',
        ],
      },
      {
        emoji: '🍽️',
        title: '7. Comer con atención (mindful eating)',
        body:
          'Comé sin pantallas, masticá al menos 20 veces cada bocado y dejá los cubiertos entre bocado y bocado. Comer despacio reduce los gases (tragás menos aire), mejora la digestión y te hace sentir saciada con menos cantidad.',
        items: [
          'Sentate, sin teléfono ni TV',
          'Masticá 20 veces cada bocado',
          'Apoyá los cubiertos entre bocados',
          'Pará cuando estés satisfecha, no llena',
        ],
      },
      {
        emoji: '🙏',
        title: '8. Tres respiraciones antes de comer',
        body:
          'Un mini-ritual que cambia tu digestión: antes del primer bocado, hacé 3 respiraciones lentas. Pasás del "modo estrés" al "modo descanso y digestión", justo cuando tu cuerpo necesita digerir.',
        items: [
          'Sentate y apoyá los cubiertos',
          '3 respiraciones lentas, exhalando largo',
          'Recién ahí, empezá a comer',
        ],
      },
      {
        emoji: '🚶‍♀️',
        title: '9. Caminata de 10 minutos para la cabeza',
        body:
          'Caminar suave después de comer hace doble trabajo: baja el azúcar en sangre y descarga tensión mental. El movimiento es uno de los reguladores del ánimo más accesibles que existen. Mejor si es al aire libre.',
      },
      {
        emoji: '📓',
        title: '10. Descarga mental antes de dormir',
        body:
          'Anotá en papel lo que te quedó dando vueltas. Sacarlo de la cabeza baja el cortisol nocturno, mejora el sueño y desinfla la panza de la mañana.',
        items: [
          '3 cosas que te preocuparon hoy',
          '1 cosa que resolviste o agradecés',
          '1 prioridad para mañana (solo una)',
        ],
      },
      {
        emoji: '📵',
        title: '11. Pausa de pantallas (detox digital)',
        body:
          'El scroll infinito mantiene el sistema nervioso activado y roba sueño. Poner límites baja el ruido mental y, de paso, el cortisol. No hace falta ser extremista: alcanzan reglas simples.',
        items: [
          'Sin celular en la primera y la última media hora del día',
          'Notificaciones en silencio durante las comidas',
          'Cargá el teléfono fuera de la cama',
        ],
      },
      {
        emoji: '🕯️',
        title: '12. Mantra de 2 minutos',
        body:
          'Sentate cómoda, cerrá los ojos y repetí mentalmente una frase corta y amable ("estoy en calma", "mi cuerpo se cuida solo") al ritmo de tu respiración. Calma la mente y, con ella, el sistema digestivo.',
      },
      {
        emoji: '⏱️',
        title: 'Tu rutina anti-ansiedad de 5 minutos',
        body:
          'Si solo hacés una cosa de esta guía, que sea esta secuencia diaria. Elegí un momento fijo (la mañana o antes de cenar) y repetila.',
        items: [
          '1 min: respiración 4-7-8 (4 ciclos)',
          '2 min: coherencia cardíaca (respiración 5-5)',
          '1 min: descarga mental rápida en papel',
          '1 min: mantra con los ojos cerrados',
        ],
      },
    ],
    closingTitle: 'Tu panza escucha a tu mente',
    closingText:
      'Dedicale 5 minutos por día a calmar tu sistema nervioso y vas a ver el efecto en tu digestión. No es "todo mental": es fisiología. La calma también desinflama.',
    sources: [
      {
        label: 'Frontiers Mol Neurosci 2024 — Estrés y eje intestino-cerebro',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11292226/',
      },
      {
        label: 'Scientific Reports 2021 — Respiración lenta, tono vagal y ansiedad',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8481564/',
      },
      {
        label: 'Frontiers in Psychology 2024 — Hipnoterapia dirigida al intestino en SII',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11181908/',
      },
    ],
  },
];

/** Devuelve un bono por su slug, o undefined si no existe. */
export function getBonusGuide(slug: string): BonusGuide | undefined {
  return BONUS_GUIDES.find((g) => g.slug === slug);
}
