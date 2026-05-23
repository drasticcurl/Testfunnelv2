'use client';

import Link from 'next/link';

export type DayCardStatus = 'completed' | 'available' | 'locked-progress' | 'locked-tier';

interface DayCardProps {
  day: number;
  title: string;
  subtitle: string;
  status: DayCardStatus;
}

export default function DayCard({ day, title, subtitle, status }: DayCardProps) {
  const baseClasses = 'rounded-[16px] p-4 transition-all duration-200 border-2';

  const statusConfig = {
    completed: {
      bg: 'bg-sage-soft border-sage',
      icon: '✓',
      iconBg: 'bg-sage text-white',
      textColor: 'text-charcoal',
      subtitleColor: 'text-gray-600',
      clickable: true,
    },
    available: {
      bg: 'bg-white border-sage shadow-sm hover:shadow-md hover:-translate-y-0.5',
      icon: '🔓',
      iconBg: 'bg-sage-soft text-sage',
      textColor: 'text-charcoal',
      subtitleColor: 'text-gray-600',
      clickable: true,
    },
    'locked-progress': {
      bg: 'bg-gray-100 border-gray-100 opacity-60',
      icon: '🔒',
      iconBg: 'bg-gray-200 text-gray-400',
      textColor: 'text-gray-400',
      subtitleColor: 'text-gray-400',
      clickable: false,
    },
    'locked-tier': {
      bg: 'bg-gray-100 border-gray-100',
      icon: '🔒',
      iconBg: 'bg-gray-200 text-gray-400',
      textColor: 'text-gray-400',
      subtitleColor: 'text-gray-400',
      clickable: false,
    },
  };

  const config = statusConfig[status];

  const content = (
    <div className={`${baseClasses} ${config.bg}`}>
      <div className="flex items-start gap-3">
        {/* Day number + icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${config.iconBg}`}>
          {status === 'completed' ? (
            <span className="text-base">✓</span>
          ) : (
            <span className="text-xs font-bold">{day}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-sm ${config.textColor} truncate`}>
              Día {day}
            </h3>
            {status === 'completed' && (
              <span className="text-xs bg-sage text-white px-2 py-0.5 rounded-full">
                Completado
              </span>
            )}
          </div>
          <p className={`text-sm font-medium ${config.textColor} mt-0.5 truncate`}>
            {title}
          </p>
          <p className={`text-xs ${config.subtitleColor} mt-0.5 truncate`}>
            {subtitle}
          </p>
          {status === 'locked-tier' && (
            <p className="text-xs text-coral font-medium mt-1">
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
