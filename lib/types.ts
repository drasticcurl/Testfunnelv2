// ============ QUIZ TYPES ============

export type Gender = 'hombre' | 'mujer';

export type InsomniaTipo = 'mente_acelerada' | 'despertador' | 'zombi' | 'irregular';

export interface QuizResult {
  tipo: InsomniaTipo;
  tipoNombre: string;
  tipoDescripcion: string;
  severidad: number; // 1-10
  genero: Gender;
  email: string;
  nombre?: string;
}

export type SlideType =
  | 'gender'
  | 'single'
  | 'multi'
  | 'email'
  | 'name'
  | 'loading'
  | 'result'
  | 'sales'
  | 'info_card'
  | 'social_proof'
  | 'profile'
  | 'checkpoint'
  | 'plan_preview'
  | 'weekly_progress';

export interface SlideOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface SlideDefinition {
  id: string;
  type: SlideType;
  question?: string;
  subtitle?: string;
  options?: SlideOption[];
  genderSpecific?: Gender; // si solo se muestra para un género
  multiSelect?: boolean;
  infoContent?: {
    title: string;
    body: string;
    icon?: string;
  };
  testimonial?: {
    name: string;
    age: number;
    text: string;
  };
}

// ============ DATABASE TYPES ============

export interface SleepLead {
  id?: string;
  email: string;
  nombre?: string;
  genero: Gender;
  tipo_insomnio: InsomniaTipo;
  severidad: number;
  respuestas: Record<string, string | string[]>;
  created_at?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface SleepUser {
  id?: string;
  email: string;
  nombre?: string;
  genero: Gender;
  tipo_insomnio: InsomniaTipo;
  plan: 'front' | 'upsell';
  created_at?: string;
  hotmart_transaction_id?: string;
}

export interface SleepDiary {
  id?: string;
  user_email: string;
  date: string;
  hora_acostar: string;
  hora_dormir: string;
  despertares: number;
  calidad: number; // 1-10
  energia_dia: number; // 1-10
  notas?: string;
  created_at?: string;
}

// ============ TRACKING TYPES ============

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export type TrackingEvent = 'QuizStart' | 'QuizComplete' | 'ViewContent' | 'InitiateCheckout';

// ============ INSOMNIA TIPO MAP ============

export const TIPO_MAP: Record<InsomniaTipo, { nombre: string; descripcion: string }> = {
  mente_acelerada: {
    nombre: 'El Mente Acelerada',
    descripcion: 'Tu cerebro no frena cuando necesitás descansar. Los pensamientos se acumulan justo al apagar la luz.',
  },
  despertador: {
    nombre: 'El Despertador',
    descripcion: 'Te dormís sin problema pero te despertás a las 2-4am y no podés volver a conciliar el sueño.',
  },
  zombi: {
    nombre: 'El Zombi',
    descripcion: 'Dormís las horas pero tu cuerpo no recupera. Te levantás destruido/a sin importar cuánto duermas.',
  },
  irregular: {
    nombre: 'El Irregular',
    descripcion: 'Tu reloj interno está completamente desincronizado. No tenés horario y tu ritmo circadiano está roto.',
  },
};
