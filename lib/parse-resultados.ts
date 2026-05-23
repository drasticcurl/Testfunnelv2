/**
 * Parser de query params de /resultados + diccionarios de personalizacion.
 *
 * Fuente de verdad: docs/03-RESULTADOS.md
 *
 * Toda la pagina de resultados es un Server Component que recibe los params
 * via la URL construida por buildResultsUrl() del Agente 02.
 *
 * El producto vendido es una PWA interactiva (app en el celular), no un PDF.
 * Precio: $9.990 ARS (~$7.15 USD) | Precio tachado: $31.950 ARS
 */

import { TipoHinchazon } from './quiz-types';

// ─── Tipos publicos ─────────────────────────────────────────────────────────

export type ResultadosParams = {
  nombre?: string;
  edad?: '25_34' | '35_44' | '45_54' | '55_mas';
  momento?: 'manana' | 'almuerzo' | 'tarde_noche' | 'todo_el_dia';
  tiempo?: 'menos_6m' | '6m_2a' | '2a_5a' | 'mas_5a';
  frecuencia?: 'diaria' | '4_6_dias' | '2_3_dias' | 'comidas_especificas';
  emocion?: 'insegura' | 'frustrada' | 'avergonzada' | 'cansada' | 'todas';
  sintomas: string[];
  probo: string[];
  tipo: TipoHinchazon;
  severidad: number;
};

/**
 * Lee searchParams (objeto plano de Next.js Server Component) y devuelve
 * un ResultadosParams tipado, con defaults seguros si faltan campos.
 */
export function parseParams(
  searchParams: Record<string, string | string[] | undefined>,
): ResultadosParams {
  const get = (k: string): string | undefined => {
    const v = searchParams[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  const tipoNum = Number(get('tipo'));
  const tipoOk: TipoHinchazon =
    tipoNum === 1 || tipoNum === 2 || tipoNum === 3 || tipoNum === 4
      ? (tipoNum as TipoHinchazon)
      : 3;

  const sevNum = Number(get('severidad'));
  const severidad =
    Number.isFinite(sevNum) && sevNum > 0 ? Math.min(Math.round(sevNum), 10) : 7;

  return {
    nombre: get('nombre'),
    edad: get('edad') as unknown as ResultadosParams['edad'],
    momento: get('momento') as unknown as ResultadosParams['momento'],
    tiempo: get('tiempo') as unknown as ResultadosParams['tiempo'],
    frecuencia: get('frecuencia') as unknown as ResultadosParams['frecuencia'],
    emocion: get('emocion') as unknown as ResultadosParams['emocion'],
    sintomas: (get('sintomas') ?? '').split(',').filter(Boolean),
    probo: (get('probo') ?? '').split(',').filter(Boolean),
    tipo: tipoOk,
    severidad,
  };
}

// ─── Diccionarios de personalizacion ────────────────────────────────────────

export const TIPOS_HINCHAZON: Record<
  TipoHinchazon,
  {
    nombre: string;
    descripcion: string;
  }
> = {
  1: {
    nombre: 'Hinchazón Matutina',
    descripcion:
      'Tu cuerpo arrastra inflamación de la noche anterior. Esto suele indicar una microbiota desequilibrada que no termina de procesar bien durante el descanso.',
  },
  2: {
    nombre: 'Hinchazón Postprandial',
    descripcion:
      'Tu sistema digestivo reacciona inflamatoriamente a alimentos específicos del almuerzo. Es de los tipos más fáciles de revertir con el protocolo correcto.',
  },
  3: {
    nombre: 'Hinchazón Inflamatoria Vespertina',
    descripcion:
      'El tipo más común en mujeres adultas. Tu intestino acumula inflamación durante el día por exposición a alimentos inflamatorios "ocultos" en tu dieta.',
  },
  4: {
    nombre: 'Hinchazón Crónica Persistente',
    descripcion:
      'Tu microbiota está significativamente desequilibrada. Necesitás un reset intestinal estructurado para recuperar la función digestiva normal.',
  },
};

export const MOMENTO_TEXTO: Record<string, string> = {
  manana: 'apenas te levantás',
  almuerzo: 'después del almuerzo',
  tarde_noche: 'a la tarde / noche',
  todo_el_dia: 'durante todo el día sin parar',
};

export const TIEMPO_TEXTO: Record<string, string> = {
  menos_6m: 'hace menos de 6 meses',
  '6m_2a': 'desde hace entre 6 meses y 2 años',
  '2a_5a': 'hace ya entre 2 y 5 años',
  mas_5a: 'desde hace más de 5 años, casi como tu normal',
};

export const EMOCIONES_TEXTO: Record<string, string> = {
  insegura: 'insegura con tu cuerpo',
  frustrada: 'frustrada porque ya probaste de todo',
  avergonzada: 'avergonzada en lo social',
  cansada: 'físicamente agotada',
  todas: 'una combinación de inseguridad, frustración y cansancio',
};

export const PROBO_TEXTO: Record<string, string> = {
  dietas: 'dietas restrictivas como keto o ayuno',
  infusiones: 'infusiones (boldo, manzanilla)',
  suplementos: 'suplementos y probióticos',
  sin_gluten: 'eliminar gluten o lactosa',
  medico: 'consultas médicas',
  nada: 'nada todavía',
};

export const FRECUENCIA_TEXTO: Record<string, string> = {
  diaria: 'todos los días',
  '4_6_dias': '4 a 6 días por semana',
  '2_3_dias': '2 a 3 días por semana',
  comidas_especificas: 'solo después de ciertas comidas',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Construye la URL de checkout de Hotmart con UTMs.
 * Post-pago, la compradora recibe acceso instantáneo a la PWA (app interactiva).
 * Si no hay env var configurada, devuelve un placeholder que NO rompe el render
 * (el cliente verá el CTA pero apuntando a "#" - esto es deliberado para staging).
 *
 * UTMs:
 *  - Por default usamos `utm_source=quiz&utm_medium=resultados&utm_campaign=lanzamiento`
 *    (pensado para trafico organico / pruebas internas).
 *  - Si llegan UTMs reales del ad (capturados en localStorage de la landing),
 *    SOBREESCRIBEN los defaults uno-a-uno. Esto preserva el `utm_content`
 *    (creativo) y permite atribuir ventas en Hotmart.
 *  - Pasamos por todos los UTMs conocidos (incluido `fbclid`) tal cual.
 *
 * Precio front end: $9.990 ARS (~$7.15 USD), tachado $31.950 ARS.
 * Bump y upsell se ofrecen dentro de Hotmart, NO en /resultados.
 */
export function buildCheckoutUrl(utms?: Record<string, string | undefined>): string {
  const base =
    process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ||
    'https://pay.hotmart.com/PLACEHOLDER';

  const params = new URLSearchParams({
    utm_source: 'quiz',
    utm_medium: 'resultados',
    utm_campaign: 'lanzamiento',
  });

  if (utms) {
    for (const [k, v] of Object.entries(utms)) {
      if (typeof v === 'string' && v.length > 0) {
        params.set(k, v);
      }
    }
  }

  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${params.toString()}`;
}
