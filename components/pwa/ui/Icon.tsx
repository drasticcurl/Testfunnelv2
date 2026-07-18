/**
 * Icon — the single iconography primitive for the PWA.
 *
 * Wraps `@phosphor-icons/react` (one consistent icon set) and maps a small,
 * enumerated `name` set to Phosphor components, so no screen mixes differing
 * icon styles for the same role (Requirement 7.1).
 *
 * Sizing comes from the named icon-size Design_Tokens (`--icon-sm/md/lg`) via the
 * Tailwind `w-icon-*`/`h-icon-*` utilities (Requirement 7.2); color comes from a
 * named color Design_Token utility (`currentColor` by default, driven by a
 * `text-*` token class on an ancestor), never a literal value (Requirement 7.3).
 *
 * Accessibility (Requirements 7.4, 7.5):
 *  - A decorative icon (`decorative` true, or no `label`) is hidden from
 *    assistive technology (`aria-hidden="true"`) and exposes no accessible name.
 *  - A meaningful icon (non-empty `label`, not `decorative`) exposes exactly that
 *    label as its accessible name (`role="img"` + `aria-label`) and is NOT hidden.
 *
 * An unknown `name` resolves to a safe default icon and logs in development; it
 * never throws (see Error Handling in design.md).
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { House } from '@phosphor-icons/react/dist/csr/House';
import { ListChecks } from '@phosphor-icons/react/dist/csr/ListChecks';
import { Notebook } from '@phosphor-icons/react/dist/csr/Notebook';
import { ForkKnife } from '@phosphor-icons/react/dist/csr/ForkKnife';
import { BookOpen } from '@phosphor-icons/react/dist/csr/BookOpen';
import { Crown } from '@phosphor-icons/react/dist/csr/Crown';
import { Fire } from '@phosphor-icons/react/dist/csr/Fire';
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { ShareNetwork } from '@phosphor-icons/react/dist/csr/ShareNetwork';
import { DownloadSimple } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { Warning } from '@phosphor-icons/react/dist/csr/Warning';
import { WarningCircle } from '@phosphor-icons/react/dist/csr/WarningCircle';
import { Info } from '@phosphor-icons/react/dist/csr/Info';
import { Question } from '@phosphor-icons/react/dist/csr/Question';

/** The enumerated, role-named icon set the PWA may render. */
export type IconName =
  | 'home'
  | 'plan'
  | 'diary'
  | 'recipes'
  | 'guides'
  | 'vip'
  | 'streak'
  | 'back'
  | 'add'
  | 'close'
  | 'share'
  | 'download'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/** Named icon-size tokens (`--icon-sm/md/lg`). */
export type IconSize = 'sm' | 'md' | 'lg';

/** Map each role name to its Phosphor component (one consistent icon set). */
const ICON_MAP: Record<IconName, PhosphorIcon> = {
  home: House,
  plan: ListChecks,
  diary: Notebook,
  recipes: ForkKnife,
  guides: BookOpen,
  vip: Crown,
  streak: Fire,
  back: ArrowLeft,
  add: Plus,
  close: X,
  share: ShareNetwork,
  download: DownloadSimple,
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
  info: Info,
};

/** Safe default rendered for an unknown name (never throws). */
const FALLBACK_ICON: PhosphorIcon = Question;

/** Tailwind size utilities backed by the `--icon-sm/md/lg` tokens. */
const SIZE_CLASS: Record<IconSize, string> = {
  sm: 'w-icon-sm h-icon-sm',
  md: 'w-icon-md h-icon-md',
  lg: 'w-icon-lg h-icon-lg',
};

export interface IconProps {
  /** The enumerated role name to render. */
  name: IconName;
  /** Named token size (default `md`). */
  size?: IconSize;
  /**
   * Accessible label. When provided (and not `decorative`), the icon conveys
   * meaning and exposes this label to assistive technology.
   */
  label?: string;
  /**
   * Force the icon to be purely decorative (hidden from assistive technology),
   * even if a label is provided. Defaults to `false`.
   */
  decorative?: boolean;
  /** Optional extra classes (e.g. a `text-*` color token utility). */
  className?: string;
}

/**
 * Render an enumerated icon at a token size and token color, with accessibility
 * driven by its role (decorative vs meaningful).
 */
export function Icon({
  name,
  size = 'md',
  label,
  decorative = false,
  className,
}: IconProps) {
  const Component = ICON_MAP[name] ?? FALLBACK_ICON;

  if (!ICON_MAP[name] && process.env.NODE_ENV !== 'production') {
    // Dev-time aid only; never throws in any environment.
    // eslint-disable-next-line no-console
    console.warn(`[Icon] Unknown icon name "${name}"; rendering safe default.`);
  }

  const meaningful = !decorative && typeof label === 'string' && label.length > 0;

  const classes = [SIZE_CLASS[size], className].filter(Boolean).join(' ');

  if (meaningful) {
    // Meaningful: exposed to assistive tech with an accessible name.
    return (
      <Component
        className={classes}
        color="currentColor"
        role="img"
        aria-label={label}
      />
    );
  }

  // Decorative: hidden from assistive technology, no accessible name.
  return (
    <Component
      className={classes}
      color="currentColor"
      aria-hidden="true"
      focusable={false}
    />
  );
}

export default Icon;
