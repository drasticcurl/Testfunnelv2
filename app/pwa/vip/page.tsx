'use client';

/**
 * /pwa/vip — sección VIP de la PWA, bloqueada por un código estático.
 *
 * Candado SIN base de datos ni autenticación: el código (`VIPLATAM`) se valida
 * localmente contra config (`lib/pwa/vip-access.ts`) y el estado de desbloqueo
 * se persiste SOLO en `localStorage` de este dispositivo. El mismo código
 * desbloquea la sección tanto si la compra vino del upsell 2 (US$27) como del
 * downsell 2 (US$17): es el mismo producto VIP.
 *
 * Desbloqueo automático: la URL de entrega post-compra es
 * `/pwa/vip?code=VIPLATAM`, así el comprador entra sin tipear nada.
 *
 * Estados:
 *   'locked'   → input de código + botón. Código correcto → persiste y desbloquea.
 *   'unlocked' → hub con el contenido VIP real (todo EXTRA de lo que ya trae la
 *                app base): herramientas, recetario premium, masterclasses,
 *                mini-guías express y protocolos. El contenido vive
 *                en lib/pwa/vip-content.ts y lib/pwa/vip-recipes.ts.
 *
 * IMPORTANTE (fix de "sección vacía"): el contenido del hub NO depende de una
 * animación orquestada (variants + staggerChildren). Cada elemento anima de
 * forma independiente con su propio initial/animate, así si la animación no se
 * dispara, el contenido igual queda visible (nunca atascado en opacity:0).
 */

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  validateVipCode,
  persistVipUnlocked,
  isVipUnlocked,
} from '@/lib/pwa/vip-access';
import { getVipGuidesByCategory } from '@/lib/pwa/vip-content';
import { Button } from '@/components/pwa/ui/Button';
import { TextInput } from '@/components/pwa/ui/TextInput';

const LOCKED_ERROR = 'Código inválido. Revisá el email de tu compra VIP.';

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const;

/** Beneficios del estatus VIP (no son contenido navegable, son la promesa). */
const VIP_PERKS = [
  { icon: '♾️', label: 'Acceso de por vida' },
  { icon: '🏅', label: 'Nivel VIP' },
  { icon: '🛡️', label: 'Actualizaciones incluidas' },
];

type LinkCard = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
};

function HubCard({ card }: { card: LinkCard }) {
  return (
    <motion.div initial={fadeIn.initial} animate={fadeIn.animate} transition={fadeIn.transition}>
      <Link
        href={card.href}
        className="block bg-warm rounded-2xl p-5 shadow-sm border border-warm-border hover:border-terracotta/30 transition-colors group"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-terracotta-soft flex items-center justify-center flex-shrink-0">
            <span className="text-xl" aria-hidden="true">{card.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-body font-semibold text-charcoal text-[15px] leading-snug">{card.title}</h3>
              <span className="text-charcoal/30 group-hover:text-terracotta transition-colors text-lg flex-shrink-0">→</span>
            </div>
            <p className="font-body text-charcoal/50 text-xs mt-1 leading-relaxed">{card.desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-xs uppercase tracking-wider text-charcoal/40 font-medium pt-2">
      {children}
    </p>
  );
}

function PwaVipContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'locked' | 'unlocked'>('locked');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // onMount → desbloqueo automático si:
  //   1. el flag ya está persistido en este dispositivo, o
  //   2. la URL trae ?code=<código VIP> válido (link de entrega post-compra
  //      del upsell 2 / downsell 2). El auto-desbloqueo persiste el flag, así
  //      las próximas visitas ya no necesitan el parámetro en la URL.
  useEffect(() => {
    if (isVipUnlocked()) {
      setMode('unlocked');
      return;
    }
    const urlCode = searchParams.get('code');
    if (urlCode && validateVipCode(urlCode)) {
      persistVipUnlocked();
      setMode('unlocked');
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateVipCode(code)) {
      persistVipUnlocked();
      setError(null);
      setMode('unlocked');
    } else {
      setError(LOCKED_ERROR);
    }
  };

  if (mode === 'unlocked') {
    const masterclasses = getVipGuidesByCategory('masterclass');
    const miniGuias = getVipGuidesByCategory('mini-guia');
    const protocolos = getVipGuidesByCategory('protocolo');

    const herramientas: LinkCard[] = [
      {
        href: '/pwa/vip/planner',
        emoji: '🗓️',
        title: 'Planner premium imprimible',
        desc: 'Tu semana en una hoja: ritual, comidas, agua y síntomas.',
      },
    ];

    return (
      <div className="space-y-4 pb-4">
        {/* Header VIP */}
        <motion.div
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={fadeIn.transition}
          className="bg-gradient-to-br from-terracotta/10 to-terracotta-soft rounded-2xl p-5 border border-terracotta/15"
        >
          <p className="font-body text-charcoal/60 text-sm">Acceso desbloqueado 👑</p>
          <h1 className="font-heading text-xl font-semibold text-charcoal mt-1">
            Tu Acceso VIP de por vida
          </h1>
          <p className="font-body text-charcoal/60 text-sm mt-2 leading-relaxed">
            Todo tu contenido premium en un solo lugar. Vamos sumando material —
            ya tenés incluidas todas las actualizaciones futuras.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {VIP_PERKS.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1 font-body text-[11px] font-medium bg-warm/70 text-charcoal/70 px-2.5 py-1 rounded-full border border-terracotta/15"
              >
                <span aria-hidden="true">{p.icon}</span> {p.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Herramientas */}
        <SectionTitle>Herramientas</SectionTitle>
        {herramientas.map((c) => (
          <HubCard key={c.href} card={c} />
        ))}

        {/* Recetario premium */}
        <SectionTitle>Recetario premium</SectionTitle>
        <HubCard
          card={{
            href: '/pwa/recetas#premium',
            emoji: '🍲',
            title: 'Recetario premium ampliado',
            desc: 'Postres ricos que no inflan + platos premium, dentro de tu recetario.',
          }}
        />

        {/* Masterclasses */}
        <SectionTitle>Biblioteca de masterclasses</SectionTitle>
        {masterclasses.map((g) => (
          <HubCard
            key={g.slug}
            card={{
              href: `/pwa/vip/guia/${g.slug}`,
              emoji: g.emoji,
              title: g.title,
              desc: g.cardDescription,
            }}
          />
        ))}

        {/* Mini-guías express */}
        <SectionTitle>Mini-guías express</SectionTitle>
        {miniGuias.map((g) => (
          <HubCard
            key={g.slug}
            card={{
              href: `/pwa/vip/guia/${g.slug}`,
              emoji: g.emoji,
              title: g.title,
              desc: g.cardDescription,
            }}
          />
        ))}

        {/* Protocolos */}
        <SectionTitle>Protocolos</SectionTitle>
        {protocolos.map((g) => (
          <HubCard
            key={g.slug}
            card={{
              href: `/pwa/vip/guia/${g.slug}`,
              emoji: g.emoji,
              title: g.title,
              desc: g.cardDescription,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="w-16 h-16 rounded-2xl bg-terracotta-soft flex items-center justify-center mb-5">
        <span className="text-3xl" aria-hidden="true">🔒</span>
      </div>
      <h1 className="font-heading text-2xl font-semibold text-charcoal">Sección VIP</h1>
      <p className="font-body text-charcoal/60 text-sm mt-2 max-w-xs leading-relaxed">
        Ingresá el código que recibiste por email al comprar tu Acceso VIP para desbloquear
        todo el contenido exclusivo.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs mt-6 space-y-3">
        <TextInput
          id="vip-code"
          label="Código VIP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Tu código VIP"
          autoComplete="off"
          autoCapitalize="characters"
          className="text-center font-medium tracking-wider"
        />
        {error && (
          <p role="alert" className="font-body text-error text-sm font-medium">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" className="w-full">
          Desbloquear acceso VIP
        </Button>
      </form>
    </motion.div>
  );
}

export default function PwaVipPage() {
  return (
    <Suspense fallback={null}>
      <PwaVipContent />
    </Suspense>
  );
}
