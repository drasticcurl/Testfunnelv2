'use client';

import Link from 'next/link';
import { Icon } from '@/components/pwa/ui/Icon';

export type DayCardStatus = 'completed' | 'available' | 'locked-progress' | 'locked-tier';

interface DayCardProps {
  day: number;
  title: string;
  subtitle: string;
  status: DayCardStatus;
}

export default function DayCard({ day, title, subtitle, status }: DayCardProps) {
  const baseClasses = 'rounded-lg p-4 transition-all duration-base ease-standard border-2';

  const statusConfig = {
    completed: {
      bg: 'bg-terracotta-soft border-terracotta',
      iconBg: 'bg-terracotta text-warm',
      textColor: 'text-charcoal',
      subtitleColor: 'text-muted',
      clickable: true,
    },
    available: {
      bg: 'bg-warm border-terracotta shadow-sm hover:shadow-md hover:-translate-y-0.5',
      iconBg: 'bg-terracotta-soft text-terracotta',
      textColor: 'text-charcoal',
      subtitleColor: 'text-muted',
      clickable: true,
    },
    'locked-progress': {
      bg: 'bg-warm-border border-warm-border opacity-60',
      iconBg: 'bg-warm-border text-muted-light',
      textColor: 'text-muted-light',
      subtitleColor: 'text-muted-light',
      clickable: false,
    },
    'locked-tier': {
      bg: 'bg-warm-border border-warm-border',
      iconBg: 'bg-warm-border text-muted-light',
      textColor: 'text-muted-light',
      subtitleColor: 'text-muted-light',
      clickable: false,
    },
  };

  const config = statusConfig[status];

  const content = (
    <div className={`${baseClasses} ${config.bg}`}>
      <div className="flex items-start gap-3">
        {/* Day number + status icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-body text-sm font-semibold ${config.iconBg}`}>
          {status === 'completed' ? (
            <Icon name="success" size="sm" label="Completado" />
          ) : (
            <span className="font-body text-xs font-bold">{day}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-body font-semibold text-sm ${config.textColor} truncate`}>
              Día {day}
            </h3>
            {status === 'completed' && (
              <span className="font-body text-xs bg-terracotta text-warm px-2 py-0.5 rounded-full">
                Completado
              </span>
            )}
          </div>
          <p className={`font-body text-sm font-medium ${config.textColor} mt-0.5 truncate`}>
            {title}
          </p>
          <p className={`font-body text-xs ${config.subtitleColor} mt-0.5 truncate`}>
            {subtitle}
          </p>
          {status === 'locked-tier' && (
            <p className="font-body text-xs text-terracotta font-medium mt-1">
              🔓 Desbloquear con Programa 30 días
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (config.clickable) {
    return (
      <Link href={`/pwa/plan/${day}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
