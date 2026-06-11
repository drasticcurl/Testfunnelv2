/**
 * @file config.ts — Configuracion centralizada del quiz funnel.
 *
 * PARA REUTILIZAR CON OTRO NICHO:
 * Este es EL archivo principal que tenes que cambiar. Aca esta todo lo que
 * define la "tematica" del funnel: nombre del producto, nutricionista,
 * checkout URL, banners estacionales, tipos de problema, textos de dolor,
 * y bonus por respuesta.
 *
 * Junto con data.ts (preguntas) y localization.ts (precios/textos por pais),
 * son los 3 archivos que definen el contenido del funnel. El resto es
 * infraestructura reutilizable.
 */

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTO
// ═══════════════════════════════════════════════════════════════════════════

/** Nombre del producto como aparece en la sales page y la app. */
export const PRODUCT_NAME = 'Protocolo Chau Hinchazón';

/** Nombre corto para badges, CTAs compactos. */
export const PRODUCT_SHORT_NAME = 'Chau Hinchazón';

/**
 * Nombre del producto del UPSELL/DOWNSELL. Es el MISMO Programa de 30 Días,
 * con la marca "TURBO" del VSL del upsell (ver docs/ad-scripts/vsl-upsell-turbo.md).
 * Fuente única: cambiá el nombre acá y se propaga al checkout del upsell y a /downsell.
 */
export const UPSELL_PRODUCT_NAME = 'Programa de 30 Días TURBO';

/** Nombre de la profesional/experta que respalda el producto. */
export const EXPERT_NAME = 'Natalia Reyes';

/** Titulo profesional de la experta. */
export const EXPERT_TITLE = 'Nutricionista · Especialista en salud digestiva';

/** Imagen de la experta (ruta en /public). */
export const EXPERT_IMAGE = '/img/natalia-reyes.jpg';

/**
 * URL de checkout del producto FRONT. Provider-neutral (Shopify/Hotmart/etc).
 * Para Shopify usar un permalink de carrito: https://TIENDA/cart/{VARIANT_ID}:1
 *
 * Orden de precedencia:
 *   1. NEXT_PUBLIC_CHECKOUT_URL          (nuevo, provider-neutral)
 *   2. NEXT_PUBLIC_HOTMART_CHECKOUT_URL  (legacy, fallback para no romper)
 *   3. placeholder (no procesa pagos)
 */
export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_URL ||
  process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ||
  'https://checkout.placeholder.invalid/PLACEHOLDER';

// ═══════════════════════════════════════════════════════════════════════════
// PRECIOS DEL FUNNEL — FUENTE ÚNICA DE VERDAD (todo en ARS)
// Antes los precios estaban hardcodeados y desincronizados en cada pagina
// (el front decia $6.000 en el quiz pero $9.990 en el ancla del upsell, y el
// tracking mandaba dolares inventados). Ahora TODO sale de aca.
//
// Reglas:
//  - `amount`  = numero crudo en ARS. Es lo que se manda a Meta (value + currency).
//  - `display` = string formateado para mostrar en pantalla.
//  - Cambiar un precio se hace SOLO aca y se propaga a todas las paginas.
//
// IMPORTANTE (tracking): el Purchase REAL lo dispara el webhook de Hotmart
// server-side con el monto que cobra Hotmart. Estos `amount` se usan para los
// eventos de intencion (InitiateCheckout/ViewContent), no para el Purchase.
// ═══════════════════════════════════════════════════════════════════════════

export const PRICING_CURRENCY = 'ARS';

export const PRICING = {
  /** Producto principal (final del quiz). Plan 7 dias + app. */
  front: { amount: 6000, display: '$6.000', displayOriginal: '$18.000' },
  /** Upsell post-compra: Programa 30 dias completo (incluye recetario de postres). */
  upsell: { amount: 14900, display: '$14.900', displayOriginal: '$39.990' },
  /** Downsell: mismo Programa 30 dias, solo bajada de precio si rechazan el upsell. */
  downsell: { amount: 9900, display: '$9.900' },
} as const;

/**
 * URL del checkout del UPSELL (Programa 30 dias). Provider-neutral.
 * Shopify: permalink de carrito del producto upsell.
 * Precedencia: NEXT_PUBLIC_UPSELL_CHECKOUT_URL → legacy HOTMART → vacío.
 */
export const UPSELL_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_UPSELL_CHECKOUT_URL ||
  process.env.NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL ||
  '';

/**
 * URL del checkout del DOWNSELL (mismo producto, precio menor). Provider-neutral.
 * Precedencia: NEXT_PUBLIC_DOWNSELL_CHECKOUT_URL → legacy HOTMART → vacío.
 */
export const DOWNSELL_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_DOWNSELL_CHECKOUT_URL ||
  process.env.NEXT_PUBLIC_HOTMART_DOWNSELL_CHECKOUT_URL ||
  '';

/** URL base de la PWA (a donde va el "no gracias" final). */
export const PWA_BASE_URL =
  process.env.NEXT_PUBLIC_PWA_BASE_URL || 'https://chauhinchazon.hilvanapp.com/pwa/login';

// ═══════════════════════════════════════════════════════════════════════════
// BANNERS ESTACIONALES POR HEMISFERIO
// Cambia el texto segun la estacion del pais del usuario.
// PARA REUTILIZAR: ajusta los textos a tu nicho. La logica de seleccion
// por pais se mantiene igual.
// ═══════════════════════════════════════════════════════════════════════════

/** Banner de la landing cover (slide 0). */
export const SEASON_BANNER: Record<string, string> = {
  AR: 'Ultimos dias de otono — arranca antes del invierno',
  CL: 'Ultimos dias de otono — arranca antes del invierno',
  PE: 'Oferta especial de temporada',
  CO: 'Oferta especial de temporada',
  MX: 'Oferta especial de verano',
};

/** Banner de la countdown bar en la sales page. Recibe el tiempo restante. */
export const SEASON_DISCOUNT: Record<string, (time: string) => string> = {
  AR: (t) => `❄️ Precio especial fin de otono: 64% off por ${t}`,
  CL: (t) => `❄️ Precio especial fin de otono: 64% off por ${t}`,
  PE: (t) => `🔥 Oferta de temporada: 64% off por ${t}`,
  CO: (t) => `🔥 Oferta de temporada: 64% off por ${t}`,
  MX: (t) => `☀️ Oferta de verano: 64% off por ${t}`,
};

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DE RESULTADO DEL QUIZ (la "temática" del funnel)
// Esta es la ÚNICA fuente de verdad para los nombres de los 4 tipos que el
// quiz puede detectar. Antes estaba duplicado en 3 componentes + 1 API route;
// ahora todos importan de acá.
//
// PARA REUTILIZAR CON OTRO NICHO: cambia SOLO los valores (los strings que ve
// el usuario, ej: "Ansiedad Matutina", "Insomnio Crónico"). No hace falta
// tocar nada más: el scoring usa los números 1–4, no los textos.
// ═══════════════════════════════════════════════════════════════════════════

/** Nombres de los 4 tipos de resultado que detecta el quiz (1–4). */
export const QUIZ_RESULT_TYPE_NAMES: Record<number, string> = {
  1: 'Hinchazón Matutina',
  2: 'Hinchazón Postprandial',
  3: 'Hinchazón Vespertina',
  4: 'Hinchazón Crónica',
};

/**
 * @deprecated Usar `QUIZ_RESULT_TYPE_NAMES`. Alias mantenido para no romper
 * imports existentes; apunta al mismo objeto.
 */
export const TIPO_NOMBRES = QUIZ_RESULT_TYPE_NAMES;

/**
 * Bullets del "espejo de dolor" por tipo.
 * Se muestran en la seccion "Reframe" de la sales page para que la persona
 * se sienta identificada y entienda la causa de su problema.
 *
 * PARA REUTILIZAR: escribe 3 bullets por tipo que:
 *  1. Nombren el sintoma especifico
 *  2. Expliquen la causa real (educacion)
 *  3. Prometan el resultado con timeline
 */
export const REFRAME_BULLETS: Record<number, string[]> = {
  1: [
    'Tu inflamacion matutina indica que tu intestino no descansa bien durante la noche.',
    'El protocolo incluye una rutina nocturna que resetea tu sistema digestivo.',
    'Desde el dia 2 vas a notar que te levantas con la panza plana.',
  ],
  2: [
    'Tu intestino no procesa bien ciertas combinaciones de alimentos.',
    'El protocolo identifica los 7 alimentos que te fermentan y los elimina.',
    'Desde el dia 3 vas a poder almorzar sin inflarte despues.',
  ],
  3: [
    'La hinchazon que se acumula durante el dia indica estres digestivo cronico.',
    'El protocolo incluye una rutina antiinflamatoria vespertina de 5 minutos.',
    'En 7 dias tu panza va a dejar de "crecer" a lo largo del dia.',
  ],
  4: [
    'La hinchazon constante indica disbiosis intestinal avanzada.',
    'El protocolo hace un reset completo de tu microbiota en 7 dias.',
    'Es el caso que mas mejora porque tenes mas margen de cambio.',
  ],
};

/**
 * Items extra del value stack por tipo.
 * Se muestran como bonus adicional en la sales page segun el tipo detectado.
 *
 * PARA REUTILIZAR: agrega 1 item extra por tipo que sea relevante al subtipo.
 */
export const EXTRA_VALUE_ITEMS: Record<number, { icon: string; title: string; desc: string }[]> = {
  1: [
    { icon: '🌙', title: 'Guia de rutina nocturna reparadora', desc: 'Protocolo pre-sueno para que tu intestino descanse y te levantes deshinchada.' },
  ],
  2: [
    { icon: '🥗', title: 'Tabla de combinacion de alimentos', desc: 'Sabe exactamente que mezclar y que no para evitar fermentacion post-comida.' },
  ],
  3: [
    { icon: '🧘', title: 'Rutina antiinflamatoria vespertina (5 min)', desc: 'Ejercicios de respiracion + masaje abdominal para deshinchar al final del dia.' },
  ],
  4: [
    { icon: '🔄', title: 'Protocolo de reset intestinal intensivo', desc: 'Plan reforzado de 3 dias para los casos mas persistentes. Reset completo.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// BONUS POR RESPUESTA
// El bonus se desbloquea segun las respuestas del usuario al quiz.
// PARA REUTILIZAR: cambia las condiciones y los textos del bonus.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Devuelve el titulo del bonus desbloqueado segun las respuestas del quiz.
 * La logica prioriza: estres alto > evento proximo > sedentarismo > default.
 */
export function getBonusTitle(answers: Record<string, unknown>): string {
  if (answers.estres === 'alto') return 'Guia de manejo del estres digestivo';
  if (answers.evento_importante && answers.evento_importante !== 'no')
    return 'Plan express pre-evento (deshinchate en 48hs)';
  if (answers.ejercicio === 'no') return 'Rutina de 5 minutos sin ejercicio';
  return 'Checklist de alimentos antiinflamatorios por tipo';
}

/**
 * Devuelve la descripcion del bonus desbloqueado.
 */
export function getBonusDesc(answers: Record<string, unknown>): string {
  if (answers.estres === 'alto')
    return 'Tu estres alto activa la inflamacion intestinal. Esta guia te ensena tecnicas rapidas para cortarlo.';
  if (answers.evento_importante && answers.evento_importante !== 'no')
    return 'Protocolo intensivo de 48hs para llegar deshinchada a tu evento. Funciona siempre.';
  if (answers.ejercicio === 'no')
    return 'No necesitas moverte mucho. 5 minutos de auto-masaje abdominal + respiracion = panza plana.';
  return 'Lista personalizada de que comer y que evitar segun tu Tipo de Hinchazon.';
}

// ═══════════════════════════════════════════════════════════════════════════
// LABELS DE OBJETIVO
// Mapea la respuesta de "objetivo" a texto legible para la sales page.
// ═══════════════════════════════════════════════════════════════════════════

export const OBJETIVO_LABEL: Record<string, string> = {
  panza_plana: 'Deshinchar tu panza',
  liviana: 'Sentirte liviana despues de comer',
  digestion: 'Mejorar tu digestion',
  todo: 'Deshincharte, sentirte liviana y mejorar tu digestion',
};
