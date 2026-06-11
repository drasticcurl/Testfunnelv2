'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowCounterClockwise } from '@phosphor-icons/react';
import WeekTabs from '@/components/pwa/lista-compras/WeekTabs';
import CategoryAccordion from '@/components/pwa/lista-compras/CategoryAccordion';
import {
  getWeekItems,
  getItemsByCategory,
  getCategoryMeta,
  getAllCategories,
} from '@/lib/pwa/shopping-data';
import { isTestMode } from '@/lib/pwa/test-mode';

// ─── LocalStorage helpers ───────────────────────────────────
const STORAGE_KEY = 'pwa_shopping_checked';

function loadCheckedIds(): Record<number, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCheckedIds(data: Record<number, string[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// ─── Page Component ─────────────────────────────────────────
export default function ListaComprasPage() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [checkedMap, setCheckedMap] = useState<Record<number, string[]>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Determine locked weeks based on tier
  const lockedWeeks = useMemo(() => {
    if (isTestMode()) return []; // Test mode: everything unlocked
    // In production, weeks 2-4 require upsell — for now we unlock all in client
    // The server-side access check would gate this, but client uses localStorage
    return [];
  }, []);

  // Load persisted checks on mount
  useEffect(() => {
    const saved = loadCheckedIds();
    setCheckedMap(saved);
  }, []);

  // Current week data
  const weekItems = useMemo(() => getWeekItems(activeWeek), [activeWeek]);
  const groupedItems = useMemo(() => getItemsByCategory(weekItems), [weekItems]);
  const checkedIds = useMemo(
    () => new Set(checkedMap[activeWeek] ?? []),
    [checkedMap, activeWeek]
  );

  // Progress
  const totalItems = weekItems.length;
  const checkedCount = checkedIds.size;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  // Toggle item
  const handleToggle = useCallback(
    (id: string) => {
      setCheckedMap((prev) => {
        const weekChecks = prev[activeWeek] ?? [];
        const updated = weekChecks.includes(id)
          ? weekChecks.filter((x) => x !== id)
          : [...weekChecks, id];
        const next = { ...prev, [activeWeek]: updated };
        saveCheckedIds(next);
        return next;
      });
    },
    [activeWeek]
  );

  // Reset current week
  const handleReset = useCallback(() => {
    setCheckedMap((prev) => {
      const next = { ...prev, [activeWeek]: [] };
      saveCheckedIds(next);
      return next;
    });
    setShowResetConfirm(false);
  }, [activeWeek]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={24} weight="bold" className="text-sage" />
          <h1 className="font-serif text-xl text-charcoal">Lista de compras</h1>
        </div>

        {/* Reset button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="p-2 rounded-lg hover:bg-sage-soft transition-colors text-charcoal/40 hover:text-charcoal/70"
          title="Reiniciar semana"
        >
          <ArrowCounterClockwise size={20} />
        </button>
      </div>

      {/* Week selector */}
      <WeekTabs
        activeWeek={activeWeek}
        onWeekChange={setActiveWeek}
        lockedWeeks={lockedWeeks}
      />

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-charcoal/50">
          <span>{checkedCount} de {totalItems} items</span>
          <span className="font-medium text-sage">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {getAllCategories().map((cat) => {
          const items = groupedItems[cat];
          if (!items || items.length === 0) return null;
          const meta = getCategoryMeta(cat);
          return (
            <CategoryAccordion
              key={`${activeWeek}-${cat}`}
              emoji={meta.emoji}
              label={meta.label}
              items={items}
              checkedIds={checkedIds}
              onToggle={handleToggle}
              defaultOpen={true}
            />
          );
        })}
      </div>

      {/* Complete message */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sage-soft border border-sage/20 rounded-lg p-4 text-center"
        >
          <p className="text-sage font-medium text-sm">
            ✅ ¡Lista completa! Tenés todo para la semana {activeWeek}.
          </p>
        </motion.div>
      )}

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 backdrop-blur-sm px-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4"
          >
            <h3 className="font-serif text-lg text-charcoal">¿Reiniciar semana {activeWeek}?</h3>
            <p className="text-sm text-charcoal/60">
              Se van a desmarcar todos los items de esta semana. No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-charcoal/10 text-sm font-medium text-charcoal/70 hover:bg-cream-warm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-full bg-coral text-white text-sm font-medium hover:bg-coral/90 transition-colors"
              >
                Reiniciar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
