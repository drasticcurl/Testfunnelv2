'use client';

import { SymptomLog, getEmojiForLog, formatDateShort } from '@/lib/pwa/diary-helpers';

interface DiaryEntryCardProps {
  log: SymptomLog;
}

export default function DiaryEntryCard({ log }: DiaryEntryCardProps) {
  const emoji = getEmojiForLog(log);

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-sage-soft/50">
      {/* Emoji */}
      <div className="text-2xl flex-shrink-0">{emoji}</div>

      {/* Date & Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal">{formatDateShort(log.date)}</p>
        <p className="text-xs text-charcoal/60 truncate">
          {log.symptoms.length > 0 ? log.symptoms.join(', ') : 'Sin síntomas'}
        </p>
      </div>

      {/* Bloating values */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-sage" />
          <span className="text-charcoal/70">AM {log.bloating_am}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs mt-0.5">
          <span className="inline-block w-2 h-2 rounded-full bg-coral" />
          <span className="text-charcoal/70">PM {log.bloating_pm}</span>
        </div>
      </div>
    </div>
  );
}
