'use client';

import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'text-white font-semibold uppercase tracking-wider',
    'hover:shadow-[0_6px_28px_rgba(192,85,58,0.45)] hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-md',
    'disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0',
  ].join(' '),
  secondary: [
    'bg-transparent text-[#C0553A] font-semibold uppercase tracking-wider',
    'border-2 border-[#C0553A]',
    'hover:bg-[#FFF5F0]',
    'active:translate-y-0',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'bg-transparent font-normal normal-case tracking-normal',
    'underline underline-offset-2',
    'hover:opacity-80',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      href,
      loading = false,
      children,
      className = '',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const primaryStyle = variant === 'primary'
      ? { background: 'linear-gradient(135deg, #C0553A 0%, #D4785C 100%)', boxShadow: '0 4px 20px rgba(192,85,58,0.35)' }
      : {};

    const baseClasses = [
      'inline-flex items-center justify-center gap-2',
      'rounded-full',
      'transition-all duration-200 ease-out',
      'cursor-pointer select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0553A] focus-visible:ring-offset-2',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(' ');

    if (href) {
      return (
        <a
          href={href}
          className={baseClasses}
          style={primaryStyle}
          onClick={
            onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>
          }
        >
          {loading ? <Spinner /> : children}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={baseClasses}
        style={primaryStyle}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default Button;
