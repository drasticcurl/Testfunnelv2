/**
 * Sistema de diseño del panel admin — dark mode, moderno.
 *
 * Primitivos presentacionales compartidos por todas las vistas del admin
 * (Resumen, Embudo, Leads, Ventas). Sin hooks: se pueden usar tanto en
 * server como en client components.
 *
 * Paleta (dark):
 *   - Fondo página:  #0a0a0f
 *   - Superficies:   #13131a / white/[0.02]
 *   - Bordes:        white/[0.06]
 *   - Texto:         neutral-100 (fuerte) / neutral-400 (suave) / neutral-500 (mute)
 *   - Acentos:       emerald (revenue/ok), violet (funnel), sky (leads),
 *                    amber (warning), rose (caída/refund)
 */

import type { ReactNode } from 'react';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// ─── Acentos ─────────────────────────────────────────────────────────────────

export type Accent = 'emerald' | 'violet' | 'sky' | 'amber' | 'rose' | 'neutral';

const ACCENT_ICON: Record<Accent, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20',
  violet: 'bg-violet-500/15 text-violet-300 ring-violet-500/20',
  sky: 'bg-sky-500/15 text-sky-300 ring-sky-500/20',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/20',
  rose: 'bg-rose-500/15 text-rose-300 ring-rose-500/20',
  neutral: 'bg-white/[0.06] text-neutral-300 ring-white/10',
};

const ACCENT_TEXT: Record<Accent, string> = {
  emerald: 'text-emerald-400',
  violet: 'text-violet-400',
  sky: 'text-sky-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  neutral: 'text-neutral-300',
};

// ─── Card ──────────────────────────────────────────────────────────────────

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-[#13131a] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_8px_24px_-12px_rgba(0,0,0,0.6)]',
        hover && 'transition-colors hover:border-white/[0.12]',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── SectionCard (card con header) ───────────────────────────────────────────

export function SectionCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={className}>
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-neutral-300 ring-1 ring-white/10">
                {icon}
              </span>
            )}
            <div>
              {title && <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </Card>
  );
}

// ─── StatCard (KPI) ──────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  accent = 'neutral',
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  accent?: Accent;
  className?: string;
}) {
  return (
    <Card hover className={cn('group relative overflow-hidden p-4', className)}>
      {/* glow sutil del acento */}
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-70',
          accent === 'emerald' && 'bg-emerald-500/20',
          accent === 'violet' && 'bg-violet-500/20',
          accent === 'sky' && 'bg-sky-500/20',
          accent === 'amber' && 'bg-amber-500/20',
          accent === 'rose' && 'bg-rose-500/20',
          accent === 'neutral' && 'bg-white/5',
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-neutral-400">{label}</div>
          <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-neutral-50">
            {value}
          </div>
          {subtitle && <div className="mt-1 text-xs text-neutral-500">{subtitle}</div>}
        </div>
        {icon && (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1',
              ACCENT_ICON[accent],
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
}

// ─── Badge / Pill ────────────────────────────────────────────────────────────

export function Badge({
  children,
  accent = 'neutral',
  className,
}: {
  children: ReactNode;
  accent?: Accent;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
        ACCENT_ICON[accent],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Botones ─────────────────────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  disabled,
  variant = 'secondary',
  type = 'button',
  className,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  className?: string;
  title?: string;
}) {
  const styles: Record<string, string> = {
    primary:
      'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 ring-1 ring-emerald-400/30',
    secondary:
      'bg-white/[0.04] text-neutral-200 hover:bg-white/[0.08] ring-1 ring-white/10',
    ghost: 'text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-100',
    danger:
      'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 ring-1 ring-rose-500/20',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ─── Estados ─────────────────────────────────────────────────────────────────

export function Banner({
  children,
  tone = 'warning',
}: {
  children: ReactNode;
  tone?: 'warning' | 'error' | 'info';
}) {
  const map = {
    warning: 'border-amber-500/20 bg-amber-500/[0.08] text-amber-200',
    error: 'border-rose-500/20 bg-rose-500/[0.08] text-rose-200',
    info: 'border-sky-500/20 bg-sky-500/[0.08] text-sky-200',
  };
  return (
    <div className={cn('rounded-xl border px-4 py-2.5 text-xs', map[tone])}>{children}</div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/80',
        className,
      )}
    />
  );
}

export function accentText(accent: Accent): string {
  return ACCENT_TEXT[accent];
}

// ─── Formatters ──────────────────────────────────────────────────────────────

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString('es-AR');
}

export function formatMoney(amount: number, currency: string = 'USD'): string {
  const upper = currency.toUpperCase();
  const isARS = upper === 'ARS';
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: upper,
      minimumFractionDigits: isARS ? 0 : 2,
      maximumFractionDigits: isARS ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
  }
}

export function formatPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(digits)}%`;
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `hace ${diffD} d`;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
