'use client';

import { motion } from 'framer-motion';
import { Lock } from '@phosphor-icons/react';

type WeekTabsProps = {
  activeWeek: number;
  onWeekChange: (week: number) => void;
  lockedWeeks: number[];
};

const weeks = [1, 2, 3, 4];

export default function WeekTabs({ activeWeek, onWeekChange, lockedWeeks }: WeekTabsProps) {
  return (
    <div className="flex gap-2">
      {weeks.map((week) => {
        const isActive = week === activeWeek;
        const isLocked = lockedWeeks.includes(week);

        return (
          <button
            key={week}
            onClick={() => !isLocked && onWeekChange(week)}
            disabled={isLocked}
            className={`relative flex-1 py-2.5 px-3 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'text-white'
                : isLocked
                ? 'bg-gray-100 text-charcoal/30 cursor-not-allowed'
                : 'bg-white text-charcoal/60 hover:bg-sage-soft'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeWeekTab"
                className="absolute inset-0 bg-sage rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1">
              {isLocked && <Lock size={12} weight="bold" />}
              Sem {week}
            </span>
          </button>
        );
      })}
    </div>
  );
}
