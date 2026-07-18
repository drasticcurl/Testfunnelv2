'use client';

import { SymptomLog, getEmojiForLog, formatDateShort } from '@/lib/pwa/diary-helpers';

interface DiaryEntryCardProps {
  log: SymptomLog;
}

export default function DiaryEntryCard({ log }: DiaryEntryCardProps) {
  const emoji = getEmojiForLog(log);

  return (
    <div className="flex items-center gap-3 bg-warm rounded-lg p-3 shadow-sm border border-warm-border">
      {/* Emoji */}
      <div className="text-2xl flex-shrink-0">{emoji}</div>

      {/* Date & Info */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium text-charcoal">{formatDateShort(log.date)}</p>
        <p className="font-body text-xs text-muted truncate">
          {log.symptoms.length > 0 ? log.symptoms.join(', ') : 'Sin síntomas'}
        </p>
      </div>

      {/* Bloating values */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1.5 font-body text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-terracotta" />
          <span className="text-muted">AM {log.bloating_am}</span>
        </div>
        <div className="flex items-center gap-1.5 font-body text-xs mt-0.5">
          <span className="inline-block w-2 h-2 rounded-full bg-terracotta-light" />
          <span className="text-muted">PM {log.bloating_pm}</span>
        </div>
      </div>
    </div>
  );
}
